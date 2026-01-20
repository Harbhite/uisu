import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, Briefcase, MapPin, Clock, Building2, 
  Bookmark, BookmarkCheck, ExternalLink, FileText, Users,
  ChevronDown, Download, CheckCircle2, Plus, Pencil, Trash2, Upload, Eye, EyeOff, Sparkles
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import CVBuilder from '@/components/CVBuilder';

type JobType = 'all' | 'full-time' | 'part-time' | 'remote' | 'internship';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: 'full-time' | 'part-time' | 'remote' | 'internship';
  industry: string;
  created_at: string;
  description: string;
  requirements: string[];
  salary?: string;
  application_url?: string;
  deadline?: string;
  is_approved: boolean;
  submitted_by?: string;
}

interface CVTemplate {
  id: string;
  title: string;
  description: string;
  file_url: string;
  format: string;
  download_count: number;
  is_approved: boolean;
  uploaded_by?: string;
}

const interviewTips = [
  {
    category: 'Preparation',
    questions: [
      { q: 'How do I research a company before an interview?', a: 'Visit their website, read recent news, understand their products/services, check LinkedIn for employee insights, and review their mission and values.' },
      { q: 'What documents should I bring?', a: 'Bring multiple copies of your CV, certificates, ID card, a notepad, and any portfolio work relevant to the role.' },
      { q: 'How early should I arrive?', a: 'Arrive 15-20 minutes early. This shows punctuality and gives you time to compose yourself.' }
    ]
  },
  {
    category: 'Common Questions',
    questions: [
      { q: 'How do I answer "Tell me about yourself"?', a: 'Structure your answer: Present (current role/studies), Past (relevant experience), Future (why this role). Keep it under 2 minutes.' },
      { q: 'What are your strengths and weaknesses?', a: 'Choose genuine strengths with examples. For weaknesses, mention something you\'ve actively worked to improve.' },
      { q: 'Where do you see yourself in 5 years?', a: 'Show ambition while being realistic. Connect your goals to what the company can offer.' }
    ]
  },
  {
    category: 'Technical Interviews',
    questions: [
      { q: 'How do I prepare for case interviews?', a: 'Practice frameworks (MECE, Porter\'s Five Forces), do mock cases, think out loud, and structure your approach clearly.' },
      { q: 'What about coding interviews?', a: 'Practice on LeetCode/HackerRank, study data structures, explain your thought process, and test your code.' },
      { q: 'How do I handle questions I don\'t know?', a: 'Be honest, explain your thought process, relate to what you do know, and show eagerness to learn.' }
    ]
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

const typeConfig = {
  'full-time': { label: 'Full-time', color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
  'part-time': { label: 'Part-time', color: 'text-ui-blue bg-blue-50 border-blue-100' },
  'remote': { label: 'Remote', color: 'text-purple-700 bg-purple-50 border-purple-100' },
  'internship': { label: 'Internship', color: 'text-nobel-gold bg-amber-50 border-amber-100' }
};

const JobCard: React.FC<{
  job: Job;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onApprove?: () => void;
  index: number;
  isStaff?: boolean;
  showApprovalStatus?: boolean;
}> = ({ job, isBookmarked, onToggleBookmark, onEdit, onDelete, onApprove, index, isStaff, showApprovalStatus }) => {
  const config = typeConfig[job.job_type];

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`bg-white border hover:border-nobel-gold/50 hover:shadow-lg transition-all duration-300 group ${
        !job.is_approved ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'
      }`}
    >
      <div className="p-4 md:p-8">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
            <Building2 size={20} />
          </div>
          <div className="flex items-center gap-1">
            {showApprovalStatus && !job.is_approved && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 text-[9px]">
                Pending
              </Badge>
            )}
            {isStaff && (
              <>
                {!job.is_approved && onApprove && (
                  <button
                    onClick={onApprove}
                    className="p-2 text-slate-300 hover:text-green-500 transition-colors"
                    title="Approve"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                )}
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
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${config.color}`}>
            {config.label}
          </span>
          <span className="text-[10px] text-slate-400">{job.industry}</span>
        </div>

        <h3 className="font-serif text-xl text-ui-blue group-hover:text-nobel-gold transition-colors mb-1 line-clamp-2">
          {job.title}
        </h3>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">{job.company}</p>

        <p className="text-slate-600 leading-relaxed text-sm font-light mb-4 line-clamp-3">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.requirements.slice(0, 3).map((req, i) => (
            <span key={i} className="px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border border-slate-100">
              {req}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {timeAgo(job.created_at)}
          </span>
        </div>

        {job.salary && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Salary</span>
            <p className="font-serif text-lg text-ui-blue">{job.salary}</p>
          </div>
        )}
      </div>

      <div className="px-8 py-4 border-t border-slate-100 bg-slate-50">
        <a 
          href={job.application_url || '#'}
          className="flex items-center justify-center gap-2 w-full py-3 bg-ui-blue text-white text-[10px] font-bold uppercase tracking-widest hover:bg-nobel-gold transition-colors"
        >
          Quick Apply <ExternalLink size={12} />
        </a>
      </div>
    </motion.div>
  );
};

interface JobFormData {
  title: string;
  company: string;
  location: string;
  job_type: 'full-time' | 'part-time' | 'remote' | 'internship';
  industry: string;
  description: string;
  requirements: string;
  salary: string;
  application_url: string;
  deadline: string;
}

interface CVFormData {
  title: string;
  description: string;
  format: string;
  file: File | null;
}

const CareerHubPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState<JobType>('all');
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [cvTemplates, setCVTemplates] = useState<CVTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [cvModalOpen, setCVModalOpen] = useState(false);
  const [cvBuilderOpen, setCVBuilderOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showPending, setShowPending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [jobFormData, setJobFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    job_type: 'full-time',
    industry: '',
    description: '',
    requirements: '',
    salary: '',
    application_url: '',
    deadline: ''
  });

  const [cvFormData, setCVFormData] = useState<CVFormData>({
    title: '',
    description: '',
    format: 'PDF',
    file: null
  });

  const { user, isStaff } = useAdminCheck();
  const { bookmarks, toggle, isBookmarked } = useBookmarks('career-hub-bookmarks');

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setJobs(data?.map(j => ({
        id: j.id,
        title: j.title,
        company: j.company,
        location: j.location,
        job_type: j.job_type as 'full-time' | 'part-time' | 'remote' | 'internship',
        industry: j.industry,
        created_at: j.created_at || new Date().toISOString(),
        description: j.description || '',
        requirements: j.requirements || [],
        salary: j.salary || undefined,
        application_url: j.application_url || undefined,
        deadline: j.deadline || undefined,
        is_approved: j.is_approved ?? true,
        submitted_by: j.submitted_by || undefined
      })) || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load job listings');
    }
  };

  const fetchCVTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('cv_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCVTemplates(data?.map(cv => ({
        id: cv.id,
        title: cv.title,
        description: cv.description || '',
        file_url: cv.file_url || '',
        format: cv.format,
        download_count: cv.download_count || 0,
        is_approved: cv.is_approved ?? false,
        uploaded_by: cv.uploaded_by || undefined
      })) || []);
    } catch (error) {
      console.error('Error fetching CV templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCVTemplates();
  }, []);

  const handleBookmark = (id: string) => {
    toggle(id);
    toast.success(isBookmarked(id) ? 'Removed from saved' : 'Job saved!');
  };

  const openCreateJobModal = () => {
    setEditingJob(null);
    setJobFormData({
      title: '',
      company: '',
      location: '',
      job_type: 'full-time',
      industry: '',
      description: '',
      requirements: '',
      salary: '',
      application_url: '',
      deadline: ''
    });
    setJobModalOpen(true);
  };

  const openEditJobModal = (job: Job) => {
    setEditingJob(job);
    setJobFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      job_type: job.job_type,
      industry: job.industry,
      description: job.description,
      requirements: job.requirements.join(', '),
      salary: job.salary || '',
      application_url: job.application_url || '',
      deadline: job.deadline || ''
    });
    setJobModalOpen(true);
  };

  const handleJobSubmit = async () => {
    if (!jobFormData.title || !jobFormData.company || !jobFormData.location || !jobFormData.industry) {
      toast.error('Please fill in all required fields');
      return;
    }

    const requirementsArray = jobFormData.requirements
      .split(',')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    try {
      if (editingJob) {
        const { error } = await supabase
          .from('job_listings')
          .update({
            title: jobFormData.title,
            company: jobFormData.company,
            location: jobFormData.location,
            job_type: jobFormData.job_type,
            industry: jobFormData.industry,
            description: jobFormData.description,
            requirements: requirementsArray,
            salary: jobFormData.salary || null,
            application_url: jobFormData.application_url || null,
            deadline: jobFormData.deadline || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingJob.id);

        if (error) throw error;
        toast.success('Job updated successfully');
      } else {
        const isUserSubmission = !isStaff;
        const { error } = await supabase
          .from('job_listings')
          .insert({
            title: jobFormData.title,
            company: jobFormData.company,
            location: jobFormData.location,
            job_type: jobFormData.job_type,
            industry: jobFormData.industry,
            description: jobFormData.description,
            requirements: requirementsArray,
            salary: jobFormData.salary || null,
            application_url: jobFormData.application_url || null,
            deadline: jobFormData.deadline || null,
            submitted_by: user?.id,
            is_approved: isStaff // Auto-approve if staff, else pending
          });

        if (error) throw error;
        toast.success(isStaff ? 'Job created successfully' : 'Job submitted for review!');
      }

      setJobModalOpen(false);
      fetchJobs();
    } catch (error: any) {
      console.error('Error saving job:', error);
      toast.error(error.message || 'Failed to save job');
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job listing?')) return;

    try {
      const { error } = await supabase
        .from('job_listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Job deleted successfully');
      fetchJobs();
    } catch (error: any) {
      console.error('Error deleting job:', error);
      toast.error(error.message || 'Failed to delete job');
    }
  };

  const handleApproveJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from('job_listings')
        .update({ is_approved: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Job approved successfully');
      fetchJobs();
    } catch (error: any) {
      console.error('Error approving job:', error);
      toast.error(error.message || 'Failed to approve job');
    }
  };

  const handleCVUpload = async () => {
    if (!cvFormData.title || !cvFormData.file) {
      toast.error('Please provide a title and file');
      return;
    }

    if (!user) {
      toast.error('Please login to upload CV templates');
      return;
    }

    setUploading(true);

    try {
      const fileExt = cvFormData.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cv-templates')
        .upload(fileName, cvFormData.file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cv-templates')
        .getPublicUrl(fileName);

      const { error } = await supabase
        .from('cv_templates')
        .insert({
          title: cvFormData.title,
          description: cvFormData.description,
          file_url: publicUrl,
          format: fileExt?.toUpperCase() || cvFormData.format,
          uploaded_by: user.id,
          is_approved: isStaff
        });

      if (error) throw error;

      toast.success(isStaff ? 'CV template uploaded!' : 'CV template submitted for review!');
      setCVModalOpen(false);
      setCVFormData({ title: '', description: '', format: 'PDF', file: null });
      fetchCVTemplates();
    } catch (error: any) {
      console.error('Error uploading CV:', error);
      toast.error(error.message || 'Failed to upload CV template');
    } finally {
      setUploading(false);
    }
  };

  const handleApproveCVTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cv_templates')
        .update({ is_approved: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('CV template approved');
      fetchCVTemplates();
    } catch (error: any) {
      console.error('Error approving CV:', error);
      toast.error(error.message || 'Failed to approve');
    }
  };

  const handleDeleteCVTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this CV template?')) return;

    try {
      const { error } = await supabase
        .from('cv_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('CV template deleted');
      fetchCVTemplates();
    } catch (error: any) {
      console.error('Error deleting CV:', error);
      toast.error(error.message || 'Failed to delete');
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = activeType === 'all' || job.job_type === activeType;
      const matchesApproval = showPending ? true : job.is_approved;
      return matchesSearch && matchesType && matchesApproval;
    });
  }, [searchTerm, activeType, jobs, showPending]);

  const visibleCVTemplates = useMemo(() => {
    if (isStaff) return cvTemplates;
    return cvTemplates.filter(cv => cv.is_approved || cv.uploaded_by === user?.id);
  }, [cvTemplates, isStaff, user]);

  const types: { value: JobType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'internship', label: 'Internships' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'remote', label: 'Remote' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 md:pt-32 pb-20">
      <SEO 
        title="Career Hub - Resources" 
        description="Find jobs, internships, and career resources for UI students." 
      />

      <div className="container mx-auto px-4 md:px-6">
        <button
          onClick={() => navigate('/resources')}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-8 md:mb-12"
        >
          <div className="p-2 border border-slate-200 group-hover:border-nobel-gold transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Resources</span>
        </button>

        <div className="mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-4">
              <Briefcase className="text-nobel-gold w-6 h-6" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Employment</span>
            </div>
            <div className="flex items-center gap-2">
              {isStaff && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPending(!showPending)}
                  className="gap-2"
                >
                  {showPending ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPending ? 'Hide Pending' : 'Show Pending'}
                </Button>
              )}
              {user && (
                <Button onClick={openCreateJobModal} className="gap-2">
                  <Plus size={16} />
                  {isStaff ? 'Add Job' : 'Submit Job'}
                </Button>
              )}
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-7xl text-ui-blue mb-6"
          >
            Career <span className="italic text-slate-300">Hub</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 font-light max-w-2xl leading-relaxed"
          >
            Discover opportunities tailored for students and fresh graduates. Jobs, internships, CV resources, and interview preparation.
          </motion.p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-full md:max-w-3xl bg-white border border-slate-200 p-1 h-auto mb-12 rounded-none flex flex-col sm:flex-row">
            <TabsTrigger 
              value="jobs" 
              className="flex-1 py-3 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-ui-blue data-[state=active]:text-white rounded-none"
            >
              Jobs & Internships
            </TabsTrigger>
            <TabsTrigger 
              value="cv-builder"
              className="flex-1 py-3 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-ui-blue data-[state=active]:text-white rounded-none"
            >
              CV Builder <span className="ml-1 text-[8px] bg-nobel-gold px-1 text-white">AI</span>
            </TabsTrigger>
            <TabsTrigger
              value="cv-resources"
              className="flex-1 py-3 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-ui-blue data-[state=active]:text-white rounded-none"
            >
              Downloads
            </TabsTrigger>
            <TabsTrigger 
              value="interview" 
              className="flex-1 py-3 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-ui-blue data-[state=active]:text-white rounded-none"
            >
              Interviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-0">
            <div className="mb-12 space-y-6 pb-8 border-b border-slate-200">
              <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input
                  type="text"
                  placeholder="Search jobs or companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 focus:border-nobel-gold focus:outline-none text-base md:text-lg font-serif transition-colors"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setActiveType(type.value)}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      activeType === type.value
                        ? 'bg-ui-blue text-white'
                        : 'bg-white text-slate-500 border border-slate-200 hover:border-ui-blue'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredJobs.map((job, index) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isBookmarked={isBookmarked(job.id)}
                    onToggleBookmark={() => handleBookmark(job.id)}
                    onEdit={() => openEditJobModal(job)}
                    onDelete={() => handleDeleteJob(job.id)}
                    onApprove={() => handleApproveJob(job.id)}
                    index={index}
                    isStaff={isStaff}
                    showApprovalStatus={showPending || job.submitted_by === user?.id}
                  />
                ))}
              </AnimatePresence>
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-24">
                <Briefcase className="mx-auto text-slate-200 mb-6" size={64} />
                <h3 className="font-serif text-2xl text-slate-400 mb-2">No jobs found</h3>
                <p className="text-slate-300">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cv-builder" className="mt-0">
             <div className="mb-8">
                <h2 className="font-serif text-3xl text-ui-blue mb-2">AI CV <span className="italic text-slate-300">Builder</span></h2>
                <p className="text-slate-500 font-light">Create a professional resume with AI assistance. Edit, preview, and print.</p>
             </div>
             <CVBuilder />
          </TabsContent>

          <TabsContent value="cv-resources" className="mt-0">
            <div className="max-w-4xl">
              <div className="mb-8 md:mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl text-ui-blue mb-2 md:mb-4">CV Resources & <span className="italic text-slate-300">Templates</span></h2>
                  <p className="text-slate-500 font-light text-sm md:text-base">Download professional templates and guides to create a standout application.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setCVBuilderOpen(true)} className="gap-2 bg-nobel-gold hover:bg-nobel-gold/90">
                    <Sparkles size={16} />
                    <span className="hidden sm:inline">Build CV</span>
                    <span className="sm:hidden">Build</span>
                  </Button>
                  {user && (
                    <Button onClick={() => setCVModalOpen(true)} variant="outline" className="gap-2">
                      <Upload size={16} />
                      <span className="hidden sm:inline">Upload Template</span>
                      <span className="sm:hidden">Upload</span>
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {visibleCVTemplates.map((cv, i) => (
                  <motion.div
                    key={cv.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-white border p-8 hover:border-nobel-gold/50 hover:shadow-lg transition-all group ${
                      !cv.is_approved ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 flex items-center justify-center text-ui-blue shrink-0">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-nobel-gold">{cv.format}</span>
                            {!cv.is_approved && (
                              <Badge variant="outline" className="text-amber-600 border-amber-300 text-[9px]">
                                Pending
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-serif text-xl text-ui-blue group-hover:text-nobel-gold transition-colors">
                            {cv.title}
                          </h3>
                        </div>
                      </div>
                      {isStaff && (
                        <div className="flex items-center gap-1">
                          {!cv.is_approved && (
                            <button
                              onClick={() => handleApproveCVTemplate(cv.id)}
                              className="p-2 text-slate-300 hover:text-green-500 transition-colors"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCVTemplate(cv.id)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-slate-600 font-light text-sm mb-6">{cv.description}</p>
                    <a 
                      href={cv.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ui-blue hover:text-nobel-gold transition-colors"
                    >
                      <Download size={14} /> Download ({cv.download_count})
                    </a>
                  </motion.div>
                ))}
              </div>

              {visibleCVTemplates.length === 0 && (
                <div className="text-center py-16 bg-white border border-slate-100">
                  <FileText className="mx-auto text-slate-200 mb-6" size={48} />
                  <h3 className="font-serif text-xl text-slate-400 mb-2">No CV templates yet</h3>
                  <p className="text-slate-300 mb-4">Be the first to upload a template!</p>
                  {user && (
                    <Button onClick={() => setCVModalOpen(true)}>
                      <Upload size={16} className="mr-2" />
                      Upload Template
                    </Button>
                  )}
                </div>
              )}

              <div className="mt-12 bg-ui-blue text-white p-8 md:p-12">
                <h3 className="font-serif text-2xl mb-4">ATS Tips</h3>
                <p className="text-white/70 font-light mb-6">Applicant Tracking Systems scan your CV before a human sees it. Here's how to pass:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Use standard section headings (Education, Experience, Skills)',
                    'Avoid tables, graphics, and complex formatting',
                    'Include keywords from the job description',
                    'Save as .docx or .pdf format',
                    'Use standard fonts like Arial or Times New Roman',
                    'Keep formatting simple and clean'
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-nobel-gold mt-1 shrink-0" />
                      <span className="text-white/80 text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="interview" className="mt-0">
            <div className="max-w-4xl">
              <div className="mb-12">
                <h2 className="font-serif text-3xl text-ui-blue mb-4">Interview <span className="italic text-slate-300">Preparation</span></h2>
                <p className="text-slate-500 font-light">Common questions and expert tips to ace your next interview.</p>
              </div>

              <div className="space-y-8">
                {interviewTips.map((section, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white border border-slate-100"
                  >
                    <div className="p-6 border-b border-slate-100">
                      <h3 className="font-serif text-xl text-ui-blue">{section.category}</h3>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                      {section.questions.map((item, j) => (
                        <AccordionItem key={j} value={`${i}-${j}`} className="border-b border-slate-100 last:border-0">
                          <AccordionTrigger className="px-6 py-4 text-left hover:no-underline hover:bg-slate-50 group">
                            <span className="text-sm font-medium text-slate-700 group-hover:text-ui-blue transition-colors pr-4">
                              {item.q}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-6">
                            <p className="text-slate-600 font-light leading-relaxed">{item.a}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Job Modal */}
      <Dialog open={jobModalOpen} onOpenChange={setJobModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingJob ? 'Edit Job Listing' : (isStaff ? 'Add New Job' : 'Submit Job Listing')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {!isStaff && !editingJob && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 text-sm">
                Your job submission will be reviewed by staff before being published.
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input
                  value={jobFormData.title}
                  onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                  placeholder="Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label>Company *</Label>
                <Input
                  value={jobFormData.company}
                  onChange={(e) => setJobFormData({ ...jobFormData, company: e.target.value })}
                  placeholder="Company name"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Location *</Label>
                <Input
                  value={jobFormData.location}
                  onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                  placeholder="Lagos / Remote"
                />
              </div>
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select
                  value={jobFormData.job_type}
                  onValueChange={(value: 'full-time' | 'part-time' | 'remote' | 'internship') => 
                    setJobFormData({ ...jobFormData, job_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Industry *</Label>
                <Input
                  value={jobFormData.industry}
                  onChange={(e) => setJobFormData({ ...jobFormData, industry: e.target.value })}
                  placeholder="Technology"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={jobFormData.description}
                onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                placeholder="Job description..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Requirements (comma-separated)</Label>
              <Input
                value={jobFormData.requirements}
                onChange={(e) => setJobFormData({ ...jobFormData, requirements: e.target.value })}
                placeholder="3+ years experience, JavaScript, React"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Salary</Label>
                <Input
                  value={jobFormData.salary}
                  onChange={(e) => setJobFormData({ ...jobFormData, salary: e.target.value })}
                  placeholder="₦150,000/month"
                />
              </div>
              <div className="space-y-2">
                <Label>Application URL</Label>
                <Input
                  value={jobFormData.application_url}
                  onChange={(e) => setJobFormData({ ...jobFormData, application_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input
                  type="date"
                  value={jobFormData.deadline}
                  onChange={(e) => setJobFormData({ ...jobFormData, deadline: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setJobModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleJobSubmit}>
                {editingJob ? 'Update' : (isStaff ? 'Create' : 'Submit')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CV Upload Modal */}
      <Dialog open={cvModalOpen} onOpenChange={setCVModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Upload CV Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {!isStaff && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 text-sm">
                Your template will be reviewed before being published.
              </div>
            )}
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={cvFormData.title}
                onChange={(e) => setCVFormData({ ...cvFormData, title: e.target.value })}
                placeholder="ATS-Friendly CV Template"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={cvFormData.description}
                onChange={(e) => setCVFormData({ ...cvFormData, description: e.target.value })}
                placeholder="Brief description of this template..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>File *</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setCVFormData({ ...cvFormData, file: e.target.files?.[0] || null })}
              />
              <p className="text-xs text-slate-400">Accepted formats: PDF, DOC, DOCX</p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setCVModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCVUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CV Builder */}
      <CVBuilder isOpen={cvBuilderOpen} onClose={() => setCVBuilderOpen(false)} />
    </div>
  );
};

export default CareerHubPage;
