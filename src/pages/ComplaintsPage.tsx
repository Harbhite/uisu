import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ThumbsUp, MessageSquare, Plus, Filter, Loader2, Clock, CheckCircle2, Eye, EyeOff, ChevronDown } from 'lucide-react';
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
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock size={12} /> },
  reviewing: { label: 'Reviewing', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Eye size={12} /> },
  in_progress: { label: 'In Progress', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: <Loader2 size={12} /> },
  resolved: { label: 'Resolved', color: 'bg-green-50 text-green-700 border-green-200', icon: <CheckCircle2 size={12} /> },
  closed: { label: 'Closed', color: 'bg-secondary text-muted-foreground border-border', icon: <EyeOff size={12} /> },
};

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

const ComplaintsPage = () => {
  const { isStaff } = useAdminCheck();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userUpvotes, setUserUpvotes] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<'all' | 'mine'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<Complaint | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'General', priority: 'medium', is_anonymous: false });
  // Staff update
  const [staffForm, setStaffForm] = useState({ status: '', resolution: '', assigned_to: '' });
  const [updatingStaff, setUpdatingStaff] = useState(false);

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

  const filtered = complaints.filter(c => {
    if (tab === 'mine' && c.user_id !== currentUser) return false;
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  const getPriorityColor = (p: string) => {
    if (p === 'high') return 'text-destructive';
    if (p === 'medium') return 'text-amber-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Complaints & Petitions - UISU SPACE" description="Submit and track complaints, petitions, and feedback" />
      

      <div className="container mx-auto px-4 pt-28 pb-16 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-2">Complaints & Petitions</h1>
            <p className="text-muted-foreground">Voice your concerns. Track resolutions. Make a difference.</p>
          </div>
          <Button onClick={() => currentUser ? setShowCreateModal(true) : toast.error('Please sign in')} className="gap-2 shrink-0">
            <Plus size={18} /> Submit Complaint
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Tabs value={tab} onValueChange={v => setTab(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="mine">My Submissions</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(STATUS_MAP).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <AlertTriangle size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No complaints found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c, i) => {
              const statusInfo = STATUS_MAP[c.status] || STATUS_MAP.pending;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-card border border-border p-5 hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => { setShowDetailModal(c); setStaffForm({ status: c.status, resolution: c.resolution || '', assigned_to: c.assigned_to || '' }); }}
                >
                  <div className="flex items-start gap-4">
                    {/* Upvote */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUpvote(c.id); }}
                      className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded transition-colors ${userUpvotes.has(c.id) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <ThumbsUp size={16} className={userUpvotes.has(c.id) ? 'fill-primary' : ''} />
                      <span className="text-xs font-bold">{c.upvotes}</span>
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-foreground">{c.title}</h3>
                        {c.is_anonymous && <Badge variant="outline" className="text-[10px]">Anonymous</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{c.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] ${statusInfo.color}`}>
                          <span className="mr-1">{statusInfo.icon}</span>{statusInfo.label}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{c.category}</Badge>
                        <span className={`text-[10px] font-bold uppercase ${getPriorityColor(c.priority)}`}>{c.priority}</span>
                        <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Submit a Complaint</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Describe your complaint in detail *" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={5} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_anonymous} onCheckedChange={v => setForm(f => ({ ...f, is_anonymous: v }))} />
              <Label>Submit anonymously</Label>
            </div>
            <p className="text-xs text-muted-foreground">Anonymous submissions hide your identity from other students but staff can still view it.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 size={16} className="animate-spin mr-2" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!showDetailModal} onOpenChange={() => setShowDetailModal(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {showDetailModal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="outline" className={`${STATUS_MAP[showDetailModal.status]?.color}`}>
                    {STATUS_MAP[showDetailModal.status]?.label}
                  </Badge>
                  <Badge variant="outline">{showDetailModal.category}</Badge>
                  <span className={`text-xs font-bold uppercase ${getPriorityColor(showDetailModal.priority)}`}>{showDetailModal.priority}</span>
                </div>
                <DialogTitle>{showDetailModal.title}</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{showDetailModal.description}</p>
              {showDetailModal.resolution && (
                <div className="bg-green-50 border border-green-200 p-3 rounded">
                  <p className="text-xs font-bold text-green-700 mb-1">Resolution</p>
                  <p className="text-sm text-green-800">{showDetailModal.resolution}</p>
                </div>
              )}
              {showDetailModal.assigned_to && (
                <p className="text-xs text-muted-foreground">Assigned to: <strong>{showDetailModal.assigned_to}</strong></p>
              )}

              {/* Staff Actions */}
              {isStaff && (
                <div className="border-t border-border pt-4 space-y-3">
                  <h4 className="text-sm font-bold text-foreground">Staff Actions</h4>
                  <Select value={staffForm.status} onValueChange={v => setStaffForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue placeholder="Update status" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_MAP).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Assign to (staff name)" value={staffForm.assigned_to} onChange={e => setStaffForm(f => ({ ...f, assigned_to: e.target.value }))} />
                  <Textarea placeholder="Resolution note..." value={staffForm.resolution} onChange={e => setStaffForm(f => ({ ...f, resolution: e.target.value }))} />
                  <Button onClick={handleStaffUpdate} disabled={updatingStaff} className="w-full">
                    {updatingStaff && <Loader2 size={16} className="animate-spin mr-2" />}
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
