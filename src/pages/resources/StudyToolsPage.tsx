import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Brain, ExternalLink, Bookmark, BookmarkCheck,
  Clock, Target, FileText, Calendar, Star, Sparkles, Timer,
  Calculator, PenTool, BookOpen, Headphones, CheckSquare, Zap
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type ToolCategory = 'all' | 'focus' | 'notes' | 'practice' | 'planning';

interface StudyTool {
  id: string;
  name: string;
  description: string;
  category: 'focus' | 'notes' | 'practice' | 'planning';
  url: string;
  isPremium: boolean;
  rating: number;
  icon: string;
  featured?: boolean;
}

const tools: StudyTool[] = [
  {
    id: 'pomodoro',
    name: 'Pomofocus',
    description: 'Customizable Pomodoro timer with task lists and detailed reports to track your productivity.',
    category: 'focus',
    url: 'https://pomofocus.io',
    isPremium: false,
    rating: 4.8,
    icon: 'Timer',
    featured: true
  },
  {
    id: 'forest',
    name: 'Forest App',
    description: 'Stay focused by planting virtual trees. Leave the app and your tree dies - gamified productivity.',
    category: 'focus',
    url: 'https://forestapp.cc',
    isPremium: true,
    rating: 4.7,
    icon: 'Target'
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'All-in-one workspace for notes, docs, wikis, and project management. Perfect for students.',
    category: 'notes',
    url: 'https://notion.so',
    isPremium: false,
    rating: 4.9,
    icon: 'FileText',
    featured: true
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    description: 'Powerful knowledge base that works on local Markdown files. Build your second brain.',
    category: 'notes',
    url: 'https://obsidian.md',
    isPremium: false,
    rating: 4.8,
    icon: 'Brain'
  },
  {
    id: 'anki',
    name: 'Anki',
    description: 'Intelligent flashcard system using spaced repetition. Perfect for memorizing anything.',
    category: 'practice',
    url: 'https://apps.ankiweb.net',
    isPremium: false,
    rating: 4.9,
    icon: 'BookOpen',
    featured: true
  },
  {
    id: 'quizlet',
    name: 'Quizlet',
    description: 'Create, share, and study flashcards. Access millions of study sets created by students.',
    category: 'practice',
    url: 'https://quizlet.com',
    isPremium: false,
    rating: 4.6,
    icon: 'CheckSquare'
  },
  {
    id: 'grammarly',
    name: 'Grammarly',
    description: 'AI-powered writing assistant that helps you write clear, mistake-free essays and papers.',
    category: 'notes',
    url: 'https://grammarly.com',
    isPremium: true,
    rating: 4.7,
    icon: 'PenTool'
  },
  {
    id: 'gpa-calculator',
    name: 'UI GPA Calculator',
    description: 'Calculate your CGPA and SGPA using the University of Ibadan grading system.',
    category: 'planning',
    url: '#',
    isPremium: false,
    rating: 4.5,
    icon: 'Calculator'
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Schedule your classes, exams, and study sessions. Sync across all your devices.',
    category: 'planning',
    url: 'https://calendar.google.com',
    isPremium: false,
    rating: 4.8,
    icon: 'Calendar'
  },
  {
    id: 'todoist',
    name: 'Todoist',
    description: 'Powerful task manager to organize your assignments, deadlines, and daily tasks.',
    category: 'planning',
    url: 'https://todoist.com',
    isPremium: false,
    rating: 4.7,
    icon: 'CheckSquare'
  },
  {
    id: 'brain-fm',
    name: 'Brain.fm',
    description: 'AI-generated music designed to improve focus, relaxation, and sleep while studying.',
    category: 'focus',
    url: 'https://brain.fm',
    isPremium: true,
    rating: 4.6,
    icon: 'Headphones'
  },
  {
    id: 'cold-turkey',
    name: 'Cold Turkey Blocker',
    description: 'Block distracting websites and apps during study sessions. Serious focus mode.',
    category: 'focus',
    url: 'https://getcoldturkey.com',
    isPremium: true,
    rating: 4.5,
    icon: 'Zap'
  },
  {
    id: 'remnote',
    name: 'RemNote',
    description: 'Note-taking app with built-in flashcards. Automatically converts notes to study materials.',
    category: 'notes',
    url: 'https://remnote.com',
    isPremium: false,
    rating: 4.6,
    icon: 'Brain'
  },
  {
    id: 'kahoot',
    name: 'Kahoot!',
    description: 'Create engaging quizzes and study with game-based learning. Great for group study.',
    category: 'practice',
    url: 'https://kahoot.com',
    isPremium: false,
    rating: 4.5,
    icon: 'Sparkles'
  },
  {
    id: 'wolfram',
    name: 'Wolfram Alpha',
    description: 'Computational knowledge engine. Solve math problems, chemistry equations, and more.',
    category: 'practice',
    url: 'https://wolframalpha.com',
    isPremium: true,
    rating: 4.8,
    icon: 'Calculator'
  },
  {
    id: 'my-study-life',
    name: 'My Study Life',
    description: 'Digital school planner for students. Track classes, tasks, and exams in one place.',
    category: 'planning',
    url: 'https://mystudylife.com',
    isPremium: false,
    rating: 4.4,
    icon: 'Calendar'
  }
];

