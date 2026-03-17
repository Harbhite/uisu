import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, BarChart3, Vote, Clock, CheckCircle2, Loader2, Lock, Users,
  Trash2, EyeOff, Share2, Search, Filter, TrendingUp, Timer, Sparkles,
  ChevronDown, Copy, X, Award, Flame, Calendar, RotateCcw
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

      // Trigger confetti
      setConfettiPoll(pollId);
      setTimeout(() => setConfettiPoll(null), 2000);
      setChangingVote(null);

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
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl py-12 md:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <button onClick={() => navigate('/')} className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/60 hover:text-primary-foreground transition-colors mb-8">
              <div className="p-2 border border-primary-foreground/20 rounded-full group-hover:border-primary-foreground/50"><ArrowLeft size={14} /></div>
              Back to Home
            </button>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-accent/20 flex items-center justify-center">
                    <Vote className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent">Community Voice</span>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif leading-[0.9] mb-4">
                  Polls &<br /><span className="italic text-primary-foreground/60">Voting</span>
                </h1>
                <p className="text-primary-foreground/50 text-sm max-w-md font-light leading-relaxed">
                  Shape the future of your student union. Every vote counts, every voice matters.
                </p>
              </div>

              {isStaff && (
                <Button
                  onClick={() => setShowCreate(true)}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 self-start md:self-end"
                >
                  <Plus size={16} className="mr-2" /> Create Poll
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="border-b border-border bg-card rounded-b-2xl">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {[
              { label: 'Total Polls', value: stats.total, icon: BarChart3 },
              { label: 'Active Now', value: stats.active, icon: Flame },
              { label: 'Total Votes', value: stats.totalVotes, icon: TrendingUp },
              { label: 'You Voted', value: stats.participated, icon: Award },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="py-5 px-4 md:px-6 text-center"
              >
                <stat.icon size={14} className="mx-auto text-accent mb-1.5" />
                <div className="text-2xl font-serif font-bold text-foreground">{stat.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter & Search Bar ── */}
      <div className="container mx-auto px-4 md:px-6 max-w-5xl mt-8 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search polls..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {([
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'closed', label: 'Closed' },
              { key: 'voted', label: 'Voted' },
              { key: 'not_voted', label: 'Not Voted' },
            ] as { key: FilterType; label: string }[]).map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest whitespace-nowrap border transition-all ${
                  filter === f.key
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Polls List ── */}
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <AnimatePresence mode="wait">
          {filteredPolls.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 bg-card border border-border"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-muted flex items-center justify-center">
                <BarChart3 size={32} className="text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl mb-2 text-foreground">No polls found</h3>
              <p className="text-muted-foreground text-sm font-light">
                {searchQuery ? 'Try adjusting your search.' : 'Check back later for community polls.'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {filteredPolls.map((poll, index) => {
                const pollOptions = options[poll.id] || [];
                const hasVoted = !!userVotes[poll.id]?.length;
                const totalVotes = pollOptions.reduce((s, o) => s + o.vote_count, 0);
                const canSeeResults = poll.status === 'closed' || poll.show_results_before_close || hasVoted;
                const isExpired = poll.ends_at ? isPast(new Date(poll.ends_at)) : false;
                const isClosed = poll.status === 'closed' || isExpired;
                const winner = isClosed ? getWinningOption(poll.id) : null;
                const isChanging = changingVote === poll.id;
                const showVoteUI = (!isClosed && !hasVoted) || isChanging;

                return (
                  <motion.div
                    key={poll.id}
                    id={poll.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    className="relative bg-card border border-border overflow-hidden rounded-2xl shadow-sm hover:shadow-md group"
                  >
                    {/* Confetti overlay */}
                    {confettiPoll === poll.id && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                        {Array.from({ length: 30 }).map((_, i) => (
                          <ConfettiPiece key={i} delay={Math.random() * 0.5} x={Math.random() * 100} />
                        ))}
                      </div>
                    )}

                    {/* Status accent bar */}
                    <div className={`h-1 w-full ${isClosed ? 'bg-muted-foreground/30' : 'bg-accent'}`} />

                    <div className="p-6 md:p-8">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <Badge
                              variant={isClosed ? 'secondary' : 'default'}
                              className={`text-[10px] font-bold tracking-wider uppercase ${!isClosed ? 'bg-accent text-accent-foreground' : ''}`}
                            >
                              {isClosed ? 'Closed' : 'Live'}
                            </Badge>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              {poll.poll_type.replace('_', ' ')}
                            </span>
                            {poll.is_anonymous && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                <EyeOff size={10} /> Anonymous
                              </span>
                            )}
                          </div>
                          <h2 className="text-xl md:text-2xl font-serif text-foreground leading-tight">{poll.title}</h2>
                        </div>

                        <button
                          onClick={() => sharePoll(poll)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors shrink-0"
                          title="Copy link"
                        >
                          <Share2 size={16} />
                        </button>
                      </div>

                      {poll.description && (
                        <p className="text-sm text-muted-foreground font-light mb-4 leading-relaxed">{poll.description}</p>
                      )}

                      {/* Meta row */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Users size={12} className="text-accent" />
                          <span className="font-bold text-foreground">{totalVotes}</span> votes
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {format(new Date(poll.created_at), 'MMM d, yyyy')}
                        </span>
                        {poll.ends_at && !isClosed && <CountdownTimer endsAt={poll.ends_at} />}
                        {isClosed && poll.ends_at && (
                          <span className="text-xs">Ended {formatDistanceToNow(new Date(poll.ends_at))} ago</span>
                        )}
                      </div>

                      {/* Winner announcement for closed polls */}
                      {isClosed && winner && totalVotes > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-6 p-4 border border-accent/30 rounded-xl bg-accent/5"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Award size={16} className="text-accent" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Winner</span>
                          </div>
                          <span className="font-serif text-lg text-foreground">{winner.label}</span>
                          <span className="text-muted-foreground text-sm ml-2">
                            — {totalVotes > 0 ? Math.round((winner.vote_count / totalVotes) * 100) : 0}%
                          </span>
                        </motion.div>
                      )}

                      {/* Options */}
                      <div className="space-y-2">
                        {pollOptions.map((opt, optIndex) => {
                          const isSelected = selectedOptions[poll.id]?.includes(opt.id) || (!isChanging && userVotes[poll.id]?.includes(opt.id));
                          const percentage = totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0;
                          const isWinner = isClosed && winner?.id === opt.id;

                          return (
                            <motion.div
                              key={opt.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: optIndex * 0.05 }}
                            >
                              {showVoteUI ? (
                                <button
                                  onClick={() => toggleOption(poll.id, opt.id, poll.poll_type, poll.max_choices)}
                                  className={`w-full text-left p-4 border-2 transition-all relative overflow-hidden rounded-xl ${
                                    isSelected
                                      ? 'border-primary bg-primary/5'
                                      : 'border-border hover:border-primary/30 bg-card'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 relative z-10">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                      isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                                    }`}>
                                      {isSelected && <CheckCircle2 size={12} className="text-primary-foreground" />}
                                    </div>
                                    <span className="font-medium text-sm text-foreground">{opt.label}</span>
                                  </div>
                                  {/* Live result overlay during voting if show_results_before_close */}
                                  {poll.show_results_before_close && totalVotes > 0 && (
                                    <div
                                      className="absolute inset-y-0 left-0 bg-accent/10 transition-all duration-500"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  )}
                                </button>
                              ) : (
                                <div className={`p-4 border relative overflow-hidden rounded-xl ${isWinner ? 'border-accent bg-accent/5' : 'border-border bg-card'}`}>
                                  {/* Result bar */}
                                  {canSeeResults && (
                                    <motion.div
                                      className={`absolute inset-y-0 left-0 ${isWinner ? 'bg-accent/15' : 'bg-primary/5'}`}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${percentage}%` }}
                                      transition={{ duration: 0.8, delay: optIndex * 0.1, ease: 'easeOut' }}
                                    />
                                  )}
                                  <div className="flex justify-between items-center relative z-10">
                                    <div className="flex items-center gap-2">
                                      {userVotes[poll.id]?.includes(opt.id) && (
                                        <CheckCircle2 size={14} className="text-primary" />
                                      )}
                                      {isWinner && <Sparkles size={14} className="text-accent" />}
                                      <span className={`font-medium text-sm ${isWinner ? 'text-foreground font-bold' : 'text-foreground'}`}>
                                        {opt.label}
                                      </span>
                                    </div>
                                    {canSeeResults && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">{opt.vote_count}</span>
                                        <span className={`text-sm font-bold font-serif ${isWinner ? 'text-accent' : 'text-foreground'}`}>
                                          {percentage}%
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex flex-wrap gap-2 items-center">
                        {showVoteUI && userId && (
                          <Button
                            onClick={() => handleVote(poll.id)}
                            disabled={!selectedOptions[poll.id]?.length || voting === poll.id}
                            className="bg-primary text-primary-foreground"
                          >
                            {voting === poll.id ? (
                              <><Loader2 size={16} className="animate-spin mr-2" /> Submitting...</>
                            ) : (
                              <><Vote size={16} className="mr-2" /> {isChanging ? 'Update Vote' : 'Submit Vote'}</>
                            )}
                          </Button>
                        )}

                        {isChanging && (
                          <Button variant="ghost" size="sm" onClick={() => setChangingVote(null)}>
                            <X size={14} className="mr-1" /> Cancel
                          </Button>
                        )}

                        {hasVoted && !isClosed && !isChanging && (
                          <Button variant="outline" size="sm" onClick={() => startChangeVote(poll.id)}>
                            <RotateCcw size={14} className="mr-1" /> Change Vote
                          </Button>
                        )}

                        {!userId && !isClosed && (
                          <p className="text-sm text-muted-foreground">
                            <Lock size={14} className="inline mr-1" /> Sign in to vote
                          </p>
                        )}

                        {/* Staff actions */}
                        {isStaff && (
                          <div className="ml-auto flex gap-2">
                            {!isClosed && (
                              <Button variant="outline" size="sm" onClick={() => closePoll(poll.id)} className="text-xs">
                                <Lock size={12} className="mr-1" /> Close
                              </Button>
                            )}
                            <Button variant="destructive" size="sm" onClick={() => deletePoll(poll.id)} className="text-xs">
                              <Trash2 size={12} className="mr-1" /> Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Create Poll Dialog ── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Create a Poll</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Question / Title *</Label>
              <Input placeholder="What should we decide on?" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Description</Label>
              <Textarea placeholder="Add context for voters..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />
            </div>

            <div>
              <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Voting Method</Label>
              <Select value={form.poll_type} onValueChange={v => setForm(p => ({ ...p, poll_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_choice">Single Choice — Pick one</SelectItem>
                  <SelectItem value="approval">Approval — Pick multiple</SelectItem>
                  <SelectItem value="ranked_choice">Ranked Choice — Order by preference</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.poll_type === 'approval' && (
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Max Selections</Label>
                <Input type="number" min={1} max={10} value={form.max_choices} onChange={e => setForm(p => ({ ...p, max_choices: parseInt(e.target.value) || 1 }))} />
              </div>
            )}

            {/* Options */}
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Options *</Label>
              <div className="space-y-2">
                {newOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-xs font-bold text-muted-foreground w-5 text-center shrink-0">{i + 1}</span>
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
                      <Button variant="ghost" size="icon" className="shrink-0 h-10 w-10" onClick={() => setNewOptions(prev => prev.filter((_, j) => j !== i))}>
                        <X size={14} />
                      </Button>
                    )}
                  </div>
                ))}
                {newOptions.length < 10 && (
                  <Button variant="outline" size="sm" onClick={() => setNewOptions(prev => [...prev, ''])} className="w-full border-dashed">
                    <Plus size={14} className="mr-1" /> Add Option
                  </Button>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="border border-border p-4 space-y-4 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground block">Settings</span>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-light">Anonymous voting</Label>
                <Switch checked={form.is_anonymous} onCheckedChange={v => setForm(p => ({ ...p, is_anonymous: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-light">Show live results</Label>
                <Switch checked={form.show_results_before_close} onCheckedChange={v => setForm(p => ({ ...p, show_results_before_close: v }))} />
              </div>
            </div>

            <div>
              <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">End Date (optional)</Label>
              <Input type="datetime-local" value={form.ends_at} onChange={e => setForm(p => ({ ...p, ends_at: e.target.value }))} />
            </div>

            <Button onClick={handleCreate} disabled={creating} className="w-full">
              {creating ? <><Loader2 size={16} className="animate-spin mr-2" /> Creating...</> : <><Sparkles size={16} className="mr-2" /> Publish Poll</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PollsPage;
