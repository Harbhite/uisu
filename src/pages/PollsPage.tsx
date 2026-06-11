import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, BarChart3, Vote, Clock, CheckCircle2, Loader2, Lock, Users,
  Trash2, EyeOff, Share2, Search, Filter, TrendingUp, Timer, Sparkles,
  ChevronDown, Copy, X, Award, Flame, Calendar, RotateCcw, ShieldCheck, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SEO } from '@/components/SEO';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useBlockchainVote } from '@/hooks/useBlockchainVote';
import { format, formatDistanceToNow, isPast, differenceInSeconds } from 'date-fns';

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

type FilterType = 'all' | 'active' | 'closed' | 'voted' | 'not_voted';

const CONFETTI_COLORS = ['#003366', '#C5A059', '#1a5276', '#d4ac0d', '#2c3e50', '#e67e22'];

const ConfettiPiece = ({ delay, x }: { delay: number; x: number }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full"
    style={{ backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)], left: `${x}%` }}
    initial={{ y: -10, opacity: 1, rotate: 0, scale: 1 }}
    animate={{ y: 400, opacity: 0, rotate: 720, scale: 0 }}
    transition={{ duration: 1.5, delay, ease: 'easeOut' }}
  />
);

const CountdownTimer = ({ endsAt }: { endsAt: string }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const tick = () => {
      const secs = differenceInSeconds(new Date(endsAt), new Date());
      if (secs <= 0) { setTimeLeft('Ended'); return; }
      setUrgent(secs < 3600);
      const d = Math.floor(secs / 86400);
      const h = Math.floor((secs % 86400) / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold tracking-wide ${urgent ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}>
      <Timer size={12} /> {timeLeft}
    </span>
  );
};

const PollsPage = () => {
  const navigate = useNavigate();
  const { isAdmin, isModerator } = useAdminCheck();
  const { submitBlockchainVote } = useBlockchainVote();
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
  const [confettiPoll, setConfettiPoll] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPoll, setExpandedPoll] = useState<string | null>(null);
  const [changingVote, setChangingVote] = useState<string | null>(null);
  const [blockchainTx, setBlockchainTx] = useState<Record<string, string>>({});

  // Create form
  const [form, setForm] = useState({
    title: '', description: '', poll_type: 'single_choice',
    is_anonymous: false, show_results_before_close: false,
    max_choices: 1, ends_at: '',
  });
  const [newOptions, setNewOptions] = useState(['', '']);

  const fetchPolls = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);

    const { data: pollsData } = await supabase
      .from('polls').select('*').order('created_at', { ascending: false });

    if (pollsData) {
      setPolls(pollsData as Poll[]);
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
  }, []);

  useEffect(() => { fetchPolls(); }, [fetchPolls]);

  const filteredPolls = useMemo(() => {
    let result = polls;
    if (filter === 'active') result = result.filter(p => p.status !== 'closed' && (!p.ends_at || !isPast(new Date(p.ends_at))));
    if (filter === 'closed') result = result.filter(p => p.status === 'closed' || (p.ends_at && isPast(new Date(p.ends_at))));
    if (filter === 'voted') result = result.filter(p => !!userVotes[p.id]?.length);
    if (filter === 'not_voted') result = result.filter(p => !userVotes[p.id]?.length && p.status !== 'closed');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    return result;
  }, [polls, filter, searchQuery, userVotes]);

  const stats = useMemo(() => ({
    total: polls.length,
    active: polls.filter(p => p.status !== 'closed' && (!p.ends_at || !isPast(new Date(p.ends_at)))).length,
    totalVotes: Object.values(options).flat().reduce((s, o) => s + o.vote_count, 0),
    participated: Object.keys(userVotes).length,
  }), [polls, options, userVotes]);

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

      const optionsToInsert = validOptions.map((label, i) => ({
        poll_id: poll.id, label: label.trim(), sort_order: i,
      }));

      const { error: optErr } = await supabase.from('poll_options').insert(optionsToInsert);
      if (optErr) throw optErr;

      toast.success('Poll created successfully!');
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
      if (userVotes[pollId]?.length) {
        await supabase.from('poll_votes').delete().eq('poll_id', pollId).eq('user_id', userId);
      }

      const votesToInsert = selected.map((optionId, i) => ({
        poll_id: pollId, option_id: optionId, user_id: userId, rank: i + 1,
      }));

      const { error } = await supabase.from('poll_votes').insert(votesToInsert);
      if (error) throw error;

      // Submit to blockchain
      const blockchainResult = await submitBlockchainVote(pollId, selected[0], userId);
      if (blockchainResult) {
        setBlockchainTx(prev => ({ ...prev, [pollId]: blockchainResult.blockHash }));
      }

      // Trigger confetti
      setConfettiPoll(pollId);
      setTimeout(() => setConfettiPoll(null), 2000);
      setChangingVote(null);

      toast.success('Vote submitted and recorded on blockchain!');
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
      if (current.includes(optionId)) return { ...prev, [pollId]: current.filter(id => id !== optionId) };
      if (pollType === 'single_choice') return { ...prev, [pollId]: [optionId] };
      if (pollType === 'approval' && current.length >= maxChoices) return prev;
      return { ...prev, [pollId]: [...current, optionId] };
    });
  };

  const startChangeVote = (pollId: string) => {
    setChangingVote(pollId);
    setSelectedOptions(prev => ({ ...prev, [pollId]: userVotes[pollId] || [] }));
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

  const sharePoll = (poll: Poll) => {
    const url = `${window.location.origin}/polls#${poll.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Poll link copied to clipboard!');
  };

  const getWinningOption = (pollId: string) => {
    const opts = options[pollId] || [];
    if (!opts.length) return null;
    return opts.reduce((max, o) => o.vote_count > max.vote_count ? o : max, opts[0]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Vote className="w-10 h-10 text-primary" />
        </motion.div>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Loading polls...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-32 pb-16">
      <SEO title="Polls & Voting | UISU SPACE" description="Vote on governance decisions, club elections, and community feedback." />

      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden bg-primary text-primary-foreground rounded-b-[3rem]">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-2xl -ml-10 -mb-10" />
        
        <div className="container mx-auto px-4 md:px-6 max-w-5xl py-16 md:py-24 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <button onClick={() => navigate('/')} className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/60 hover:text-primary-foreground transition-all mb-10">
              <div className="p-2.5 border border-primary-foreground/20 rounded-full group-hover:border-primary-foreground/50 group-hover:scale-110 transition-transform"><ArrowLeft size={14} /></div>
              Back to Home
            </button>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-accent/20 rounded-2xl flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-300">
                    <Vote className="w-5 h-5 text-accent" />
                  </div>
                  <Badge variant="outline" className="border-accent/30 text-accent font-bold tracking-widest text-[10px] py-1 px-3 rounded-full">COMMUNITY VOICE</Badge>
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif leading-[0.85] mb-6">
                  Polls &<br /><span className="italic text-primary-foreground/40">Voting</span>
                </h1>
                <p className="text-primary-foreground/60 text-lg md:text-xl font-light leading-relaxed max-w-lg">
                  Shape the future of your student union. Every vote is secured by <span className="text-accent font-medium">blockchain technology</span> for total transparency.
                </p>
              </div>

              {isStaff && (
                <Button
                  onClick={() => setShowCreate(true)}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 self-start md:self-end h-14 px-8 rounded-2xl shadow-xl shadow-accent/20 group transition-all hover:-translate-y-1"
                >
                  <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" /> 
                  <span className="font-bold tracking-tight">Create New Poll</span>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="container mx-auto px-4 md:px-6 max-w-5xl -mt-8 relative z-20">
        <div className="bg-card border border-border rounded-[2rem] shadow-2xl shadow-black/5 p-2 overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { label: 'Total Polls', value: stats.total, icon: BarChart3, color: 'text-primary' },
              { label: 'Active Now', value: stats.active, icon: Flame, color: 'text-orange-500' },
              { label: 'Total Votes', value: stats.totalVotes, icon: TrendingUp, color: 'text-green-500' },
              { label: 'You Voted', value: stats.participated, icon: Award, color: 'text-accent' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="flex flex-col items-center justify-center py-6 px-4 hover:bg-muted/50 transition-colors cursor-default group"
              >
                <div className={`p-2.5 rounded-xl bg-muted group-hover:scale-110 transition-transform duration-300 mb-3 ${stat.color}`}>
                  <stat.icon size={18} />
                </div>
                <span className="text-2xl md:text-3xl font-serif font-bold mb-1">{stat.value}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="container mx-auto px-4 md:px-6 max-w-5xl mt-16">
        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="flex items-center gap-2 p-1.5 bg-muted/50 rounded-2xl border border-border w-full md:w-auto overflow-x-auto no-scrollbar">
            {(['all', 'active', 'closed', 'voted', 'not_voted'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  filter === f ? 'bg-card text-primary shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <Input
              placeholder="Search polls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-border bg-card focus-visible:ring-accent transition-all"
            />
          </div>
        </div>

        {/* Polls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredPolls.map((poll) => {
              const pollOptions = options[poll.id] || [];
              const votedOptions = userVotes[poll.id] || [];
              const hasVoted = votedOptions.length > 0;
              const isClosed = poll.status === 'closed' || (poll.ends_at && isPast(new Date(poll.ends_at)));
              const showResults = isClosed || (poll.show_results_before_close && hasVoted);
              const totalVotes = pollOptions.reduce((s, o) => s + o.vote_count, 0);
              const isExpanded = expandedPoll === poll.id;
              const isChanging = changingVote === poll.id;
              const winningOption = getWinningOption(poll.id);

              return (
                <motion.div
                  key={poll.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group relative bg-card border border-border rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 flex flex-col ${
                    isExpanded ? 'md:col-span-2' : ''
                  }`}
                >
                  {/* Confetti overlay */}
                  {confettiPoll === poll.id && (
                    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <ConfettiPiece key={i} delay={i * 0.05} x={Math.random() * 100} />
                      ))}
                    </div>
                  )}

                  <div className="p-8 flex-1">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex flex-wrap gap-2">
                        {isClosed ? (
                          <Badge className="bg-muted text-muted-foreground rounded-lg px-2.5 py-0.5 border-none flex items-center gap-1.5 font-bold text-[10px] tracking-wider">
                            <Lock size={10} /> CLOSED
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500/10 text-green-600 rounded-lg px-2.5 py-0.5 border-none flex items-center gap-1.5 font-bold text-[10px] tracking-wider animate-pulse">
                            <Clock size={10} /> ACTIVE
                          </Badge>
                        )}
                        {poll.is_anonymous && (
                          <Badge variant="outline" className="rounded-lg px-2.5 py-0.5 text-[10px] font-bold tracking-wider border-border text-muted-foreground">
                            <EyeOff size={10} className="mr-1.5" /> ANONYMOUS
                          </Badge>
                        )}
                        {blockchainTx[poll.id] && (
                          <Badge className="bg-accent/10 text-accent rounded-lg px-2.5 py-0.5 border-none flex items-center gap-1.5 font-bold text-[10px] tracking-wider">
                            <ShieldCheck size={10} /> VERIFIED
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => sharePoll(poll)} className="h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                          <Share2 size={16} />
                        </Button>
                        {isStaff && (
                          <Button variant="ghost" size="icon" onClick={() => deletePoll(poll.id)} className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-serif font-bold leading-tight mb-4 group-hover:text-primary transition-colors">{poll.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-8 font-light line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                      {poll.description || "No description provided for this poll."}
                    </p>

                    {/* Voting/Results area */}
                    <div className="space-y-4 mb-8">
                      {pollOptions.map((option) => {
                        const isSelected = (selectedOptions[poll.id] || []).includes(option.id);
                        const isUserVote = votedOptions.includes(option.id);
                        const percentage = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0;
                        const isWinner = isClosed && winningOption?.id === option.id;

                        return (
                          <div key={option.id} className="relative group/opt">
                            {showResults ? (
                              <div className="space-y-2">
                                <div className="flex justify-between items-end px-1">
                                  <span className="text-sm font-bold flex items-center gap-2">
                                    {option.label}
                                    {isUserVote && <Badge className="bg-primary/10 text-primary border-none text-[8px] px-1.5 py-0 h-4 rounded-md">YOUR VOTE</Badge>}
                                    {isWinner && <Award size={14} className="text-accent animate-bounce" />}
                                  </span>
                                  <span className="text-xs font-serif italic text-muted-foreground">{percentage}%</span>
                                </div>
                                <div className="h-3 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${isWinner ? 'bg-accent shadow-[0_0_15px_rgba(197,160,89,0.3)]' : 'bg-primary/40'}`}
                                  />
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => !isClosed && (hasVoted ? isChanging : true) && toggleOption(poll.id, option.id, poll.poll_type, poll.max_choices)}
                                disabled={isClosed || (hasVoted && !isChanging)}
                                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden flex items-center gap-4 ${
                                  isSelected 
                                    ? 'border-accent bg-accent/5 shadow-lg shadow-accent/5' 
                                    : 'border-border bg-muted/30 hover:border-accent/30 hover:bg-card'
                                } ${(hasVoted && !isChanging) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                  isSelected ? 'border-accent bg-accent text-accent-foreground scale-110' : 'border-border'
                                }`}>
                                  {isSelected && <CheckCircle2 size={14} strokeWidth={3} />}
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-sm">{option.label}</p>
                                  {option.description && <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{option.description}</p>}
                                </div>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Blockchain Verification Footer */}
                    {blockchainTx[poll.id] && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 rounded-2xl bg-accent/5 border border-accent/20 flex items-center gap-4"
                      >
                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                          <ShieldCheck className="text-accent" size={20} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-0.5">Blockchain Verified</p>
                          <p className="text-[10px] font-mono text-muted-foreground truncate">Tx: {blockchainTx[poll.id]}</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users size={14} />
                          <span className="text-xs font-bold">{totalVotes} <span className="font-light">votes</span></span>
                        </div>
                        {poll.ends_at && !isClosed && <CountdownTimer endsAt={poll.ends_at} />}
                      </div>

                      {!isClosed && (
                        <div className="flex gap-2">
                          {hasVoted && !isChanging ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startChangeVote(poll.id)}
                              className="rounded-xl h-10 px-4 border-border text-xs font-bold uppercase tracking-wider hover:bg-muted"
                            >
                              <RotateCcw size={14} className="mr-2" /> Change Vote
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleVote(poll.id)}
                              disabled={voting === poll.id || !selectedOptions[poll.id]?.length}
                              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-10 px-6 text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 active:translate-y-0"
                            >
                              {voting === poll.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <span className="flex items-center gap-2"><Zap size={14} fill="currentColor" /> Submit Vote</span>
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Decorative corner element */}
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors duration-500" />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredPolls.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 bg-muted rounded-[2.5rem] flex items-center justify-center mb-8 rotate-12">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-3xl font-serif font-bold mb-3">No polls found</h3>
            <p className="text-muted-foreground font-light max-w-sm mx-auto">
              We couldn't find any polls matching your current filters. Try adjusting your search or filter settings.
            </p>
            <Button variant="link" onClick={() => { setFilter('all'); setSearchQuery(''); }} className="mt-6 text-accent font-bold uppercase tracking-widest text-xs">
              Clear all filters
            </Button>
          </motion.div>
        )}
      </div>

      {/* ── Create Poll Dialog ── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none rounded-[3rem] bg-card shadow-2xl">
          <div className="bg-primary p-10 text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-4xl font-serif leading-tight">Create a<br /><span className="italic text-primary-foreground/40">New Poll</span></DialogTitle>
              <p className="text-primary-foreground/50 font-light mt-4 max-w-sm">Gather community feedback or host elections with secure blockchain recording.</p>
            </DialogHeader>
          </div>

          <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto no-scrollbar">
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Poll Details</Label>
              <Input
                placeholder="Poll Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="h-14 rounded-2xl border-border bg-muted/30 focus-visible:ring-accent text-lg font-medium"
              />
              <Textarea
                placeholder="Detailed Description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="rounded-2xl border-border bg-muted/30 focus-visible:ring-accent min-h-[100px] py-4"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Poll Type</Label>
                <Select value={form.poll_type} onValueChange={(v) => setForm({ ...form, poll_type: v })}>
                  <SelectTrigger className="h-12 rounded-xl border-border bg-muted/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="single_choice">Single Choice</SelectItem>
                    <SelectItem value="approval">Approval (Multi-choice)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">End Date</Label>
                <Input
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                  className="h-12 rounded-xl border-border bg-muted/30"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Options</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setNewOptions([...newOptions, ''])}
                  className="h-8 text-accent hover:text-accent hover:bg-accent/10 rounded-lg font-bold text-[10px] tracking-widest uppercase"
                >
                  <Plus size={12} className="mr-1.5" /> Add Option
                </Button>
              </div>
              <div className="space-y-3">
                {newOptions.map((opt, i) => (
                  <div key={i} className="flex gap-3 group/opt">
                    <div className="flex-1 relative">
                      <Input
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...newOptions];
                          updated[i] = e.target.value;
                          setNewOptions(updated);
                        }}
                        className="h-12 rounded-xl border-border bg-muted/30 focus-visible:ring-accent pr-10"
                      />
                      {newOptions.length > 2 && (
                        <button 
                          onClick={() => setNewOptions(newOptions.filter((_, idx) => idx !== i))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold">Anonymous Voting</Label>
                  <p className="text-[10px] text-muted-foreground">Hide voter identities</p>
                </div>
                <Switch
                  checked={form.is_anonymous}
                  onCheckedChange={(v) => setForm({ ...form, is_anonymous: v })}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold">Real-time Results</Label>
                  <p className="text-[10px] text-muted-foreground">Show results before close</p>
                </div>
                <Switch
                  checked={form.show_results_before_close}
                  onCheckedChange={(v) => setForm({ ...form, show_results_before_close: v })}
                />
              </div>
            </div>
          </div>

          <div className="p-10 bg-muted/30 border-t border-border flex justify-end gap-4">
            <Button variant="ghost" onClick={() => setShowCreate(false)} className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest text-xs">Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 px-10 font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/10"
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : 'Launch Poll'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PollsPage;
