import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ThumbsUp, Plus, Loader2, Clock, CheckCircle2, Eye, EyeOff, ArrowLeft, Search, ArrowUpDown, BarChart3, MessageCircle, Send, Trash2, TrendingUp, Timer, PieChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const CATEGORIES = ['Welfare', 'Academic', 'Facilities', 'Security', 'Transport', 'General'];
const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: <Clock size={12} /> },
  reviewing: { label: 'Reviewing', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: <Eye size={12} /> },
  in_progress: { label: 'In Progress', color: 'bg-purple-50 text-purple-600 border-purple-200', icon: <Loader2 size={12} /> },
  resolved: { label: 'Resolved', color: 'bg-green-50 text-green-600 border-green-200', icon: <CheckCircle2 size={12} /> },
  closed: { label: 'Closed', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: <EyeOff size={12} /> },
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most_upvoted', label: 'Most Upvoted' },
  { value: 'priority_high', label: 'Priority: High → Low' },
];

interface Complaint {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  resolution: string | null;
  is_anonymous: boolean;
  upvotes: number;
  assigned_to: string | null;
  created_at: string;
}

interface Comment {
  id: string;
  complaint_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: { full_name: string | null; avatar_url: string | null };
}

const ComplaintsPage = () => {
  const navigate = useNavigate();
  const { isStaff, user } = useAdminCheck();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userUpvotes, setUserUpvotes] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<'all' | 'mine'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showStats, setShowStats] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<Complaint | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'General', priority: 'medium', is_anonymous: false });
  const [staffForm, setStaffForm] = useState({ status: '', resolution: '', assigned_to: '' });
  const [updatingStaff, setUpdatingStaff] = useState(false);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id || null;
      setCurrentUser(uid);
      fetchComplaints();
      if (uid) fetchUserUpvotes(uid);
    });
  }, []);

  const fetchComplaints = async () => {
    const { data, error } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    if (!error && data) setComplaints(data);
    setLoading(false);
  };

  const fetchUserUpvotes = async (uid: string) => {
    const { data } = await supabase.from('complaint_upvotes').select('complaint_id').eq('user_id', uid);
    if (data) setUserUpvotes(new Set(data.map(d => d.complaint_id)));
  };

  const fetchComments = async (complaintId: string) => {
    setCommentsLoading(true);
    const { data, error } = await supabase
      .from('complaint_comments')
      .select('*')
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      // Fetch profiles for comment authors
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const commentsWithProfiles = data.map(c => ({
        ...c,
        profile: profileMap.get(c.user_id) || { full_name: null, avatar_url: null }
      }));
      setComments(commentsWithProfiles);
    }
    setCommentsLoading(false);
  };

  const handleCreate = async () => {
    if (!form.title || !form.description) { toast.error('Title and description required'); return; }
    if (!currentUser) { toast.error('Please sign in'); return; }
    setCreating(true);
    try {
      const { error } = await supabase.from('complaints').insert({
        user_id: currentUser, title: form.title, description: form.description,
        category: form.category, priority: form.priority, is_anonymous: form.is_anonymous,
      });
      if (error) throw error;
      toast.success('Complaint submitted');
      setShowCreateModal(false);
      setForm({ title: '', description: '', category: 'General', priority: 'medium', is_anonymous: false });
      fetchComplaints();
    } catch { toast.error('Failed to submit'); }
    finally { setCreating(false); }
  };

  const handleUpvote = async (complaintId: string) => {
    if (!currentUser) { toast.error('Please sign in'); return; }
    if (userUpvotes.has(complaintId)) {
      await supabase.from('complaint_upvotes').delete().eq('complaint_id', complaintId).eq('user_id', currentUser);
      setUserUpvotes(prev => { const n = new Set(prev); n.delete(complaintId); return n; });
    } else {
      await supabase.from('complaint_upvotes').insert({ complaint_id: complaintId, user_id: currentUser });
      setUserUpvotes(prev => new Set(prev).add(complaintId));
    }
    fetchComplaints();
  };

  const handleStaffUpdate = async () => {
    if (!showDetailModal) return;
    setUpdatingStaff(true);
    try {
      const updates: any = {};
      if (staffForm.status) updates.status = staffForm.status;
      if (staffForm.resolution) updates.resolution = staffForm.resolution;
      if (staffForm.assigned_to) updates.assigned_to = staffForm.assigned_to;
      const { error } = await supabase.from('complaints').update(updates).eq('id', showDetailModal.id);
      if (error) throw error;
      toast.success('Complaint updated');
      fetchComplaints();
      setShowDetailModal(null);
    } catch { toast.error('Update failed'); }
    finally { setUpdatingStaff(false); }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !showDetailModal || !currentUser) return;
    setSubmittingComment(true);
    try {
      const { error } = await supabase.from('complaint_comments').insert({
        complaint_id: showDetailModal.id,
        user_id: currentUser,
        content: newComment.trim(),
      });
      if (error) throw error;
      setNewComment('');
      fetchComments(showDetailModal.id);
      toast.success('Comment added');
    } catch { toast.error('Failed to post comment'); }
    finally { setSubmittingComment(false); }
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase.from('complaint_comments').delete().eq('id', commentId);
    if (!error && showDetailModal) {
      fetchComments(showDetailModal.id);
      toast.success('Comment deleted');
    }
  };

  // Filtering, searching, sorting
  const filtered = useMemo(() => {
    let result = complaints.filter(c => {
      if (tab === 'mine' && c.user_id !== currentUser) return false;
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!c.title.toLowerCase().includes(q) && !c.description.toLowerCase().includes(q) && !c.category.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    switch (sortBy) {
      case 'oldest': result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break;
      case 'most_upvoted': result.sort((a, b) => b.upvotes - a.upvotes); break;
      case 'priority_high': {
        const pOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        result.sort((a, b) => (pOrder[a.priority] ?? 2) - (pOrder[b.priority] ?? 2));
        break;
      }
      default: result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [complaints, tab, categoryFilter, statusFilter, searchQuery, sortBy, currentUser]);

  const getPriorityStyle = (p: string) => {
    if (p === 'high') return 'text-red-600 bg-red-50 border-red-100';
    if (p === 'medium') return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-slate-500 bg-slate-50 border-slate-100';
  };

  // Stats
  const stats = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const inProgress = complaints.filter(c => c.status === 'in_progress' || c.status === 'reviewing').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    
    const categoryBreakdown = CATEGORIES.map(cat => ({
      name: cat,
      count: complaints.filter(c => c.category === cat).length,
    })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

    const highPriority = complaints.filter(c => c.priority === 'high' && c.status !== 'resolved' && c.status !== 'closed').length;

    return { total, resolved, pending, inProgress, resolutionRate, categoryBreakdown, highPriority };
  }, [complaints]);

  // Open detail modal with comments
  const openDetail = (c: Complaint) => {
    setShowDetailModal(c);
    setStaffForm({ status: c.status, resolution: c.resolution || '', assigned_to: c.assigned_to || '' });
    setComments([]);
    setNewComment('');
    fetchComments(c.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <SEO title="Complaints & Petitions - UISU SPACE" description="Submit and track complaints, petitions, and feedback" />

      <div className="container mx-auto px-6">
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors mb-12"
        >
          <div className="p-2 border border-slate-200 rounded-md group-hover:border-accent transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <AlertTriangle className="text-accent w-6 h-6" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Student Voice</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStats(!showStats)}
                className="gap-2 rounded-md text-xs uppercase tracking-widest"
              >
                <BarChart3 size={14} /> Stats
              </Button>
              <Button
                onClick={() => currentUser ? setShowCreateModal(true) : toast.error('Please sign in')}
                className="gap-2 rounded-md text-xs uppercase tracking-widest bg-primary hover:bg-primary/90"
              >
                <Plus size={16} /> Submit Complaint
              </Button>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl text-primary mb-6 leading-tight"
          >
            Complaints & <span className="italic text-slate-300">Petitions</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 font-light max-w-2xl leading-relaxed"
          >
            Voice your concerns. Track resolutions. Make a difference.
          </motion.p>
        </div>

        {/* Stats Dashboard */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 overflow-hidden"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total', value: stats.total, icon: <PieChart size={18} />, color: 'text-primary' },
                  { label: 'Pending', value: stats.pending, icon: <Clock size={18} />, color: 'text-amber-500' },
                  { label: 'In Progress', value: stats.inProgress, icon: <Timer size={18} />, color: 'text-purple-500' },
                  { label: 'Resolved', value: stats.resolved, icon: <CheckCircle2 size={18} />, color: 'text-green-500' },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white border border-slate-200 rounded-lg p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`${s.color}`}>{s.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</span>
                    </div>
                    <p className="font-serif text-3xl text-primary font-bold">{s.value}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Resolution Rate */}
                <div className="bg-white border border-slate-200 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={16} className="text-accent" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Resolution Rate</span>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="font-serif text-4xl font-bold text-primary">{stats.resolutionRate}%</span>
                    <span className="text-sm text-slate-400 pb-1">{stats.resolved} of {stats.total} resolved</span>
                  </div>
                  <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.resolutionRate}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-green-500 rounded-full"
                    />
                  </div>
                  {stats.highPriority > 0 && (
                    <p className="text-xs text-red-500 font-medium mt-3">
                      ⚠ {stats.highPriority} high priority complaint{stats.highPriority > 1 ? 's' : ''} unresolved
                    </p>
                  )}
                </div>

                {/* Category Breakdown */}
                <div className="bg-white border border-slate-200 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <PieChart size={16} className="text-accent" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">By Category</span>
                  </div>
                  <div className="space-y-2">
                    {stats.categoryBreakdown.map(cat => (
                      <div key={cat.name} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-600 w-20">{cat.name}</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(cat.count / stats.total) * 100}%` }}
                            transition={{ duration: 0.6 }}
                            className="h-full bg-primary/70 rounded-full"
                          />
                        </div>
                        <span className="text-xs font-bold text-primary w-6 text-right">{cat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search + Filters */}
        <div className="flex flex-col gap-3 mb-12">
          {/* Search Bar */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search complaints by title, description, or category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-11 rounded-md border-slate-200 h-12"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Tabs value={tab} onValueChange={v => setTab(v as any)} className="w-full sm:w-auto">
              <TabsList className="rounded-md bg-white border border-slate-200 p-1 h-auto grid grid-cols-2 w-full sm:w-[300px]">
                <TabsTrigger value="all" className="rounded-md py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All</TabsTrigger>
                <TabsTrigger value="mine" className="rounded-md py-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">My Submissions</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 rounded-md border-slate-200 h-full min-h-[42px] text-xs font-bold uppercase tracking-widest text-slate-500">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="rounded-md border-slate-200">
                <SelectItem value="all" className="text-xs uppercase tracking-widest">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-xs uppercase tracking-widest">{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 rounded-md border-slate-200 h-full min-h-[42px] text-xs font-bold uppercase tracking-widest text-slate-500">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-md border-slate-200">
                <SelectItem value="all" className="text-xs uppercase tracking-widest">All Status</SelectItem>
                {Object.entries(STATUS_MAP).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs uppercase tracking-widest">{v.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-52 rounded-md border-slate-200 h-full min-h-[42px] text-xs font-bold uppercase tracking-widest text-slate-500">
                <ArrowUpDown size={12} className="mr-1" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="rounded-md border-slate-200">
                {SORT_OPTIONS.map(s => <SelectItem key={s.value} value={s.value} className="text-xs uppercase tracking-widest">{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            {filtered.length} complaint{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-white border border-slate-200 rounded-lg">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-6 rounded-lg">
              <AlertTriangle size={28} className="text-slate-300" />
            </div>
            <h3 className="font-serif text-xl text-primary mb-2">No complaints found</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">Adjust your filters or submit a new complaint.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((c, i) => {
                const statusInfo = STATUS_MAP[c.status] || STATUS_MAP.pending;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="bg-white border border-slate-200 rounded-lg p-6 hover:border-accent transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md"
                    onClick={() => openDetail(c)}
                  >
                    <div className="flex items-start gap-6">
                      {/* Upvote */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpvote(c.id); }}
                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md border transition-colors min-w-[60px] ${
                          userUpvotes.has(c.id)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-accent hover:text-accent'
                        }`}
                      >
                        <ThumbsUp size={16} className={userUpvotes.has(c.id) ? 'fill-white' : ''} />
                        <span className="text-xs font-bold">{c.upvotes}</span>
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-serif text-xl font-bold text-primary group-hover:text-accent transition-colors">{c.title}</h3>
                              {c.is_anonymous && (
                                <Badge variant="outline" className="text-[9px] rounded-md border-slate-200 text-slate-400 uppercase tracking-widest font-bold">
                                  Anonymous
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap text-xs">
                              <Badge variant="outline" className="text-[9px] rounded-md border-slate-200 text-slate-500 uppercase tracking-widest font-bold bg-slate-50">
                                {c.category}
                              </Badge>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-400">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className={`text-[9px] rounded-md uppercase tracking-widest font-bold ${statusInfo.color}`}>
                              <span className="mr-1.5">{statusInfo.icon}</span>{statusInfo.label}
                            </Badge>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 border rounded-md ${getPriorityStyle(c.priority)}`}>
                              {c.priority} Priority
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-500 line-clamp-2 font-light leading-relaxed max-w-3xl">
                          {c.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg rounded-lg border-slate-200">
          <DialogHeader><DialogTitle className="font-serif text-2xl text-primary">Submit a Complaint</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Title</label>
              <Input placeholder="Short summary" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="rounded-md border-slate-200" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Description</label>
              <Textarea placeholder="Describe your complaint in detail..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={5} className="rounded-md border-slate-200" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Category</label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="rounded-md border-slate-200"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-md border-slate-200">
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Priority</label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger className="rounded-md border-slate-200"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-md border-slate-200">
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Switch checked={form.is_anonymous} onCheckedChange={v => setForm(f => ({ ...f, is_anonymous: v }))} />
              <div>
                <Label className="text-sm font-medium text-primary">Submit anonymously</Label>
                <p className="text-xs text-slate-400 font-light mt-0.5">Hide your identity from other students (staff can still view)</p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="rounded-md border-slate-200 text-xs uppercase tracking-widest font-bold">Cancel</Button>
            <Button onClick={handleCreate} disabled={creating} className="rounded-md bg-primary text-xs uppercase tracking-widest font-bold">
              {creating && <Loader2 size={14} className="animate-spin mr-2" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!showDetailModal} onOpenChange={() => setShowDetailModal(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border-slate-200">
          {showDetailModal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline" className={`rounded-md text-[9px] font-bold uppercase tracking-widest ${STATUS_MAP[showDetailModal.status]?.color}`}>
                    {STATUS_MAP[showDetailModal.status]?.label}
                  </Badge>
                  <Badge variant="outline" className="rounded-md border-slate-200 text-slate-500 text-[9px] font-bold uppercase tracking-widest bg-slate-50">
                    {showDetailModal.category}
                  </Badge>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 border rounded-md ${getPriorityStyle(showDetailModal.priority)}`}>
                    {showDetailModal.priority} Priority
                  </span>
                </div>
                <DialogTitle className="font-serif text-2xl text-primary">{showDetailModal.title}</DialogTitle>
              </DialogHeader>

              <p className="text-sm text-slate-600 whitespace-pre-wrap font-light leading-relaxed my-4">
                {showDetailModal.description}
              </p>

              {showDetailModal.resolution && (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={14} className="text-green-600" />
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">Resolution</p>
                  </div>
                  <p className="text-sm text-slate-600 font-light">{showDetailModal.resolution}</p>
                </div>
              )}

              {showDetailModal.assigned_to && (
                <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
                  Assigned to: <strong className="text-primary font-medium">{showDetailModal.assigned_to}</strong>
                </p>
              )}

              {/* Comment Thread */}
              <div className="mt-6 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle size={16} className="text-accent" />
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Discussion ({comments.length})</h4>
                </div>

                {commentsLoading ? (
                  <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin text-slate-300" /></div>
                ) : comments.length === 0 ? (
                  <p className="text-sm text-slate-400 font-light py-4 text-center">No comments yet. Be the first to discuss.</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                    {comments.map(comment => (
                      <div key={comment.id} className="bg-slate-50 border border-slate-100 rounded-md p-4 group/comment">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                              {(comment.profile?.full_name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-bold text-primary">{comment.profile?.full_name || 'Anonymous'}</span>
                            <span className="text-[10px] text-slate-400">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                          </div>
                          {(comment.user_id === currentUser || isStaff) && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="opacity-0 group-hover/comment:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 font-light pl-8">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {currentUser && (
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmitComment()}
                      className="rounded-md border-slate-200 flex-1"
                    />
                    <Button
                      size="icon"
                      onClick={handleSubmitComment}
                      disabled={submittingComment || !newComment.trim()}
                      className="rounded-md bg-primary shrink-0"
                    >
                      {submittingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    </Button>
                  </div>
                )}
              </div>

              {/* Staff Actions */}
              {isStaff && (
                <div className="bg-slate-50 border border-slate-200 p-6 mt-6 space-y-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={14} className="text-accent" />
                    <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Staff Actions</h4>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Update Status</label>
                    <Select value={staffForm.status} onValueChange={v => setStaffForm(f => ({ ...f, status: v }))}>
                      <SelectTrigger className="rounded-md border-slate-200 bg-white"><SelectValue placeholder="Update status" /></SelectTrigger>
                      <SelectContent className="rounded-md border-slate-200">
                        {Object.entries(STATUS_MAP).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Assign To</label>
                    <Input placeholder="Staff name" value={staffForm.assigned_to} onChange={e => setStaffForm(f => ({ ...f, assigned_to: e.target.value }))} className="rounded-md border-slate-200 bg-white" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Resolution Note</label>
                    <Textarea placeholder="Resolution note..." value={staffForm.resolution} onChange={e => setStaffForm(f => ({ ...f, resolution: e.target.value }))} className="rounded-md border-slate-200 bg-white" />
                  </div>

                  <Button onClick={handleStaffUpdate} disabled={updatingStaff} className="w-full rounded-md bg-primary uppercase tracking-widest text-xs font-bold">
                    {updatingStaff && <Loader2 size={14} className="animate-spin mr-2" />}
                    Update Complaint
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplaintsPage;
