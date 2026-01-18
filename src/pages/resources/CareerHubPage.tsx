import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, Briefcase, MapPin, Clock, Building2, 
  Bookmark, BookmarkCheck, ExternalLink, FileText, Users,
  ChevronDown, Download, CheckCircle2
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';

type JobType = 'all' | 'full-time' | 'part-time' | 'remote' | 'internship';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'remote' | 'internship';
  industry: string;
  posted: string;
  description: string;
  requirements: string[];
  salary?: string;
}

const jobs: Job[] = [
  {
    id: 'campus-rep-mtn',
    title: 'Campus Brand Ambassador',
    company: 'MTN Nigeria',
    location: 'University of Ibadan',
    type: 'part-time',
    industry: 'Telecommunications',
    posted: '2 days ago',
    description: 'Represent MTN brand on campus, organize activations, and drive student engagement.',
    requirements: ['Current UI Student', 'Good Communication', '200-400 Level'],
    salary: '₦30,000/month'
  },
  {
    id: 'tech-intern-andela',
    title: 'Software Engineering Intern',
    company: 'Andela',
    location: 'Lagos / Remote',
    type: 'internship',
    industry: 'Technology',
    posted: '1 week ago',
    description: 'Join our engineering team to build products used by companies worldwide.',
    requirements: ['Computer Science Student', 'JavaScript/Python', 'Problem Solving'],
    salary: '₦150,000/month'
  },
  {
    id: 'research-assist',
    title: 'Research Assistant',
    company: 'UI Department of Chemistry',
    location: 'University of Ibadan',
    type: 'part-time',
    industry: 'Research',
    posted: '3 days ago',
    description: 'Assist faculty with ongoing research projects and laboratory work.',
    requirements: ['Chemistry Student', '300+ Level', 'Lab Experience'],
    salary: '₦25,000/month'
  },
  {
    id: 'content-writer',
    title: 'Content Writer (Remote)',
    company: 'TechCabal',
    location: 'Remote',
    type: 'remote',
    industry: 'Media',
    posted: '5 days ago',
    description: 'Write engaging articles about technology and startups in Africa.',
    requirements: ['Excellent Writing', 'Tech Knowledge', 'Self-motivated'],
    salary: '₦80,000/month'
  },
  {
    id: 'grad-trainee-gtb',
    title: 'Graduate Trainee Program',
    company: 'GTBank',
    location: 'Lagos',
    type: 'full-time',
    industry: 'Banking',
    posted: '1 week ago',
    description: 'Comprehensive 12-month training program for fresh graduates.',
    requirements: ['Recent Graduate', 'First Class/2.1', 'Under 26 years'],
    salary: '₦250,000/month'
  },
  {
    id: 'data-analyst-intern',
    title: 'Data Analytics Intern',
    company: 'Flutterwave',
    location: 'Lagos / Remote',
    type: 'internship',
    industry: 'Fintech',
    posted: '4 days ago',
    description: 'Work with data team to analyze payment trends and generate insights.',
    requirements: ['Statistics/Economics', 'Excel/Python', 'Analytical Mind'],
    salary: '₦120,000/month'
  },
  {
    id: 'library-assist',
    title: 'Student Library Assistant',
    company: 'Kenneth Dike Library',
    location: 'University of Ibadan',
    type: 'part-time',
    industry: 'Education',
    posted: '1 day ago',
    description: 'Help with library operations, shelving, and assisting other students.',
    requirements: ['Current UI Student', 'Organized', 'Flexible Schedule'],
    salary: '₦20,000/month'
  },
  {
    id: 'marketing-intern',
    title: 'Digital Marketing Intern',
    company: 'Paystack',
    location: 'Lagos',
    type: 'internship',
    industry: 'Fintech',
    posted: '6 days ago',
    description: 'Support marketing campaigns, social media management, and content creation.',
    requirements: ['Marketing Student', 'Social Media Savvy', 'Creative'],
    salary: '₦100,000/month'
  },
  {
    id: 'tutor-position',
    title: 'Academic Tutor',
    company: 'PrepClass',
    location: 'Ibadan / Remote',
    type: 'part-time',
    industry: 'Education',
    posted: '2 days ago',
    description: 'Teach secondary school students in your area of expertise.',
    requirements: ['300+ Level', 'CGPA 4.0+', 'Teaching Skills'],
    salary: '₦3,000/hour'
  },
  {
    id: 'ui-ux-intern',
    title: 'UI/UX Design Intern',
    company: 'Cowrywise',
    location: 'Lagos / Remote',
    type: 'internship',
    industry: 'Fintech',
    posted: '1 week ago',
    description: 'Design user interfaces and experiences for our investment platform.',
    requirements: ['Design Portfolio', 'Figma', 'User Research'],
    salary: '₦130,000/month'
  }
];

