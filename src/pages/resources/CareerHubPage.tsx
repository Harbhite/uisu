import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Briefcase, MapPin, Clock, Building2,
  Bookmark, BookmarkCheck, ExternalLink, FileText, Users,
  ChevronDown, ChevronRight, Download, CheckCircle2, Laptop,
  GraduationCap, DollarSign, Filter, X
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';

type JobType = 'full-time' | 'part-time' | 'remote' | 'internship';
type JobIndustry = 'tech' | 'finance' | 'education' | 'media' | 'healthcare' | 'consulting';
type ExperienceLevel = 'entry' | 'mid' | 'senior';
type ApplicationStatus = 'not_started' | 'applied' | 'interviewing' | 'offered' | 'rejected';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  industry: JobIndustry;
  experience: ExperienceLevel;
  salary?: string;
  description: string;
  requirements: string[];
  postedDate: string;
  deadline: string;
  isInternship: boolean;
}

const jobs: Job[] = [
  {
    id: 'tech-intern-1',
    title: 'Software Engineering Intern',
    company: 'Andela Nigeria',
    location: 'Lagos (Remote)',
    type: 'internship',
    industry: 'tech',
    experience: 'entry',
    salary: '₦150,000/month',
    description: 'Join our engineering team and work on real-world projects using modern tech stack.',
    requirements: ['200+ Level CS Student', 'Python or JavaScript', 'Problem-solving skills'],
    postedDate: '2026-01-05',
    deadline: '2026-02-28',
    isInternship: true
  },
  {
    id: 'research-assist',
    title: 'Research Assistant',
    company: 'Dept. of Economics, UI',
    location: 'On-Campus',
    type: 'part-time',
    industry: 'education',
    experience: 'entry',
    salary: '₦40,000/month',
    description: 'Assist faculty members with ongoing research projects in development economics.',
    requirements: ['Economics Student', 'CGPA 3.5+', 'STATA proficiency'],
    postedDate: '2026-01-08',
    deadline: '2026-01-31',
    isInternship: false
  },
  {
    id: 'graphic-design',
    title: 'Graphic Design Intern',
    company: 'Campus Press',
    location: 'On-Campus',
    type: 'internship',
    industry: 'media',
    experience: 'entry',
    description: 'Create visual content for campus publications and digital platforms.',
    requirements: ['Adobe Creative Suite', 'Portfolio required', 'Any department'],
    postedDate: '2026-01-03',
    deadline: '2026-02-15',
    isInternship: true
  },
  {
    id: 'frontend-dev',
    title: 'Frontend Developer',
    company: 'Paystack',
    location: 'Lagos',
    type: 'full-time',
    industry: 'tech',
    experience: 'entry',
    salary: '₦350,000/month',
    description: 'Build beautiful, responsive interfaces for our payment products.',
    requirements: ['React/Vue.js', 'TypeScript', 'CSS expertise', 'Fresh graduate welcome'],
    postedDate: '2026-01-02',
    deadline: '2026-03-15',
    isInternship: false
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst Intern',
    company: 'Access Bank',
    location: 'Lagos',
    type: 'internship',
    industry: 'finance',
    experience: 'entry',
    salary: '₦100,000/month',
    description: 'Analyze banking data and create insights for business decisions.',
    requirements: ['Statistics/Math/Econ student', 'Excel/SQL', 'Attention to detail'],
    postedDate: '2026-01-06',
    deadline: '2026-02-28',
    isInternship: true
  },
  {
    id: 'content-writer',
    title: 'Content Writer',
    company: 'TechCabal',
    location: 'Remote',
    type: 'remote',
    industry: 'media',
    experience: 'entry',
    salary: '₦80,000/month',
    description: 'Write engaging articles about African tech ecosystem and startups.',
    requirements: ['Strong writing skills', 'Interest in tech', 'Portfolio preferred'],
    postedDate: '2026-01-07',
    deadline: '2026-03-01',
    isInternship: false
  },
  {
    id: 'graduate-trainee',
    title: 'Graduate Trainee',
    company: 'Shell Nigeria',
    location: 'Port Harcourt',
    type: 'full-time',
    industry: 'consulting',
    experience: 'entry',
    salary: '₦500,000/month',
    description: 'Comprehensive 18-month program rotating through various departments.',
    requirements: ['2:1 minimum', 'Engineering/Science degree', 'NYSC completed'],
    postedDate: '2026-01-01',
    deadline: '2026-04-30',
    isInternship: false
  },
  {
    id: 'lab-assistant',
    title: 'Laboratory Assistant',
    company: 'UI Teaching Hospital',
    location: 'On-Campus',
    type: 'part-time',
    industry: 'healthcare',
    experience: 'entry',
    salary: '₦35,000/month',
    description: 'Support laboratory operations and assist with medical tests.',
    requirements: ['Medical Lab Science student', '300+ Level', 'Lab safety training'],
    postedDate: '2026-01-04',
    deadline: '2026-01-25',
    isInternship: false
  },
  {
    id: 'marketing-intern',
    title: 'Digital Marketing Intern',
    company: 'Flutterwave',
    location: 'Lagos (Hybrid)',
    type: 'internship',
    industry: 'tech',
    experience: 'entry',
    salary: '₦120,000/month',
    description: 'Help grow our brand through creative digital marketing campaigns.',
    requirements: ['Marketing knowledge', 'Social media savvy', 'Creative thinking'],
    postedDate: '2026-01-09',
    deadline: '2026-02-20',
    isInternship: true
  },
  {
    id: 'audit-trainee',
    title: 'Audit Trainee',
    company: 'KPMG Nigeria',
    location: 'Lagos',
    type: 'full-time',
    industry: 'consulting',
    experience: 'entry',
    salary: '₦280,000/month',
    description: 'Join our audit practice and work with top Nigerian companies.',
    requirements: ['Accounting degree', 'ICAN in progress', 'Strong analytical skills'],
    postedDate: '2026-01-02',
    deadline: '2026-03-31',
    isInternship: false
  },
  {
    id: 'teaching-assist',
    title: 'Teaching Assistant',
    company: 'Dept. of Computer Science, UI',
    location: 'On-Campus',
    type: 'part-time',
    industry: 'education',
    experience: 'entry',
    salary: '₦25,000/month',
    description: 'Assist lecturers with tutorials and grading for undergraduate courses.',
    requirements: ['400+ Level CS student', 'CGPA 4.0+', 'Teaching interest'],
    postedDate: '2026-01-10',
    deadline: '2026-01-20',
    isInternship: false
  },
  {
    id: 'product-design',
    title: 'Product Design Intern',
    company: 'Kuda Bank',
    location: 'Lagos (Remote)',
    type: 'internship',
    industry: 'tech',
    experience: 'entry',
    salary: '₦130,000/month',
    description: 'Design user-centered experiences for our mobile banking app.',
    requirements: ['UI/UX portfolio', 'Figma proficiency', 'Design thinking'],
    postedDate: '2026-01-08',
    deadline: '2026-02-28',
    isInternship: true
  }
];

