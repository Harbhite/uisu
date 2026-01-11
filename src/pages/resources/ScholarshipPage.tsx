import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, GraduationCap, Calendar, DollarSign, 
  Bookmark, BookmarkCheck, Share2, ExternalLink, Filter,
  Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight,
  Award, Globe, Building2, TrendingUp, X
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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
  applicationUrl: string;
}

const scholarships: Scholarship[] = [
  {
    id: 'mtn-foundation',
    title: 'MTN Foundation Scholarship',
    provider: 'MTN Nigeria',
    amount: '₦200,000',
    deadline: '2026-06-30',
    category: 'corporate',
    eligibility: ['Nigerian Student', 'CGPA 3.5+', '200-400 Level'],
    description: 'Annual scholarship for outstanding students in Nigerian universities. Covers tuition and provides monthly stipend for academic materials.',
    applicationUrl: '#'
  },
  {
    id: 'nnpc-total',
    title: 'NNPC/Total National Merit Scholarship',
    provider: 'NNPC & Total Energies',
    amount: '₦150,000',
    deadline: '2026-05-15',
    category: 'corporate',
    eligibility: ['Nigerian Citizen', 'CGPA 3.0+', 'Science/Engineering'],
    description: 'Merit-based scholarship for students in science and engineering disciplines. Includes internship opportunities.',
    applicationUrl: '#'
  },
  {
    id: 'agbami-medical',
    title: 'Agbami Medical & Engineering Scholarship',
    provider: 'Agbami Partners',
    amount: '₦500,000',
    deadline: '2026-04-30',
    category: 'corporate',
    eligibility: ['Medical/Engineering Student', 'CGPA 3.5+', '300+ Level'],
    description: 'Premium scholarship for medical and engineering students with exceptional academic records.',
    applicationUrl: '#'
  },
  {
    id: 'shell-nigeria',
    title: 'Shell Nigeria Scholarship',
    provider: 'Shell Petroleum',
    amount: '₦400,000',
    deadline: '2026-07-31',
    category: 'corporate',
    eligibility: ['Nigerian Student', 'CGPA 3.5+', 'STEM Fields'],
    description: 'Comprehensive scholarship covering tuition, accommodation, and professional development programs.',
    applicationUrl: '#'
  },
  {
    id: 'ui-endowment',
    title: 'UI Endowment Fund Scholarship',
    provider: 'University of Ibadan',
    amount: '₦100,000',
    deadline: '2026-03-15',
    category: 'local',
    eligibility: ['UI Student', 'CGPA 4.0+', 'Financial Need'],
    description: 'Internal scholarship for outstanding UI students demonstrating financial need and academic excellence.',
    applicationUrl: '#'
  },
  {
    id: 'chevron-undergrad',
    title: 'Chevron Undergraduate Scholarship',
    provider: 'Chevron Nigeria',
    amount: '₦300,000',
    deadline: '2026-06-15',
    category: 'corporate',
    eligibility: ['Nigerian Student', 'CGPA 3.5+', '200-400 Level'],
    description: 'Annual scholarship supporting Nigerian undergraduates with academic excellence.',
    applicationUrl: '#'
  },
  {
    id: 'bilateral-education',
    title: 'Bilateral Education Agreement (BEA)',
    provider: 'Federal Government of Nigeria',
    amount: 'Full Tuition + Stipend',
    deadline: '2026-02-28',
    category: 'international',
    eligibility: ['Nigerian Citizen', 'CGPA 3.5+', 'Postgraduate'],
    description: 'Government-sponsored international scholarship for postgraduate studies in partner countries.',
    applicationUrl: '#'
  },
  {
    id: 'mastercard-foundation',
    title: 'Mastercard Foundation Scholars Program',
    provider: 'Mastercard Foundation',
    amount: 'Full Scholarship',
    deadline: '2026-08-31',
    category: 'international',
    eligibility: ['African Student', 'Academic Excellence', 'Leadership Potential'],
    description: 'Comprehensive scholarship covering tuition, accommodation, travel, and leadership development.',
    applicationUrl: '#'
  },
  {
    id: 'oyo-state',
    title: 'Oyo State Bursary Award',
    provider: 'Oyo State Government',
    amount: '₦50,000',
    deadline: '2026-09-30',
    category: 'local',
    eligibility: ['Oyo State Indigene', 'UI Student', 'Good Standing'],
    description: 'Annual bursary for indigenes of Oyo State studying at University of Ibadan.',
    applicationUrl: '#'
  },
  {
    id: 'first-bank-endowment',
    title: 'First Bank Endowment Scholarship',
    provider: 'First Bank of Nigeria',
    amount: '₦250,000',
    deadline: '2026-05-31',
    category: 'corporate',
    eligibility: ['Nigerian Student', 'CGPA 3.5+', 'Business/Economics'],
    description: 'Scholarship for students in business and economics programs with strong academic performance.',
    applicationUrl: '#'
  }
];

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
  if (days < 0) return { status: 'expired', color: 'text-red-500', bg: 'bg-red-50' };
  if (days <= 7) return { status: 'urgent', color: 'text-orange-500', bg: 'bg-orange-50' };
  if (days <= 30) return { status: 'soon', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  return { status: 'open', color: 'text-green-600', bg: 'bg-green-50' };
};