const cvResources = [
  { title: 'ATS-Friendly CV Template', format: 'DOCX', description: 'Clean template that passes applicant tracking systems.' },
  { title: 'Nigerian Graduate CV Guide', format: 'PDF', description: 'How to write a CV for the Nigerian job market.' },
  { title: 'Cover Letter Templates', format: 'DOCX', description: 'Professional cover letter templates for various industries.' },
  { title: 'LinkedIn Profile Optimization', format: 'PDF', description: 'Tips to make your LinkedIn profile stand out.' }
];

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
  index: number;
}> = ({ job, isBookmarked, onToggleBookmark, index }) => {
  const config = typeConfig[job.type];

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
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
            <Building2 size={20} />
          </div>
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

        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${config.color}`}>
            {config.label}
          </span>
          <span className="text-[10px] text-slate-400">{job.industry}</span>
        </div>

        <h3 className="font-serif text-xl text-ui-blue group-hover:text-nobel-gold transition-colors mb-1">
          {job.title}
        </h3>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">{job.company}</p>

        <p className="text-slate-600 leading-relaxed text-sm font-light mb-4">
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
            <Clock size={12} /> {job.posted}
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
        <button className="flex items-center justify-center gap-2 w-full py-3 bg-ui-blue text-white text-[10px] font-bold uppercase tracking-widest hover:bg-nobel-gold transition-colors">
          Quick Apply <ExternalLink size={12} />
        </button>
      </div>
    </motion.div>
  );
};

const CareerHubPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState<JobType>('all');
  const [activeTab, setActiveTab] = useState('jobs');

  const { bookmarks, toggle, isBookmarked } = useBookmarks('career-hub-bookmarks');

  const handleBookmark = (id: string) => {
    toggle(id);
    toast.success(isBookmarked(id) ? 'Removed from saved' : 'Job saved!');
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = activeType === 'all' || job.type === activeType;
      return matchesSearch && matchesType;
    });
  }, [searchTerm, activeType]);

  const types: { value: JobType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'internship', label: 'Internships' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'remote', label: 'Remote' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <SEO 
        title="Career Hub - Resources" 
        description="Find jobs, internships, and career resources for UI students." 
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
            className="flex items-center gap-4 mb-4"
          >
            <Briefcase className="text-nobel-gold w-6 h-6" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Employment</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl text-ui-blue mb-6"
          >
            Career <span className="italic text-slate-300">Hub</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 font-light max-w-2xl leading-relaxed"
          >
            Discover opportunities tailored for students and fresh graduates. Jobs, internships, CV resources, and interview preparation.
          </motion.p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-2xl bg-white border border-slate-200 p-1 h-auto mb-12 rounded-none">
            <TabsTrigger 
              value="jobs" 
              className="flex-1 py-3 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-ui-blue data-[state=active]:text-white rounded-none"
            >
              Jobs & Internships
            </TabsTrigger>
            <TabsTrigger 
              value="cv" 
              className="flex-1 py-3 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-ui-blue data-[state=active]:text-white rounded-none"
            >
              CV Resources
            </TabsTrigger>
            <TabsTrigger 
              value="interview" 
              className="flex-1 py-3 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-ui-blue data-[state=active]:text-white rounded-none"
            >
              Interview Tips
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
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 focus:border-nobel-gold focus:outline-none text-lg font-serif transition-colors"
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
                    index={index}
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

          <TabsContent value="cv" className="mt-0">
            <div className="max-w-4xl">
              <div className="mb-12">
                <h2 className="font-serif text-3xl text-ui-blue mb-4">CV Resources & <span className="italic text-slate-300">Templates</span></h2>
                <p className="text-slate-500 font-light">Download professional templates and guides to create a standout application.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cvResources.map((resource, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white border border-slate-100 p-8 hover:border-nobel-gold/50 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-slate-50 border border-slate-100 flex items-center justify-center text-ui-blue">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-nobel-gold">{resource.format}</span>
                        <h3 className="font-serif text-xl text-ui-blue group-hover:text-nobel-gold transition-colors">
                          {resource.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-slate-600 font-light text-sm mb-6">{resource.description}</p>
                    <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ui-blue hover:text-nobel-gold transition-colors">
                      <Download size={14} /> Download
                    </button>
                  </motion.div>
                ))}
              </div>

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
    </div>
  );
};

export default CareerHubPage;