const iconMap: Record<string, React.ElementType> = {
  Timer, Target, FileText, Calendar, Star, Brain, BookOpen,
  CheckSquare, PenTool, Calculator, Headphones, Zap, Sparkles
};

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

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={12}
          className={star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating}</span>
    </div>
  );
};

const FeaturedToolCard: React.FC<{
  tool: StudyTool;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}> = ({ tool, isBookmarked, onToggleBookmark }) => {
  const Icon = iconMap[tool.icon] || Brain;

  return (
    <motion.a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="relative bg-gradient-to-br from-ui-blue to-ui-dark p-6 rounded-xl text-white overflow-hidden group block"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-nobel-gold/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <Icon size={24} />
          </div>
          <div className="flex items-center gap-2">
            {tool.isPremium && (
              <Badge className="bg-nobel-gold/20 text-nobel-gold border-nobel-gold/30 text-[10px]">
                Premium
              </Badge>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleBookmark();
              }}
              className={`p-2 rounded-full transition-all ${
                isBookmarked ? 'bg-nobel-gold/20 text-nobel-gold' : 'hover:bg-white/10'
              }`}
            >
              {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-nobel-gold" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Featured</span>
        </div>

        <h3 className="font-serif text-2xl mb-2">{tool.name}</h3>
        <p className="text-sm text-white/70 leading-relaxed mb-4 line-clamp-2">{tool.description}</p>

        <div className="flex items-center justify-between">
          <StarRating rating={tool.rating} />
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 group-hover:text-nobel-gold transition-colors">
            Open <ExternalLink size={12} />
          </span>
        </div>
      </div>
    </motion.a>
  );
};

const ToolCard: React.FC<{
  tool: StudyTool;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  index: number;
}> = ({ tool, isBookmarked, onToggleBookmark, index }) => {
  const Icon = iconMap[tool.icon] || Brain;

  const categoryColors = {
    focus: 'bg-rose-100 text-rose-600',
    notes: 'bg-violet-100 text-violet-600',
    practice: 'bg-emerald-100 text-emerald-600',
    planning: 'bg-blue-100 text-blue-600'
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
      <a href={tool.url} target="_blank" rel="noopener noreferrer" className="block p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-lg ${categoryColors[tool.category]} group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
          </div>
          <div className="flex items-center gap-2">
            {tool.isPremium ? (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
                Premium
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">Free</Badge>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleBookmark();
              }}
              className={`p-2 rounded-full transition-all ${
                isBookmarked
                  ? 'bg-nobel-gold/10 text-nobel-gold'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          </div>
        </div>

        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded ${categoryColors[tool.category]}`}>
          {tool.category}
        </span>

        <h3 className="font-serif text-xl text-foreground group-hover:text-ui-blue transition-colors mt-3 mb-2">
          {tool.name}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
          {tool.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <StarRating rating={tool.rating} />
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground group-hover:text-ui-blue transition-colors">
            Open <ExternalLink size={12} />
          </span>
        </div>
      </a>
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
    toast.success(isBookmarked(id) ? 'Removed from saved' : 'Tool saved!');
  };

  const featuredTools = tools.filter(t => t.featured);
  
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      if (tool.featured) return false;
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tool.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const categories: { value: ToolCategory; label: string; icon: React.ElementType }[] = [
    { value: 'all', label: 'All Tools', icon: Sparkles },
    { value: 'focus', label: 'Focus & Productivity', icon: Target },
    { value: 'notes', label: 'Note-Taking', icon: FileText },
    { value: 'practice', label: 'Practice & Testing', icon: BookOpen },
    { value: 'planning', label: 'Planning', icon: Calendar }
  ];

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <SEO
        title="Study Tools - Resources"
        description="Productivity apps, study techniques, and tools to boost your academic performance."
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
            <Brain className="text-nobel-gold w-8 h-8" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">Productivity</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif text-ui-blue leading-[0.9] mb-6"
          >
            Study <br />
            <span className="italic text-muted-foreground">Tools</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground font-light max-w-2xl leading-relaxed"
          >
            Curated collection of apps and tools to help you study smarter, stay focused, and achieve academic excellence.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
            <Sparkles size={14} className="text-nobel-gold" />
            Featured Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTools.map((tool) => (
              <FeaturedToolCard
                key={tool.id}
                tool={tool}
                isBookmarked={isBookmarked(tool.id)}
                onToggleBookmark={() => handleBookmark(tool.id)}
              />
            ))}
          </div>
        </motion.div>

        <div className="mb-8 space-y-4 py-4 border-y border-border">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Search tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base rounded-full border-border"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                    activeCategory === cat.value
                      ? 'bg-ui-blue text-white shadow-md'
                      : 'bg-card text-muted-foreground border border-border hover:border-ui-blue'
                  }`}
                >
                  <Icon size={14} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            className="text-center py-20"
          >
            <Brain className="mx-auto text-muted-foreground mb-4" size={64} />
            <h3 className="text-xl font-serif text-foreground mb-2">No tools found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filter</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudyToolsPage;
