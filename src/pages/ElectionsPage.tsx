import React, { useState, useEffect, useCallback } from 'react';
import { CardListSkeleton } from '@/components/skeletons/GenericSkeletons';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Vote, Users, Loader2, Award, Clock,
  User, Trash2, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { format, isPast, isFuture } from 'date-fns';

interface Election {
  id: string;
  title: string;
  description: string | null;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

interface Candidate {
  id: string;
  election_id: string;
  name: string;
  position: string;
  manifesto: string | null;
  photo_url: string | null;
  vote_count?: number;
}

interface UserVote {
  position: string;
  candidate_id: string;
}

const getElectionStatus = (e: Election) => {
  if (e.status === 'closed') return 'closed';
  if (e.starts_at && isFuture(new Date(e.starts_at))) return 'upcoming';
  if (e.ends_at && isPast(new Date(e.ends_at))) return 'closed';
  return 'active';
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    active: 'bg-green-500/10 text-green-600 border-green-500/20',
    upcoming: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    closed: 'bg-muted text-muted-foreground border-border',
  };
  return <Badge variant="outline" className={`rounded-full text-[9px] ${styles[status] || styles.closed}`}>{status}</Badge>;
};

const ElectionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useAdminCheck();
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Record<string, Candidate[]>>({});
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [userVotes, setUserVotes] = useState<Record<string, UserVote[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [totalVotesCount, setTotalVotesCount] = useState(0);

  const [showCreateElection, setShowCreateElection] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStartsAt, setNewStartsAt] = useState('');
  const [newEndsAt, setNewEndsAt] = useState('');
  const [savingElection, setSavingElection] = useState(false);

  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [candName, setCandName] = useState('');
  const [candPosition, setCandPosition] = useState('');
  const [candManifesto, setCandManifesto] = useState('');
  const [savingCandidate, setSavingCandidate] = useState(false);

  const fetchData = useCallback(async () => {
    const { data: electionsData } = await supabase.from('elections').select('*').order('created_at', { ascending: false });
    if (electionsData) {
      setElections(electionsData as Election[]);
      const { data: allCandidates } = await supabase.from('election_candidates').select('*');
      if (allCandidates) {
        const map: Record<string, Candidate[]> = {};
        (allCandidates as Candidate[]).forEach(c => {
          if (!map[c.election_id]) map[c.election_id] = [];
          map[c.election_id].push(c);
        });
        setCandidates(map);
      }

      const { data: votes } = await supabase.from('election_votes').select('candidate_id');
      if (votes) {
        const counts: Record<string, number> = {};
        votes.forEach((v: any) => { counts[v.candidate_id] = (counts[v.candidate_id] || 0) + 1; });
        setVoteCounts(counts);
        setTotalVotesCount(votes.length);
      }

      if (user?.id) {
        const { data: myVotes } = await supabase.from('election_votes').select('*').eq('user_id', user.id);
        if (myVotes) {
          const uv: Record<string, UserVote[]> = {};
          (myVotes as any[]).forEach(v => {
            if (!uv[v.election_id]) uv[v.election_id] = [];
            uv[v.election_id].push({ position: v.position, candidate_id: v.candidate_id });
          });
          setUserVotes(uv);
        }
      }
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateElection = async () => {
    if (!newTitle.trim()) { toast.error('Title required'); return; }
    setSavingElection(true);
    const { error } = await supabase.from('elections').insert({
      title: newTitle.trim(),
      description: newDesc.trim() || null,
      starts_at: newStartsAt || null,
      ends_at: newEndsAt || null,
      created_by: user?.id,
    });
    if (error) toast.error('Failed to create'); else { toast.success('Election created'); fetchData(); }
    setSavingElection(false); setShowCreateElection(false);
    setNewTitle(''); setNewDesc(''); setNewStartsAt(''); setNewEndsAt('');
  };

  const handleAddCandidate = async () => {
    if (!selectedElection || !candName.trim() || !candPosition.trim()) { toast.error('Name and position required'); return; }
    setSavingCandidate(true);
    const { error } = await supabase.from('election_candidates').insert({
      election_id: selectedElection.id,
      name: candName.trim(),
      position: candPosition.trim(),
      manifesto: candManifesto.trim() || null,
    });
    if (error) toast.error('Failed to add'); else { toast.success('Candidate added'); fetchData(); }
    setSavingCandidate(false); setShowAddCandidate(false);
    setCandName(''); setCandPosition(''); setCandManifesto('');
  };

  const handleVote = async (electionId: string, candidateId: string, position: string) => {
    if (!user?.id) { toast.error('Sign in to vote'); return; }
    const alreadyVoted = (userVotes[electionId] || []).some(v => v.position === position);
    if (alreadyVoted) { toast.error('You already voted for this position'); return; }
    setSubmittingVote(true);
    const { error } = await supabase.from('election_votes').insert({
      election_id: electionId, candidate_id: candidateId, user_id: user.id, position,
    });
    if (error) toast.error(error.message.includes('duplicate') ? 'Already voted' : 'Vote failed');
    else { toast.success('Vote cast!'); fetchData(); }
    setSubmittingVote(false);
  };

  const handleDeleteElection = async (id: string) => {
    const { error } = await supabase.from('elections').delete().eq('id', id);
    if (!error) { toast.success('Deleted'); fetchData(); setSelectedElection(null); }
  };

  const activeCount = elections.filter(e => getElectionStatus(e) === 'active').length;
  const positions = selectedElection ? [...new Set((candidates[selectedElection.id] || []).map(c => c.position))] : [];

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Elections | UISU" description="Student union elections and voting" />

      {/* Hero */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 pt-24 pb-8 max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2.5 border border-primary-foreground/20 hover:border-accent transition-colors rounded-full">
                <ArrowLeft size={14} />
              </button>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-primary-foreground/50">Governance</p>
                <h1 className="text-xl md:text-2xl font-serif font-bold">Student Elections</h1>
              </div>
            </div>
            {isAdmin && (
              <Button size="sm" onClick={() => setShowCreateElection(true)} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus size={14} className="mr-1" /> New Election
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="bg-primary-foreground/10 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-medium flex items-center gap-1.5">
              <Vote size={10} /> {elections.length} Elections
            </span>
            <span className="bg-primary-foreground/10 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-medium flex items-center gap-1.5">
              <Award size={10} /> {activeCount} Active
            </span>
            <span className="bg-primary-foreground/10 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-medium flex items-center gap-1.5">
              <Users size={10} /> {totalVotesCount} Votes Cast
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {loading ? (
          <CardListSkeleton count={3} />
        ) : selectedElection ? (
          <div className="space-y-6">
            <button onClick={() => setSelectedElection(null)} className="text-xs text-accent flex items-center gap-1 hover:underline rounded-full">
              <ArrowLeft size={12} /> Back to elections
            </button>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={getElectionStatus(selectedElection)} />
                  {selectedElection.ends_at && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock size={10} /> Ends {format(new Date(selectedElection.ends_at), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-serif font-bold text-foreground">{selectedElection.title}</h2>
                {selectedElection.description && <p className="text-sm text-muted-foreground mt-1">{selectedElection.description}</p>}
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setShowAddCandidate(true)}>
                    <Plus size={12} className="mr-1" /> Candidate
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full text-destructive" onClick={() => handleDeleteElection(selectedElection.id)}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              )}
            </div>

            {positions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <Users size={32} />
                </div>
                <p className="font-medium">No candidates registered yet</p>
              </div>
            ) : (
              positions.map(pos => {
                const posCandidates = (candidates[selectedElection.id] || []).filter(c => c.position === pos);
                const totalVotes = posCandidates.reduce((sum, c) => sum + (voteCounts[c.id] || 0), 0);
                const maxVotes = Math.max(...posCandidates.map(c => voteCounts[c.id] || 0), 1);
                const status = getElectionStatus(selectedElection);
                const userVotedForPos = (userVotes[selectedElection.id] || []).find(v => v.position === pos);

                return (
                  <div key={pos} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Award size={14} className="text-accent" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{pos}</h3>
                      <Badge variant="outline" className="rounded-full text-[10px] font-normal">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</Badge>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {posCandidates.map(cand => {
                        const votes = voteCounts[cand.id] || 0;
                        const pct = totalVotes > 0 ? (votes / totalVotes * 100) : 0;
                        const isWinner = status === 'closed' && votes === maxVotes && votes > 0;
                        const hasVoted = userVotedForPos?.candidate_id === cand.id;

                        return (
                          <motion.div
                            key={cand.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-card border rounded-2xl shadow-sm hover:shadow-md transition-all p-4 relative overflow-hidden ${
                              isWinner ? 'border-accent ring-1 ring-accent/20' : status === 'active' ? 'border-border hover:border-accent/30' : 'border-border'
                            }`}
                          >
                            {isWinner && (
                              <div className="absolute top-2 right-2">
                                <Award size={16} className="text-accent" />
                              </div>
                            )}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User size={18} className="text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-foreground">{cand.name}</p>
                                {hasVoted && <Badge className="rounded-full text-[8px] bg-accent/20 text-accent border-0">Your vote</Badge>}
                              </div>
                            </div>
                            {cand.manifesto && <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{cand.manifesto}</p>}

                            {(status === 'closed' || isAdmin) && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-muted-foreground">{votes} votes</span>
                                  <span className="font-bold text-foreground">{pct.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: isWinner ? 'hsl(var(--accent))' : 'hsl(var(--primary))' }}
                                  />
                                </div>
                              </div>
                            )}

                            {status === 'active' && !userVotedForPos && user && (
                              <Button
                                size="sm"
                                className="w-full mt-3 rounded-full bg-primary text-primary-foreground"
                                disabled={submittingVote}
                                onClick={() => handleVote(selectedElection.id, cand.id, pos)}
                              >
                                <Vote size={12} className="mr-1" /> Vote
                              </Button>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {elections.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <Vote size={32} />
                </div>
                <p className="font-medium">No elections yet</p>
              </div>
            ) : (
              elections.map(e => {
                const status = getElectionStatus(e);
                const candCount = (candidates[e.id] || []).length;
                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedElection(e)}
                    className={`bg-card border rounded-2xl p-4 cursor-pointer shadow-sm hover:shadow-md transition-all ${
                      status === 'active' ? 'border-accent/30 hover:border-accent/50' : 'border-border hover:border-accent/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={status} />
                        </div>
                        <h3 className="font-serif font-bold text-foreground">{e.title}</h3>
                        {e.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{e.description}</p>}
                      </div>
                      <div className="text-right text-[10px] text-muted-foreground space-y-1">
                        <p className="flex items-center gap-1 justify-end"><Users size={10} />{candCount} candidates</p>
                        {e.ends_at && <p className="flex items-center gap-1 justify-end"><Calendar size={10} />{format(new Date(e.ends_at), 'MMM d')}</p>}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Create Election Dialog */}
      <Dialog open={showCreateElection} onOpenChange={setShowCreateElection}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="font-serif">Create Election</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-xs">Title *</Label><Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. SUG Presidential Election 2026" className="rounded-xl" /></div>
            <div><Label className="text-xs">Description</Label><Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Election details..." className="resize-none rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Starts At</Label><Input type="datetime-local" value={newStartsAt} onChange={e => setNewStartsAt(e.target.value)} className="rounded-xl" /></div>
              <div><Label className="text-xs">Ends At</Label><Input type="datetime-local" value={newEndsAt} onChange={e => setNewEndsAt(e.target.value)} className="rounded-xl" /></div>
            </div>
            <Button onClick={handleCreateElection} disabled={savingElection} className="w-full rounded-full bg-primary text-primary-foreground">
              {savingElection && <Loader2 size={14} className="animate-spin mr-2" />} Create Election
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Candidate Dialog */}
      <Dialog open={showAddCandidate} onOpenChange={setShowAddCandidate}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="font-serif">Add Candidate</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-xs">Name *</Label><Input value={candName} onChange={e => setCandName(e.target.value)} placeholder="Candidate name" className="rounded-xl" /></div>
            <div><Label className="text-xs">Position *</Label><Input value={candPosition} onChange={e => setCandPosition(e.target.value)} placeholder="e.g. President, Vice President" className="rounded-xl" /></div>
            <div><Label className="text-xs">Manifesto</Label><Textarea value={candManifesto} onChange={e => setCandManifesto(e.target.value)} placeholder="Campaign promises..." className="resize-none rounded-xl" /></div>
            <Button onClick={handleAddCandidate} disabled={savingCandidate} className="w-full rounded-full bg-primary text-primary-foreground">
              {savingCandidate && <Loader2 size={14} className="animate-spin mr-2" />} Add Candidate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ElectionsPage;
