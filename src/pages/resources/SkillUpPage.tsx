import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, Rocket, Play, Clock, ExternalLink,
  Code, Briefcase, Palette, Globe, Bookmark, BookmarkCheck,
  Star, Users, ChevronRight
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { toast } from 'sonner';

type SkillCategory = 'all' | 'tech' | 'business' | 'creative' | 'languages';

interface Course {
  id: string;
  title: string;
  instructor: string;
  category: 'tech' | 'business' | 'creative' | 'languages';
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  youtubeUrl: string;
  thumbnailId: string;
  views: string;
  rating: number;
}

const courses: Course[] = [
  {
    id: 'python-beginners',
    title: 'Python for Beginners - Full Course',
    instructor: 'freeCodeCamp',
    category: 'tech',
    duration: '4h 20m',
    level: 'Beginner',
    description: 'Learn Python programming from scratch. Perfect for students starting their coding journey.',
    youtubeUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    thumbnailId: 'rfscVS0vtbw',
    views: '40M+',
    rating: 4.9
  },
  {
    id: 'web-dev-crash',
    title: 'HTML, CSS, JavaScript Crash Course',
    instructor: 'Traversy Media',
    category: 'tech',
    duration: '2h 30m',
    level: 'Beginner',
    description: 'Build your first website. Essential skills for any modern professional.',
    youtubeUrl: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
    thumbnailId: 'UB1O30fR-EE',
    views: '15M+',
    rating: 4.8
  },
  {
    id: 'excel-mastery',
    title: 'Excel Full Course - From Beginner to Pro',
    instructor: 'Leila Gharani',
    category: 'business',
    duration: '3h 45m',
    level: 'Beginner',
    description: 'Master Microsoft Excel. Essential for data analysis, finance, and business roles.',
    youtubeUrl: 'https://www.youtube.com/watch?v=Vl0H-qTclOg',
    thumbnailId: 'Vl0H-qTclOg',
    views: '8M+',
    rating: 4.9
  },
  {
    id: 'figma-ui-ux',
    title: 'Figma UI/UX Design Tutorial',
    instructor: 'DesignCourse',
    category: 'creative',
    duration: '2h 15m',
    level: 'Beginner',
    description: 'Learn UI/UX design with Figma. Build beautiful interfaces and prototypes.',
    youtubeUrl: 'https://www.youtube.com/watch?v=FTFaQWZBqQ8',
    thumbnailId: 'FTFaQWZBqQ8',
    views: '2M+',
    rating: 4.7
  },
  {
    id: 'public-speaking',
    title: 'Public Speaking Masterclass',
    instructor: 'Charisma on Command',
    category: 'business',
    duration: '1h 30m',
    level: 'Intermediate',
    description: 'Become a confident speaker. Essential for presentations, interviews, and leadership.',
    youtubeUrl: 'https://www.youtube.com/watch?v=tShavGuo0_E',
    thumbnailId: 'tShavGuo0_E',
    views: '5M+',
    rating: 4.8
  },
  {
    id: 'data-analysis-python',
    title: 'Data Analysis with Python - Full Course',
    instructor: 'freeCodeCamp',
    category: 'tech',
    duration: '5h 30m',
    level: 'Intermediate',
    description: 'Learn Pandas, NumPy, and data visualization for data science careers.',
    youtubeUrl: 'https://www.youtube.com/watch?v=r-uOLxNrNk8',
    thumbnailId: 'r-uOLxNrNk8',
    views: '6M+',
    rating: 4.9
  },
  {
    id: 'financial-modeling',
    title: 'Financial Modeling for Beginners',
    instructor: 'Corporate Finance Institute',
    category: 'business',
    duration: '2h 45m',
    level: 'Intermediate',
    description: 'Build financial models in Excel. Essential for banking and consulting roles.',
    youtubeUrl: 'https://www.youtube.com/watch?v=qeMJXrVrPLI',
    thumbnailId: 'qeMJXrVrPLI',
    views: '1M+',
    rating: 4.6
  },
  {
    id: 'graphic-design',
    title: 'Graphic Design Fundamentals',
    instructor: 'Envato Tuts+',
    category: 'creative',
    duration: '1h 45m',
    level: 'Beginner',
    description: 'Learn design principles, color theory, and typography basics.',
    youtubeUrl: 'https://www.youtube.com/watch?v=YqQx75OPRa0',
    thumbnailId: 'YqQx75OPRa0',
    views: '3M+',
    rating: 4.7
  },
  {
    id: 'french-beginners',
    title: 'French for Beginners - Complete Course',
    instructor: 'Learn French with Alexa',
    category: 'languages',
    duration: '6h 00m',
    level: 'Beginner',
    description: 'Start learning French from zero. Great for international opportunities.',
    youtubeUrl: 'https://www.youtube.com/watch?v=lmTvGifSzRQ',
    thumbnailId: 'lmTvGifSzRQ',
    views: '4M+',
    rating: 4.8
  },
  {
    id: 'spanish-conversation',
    title: 'Spanish Conversation Practice',
    instructor: 'SpanishPod101',
    category: 'languages',
    duration: '3h 30m',
    level: 'Intermediate',
    description: 'Improve your Spanish speaking skills with real conversations.',
    youtubeUrl: 'https://www.youtube.com/watch?v=Q9X2l6Y-aag',
    thumbnailId: 'Q9X2l6Y-aag',
    views: '2M+',
    rating: 4.6
  },
  {
    id: 'react-course',
    title: 'React JS Full Course 2024',
    instructor: 'JavaScript Mastery',
    category: 'tech',
    duration: '6h 00m',
    level: 'Intermediate',
    description: 'Build modern web applications with React. High-demand skill in tech.',
    youtubeUrl: 'https://www.youtube.com/watch?v=b9eMGE7QtTk',
    thumbnailId: 'b9eMGE7QtTk',
    views: '3M+',
    rating: 4.9
  },
  {
    id: 'video-editing',
    title: 'Video Editing Masterclass - DaVinci Resolve',
    instructor: 'Casey Faris',
    category: 'creative',
    duration: '4h 00m',
    level: 'Beginner',
    description: 'Learn professional video editing with free software. Create content that stands out.',
    youtubeUrl: 'https://www.youtube.com/watch?v=63Ln33O4p4c',
    thumbnailId: '63Ln33O4p4c',
    views: '2M+',
    rating: 4.8
  },
  {
    id: 'sql-database',
    title: 'SQL Full Course - Database Management',
    instructor: 'freeCodeCamp',
    category: 'tech',
    duration: '4h 20m',
    level: 'Beginner',
    description: 'Learn SQL for data management. Essential for data analysts and developers.',
    youtubeUrl: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
    thumbnailId: 'HXV3zeQKqGY',
    views: '12M+',
    rating: 4.9
  },
  {
    id: 'negotiation-skills',
    title: 'Negotiation Skills - Harvard Business',
    instructor: 'Harvard Business Review',
    category: 'business',
    duration: '1h 15m',
    level: 'Advanced',
    description: 'Master negotiation tactics. Valuable for salary discussions and business deals.',
    youtubeUrl: 'https://www.youtube.com/watch?v=Jl-0Ng0ufaI',
    thumbnailId: 'Jl-0Ng0ufaI',
    views: '1.5M+',
    rating: 4.7
  },
  {
    id: 'photography',
    title: 'Photography Basics for Beginners',
    instructor: 'Peter McKinnon',
    category: 'creative',
    duration: '2h 00m',
    level: 'Beginner',
    description: 'Learn photography fundamentals. Great for content creation and portfolios.',
    youtubeUrl: 'https://www.youtube.com/watch?v=V7z7BAZdt2M',
    thumbnailId: 'V7z7BAZdt2M',
    views: '5M+',
    rating: 4.8
  },
  {
    id: 'german-beginners',
    title: 'German for Beginners - A1 Level',
    instructor: 'Learn German',
    category: 'languages',
    duration: '5h 30m',
    level: 'Beginner',
    description: 'Start learning German. Opens doors to opportunities in Germany.',
    youtubeUrl: 'https://www.youtube.com/watch?v=RuGmc662HDg',
    thumbnailId: 'RuGmc662HDg',
    views: '8M+',
    rating: 4.7
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
  tech: { icon: Code, label: 'Tech & Programming', color: 'text-emerald-600' },
  business: { icon: Briefcase, label: 'Business & Finance', color: 'text-ui-blue' },
  creative: { icon: Palette, label: 'Creative & Design', color: 'text-purple-600' },
  languages: { icon: Globe, label: 'Languages', color: 'text-nobel-gold' }
};

const levelConfig = {
  Beginner: 'bg-green-50 text-green-700 border-green-100',
  Intermediate: 'bg-amber-50 text-amber-700 border-amber-100',
  Advanced: 'bg-red-50 text-red-700 border-red-100'
};

const CourseCard: React.FC<{
  course: Course;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  index: number;
}> = ({ course, isBookmarked, onToggleBookmark, index }) => {
  const catConfig = categoryConfig[course.category];
  const CategoryIcon = catConfig.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="bg-white border border-slate-100 hover:border-nobel-gold/50 hover:shadow-lg transition-all duration-300 group overflow-hidden"
    >
      <a 
        href={course.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative aspect-video bg-slate-100 overflow-hidden"
      >
        <img
          src={`https://img.youtube.com/vi/${course.thumbnailId}/maxresdefault.jpg`}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${course.thumbnailId}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
            <Play size={28} className="text-white ml-1" fill="white" />
          </div>
        </div>
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 text-white text-xs font-bold">
          {course.duration}
        </div>
      </a>

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CategoryIcon size={14} className={catConfig.color} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${catConfig.color}`}>
              {catConfig.label}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleBookmark();
            }}
            className={`p-1.5 transition-colors ${
              isBookmarked 
                ? 'text-nobel-gold' 
                : 'text-slate-300 hover:text-slate-600'
            }`}
          >
            {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        </div>

        <h3 className="font-serif text-xl text-ui-blue group-hover:text-nobel-gold transition-colors mb-2 leading-tight">
          {course.title}
        </h3>

        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
          {course.instructor}
        </p>

        <p className="text-slate-600 font-light text-sm leading-relaxed mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center gap-3 mb-4">
          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${levelConfig[course.level]}`}>
            {course.level}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Users size={12} /> {course.views}
          </span>
        </div>

        <div className="flex items-center gap-1 text-nobel-gold">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={12} 
              fill={i < Math.floor(course.rating) ? 'currentColor' : 'none'}
              className={i < Math.floor(course.rating) ? '' : 'text-slate-200'}
            />
          ))}
          <span className="ml-1 text-xs text-slate-500">{course.rating}</span>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
        <a
          href={course.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
        >
          <Play size={14} fill="white" /> Watch on YouTube
        </a>
      </div>
    </motion.div>
  );
};

const SkillUpPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<SkillCategory>('all');

  const { bookmarks, toggle, isBookmarked } = useBookmarks('skillup-bookmarks');

  const handleBookmark = (id: string) => {
    toggle(id);
    toast.success(isBookmarked(id) ? 'Removed from saved' : 'Added to watchlist');
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || course.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const categories: { value: SkillCategory; label: string; icon: typeof Code }[] = [
    { value: 'all', label: 'All Courses', icon: Rocket },
    { value: 'tech', label: 'Tech', icon: Code },
    { value: 'business', label: 'Business', icon: Briefcase },
    { value: 'creative', label: 'Creative', icon: Palette },
    { value: 'languages', label: 'Languages', icon: Globe }
  ];

  const featuredCourse = courses.find(c => c.id === 'python-beginners');

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <SEO 
        title="Skill Up - Resources" 
        description="Free YouTube tutorials and courses to build valuable skills." 
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
            <Rocket className="text-nobel-gold w-6 h-6" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Free Learning</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl text-ui-blue mb-6"
          >
            Skill <span className="italic text-slate-300">Up</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 font-light max-w-2xl leading-relaxed"
          >
            Curated YouTube tutorials and courses to build in-demand skills. All free, all valuable. Start learning today.
          </motion.p>
        </div>

        {featuredCourse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16 bg-ui-blue text-white overflow-hidden"
          >
            <div className="grid md:grid-cols-2">
              <a 
                href={featuredCourse.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-video md:aspect-auto overflow-hidden group"
              >
                <img
                  src={`https://img.youtube.com/vi/${featuredCourse.thumbnailId}/maxresdefault.jpg`}
                  alt={featuredCourse.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play size={36} className="text-white ml-1" fill="white" />
                  </div>
                </div>
              </a>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-nobel-gold mb-4">Featured Course</span>
                <h2 className="font-serif text-3xl mb-2">{featuredCourse.title}</h2>
                <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">{featuredCourse.instructor}</p>
                <p className="text-white/70 font-light mb-6">{featuredCourse.description}</p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
                    {featuredCourse.duration}
                  </span>
                  <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
                    {featuredCourse.level}
                  </span>
                  <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
                    {featuredCourse.views} views
                  </span>
                </div>
                <a 
                  href={featuredCourse.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors self-start"
                >
                  <Play size={14} fill="white" /> Start Learning
                </a>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mb-12 space-y-6 pb-8 border-b border-slate-200">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
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
            {filteredCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                isBookmarked={isBookmarked(course.id)}
                onToggleBookmark={() => handleBookmark(course.id)}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <Rocket className="mx-auto text-slate-200 mb-6" size={64} />
            <h3 className="font-serif text-2xl text-slate-400 mb-2">No courses found</h3>
            <p className="text-slate-300">Try adjusting your search or filter</p>
          </motion.div>
        )}

        <div className="mt-20 bg-white border border-slate-100 p-8 md:p-12 text-center max-w-3xl mx-auto">
          <h3 className="font-serif text-2xl text-ui-blue mb-4">Suggest a Course</h3>
          <p className="text-slate-500 font-light mb-8">Know a great YouTube tutorial that should be here? Let us know!</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="url"
              placeholder="Paste YouTube URL..."
              className="flex-1 px-4 py-3 border border-slate-200 focus:border-nobel-gold focus:outline-none text-sm"
            />
            <button className="px-6 py-3 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold transition-colors">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillUpPage;