const cvResources = [
  {
    id: 'cv-template-1',
    title: 'Professional CV Template',
    description: 'Clean, ATS-friendly template perfect for corporate applications.',
    format: 'DOCX',
    downloads: 1234
  },
  {
    id: 'cv-template-2',
    title: 'Creative CV Template',
    description: 'Stand out with this modern design for creative industries.',
    format: 'DOCX',
    downloads: 892
  },
  {
    id: 'cv-template-3',
    title: 'Academic CV Template',
    description: 'Comprehensive template for research and academic positions.',
    format: 'DOCX',
    downloads: 567
  },
  {
    id: 'cover-letter',
    title: 'Cover Letter Template',
    description: 'Compelling cover letter format that gets interviews.',
    format: 'DOCX',
    downloads: 1456
  }
];

const atsTips = [
  'Use standard section headings (Education, Experience, Skills)',
  'Avoid tables, columns, and graphics that confuse ATS',
  'Include keywords from the job description',
  'Use common fonts like Arial, Calibri, or Times New Roman',
  'Save as .docx or .pdf (check job requirements)',
  'Keep formatting simple and consistent'
];

const interviewQuestions = [
  {
    category: 'General',
    questions: [
      { q: 'Tell me about yourself', a: 'Structure your answer: Present role/studies → Past experience → Future goals. Keep it under 2 minutes.' },
      { q: 'Why do you want this job?', a: 'Connect your skills and interests to the specific role and company mission.' },
      { q: 'What are your strengths and weaknesses?', a: 'Be honest but strategic. For weaknesses, show how you\'re working to improve.' },
      { q: 'Where do you see yourself in 5 years?', a: 'Show ambition while demonstrating commitment to the role and company.' }
    ]
  },
  {
    category: 'Behavioral',
    questions: [
      { q: 'Describe a challenging situation you faced', a: 'Use the STAR method: Situation, Task, Action, Result.' },
      { q: 'Tell me about a time you worked in a team', a: 'Highlight collaboration, communication, and your specific contribution.' },
      { q: 'How do you handle pressure?', a: 'Give specific examples of how you stayed calm and delivered results.' }
    ]
  },
  {
    category: 'Technical (for Tech Roles)',
    questions: [
      { q: 'Explain your approach to problem-solving', a: 'Walk through your systematic approach: understand, plan, execute, test.' },
      { q: 'Describe a project you\'re proud of', a: 'Focus on your role, technologies used, challenges overcome, and impact.' },
      { q: 'How do you stay updated with technology?', a: 'Mention courses, communities, blogs, and personal projects.' }
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

const useApplicationStatus = () => {
  const [statuses, setStatuses] = useState<Record<string, ApplicationStatus>>(() => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem('job-statuses');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('job-statuses', JSON.stringify(statuses));
  }, [statuses]);

  const setStatus = (id: string, status: ApplicationStatus) => {
    setStatuses(prev => ({ ...prev, [id]: status }));
  };

  const getStatus = (id: string): ApplicationStatus => statuses[id] || 'not_started';

  return { statuses, setStatus, getStatus };
};

const getDaysAgo = (date: string) => {
  const posted = new Date(date);
  const today = new Date();
  const diffTime = today.getTime() - posted.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

const JobCard: React.FC<{
  job: Job;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onApply: () => void;
  index: number;
}> = ({ job, isBookmarked, onToggleBookmark, onApply, index }) => {
  const typeColors: Record<JobType, string> = {
    'full-time': 'bg-emerald-100 text-emerald-700',
    'part-time': 'bg-blue-100 text-blue-700',
    'remote': 'bg-violet-100 text-violet-700',
    'internship': 'bg-amber-100 text-amber-700'
  };

  const typeLabels: Record<JobType, string> = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    'remote': 'Remote',
    'internship': 'Internship'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-xl border border-border hover:border-nobel-gold hover:shadow-xl transition-all duration-300 group p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-muted-foreground group-hover:bg-ui-blue group-hover:text-white transition-colors">
          <Building2 size={24} />
        </div>
        <div className="flex items-center gap-2">
          <Badge className={typeColors[job.type]}>{typeLabels[job.type]}</Badge>
          <button
            onClick={onToggleBookmark}
            className={`p-2 rounded-full transition-all ${
              isBookmarked
                ? 'bg-nobel-gold/10 text-nobel-gold'
                : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        </div>
      </div>

      <h3 className="font-serif text-xl text-foreground group-hover:text-ui-blue transition-colors mb-1">
        {job.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">{job.company}</p>

      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.requirements.slice(0, 3).map((req, i) => (
          <span key={i} className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-medium rounded-full">
            {req}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
        <span className="flex items-center gap-1"><Clock size={12} /> {getDaysAgo(job.postedDate)}</span>
      </div>

      {job.salary && (
        <div className="flex items-center gap-1 text-sm font-medium text-ui-blue mb-4">
          <DollarSign size={14} /> {job.salary}
        </div>
      )}

      <div className="pt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Deadline: {new Date(job.deadline).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
        </span>
        <Button size="sm" onClick={onApply} className="gap-2 text-xs">
          Quick Apply <ExternalLink size={12} />
        </Button>
      </div>
    </motion.div>
  );
};

const CareerHubPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const { bookmarks, toggle, isBookmarked } = useBookmarks('career-bookmarks');
  const { getStatus, setStatus } = useApplicationStatus();

  const handleBookmark = (id: string) => {
    toggle(id);
    toast.success(isBookmarked(id) ? 'Removed from saved' : 'Job saved!');
  };

  const handleApply = (job: Job) => {
    setStatus(job.id, 'applied');
    toast.success(`Applied to ${job.title}`, {
      description: `at ${job.company}`
    });
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (job.isInternship) return false;
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || job.type === typeFilter;
      const matchesIndustry = industryFilter === 'all' || job.industry === industryFilter;
      return matchesSearch && matchesType && matchesIndustry;
    });
  }, [searchTerm, typeFilter, industryFilter]);

  const filteredInternships = useMemo(() => {
    return jobs.filter(job => {
      if (!job.isInternship) return false;
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesIndustry = industryFilter === 'all' || job.industry === industryFilter;
      return matchesSearch && matchesIndustry;
    });
  }, [searchTerm, industryFilter]);

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <SEO
        title="Career Hub - Resources"
        description="Find jobs, internships, CV resources, and interview tips for your career."
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
            <Briefcase className="text-nobel-gold w-8 h-8" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">Career Development</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif text-ui-blue leading-[0.9] mb-6"
          >
            Career <br />
            <span className="italic text-muted-foreground">Hub</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground font-light max-w-2xl leading-relaxed"
          >
            Find opportunities, prepare your application materials, and ace your interviews. Your career journey starts here.
          </motion.p>
        </div>

        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="w-full max-w-2xl grid grid-cols-4 mb-8">
            <TabsTrigger value="jobs" className="gap-2">
              <Briefcase size={16} /> Jobs
            </TabsTrigger>
            <TabsTrigger value="internships" className="gap-2">
              <GraduationCap size={16} /> Internships
            </TabsTrigger>
            <TabsTrigger value="cv" className="gap-2">
              <FileText size={16} /> CV Resources
            </TabsTrigger>
            <TabsTrigger value="interview" className="gap-2">
              <Users size={16} /> Interview Tips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs">
            <div className="mb-8 space-y-4 py-4 border-y border-border">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-base rounded-full border-border"
                  />
                </div>

                <div className="flex gap-3">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px] h-12 rounded-full">
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={industryFilter} onValueChange={setIndustryFilter}>
                    <SelectTrigger className="w-[150px] h-12 rounded-full">
                      <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      <SelectItem value="tech">Tech</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                    onApply={() => handleApply(job)}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>

            {filteredJobs.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <Briefcase className="mx-auto text-muted-foreground mb-4" size={64} />
                <h3 className="text-xl font-serif text-foreground mb-2">No jobs found</h3>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="internships">
            <div className="mb-8 space-y-4 py-4 border-y border-border">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    type="text"
                    placeholder="Search internships..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-base rounded-full border-border"
                  />
                </div>

                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger className="w-[150px] h-12 rounded-full">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    <SelectItem value="tech">Tech</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredInternships.map((job, index) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isBookmarked={isBookmarked(job.id)}
                    onToggleBookmark={() => handleBookmark(job.id)}
                    onApply={() => handleApply(job)}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>

            {filteredInternships.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <GraduationCap className="mx-auto text-muted-foreground mb-4" size={64} />
                <h3 className="text-xl font-serif text-foreground mb-2">No internships found</h3>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="cv">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="font-serif text-2xl text-foreground mb-2">CV Templates</h2>
                  <p className="text-muted-foreground">Download ATS-friendly templates to create your perfect CV.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cvResources.map((resource, index) => (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card p-6 rounded-xl border border-border hover:border-nobel-gold hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-muted rounded-lg text-muted-foreground group-hover:bg-ui-blue group-hover:text-white transition-colors">
                          <FileText size={24} />
                        </div>
                        <Badge variant="secondary">{resource.format}</Badge>
                      </div>

                      <h3 className="font-medium text-foreground mb-2">{resource.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{resource.downloads.toLocaleString()} downloads</span>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Download size={14} /> Download
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="font-serif text-xl text-foreground mb-4">ATS Tips</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Applicant Tracking Systems scan your CV before humans see it. Make sure yours passes:
                  </p>
                  <ul className="space-y-3">
                    {atsTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-ui-blue p-6 rounded-xl text-white">
                  <h4 className="font-serif text-lg mb-2">Need Help?</h4>
                  <p className="text-sm text-white/70 mb-4">
                    Book a CV review session with the Career Services office.
                  </p>
                  <Button variant="secondary" className="w-full">
                    Book Session
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="interview">
            <div className="max-w-4xl">
              <div className="mb-8">
                <h2 className="font-serif text-2xl text-foreground mb-2">Interview Preparation</h2>
                <p className="text-muted-foreground">Common questions and how to answer them confidently.</p>
              </div>

              <Accordion type="single" collapsible className="space-y-4">
                {interviewQuestions.map((section, sectionIndex) => (
                  <AccordionItem
                    key={section.category}
                    value={section.category}
                    className="bg-card rounded-xl border border-border px-6"
                  >
                    <AccordionTrigger className="hover:no-underline py-6">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <Users size={20} className="text-ui-blue" />
                        </div>
                        <span className="font-serif text-xl text-foreground">{section.category} Questions</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <div className="space-y-6 pt-2">
                        {section.questions.map((item, qIndex) => (
                          <div key={qIndex} className="border-l-2 border-nobel-gold pl-4">
                            <h4 className="font-medium text-foreground mb-2">"{item.q}"</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 bg-gradient-to-r from-ui-blue to-ui-dark p-8 rounded-xl text-white"
              >
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-white/10 rounded-lg">
                    <Laptop size={32} />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl mb-2">Practice Mock Interviews</h3>
                    <p className="text-white/70 mb-4">
                      Schedule a practice interview with our career counselors or use AI-powered mock interview tools.
                    </p>
                    <div className="flex gap-3">
                      <Button variant="secondary">Book with Counselor</Button>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        Try AI Practice
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CareerHubPage;
