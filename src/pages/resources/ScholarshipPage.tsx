import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, GraduationCap, Calendar, 
  Bookmark, BookmarkCheck, Share2, ExternalLink,
  Clock, CheckCircle2, XCircle, AlertCircle,
  Award, Globe, Building2, X, ArrowRight, Plus, Pencil, Trash2
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type ScholarshipCategory = 'all' | 'local' | 'international' | 'corporate';
type ApplicationStatus = 'not_started' | 'in_progress' | 'submitted' | 'accepted' | 'rejected';

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount: string;
  deadline: string;
  category: 'local' | 'international' | 'corporate';
  eligibility: string[];
  description: string;
  application_url: string;
}

const useBookmarks = (key: string) => {
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(bookmarks));
  }, [bookmarks, key]);

  const toggle = (id: string) => {
    setBookmarks(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const isBookmarked = (id: string) => bookmarks.includes(id);

  return { bookmarks, toggle, isBookmarked };
};

const useApplicationStatus = () => {
  const [statuses, setStatuses] = useState<Record<string, ApplicationStatus>>(() => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem('scholarship-statuses');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('scholarship-statuses', JSON.stringify(statuses));
  }, [statuses]);

  const setStatus = (id: string, status: ApplicationStatus) => {
    setStatuses(prev => ({ ...prev, [id]: status }));
  };

  const getStatus = (id: string): ApplicationStatus => statuses[id] || 'not_started';

  return { statuses, setStatus, getStatus };
};

const getDaysRemaining = (deadline: string) => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getDeadlineStatus = (deadline: string) => {
  const days = getDaysRemaining(deadline);
  if (days < 0) return { status: 'expired', color: 'text-red-600' };
  if (days <= 7) return { status: 'urgent', color: 'text-orange-600' };
  if (days <= 30) return { status: 'soon', color: 'text-amber-600' };
  return { status: 'open', color: 'text-green-700' };
};

const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
  const configs: Record<ApplicationStatus, { label: string; icon: typeof CheckCircle2; color: string }> = {
    not_started: { label: 'Not Started', icon: Clock, color: 'text-slate-500' },
    in_progress: { label: 'In Progress', icon: AlertCircle, color: 'text-ui-blue' },
    submitted: { label: 'Submitted', icon: CheckCircle2, color: 'text-green-600' },
    accepted: { label: 'Accepted', icon: CheckCircle2, color: 'text-emerald-600' },
    rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-600' }
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
};

