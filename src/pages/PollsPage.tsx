import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Plus, BarChart3, Vote, Clock, CheckCircle2, Loader2, Lock, Users, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { SEO } from '@/components/SEO';
import { useAdminCheck } from '@/hooks/useAdminCheck';

interface PollOption {
  id: string;
  poll_id: string;
  label: string;
  description: string | null;
  sort_order: number;
  vote_count: number;
}

interface Poll {
  id: string;
  title: string;
  description: string | null;
  poll_type: string;
  status: string;
  is_anonymous: boolean;
  show_results_before_close: boolean;
  max_choices: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

const PollsPage = () => {
  const navigate = useNavigate();
  const { isAdmin, isModerator } = useAdminCheck();
  const isStaff = isAdmin || isModerator;
  const [polls, setPolls] = useState<Poll[]>([]);
  const [options, setOptions] = useState<Record<string, PollOption[]>>({});
  const [userVotes, setUserVotes] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [voting, setVoting] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

  // Create form
  const [form, setForm] = useState({
    title: '', description: '', poll_type: 'single_choice',
    is_anonymous: false, show_results_before_close: false,
    max_choices: 1, ends_at: '',
  });
  const [newOptions, setNewOptions] = useState(['', '']);

  const fetchPolls = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);

    const { data: pollsData } = await supabase
      .from('polls').select('*').order('created_at', { ascending: false });

    if (pollsData) {
      setPolls(pollsData as Poll[]);
      
      // Fetch options for all polls
      const pollIds = pollsData.map(p => p.id);
      if (pollIds.length > 0) {
        const { data: optData } = await supabase
          .from('poll_options').select('*')
          .in('poll_id', pollIds)
          .order('sort_order', { ascending: true });
        
        if (optData) {
          const grouped: Record<string, PollOption[]> = {};
          optData.forEach((o: any) => {
            if (!grouped[o.poll_id]) grouped[o.poll_id] = [];
            grouped[o.poll_id].push(o as PollOption);
          });
          setOptions(grouped);
        }

        // Fetch user's votes
        if (user) {
          const { data: votesData } = await supabase
            .from('poll_votes').select('poll_id, option_id')
            .eq('user_id', user.id)
            .in('poll_id', pollIds);

          if (votesData) {
            const voteMap: Record<string, string[]> = {};
            votesData.forEach((v: any) => {
              if (!voteMap[v.poll_id]) voteMap[v.poll_id] = [];
              voteMap[v.poll_id].push(v.option_id);
            });
            setUserVotes(voteMap);
          }
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchPolls(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    const validOptions = newOptions.filter(o => o.trim());
    if (validOptions.length < 2) { toast.error('At least 2 options required'); return; }
    setCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: poll, error } = await supabase.from('polls').insert({
        created_by: user.id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        poll_type: form.poll_type,
        is_anonymous: form.is_anonymous,
        show_results_before_close: form.show_results_before_close,
        max_choices: form.poll_type === 'approval' ? form.max_choices : 1,
        status: 'active',
        ends_at: form.ends_at || null,
      }).select().single();

      if (error) throw error;

      // Insert options
      const optionsToInsert = validOptions.map((label, i) => ({
        poll_id: poll.id,
        label: label.trim(),
        sort_order: i,
      }));

      const { error: optErr } = await supabase.from('poll_options').insert(optionsToInsert);
      if (optErr) throw optErr;

      toast.success('Poll created!');
      setShowCreate(false);
      setForm({ title: '', description: '', poll_type: 'single_choice', is_anonymous: false, show_results_before_close: false, max_choices: 1, ends_at: '' });
      setNewOptions(['', '']);
      fetchPolls();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create poll');
    } finally {
      setCreating(false);
    }
  };

  const handleVote = async (pollId: string) => {
    if (!userId) { toast.error('Please sign in to vote'); return; }
    const selected = selectedOptions[pollId];
    if (!selected?.length) { toast.error('Select an option'); return; }
    setVoting(pollId);

    try {
      // Remove existing votes first
      if (userVotes[pollId]?.length) {
        await supabase.from('poll_votes').delete().eq('poll_id', pollId).eq('user_id', userId);
      }

      const votesToInsert = selected.map((optionId, i) => ({
        poll_id: pollId, option_id: optionId, user_id: userId, rank: i + 1,
      }));

      const { error } = await supabase.from('poll_votes').insert(votesToInsert);
      if (error) throw error;

      toast.success('Vote submitted!');
      fetchPolls();
    } catch (err: any) {
      toast.error(err.message || 'Failed to vote');
    } finally {
      setVoting(null);
    }
  };

  const toggleOption = (pollId: string, optionId: string, pollType: string, maxChoices: number) => {
    setSelectedOptions(prev => {
      const current = prev[pollId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [pollId]: current.filter(id => id !== optionId) };
      }
      if (pollType === 'single_choice') {
        return { ...prev, [pollId]: [optionId] };
      }
      if (pollType === 'approval' && current.length >= maxChoices) {
        return prev;
      }
      return { ...prev, [pollId]: [...current, optionId] };
    });
  };

