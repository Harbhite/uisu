import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { constitutionData, amendmentsData } from '@/lib/data';
import { Search, Scale, ChevronRight, BookOpen, Zap, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Constitution1Page: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState(constitutionData[0]?.id || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('constitution1-dark') === 'true');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => { localStorage.setItem('constitution1-dark', String(darkMode)); }, [darkMode]);

  const filteredArticles = constitutionData.filter(article => {
    const query = searchQuery.toLowerCase();
    return article.title.toLowerCase().includes(query) || 
           article.sections.some(section => section.content.toLowerCase().includes(query));
  });

  const categories = ['all', 'governance', 'rights', 'procedures', 'committees'];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
    }`}>
      <SEO
        title="Constitution (Modern View) | UISU SPACE"
        description="Modern card-based view of the University of Ibadan Students' Union Constitution."
      />

      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-ui-blue to-nobel-gold z-50 origin-left" style={{ scaleX }} />

      {/* Header */}
      <div className={`pt-32 pb-20 px-6 md:px-12 lg:px-20 relative overflow-hidden ${
        darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-ui-blue via-ui-blue to-ui-dark'
      } text-white`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-nobel-gold blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-nobel-gold blur-3xl rounded-full opacity-50" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-nobel-gold/20 rounded-full backdrop-blur-sm">
              <BookOpen size={24} className="text-nobel-gold" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-nobel-gold">Constitutional Framework</span>
          </div>

          <h1 className="font-serif text-6xl md:text-7xl mb-6 leading-tight">
            The Constitution <span className="text-nobel-gold">Reimagined</span>
          </h1>

          <p className="text-lg text-slate-200 max-w-2xl leading-relaxed">
            Explore the supreme law of the Students' Union through a modern, interactive interface designed for clarity and accessibility.
          </p>

          {/* Search Bar */}
          <div className="mt-8 flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search articles, sections, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 pl-12 pr-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-nobel-gold/50 transition-all rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20">
        {/* Category Filter */}
        <div className="flex gap-2 mb-12 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all',
                selectedCategory === cat
                  ? 'bg-ui-blue text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {cat === 'all' ? 'All Articles' : cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.slice(0, 12).map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'group p-6 rounded-2xl border transition-all duration-300 cursor-pointer',
                darkMode
                  ? 'bg-slate-800 border-slate-700 hover:border-nobel-gold hover:shadow-lg hover:shadow-nobel-gold/20'
                  : 'bg-white border-slate-200 hover:border-nobel-gold hover:shadow-xl hover:shadow-nobel-gold/10'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-ui-blue/10 rounded-xl group-hover:bg-nobel-gold/10 transition-colors">
                  <Scale size={20} className="text-ui-blue group-hover:text-nobel-gold transition-colors" />
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                  Article {article.id.replace('article-', '')}
                </span>
              </div>

              <h3 className="font-serif text-xl text-ui-blue dark:text-white mb-3 group-hover:text-nobel-gold transition-colors">
                {article.title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                {article.sections[0]?.content.substring(0, 150)}...
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {article.sections.length} sections
                </span>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-nobel-gold group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-16">
          <Button className="bg-ui-blue hover:bg-ui-blue/90 text-white rounded-full px-8">
            View All {constitutionData.length} Articles
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Constitution1Page;