const ScholarshipCard: React.FC<{
  scholarship: Scholarship;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onShare: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  status: ApplicationStatus;
  index: number;
  isStaff?: boolean;
}> = ({ scholarship, isBookmarked, onToggleBookmark, onShare, onEdit, onDelete, status, index, isStaff }) => {
  const deadlineInfo = getDeadlineStatus(scholarship.deadline);
  const daysRemaining = getDaysRemaining(scholarship.deadline);

  const categoryConfig = {
    local: { icon: Award, label: 'Local', color: 'text-emerald-700' },
    international: { icon: Globe, label: 'International', color: 'text-ui-blue' },
    corporate: { icon: Building2, label: 'Corporate', color: 'text-nobel-gold' }
  };

  const config = categoryConfig[scholarship.category];
  const CategoryIcon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="bg-white border border-slate-100 hover:border-nobel-gold/50 hover:shadow-lg transition-all duration-300 group"
    >
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div className={`w-12 h-12 bg-slate-50 border border-slate-100 flex items-center justify-center ${config.color}`}>
            <CategoryIcon size={20} />
          </div>
          <div className="flex items-center gap-1">
            {isStaff && (
              <>
                <button
                  onClick={onEdit}
                  className="p-2 text-slate-300 hover:text-ui-blue transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
            <button
              onClick={onToggleBookmark}
              className={`p-2 transition-colors ${
                isBookmarked 
                  ? 'text-nobel-gold' 
                  : 'text-slate-300 hover:text-slate-600'
              }`}
            >
              {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
            <button
              onClick={onShare}
              className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${config.color}`}>
            {config.label}
          </span>
        </div>

        <h3 className="font-serif text-2xl text-ui-blue group-hover:text-nobel-gold transition-colors mb-2 leading-tight">
          {scholarship.title}
        </h3>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">{scholarship.provider}</p>

        <p className="text-slate-600 leading-relaxed text-sm font-light line-clamp-2 mb-6">
          {scholarship.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {scholarship.eligibility.map((req, i) => (
            <span key={i} className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border border-slate-100">
              {req}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-6">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-1">Amount</div>
            <div className="font-serif text-xl text-ui-blue">{scholarship.amount}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-1">Deadline</div>
            <div className={`font-serif text-lg ${deadlineInfo.color}`}>
              {daysRemaining > 0 ? `${daysRemaining} days` : 'Expired'}
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
        <StatusBadge status={status} />
        <a 
          href={scholarship.application_url}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ui-blue hover:text-nobel-gold transition-colors group/link"
        >
          Apply Now 
          <ExternalLink size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </motion.div>
  );
};

const TrackerSidebar: React.FC<{
  scholarships: Scholarship[];
  bookmarks: string[];
  getStatus: (id: string) => ApplicationStatus;
  setStatus: (id: string, status: ApplicationStatus) => void;
  isOpen: boolean;
  onClose: () => void;
}> = ({ scholarships, bookmarks, getStatus, setStatus, isOpen, onClose }) => {
  const savedScholarships = scholarships.filter(s => bookmarks.includes(s.id));

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-ui-blue/20 backdrop-blur-sm z-40" onClick={onClose} />
      )}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 overflow-y-auto"
      >
        <div className="p-8 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your Applications</span>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>
          <h2 className="font-serif text-3xl text-ui-blue">Application <span className="italic text-slate-300">Tracker</span></h2>
        </div>

        <div className="p-8">
          {savedScholarships.length === 0 ? (
            <div className="text-center py-16">
              <Bookmark className="mx-auto text-slate-200 mb-6" size={48} />
              <p className="font-serif text-xl text-slate-400 mb-2">No saved scholarships</p>
              <p className="text-sm text-slate-300">Bookmark scholarships to track them here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedScholarships.map((scholarship) => (
                <div key={scholarship.id} className="p-6 bg-slate-50 border border-slate-100">
                  <h4 className="font-serif text-lg text-ui-blue mb-1">{scholarship.title}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">{scholarship.provider}</p>
                  
                  <div className="flex items-center justify-between">
                    <Select 
                      value={getStatus(scholarship.id)} 
                      onValueChange={(value) => setStatus(scholarship.id, value as ApplicationStatus)}
                    >
                      <SelectTrigger className="w-[140px] h-9 text-xs border-slate-200 rounded-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <span className={`text-xs font-bold ${getDeadlineStatus(scholarship.deadline).color}`}>
                      {getDaysRemaining(scholarship.deadline) > 0 
                        ? `${getDaysRemaining(scholarship.deadline)}d left`
                        : 'Expired'
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

interface ScholarshipFormData {
  title: string;
  provider: string;
  amount: string;
  deadline: string;
  category: 'local' | 'international' | 'corporate';
  eligibility: string;
  description: string;
  application_url: string;
}

const ScholarshipPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<ScholarshipCategory>('all');
  const [deadlineFilter, setDeadlineFilter] = useState<string>('all');
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);
  const [formData, setFormData] = useState<ScholarshipFormData>({
    title: '',
    provider: '',
    amount: '',
    deadline: '',
    category: 'corporate',
    eligibility: '',
    description: '',
    application_url: ''
  });

  const { isStaff } = useAdminCheck();
  const { bookmarks, toggle, isBookmarked } = useBookmarks('scholarship-bookmarks');
  const { getStatus, setStatus } = useApplicationStatus();

  const fetchScholarships = async () => {
    try {
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .eq('is_active', true)
        .order('deadline', { ascending: true });

      if (error) throw error;

      setScholarships(data?.map(s => ({
        id: s.id,
        title: s.title,
        provider: s.provider,
        amount: s.amount,
        deadline: s.deadline,
        category: s.category as 'local' | 'international' | 'corporate',
        eligibility: s.eligibility || [],
        description: s.description || '',
        application_url: s.application_url || '#'
      })) || []);
    } catch (error) {
      console.error('Error fetching scholarships:', error);
      toast.error('Failed to load scholarships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      const scholarship = scholarships.find(s => s.id === id);
      if (scholarship) {
        toast.info(`Viewing: ${scholarship.title}`, {
          description: scholarship.provider
        });
      }
    }
  }, [searchParams, scholarships]);

  const handleShare = (scholarship: Scholarship) => {
    const url = `${window.location.origin}/resources/scholarships?id=${scholarship.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleBookmark = (id: string) => {
    toggle(id);
    toast.success(isBookmarked(id) ? 'Removed from tracker' : 'Added to tracker');
  };

  const openCreateModal = () => {
    setEditingScholarship(null);
    setFormData({
      title: '',
      provider: '',
      amount: '',
      deadline: '',
      category: 'corporate',
      eligibility: '',
      description: '',
      application_url: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (scholarship: Scholarship) => {
    setEditingScholarship(scholarship);
    setFormData({
      title: scholarship.title,
      provider: scholarship.provider,
      amount: scholarship.amount,
      deadline: scholarship.deadline,
      category: scholarship.category,
      eligibility: scholarship.eligibility.join(', '),
      description: scholarship.description,
      application_url: scholarship.application_url
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.provider || !formData.amount || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    const eligibilityArray = formData.eligibility
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0);

    try {
      if (editingScholarship) {
        const { error } = await supabase
          .from('scholarships')
          .update({
            title: formData.title,
            provider: formData.provider,
            amount: formData.amount,
            deadline: formData.deadline,
            category: formData.category,
            eligibility: eligibilityArray,
            description: formData.description,
            application_url: formData.application_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingScholarship.id);

        if (error) throw error;
        toast.success('Scholarship updated successfully');
      } else {
        const { error } = await supabase
          .from('scholarships')
          .insert({
            title: formData.title,
            provider: formData.provider,
            amount: formData.amount,
            deadline: formData.deadline,
            category: formData.category,
            eligibility: eligibilityArray,
            description: formData.description,
            application_url: formData.application_url
          });

        if (error) throw error;
        toast.success('Scholarship created successfully');
      }

      setModalOpen(false);
      fetchScholarships();
    } catch (error: any) {
      console.error('Error saving scholarship:', error);
      toast.error(error.message || 'Failed to save scholarship');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return;

    try {
      const { error } = await supabase
        .from('scholarships')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Scholarship deleted successfully');
      fetchScholarships();
    } catch (error: any) {
      console.error('Error deleting scholarship:', error);
      toast.error(error.message || 'Failed to delete scholarship');
    }
  };

  const filteredScholarships = useMemo(() => {
    return scholarships.filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           s.provider.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
      
      let matchesDeadline = true;
      if (deadlineFilter !== 'all') {
        const days = getDaysRemaining(s.deadline);
        if (deadlineFilter === 'urgent') matchesDeadline = days <= 7 && days > 0;
        else if (deadlineFilter === 'month') matchesDeadline = days <= 30 && days > 0;
        else if (deadlineFilter === 'open') matchesDeadline = days > 0;
      }

      return matchesSearch && matchesCategory && matchesDeadline;
    });
  }, [searchTerm, activeCategory, deadlineFilter, scholarships]);

  const stats = [
    { label: 'Scholarships', value: `${scholarships.length}+` },
    { label: 'Total Available', value: '₦2B+' },
    { label: 'Open Deadlines', value: scholarships.filter(s => getDaysRemaining(s.deadline) > 0).length.toString() },
    { label: 'Your Saved', value: bookmarks.length.toString() }
  ];

  const categories: { value: ScholarshipCategory; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'local', label: 'Local' },
    { value: 'international', label: 'International' },
    { value: 'corporate', label: 'Corporate' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <SEO 
        title="Scholarship Finder - Resources" 
        description="Find local and international scholarships available to University of Ibadan students." 
      />

      <div className="container mx-auto px-6">
        <button
          onClick={() => navigate('/resources')}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-12"
        >
          <div className="p-2 border border-slate-200 group-hover:border-nobel-gold transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Resources</span>
        </button>

        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-4">
              <GraduationCap className="text-nobel-gold w-6 h-6" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Funding Opportunities</span>
            </div>
            {isStaff && (
              <Button onClick={openCreateModal} className="gap-2">
                <Plus size={16} />
                Add Scholarship
              </Button>
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl text-ui-blue mb-6"
          >
            Scholarship <span className="italic text-slate-300">Finder</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 font-light max-w-2xl leading-relaxed"
          >
            Discover funding opportunities to support your academic journey. Local, international, and corporate scholarships curated for UI students.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 border border-slate-200 mb-16"
        >
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 text-center">
              <div className="font-serif text-3xl md:text-4xl text-ui-blue mb-2">{stat.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <div className="mb-12 space-y-6 pb-8 border-b border-slate-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="text"
                placeholder="Search scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 focus:border-nobel-gold focus:outline-none text-lg font-serif transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <Select value={deadlineFilter} onValueChange={setDeadlineFilter}>
                <SelectTrigger className="w-[160px] h-14 border-slate-200 rounded-none bg-white">
                  <SelectValue placeholder="Deadline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Deadlines</SelectItem>
                  <SelectItem value="urgent">Urgent (7 days)</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                </SelectContent>
              </Select>

              <button 
                onClick={() => setTrackerOpen(true)}
                className="h-14 px-6 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold transition-colors flex items-center gap-3"
              >
                <Bookmark size={16} />
                Tracker ({bookmarks.length})
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeCategory === cat.value
                    ? 'bg-ui-blue text-white'
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-ui-blue'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredScholarships.map((scholarship, index) => (
              <ScholarshipCard
                key={scholarship.id}
                scholarship={scholarship}
                isBookmarked={isBookmarked(scholarship.id)}
                onToggleBookmark={() => handleBookmark(scholarship.id)}
                onShare={() => handleShare(scholarship)}
                onEdit={() => openEditModal(scholarship)}
                onDelete={() => handleDelete(scholarship.id)}
                status={getStatus(scholarship.id)}
                index={index}
                isStaff={isStaff}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredScholarships.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <GraduationCap className="mx-auto text-slate-200 mb-6" size={64} />
            <h3 className="font-serif text-2xl text-slate-400 mb-2">No scholarships found</h3>
            <p className="text-slate-300">Try adjusting your filters or search term</p>
          </motion.div>
        )}
      </div>

      <TrackerSidebar
        scholarships={scholarships}
        bookmarks={bookmarks}
        getStatus={getStatus}
        setStatus={setStatus}
        isOpen={trackerOpen}
        onClose={() => setTrackerOpen(false)}
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingScholarship ? 'Edit Scholarship' : 'Add New Scholarship'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Scholarship title"
                />
              </div>
              <div className="space-y-2">
                <Label>Provider *</Label>
                <Input
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="Organization name"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="₦200,000"
                />
              </div>
              <div className="space-y-2">
                <Label>Deadline *</Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: 'local' | 'international' | 'corporate') => 
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Eligibility (comma-separated)</Label>
              <Input
                value={formData.eligibility}
                onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                placeholder="Nigerian Student, CGPA 3.5+, 200-400 Level"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Scholarship description..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Application URL</Label>
              <Input
                value={formData.application_url}
                onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingScholarship ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScholarshipPage;