  const closePoll = async (pollId: string) => {
    await supabase.from('polls').update({ status: 'closed' }).eq('id', pollId);
    toast.success('Poll closed');
    fetchPolls();
  };

  const deletePoll = async (pollId: string) => {
    await supabase.from('polls').delete().eq('id', pollId);
    toast.success('Poll deleted');
    fetchPolls();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 md:pt-32 pb-16">
      <SEO title="Polls & Voting | UISU" description="Vote on governance decisions, club elections, and community feedback." />
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <button onClick={() => navigate('/')} className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-primary transition-colors mb-8">
          <div className="p-2 border border-border rounded-full group-hover:border-primary"><ArrowLeft size={14} /></div>
          Back to Home
        </button>

        <div className="flex items-end justify-between mb-12 border-b border-border pb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Vote className="text-primary w-5 h-5" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">Community Voice</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif text-foreground leading-[0.9]">
              Polls & <span className="italic text-muted-foreground">Voting</span>
            </h1>
          </div>
          {isStaff && (
            <Button onClick={() => setShowCreate(true)}><Plus size={16} className="mr-2" /> New Poll</Button>
          )}
        </div>

        {/* Polls List */}
        <div className="space-y-6">
          {polls.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-border">
              <BarChart3 size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="font-bold text-lg mb-2">No polls yet</h3>
              <p className="text-muted-foreground text-sm">Check back later for community polls and votes.</p>
            </div>
          ) : polls.map(poll => {
            const pollOptions = options[poll.id] || [];
            const hasVoted = !!userVotes[poll.id]?.length;
            const totalVotes = pollOptions.reduce((s, o) => s + o.vote_count, 0);
            const canSeeResults = poll.status === 'closed' || poll.show_results_before_close || hasVoted;
            const isExpired = poll.ends_at && new Date(poll.ends_at) < new Date();
            const isClosed = poll.status === 'closed' || isExpired;

            return (
              <div key={poll.id} className="bg-white rounded-xl border border-border p-6 md:p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">{poll.title}</h2>
                    {poll.description && <p className="text-muted-foreground text-sm">{poll.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={isClosed ? 'secondary' : 'default'} className="text-[10px]">
                      {isClosed ? 'Closed' : 'Active'}
                    </Badge>
                    {poll.is_anonymous && (
                      <Badge variant="outline" className="text-[10px]"><EyeOff size={10} className="mr-1" /> Anonymous</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
                  <span className="flex items-center gap-1"><Users size={12} /> {totalVotes} votes</span>
                  <span className="capitalize">{poll.poll_type.replace('_', ' ')}</span>
                  {poll.ends_at && (
                    <span className="flex items-center gap-1"><Clock size={12} /> Ends {new Date(poll.ends_at).toLocaleDateString()}</span>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {pollOptions.map(opt => {
                    const isSelected = selectedOptions[poll.id]?.includes(opt.id) || userVotes[poll.id]?.includes(opt.id);
                    const percentage = totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0;

                    return (
                      <div key={opt.id}>
                        {!isClosed && !hasVoted ? (
                          <button
                            onClick={() => toggleOption(poll.id, opt.id, poll.poll_type, poll.max_choices)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                              isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                              }`}>
                                {isSelected && <CheckCircle2 size={12} className="text-primary-foreground" />}
                              </div>
                              <span className="font-medium text-sm">{opt.label}</span>
                            </div>
                          </button>
                        ) : (
                          <div className="p-4 rounded-lg border border-border">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                {userVotes[poll.id]?.includes(opt.id) && (
                                  <CheckCircle2 size={14} className="text-primary" />
                                )}
                                <span className="font-medium text-sm">{opt.label}</span>
                              </div>
                              {canSeeResults && (
                                <span className="text-sm font-bold text-muted-foreground">{percentage}%</span>
                              )}
                            </div>
                            {canSeeResults && (
                              <Progress value={percentage} className="h-2" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Vote Button */}
                {!isClosed && !hasVoted && userId && (
                  <Button
                    onClick={() => handleVote(poll.id)}
                    disabled={!selectedOptions[poll.id]?.length || voting === poll.id}
                    className="mt-4 w-full"
                  >
                    {voting === poll.id ? <Loader2 size={16} className="animate-spin mr-2" /> : <Vote size={16} className="mr-2" />}
                    Submit Vote
                  </Button>
                )}

                {!userId && !isClosed && (
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    <Lock size={14} className="inline mr-1" /> Sign in to vote
                  </p>
                )}

                {/* Staff Actions */}
                {isStaff && (
                  <div className="mt-4 pt-4 border-t border-border flex gap-2">
                    {!isClosed && (
                      <Button variant="outline" size="sm" onClick={() => closePoll(poll.id)}>Close Poll</Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => deletePoll(poll.id)}>
                      <Trash2 size={14} className="mr-1" /> Delete
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Create Poll Dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create a Poll</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <Input placeholder="Poll question / title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              <Textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />
              
              <Select value={form.poll_type} onValueChange={v => setForm(p => ({ ...p, poll_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_choice">Single Choice</SelectItem>
                  <SelectItem value="approval">Approval (Multiple)</SelectItem>
                  <SelectItem value="ranked_choice">Ranked Choice</SelectItem>
                </SelectContent>
              </Select>

              {form.poll_type === 'approval' && (
                <div>
                  <Label className="text-xs">Max selections</Label>
                  <Input type="number" min={1} max={10} value={form.max_choices} onChange={e => setForm(p => ({ ...p, max_choices: parseInt(e.target.value) || 1 }))} />
                </div>
              )}

              {/* Options */}
              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Options</Label>
                <div className="space-y-2">
                  {newOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={e => {
                          const updated = [...newOptions];
                          updated[i] = e.target.value;
                          setNewOptions(updated);
                        }}
                      />
                      {newOptions.length > 2 && (
                        <Button variant="ghost" size="sm" onClick={() => setNewOptions(prev => prev.filter((_, j) => j !== i))}>
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  ))}
                  {newOptions.length < 10 && (
                    <Button variant="outline" size="sm" onClick={() => setNewOptions(prev => [...prev, ''])}>
                      <Plus size={14} className="mr-1" /> Add Option
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_anonymous} onCheckedChange={v => setForm(p => ({ ...p, is_anonymous: v }))} />
                  <Label className="text-sm">Anonymous</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.show_results_before_close} onCheckedChange={v => setForm(p => ({ ...p, show_results_before_close: v }))} />
                  <Label className="text-sm">Show results live</Label>
                </div>
              </div>

              <div>
                <Label className="text-xs">End Date (optional)</Label>
                <Input type="datetime-local" value={form.ends_at} onChange={e => setForm(p => ({ ...p, ends_at: e.target.value }))} />
              </div>

              <Button onClick={handleCreate} disabled={creating} className="w-full">
                {creating ? <><Loader2 size={16} className="animate-spin mr-2" /> Creating...</> : 'Create Poll'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PollsPage;
