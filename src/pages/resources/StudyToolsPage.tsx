import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, Bookmark, BookmarkCheck, ExternalLink, Star,
  Clock, Brain, FileText, BarChart3, Calendar, Pencil, Target, Zap
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { toast } from 'sonner';

type ToolCategory = 'all' | 'focus' | 'notes' | 'practice' | 'planning';

interface StudyTool {
  id: string;
  name: string;
  description: string;
  category: 'focus' | 'notes' | 'practice' | 'planning';
  pricing: 'free' | 'freemium' | 'premium';
  rating: number;
  url: string;
  features: string[];
}

const studyTools: StudyTool[] = [
  {
    id: 'forest',
    name: 'Forest',
    description: 'Stay focused by planting virtual trees. Your tree grows while you focus, dies if you leave the app.',
    category: 'focus',
    pricing: 'freemium',
    rating: 4.8,
    url: 'https://www.forestapp.cc/',
    features: ['Gamified Focus', 'Real Tree Planting', 'Statistics']
  },
  {
    id: 'pomofocus',
    name: 'Pomofocus',
    description: 'A customizable pomodoro timer that works on desktop and mobile browsers for focused work sessions.',
    category: 'focus',
    pricing: 'free',
    rating: 4.7,
    url: 'https://pomofocus.io/',
    features: ['Customizable Timer', 'Task Integration', 'Reports']
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'All-in-one workspace for notes, databases, wikis, and project management with powerful templates.',
    category: 'notes',
    pricing: 'freemium',
    rating: 4.9,
    url: 'https://www.notion.so/',
    features: ['Templates', 'Databases', 'Collaboration']
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    description: 'A powerful knowledge base that works on local Markdown files with bidirectional linking.',
    category: 'notes',
    pricing: 'free',
    rating: 4.8,
    url: 'https://obsidian.md/',
    features: ['Graph View', 'Plugins', 'Local Storage']
  },
  {
    id: 'anki',
    name: 'Anki',
    description: 'Powerful flashcard app using spaced repetition algorithm for efficient memorization.',
    category: 'practice',
    pricing: 'free',
    rating: 4.7,
    url: 'https://apps.ankiweb.net/',
    features: ['Spaced Repetition', 'Custom Decks', 'Statistics']
  },
  {
    id: 'quizlet',
    name: 'Quizlet',
    description: 'Create and study flashcards, play learning games, and test your knowledge with practice tests.',
    category: 'practice',
    pricing: 'freemium',
    rating: 4.6,
    url: 'https://quizlet.com/',
    features: ['Flashcards', 'Games', 'Study Modes']
  },
  {
    id: 'todoist',
    name: 'Todoist',
    description: 'Task manager to organize your academic life with projects, labels, and priorities.',
    category: 'planning',
    pricing: 'freemium',
    rating: 4.8,
    url: 'https://todoist.com/',
    features: ['Natural Language', 'Projects', 'Integrations']
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Schedule classes, assignments, and study sessions with reminders and time blocking.',
    category: 'planning',
    pricing: 'free',
    rating: 4.7,
    url: 'https://calendar.google.com/',
    features: ['Time Blocking', 'Reminders', 'Sharing']
  },
  {
    id: 'grammarly',
    name: 'Grammarly',
    description: 'AI-powered writing assistant for essays, papers, and academic writing improvement.',
    category: 'notes',
    pricing: 'freemium',
    rating: 4.6,
    url: 'https://www.grammarly.com/',
    features: ['Grammar Check', 'Plagiarism', 'Tone Detection']
  },
  {
    id: 'cold-turkey',
    name: 'Cold Turkey',
    description: 'Block distracting websites and apps during study sessions with strict scheduling.',
    category: 'focus',
    pricing: 'freemium',
    rating: 4.5,
    url: 'https://getcoldturkey.com/',
    features: ['Website Blocker', 'App Blocker', 'Scheduling']
  },
  {
    id: 'rescuetime',
    name: 'RescueTime',
    description: 'Automatic time tracking to understand your digital habits and improve productivity.',
    category: 'focus',
    pricing: 'freemium',
    rating: 4.4,
    url: 'https://www.rescuetime.com/',
    features: ['Auto Tracking', 'Reports', 'Goals']
  },
  {
    id: 'gpa-calculator',
    name: 'GPA Calculator',
    description: 'Calculate your cumulative GPA and plan your grades for upcoming semesters.',
    category: 'planning',
    pricing: 'free',
    rating: 4.5,
    url: 'https://gpacalculator.net/',
    features: ['CGPA Calc', 'What-If Analysis', 'Multiple Scales']
  },
  {
    id: 'remnote',
    name: 'RemNote',
    description: 'Note-taking app with built-in spaced repetition for turning notes into flashcards.',
    category: 'notes',
    pricing: 'freemium',
    rating: 4.6,
    url: 'https://www.remnote.com/',
    features: ['Notes + Flashcards', 'PDF Annotation', 'Knowledge Graph']
  },
  {
    id: 'khan-academy',
    name: 'Khan Academy',
    description: 'Free courses and practice exercises for math, science, and test preparation.',
    category: 'practice',
    pricing: 'free',
    rating: 4.9,
    url: 'https://www.khanacademy.org/',
    features: ['Video Lessons', 'Practice', 'Progress Tracking']
  },
  {
    id: 'my-study-life',
    name: 'My Study Life',
    description: 'Student planner to manage classes, tasks, and exams with a rotating weekly schedule.',
    category: 'planning',
    pricing: 'free',
    rating: 4.5,
    url: 'https://www.mystudylife.com/',
    features: ['Class Schedule', 'Task Manager', 'Exam Planner']
  },
  {
    id: 'brain-fm',
    name: 'Brain.fm',
    description: 'AI-generated music designed to improve focus, relaxation, and sleep during study.',
    category: 'focus',
    pricing: 'premium',
    rating: 4.6,
    url: 'https://www.brain.fm/',
    features: ['Focus Music', 'Sleep Sounds', 'Science-Backed']
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

const categoryConfig = {
  focus: { icon: Brain, label: 'Focus & Productivity', color: 'text-rose-600' },
  notes: { icon: FileText, label: 'Note-Taking', color: 'text-ui-blue' },
  practice: { icon: Target, label: 'Practice & Testing', color: 'text-emerald-600' },
  planning: { icon: Calendar, label: 'Planning', color: 'text-nobel-gold' }
};

const pricingConfig = {
  free: { label: 'Free', color: 'text-green-700 bg-green-50 border-green-100' },
  freemium: { label: 'Freemium', color: 'text-ui-blue bg-blue-50 border-blue-100' },
  premium: { label: 'Premium', color: 'text-amber-700 bg-amber-50 border-amber-100' }
};

const ToolCard: React.FC<{
  tool: StudyTool;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  index: number;
}> = ({ tool, isBookmarked, onToggleBookmark, index }) => {
  const catConfig = categoryConfig[tool.category];
  const priceConfig = pricingConfig[tool.pricing];
  const CategoryIcon = catConfig.icon;

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
          <div className={`w-12 h-12 bg-slate-50 border border-slate-100 flex items-center justify-center ${catConfig.color}`}>
            <CategoryIcon size={20} />
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

        <div className="flex items-center gap-3 mb-4">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${catConfig.color}`}>
            {catConfig.label}
          </span>
          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${priceConfig.color}`}>
            {priceConfig.label}
          </span>
        </div>

        <h3 className="font-serif text-2xl text-ui-blue group-hover:text-nobel-gold transition-colors mb-3">
          {tool.name}
        </h3>

        <p className="text-slate-600 leading-relaxed text-sm font-light mb-6">
          {tool.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {tool.features.map((feature, i) => (
            <span key={i} className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border border-slate-100">
              {feature}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 text-nobel-gold">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={14} 
              fill={i < Math.floor(tool.rating) ? 'currentColor' : 'none'}
              className={i < Math.floor(tool.rating) ? '' : 'text-slate-200'}
            />
          ))}
          <span className="ml-2 text-sm text-slate-500">{tool.rating}</span>
        </div>
      </div>

      <div className="px-8 py-4 border-t border-slate-100 bg-slate-50">
        <a 
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-ui-blue text-white text-[10px] font-bold uppercase tracking-widest hover:bg-nobel-gold transition-colors"
        >
          Visit Website <ExternalLink size={12} />
        </a>
      </div>
    </motion.div>
  );
};

const StudyToolsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');

  const { bookmarks, toggle, isBookmarked } = useBookmarks('study-tools-bookmarks');

  const handleBookmark = (id: string) => {
    toggle(id);
    toast.success(isBookmarked(id) ? 'Removed from saved' : 'Added to saved tools');
  };

  const filteredTools = useMemo(() => {
    return studyTools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tool.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const categories: { value: ToolCategory; label: string; icon: typeof Brain }[] = [
    { value: 'all', label: 'All Tools', icon: Zap },
    { value: 'focus', label: 'Focus', icon: Brain },
    { value: 'notes', label: 'Notes', icon: FileText },
    { value: 'practice', label: 'Practice', icon: Target },
    { value: 'planning', label: 'Planning', icon: Calendar }
  ];

  const featuredTool = studyTools.find(t => t.id === 'notion');

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <SEO 
        title="Study Tools - Resources" 
        description="Discover the best apps and tools to boost your academic productivity." 
        image="/og/pages-screenshot/resources_study-tools.png"
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
            <Pencil className="text-nobel-gold w-6 h-6" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Productivity Suite</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl text-ui-blue mb-6"
          >
            Study <span className="italic text-slate-300">Tools</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 font-light max-w-2xl leading-relaxed"
          >
            Curated collection of apps and tools to help you focus, take better notes, practice effectively, and plan your academic journey.
          </motion.p>
        </div>

        {featuredTool && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16 bg-ui-blue text-white p-8 md:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-nobel-gold/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-nobel-gold mb-4 block">Featured Tool</span>
                <h2 className="font-serif text-4xl mb-4">{featuredTool.name}</h2>
                <p className="text-white/70 font-light mb-6">{featuredTool.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {featuredTool.features.map((f, i) => (
                    <span key={i} className="px-3 py-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
                      {f}
                    </span>
                  ))}
                </div>
                <a 
                  href={featuredTool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-nobel-gold text-ui-blue text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
                >
                  Try {featuredTool.name} <ExternalLink size={14} />
                </a>
              </div>
              <div className="hidden md:flex justify-end">
                <div className="w-48 h-48 bg-white/10 border border-white/20 flex items-center justify-center">
                  <FileText size={64} className="text-white/20" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mb-12 space-y-6 pb-8 border-b border-slate-200">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 focus:border-nobel-gold focus:outline-none text-lg font-serif transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                    activeCategory === cat.value
                      ? 'bg-ui-blue text-white'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-ui-blue'
                  }`}
                >
                  <Icon size={14} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool, index) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isBookmarked={isBookmarked(tool.id)}
                onToggleBookmark={() => handleBookmark(tool.id)}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredTools.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <Pencil className="mx-auto text-slate-200 mb-6" size={64} />
            <h3 className="font-serif text-2xl text-slate-400 mb-2">No tools found</h3>
            <p className="text-slate-300">Try adjusting your search or filter</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudyToolsPage;