const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
  const configs: Record<ApplicationStatus, { label: string; icon: typeof CheckCircle2; color: string }> = {
    not_started: { label: 'Not Started', icon: Clock, color: 'bg-slate-100 text-slate-600' },
    in_progress: { label: 'In Progress', icon: AlertCircle, color: 'bg-blue-100 text-blue-600' },
    submitted: { label: 'Submitted', icon: CheckCircle2, color: 'bg-green-100 text-green-600' },
    accepted: { label: 'Accepted', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600' },
    rejected: { label: 'Rejected', icon: XCircle, color: 'bg-red-100 text-red-600' }
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
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
  status: ApplicationStatus;
  index: number;
}> = ({ scholarship, isBookmarked, onToggleBookmark, onShare, status, index }) => {
  const deadlineInfo = getDeadlineStatus(scholarship.deadline);
  const daysRemaining = getDaysRemaining(scholarship.deadline);

  const categoryIcon = {
    local: <Award size={20} />,
    international: <Globe size={20} />,
    corporate: <Building2 size={20} />
  };

  const categoryColors = {
    local: 'bg-emerald-100 text-emerald-600',
    international: 'bg-blue-100 text-blue-600',
    corporate: 'bg-amber-100 text-amber-600'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-xl border border-border hover:border-nobel-gold hover:shadow-xl transition-all duration-300 group overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-lg ${categoryColors[scholarship.category]}`}>
            {categoryIcon[scholarship.category]}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleBookmark}
              className={`p-2 rounded-full transition-all ${
                isBookmarked 
                  ? 'bg-nobel-gold/10 text-nobel-gold' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
            <button
              onClick={onShare}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        <div className="mb-3">
          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded ${categoryColors[scholarship.category]}`}>
            {scholarship.category}
          </span>
        </div>

        <h3 className="font-serif text-xl text-foreground group-hover:text-ui-blue transition-colors mb-1">
          {scholarship.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{scholarship.provider}</p>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
          {scholarship.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {scholarship.eligibility.map((req, i) => (
            <span key={i} className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-medium rounded-full">
              {req}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm mb-4">
          <div className="flex items-center gap-1.5 text-ui-blue font-semibold">
            <DollarSign size={16} />
            {scholarship.amount}
          </div>
          <div className={`flex items-center gap-1.5 ${deadlineInfo.color}`}>
            <Calendar size={14} />
            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
          </div>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Deadline: {new Date(scholarship.deadline).toLocaleDateString('en-NG', { 
            month: 'short', day: 'numeric', year: 'numeric' 
          })}
        </span>
        <Button size="sm" className="gap-2 text-xs">
          Apply <ExternalLink size={12} />
        </Button>
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
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl z-50 overflow-y-auto"
      >
        <div className="p-6 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-foreground">Application Tracker</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Track your saved scholarships</p>
        </div>

        <div className="p-6">
          {savedScholarships.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="mx-auto text-muted-foreground mb-4" size={48} />
              <p className="text-muted-foreground">No saved scholarships yet</p>
              <p className="text-sm text-muted-foreground mt-1">Bookmark scholarships to track them here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedScholarships.map((scholarship) => (
                <div key={scholarship.id} className="p-4 bg-muted/50 rounded-xl border border-border">
                  <h4 className="font-medium text-foreground mb-1">{scholarship.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{scholarship.provider}</p>
                  
                  <div className="flex items-center justify-between">
                    <Select 
                      value={getStatus(scholarship.id)} 
                      onValueChange={(value) => setStatus(scholarship.id, value as ApplicationStatus)}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
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
                    
                    <span className={`text-xs ${getDeadlineStatus(scholarship.deadline).color}`}>
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

const ScholarshipPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<ScholarshipCategory>('all');
  const [amountFilter, setAmountFilter] = useState<string>('all');
  const [deadlineFilter, setDeadlineFilter] = useState<string>('all');
  const [trackerOpen, setTrackerOpen] = useState(false);

  const { bookmarks, toggle, isBookmarked } = useBookmarks('scholarship-bookmarks');
  const { getStatus, setStatus } = useApplicationStatus();

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
  }, [searchParams]);

  const handleShare = (scholarship: Scholarship) => {
    const url = `${window.location.origin}/resources/scholarships?id=${scholarship.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!', {
      description: 'Share this scholarship with others'
    });
  };

  const handleBookmark = (id: string) => {
    toggle(id);
    toast.success(isBookmarked(id) ? 'Removed from saved' : 'Saved to tracker');
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
  }, [searchTerm, activeCategory, deadlineFilter]);

  const stats = [
    { label: 'Total Scholarships', value: `${scholarships.length}+`, icon: GraduationCap },
    { label: 'Total Available', value: '₦2B+', icon: TrendingUp },
    { label: 'Active Deadlines', value: scholarships.filter(s => getDaysRemaining(s.deadline) > 0).length, icon: Calendar },
    { label: 'Your Saved', value: bookmarks.length, icon: Bookmark }
  ];

  const categories: { value: ScholarshipCategory; label: string }[] = [
    { value: 'all', label: 'All Scholarships' },
    { value: 'local', label: 'Local' },
    { value: 'international', label: 'International' },
    { value: 'corporate', label: 'Corporate' }
  ];

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <SEO 
        title="Scholarship Finder - Resources" 
        description="Find local and international scholarships available to University of Ibadan students." 
      />

      <div className="container mx-auto px-6">
        <button
          onClick={() => navigate('/resources')}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-8"
        >
          <div className="p-2 rounded-full border border-border group-hover:border-nobel-gold transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Back to Resources</span>
        </button>

        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <GraduationCap className="text-nobel-gold w-8 h-8" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">Funding Opportunities</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif text-ui-blue leading-[0.9] mb-6"
          >
            Scholarship <br />
            <span className="italic text-muted-foreground">Finder</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground font-light max-w-2xl leading-relaxed"
          >
            Discover funding opportunities to support your academic journey. Local, international, and corporate scholarships curated for UI students.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-card p-6 rounded-xl border border-border">
                <Icon className="text-nobel-gold mb-3" size={24} />
                <div className="text-3xl font-serif text-foreground mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </div>
            );
          })}
        </motion.div>

        <div className="mb-8 space-y-4 py-4 border-y border-border">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Search scholarships by name or provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base rounded-full border-border"
              />
            </div>

            <div className="flex gap-3">
              <Select value={deadlineFilter} onValueChange={setDeadlineFilter}>
                <SelectTrigger className="w-[160px] h-12 rounded-full">
                  <SelectValue placeholder="Deadline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Deadlines</SelectItem>
                  <SelectItem value="urgent">Urgent (7 days)</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={() => setTrackerOpen(true)}
                variant="outline" 
                className="h-12 px-6 rounded-full gap-2"
              >
                <Bookmark size={18} />
                Tracker ({bookmarks.length})
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  activeCategory === cat.value
                    ? 'bg-ui-blue text-white shadow-md'
                    : 'bg-card text-muted-foreground border border-border hover:border-ui-blue'
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
                status={getStatus(scholarship.id)}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredScholarships.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <GraduationCap className="mx-auto text-muted-foreground mb-4" size={64} />
            <h3 className="text-xl font-serif text-foreground mb-2">No scholarships found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search term</p>
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
    </div>
  );
};

export default ScholarshipPage;
