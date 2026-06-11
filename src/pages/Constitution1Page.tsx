import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { constitutionData, amendmentsData } from '@/lib/data';
import { Search, Scale, ChevronRight, BookOpen, Zap, Filter, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Constitution1Page: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState(constitutionData[0]?.id || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('constitution1-dark') === 'true');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('constitution1-favorites') || '[]'); } catch { return []; }
  });

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => { localStorage.setItem('constitution1-dark', String(darkMode)); }, [darkMode]);
  useEffect(() => { localStorage.setItem('constitution1-favorites', JSON.stringify(favorites)); }, [favorites]);

  const filteredArticles = constitutionData.filter(article => {
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.sections.some(section =>
        section.content.toLowerCase().includes(query) ||
        section.subSections?.some(sub => sub.toLowerCase().includes(query))
      )
    );
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const categories = [
    { id: 'all', label: 'All Articles', count: constitutionData.length },
    { id: 'governance', label: 'Governance', count: Math.ceil(constitutionData.length / 3) },
    { id: 'rights', label: 'Rights & Duties', count: Math.ceil(constitutionData.length / 3) },
    { id: 'procedures', label: 'Procedures', count: Math.ceil(constitutionData.length / 3) },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark' : 'bg-gradient-to-br from-slate-50 via-white to-slate-50'
    }`}>
      <SEO
        title="Constitution (Modern Design) | UISU SPACE"
        description="The Constitution of UISU - Modern Card-Based Design"
        image="/og/pages-screenshot/constitution.png"
      />

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-nobel-gold/10 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-ui-blue/10 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Reading Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-nobel-gold to-ui-blue z-50 origin-left" style={{ scaleX }} />

      {/* Header */}
      <div className="relative pt-20 pb-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-nobel-gold/20 rounded-lg">
                <Scale className="text-nobel-gold" size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Official Document</span>
                <h1 className="font-serif text-5xl md:text-6xl font-bold text-ui-blue dark:text-white">The Constitution</h1>
              </div>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Explore the supreme law of the University of Ibadan Students' Union through an intuitive, modern interface.
            </p>
          </motion.div>

          {/* Search & Filter Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-10 flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search articles, sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-nobel-gold transition-all shadow-sm"
              />
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 px-6 md:px-12 lg:px-20 py-4">
        <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all',
                selectedCategory === cat.id
                  ? 'bg-nobel-gold text-ui-blue shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {cat.label} <span className="ml-2 text-xs opacity-70">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="px-6 md:px-12 lg:px-20 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            <div className="p-6 bg-gradient-to-br from-ui-blue/10 to-ui-blue/5 border border-ui-blue/20 rounded-2xl">
              <div className="text-sm font-bold uppercase tracking-widest text-ui-blue dark:text-nobel-gold mb-2">Total Articles</div>
              <div className="text-4xl font-serif font-bold text-ui-blue dark:text-white">{constitutionData.length}</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-nobel-gold/10 to-nobel-gold/5 border border-nobel-gold/20 rounded-2xl">
              <div className="text-sm font-bold uppercase tracking-widest text-nobel-gold mb-2">Amendments</div>
              <div className="text-4xl font-serif font-bold text-nobel-gold">{amendmentsData.length}</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-2xl">
              <div className="text-sm font-bold uppercase tracking-widest text-green-600 dark:text-green-400 mb-2">Your Favorites</div>
              <div className="text-4xl font-serif font-bold text-green-600 dark:text-green-400">{favorites.length}</div>
            </div>
          </motion.div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-xl hover:border-nobel-gold/50 transition-all duration-300 cursor-pointer"
              >
                {/* Card Header */}
                <div className="p-6 bg-gradient-to-r from-ui-blue/5 to-nobel-gold/5 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Article {article.id.replace('article-', '')}</div>
                      <h3 className="font-serif text-lg font-bold text-ui-blue dark:text-white group-hover:text-nobel-gold transition-colors">
                        {article.title}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(article.id);
                      }}
                      className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    >
                      <Star
                        size={20}
                        className={favorites.includes(article.id) ? 'fill-nobel-gold text-nobel-gold' : 'text-slate-400'}
                      />
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                    {article.sections[0]?.content || 'No description available'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <BookOpen size={14} />
                    <span>{article.sections.length} sections</span>
                  </div>
                  <Button className="w-full bg-ui-blue hover:bg-ui-blue/90 text-white gap-2 group/btn">
                    <Eye size={14} /> Read Article
                    <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredArticles.length === 0 && (
            <div className="py-20 text-center">
              <BookOpen className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
              <h3 className="text-lg font-serif text-slate-600 dark:text-slate-400 mb-2">No Articles Found</h3>
              <p className="text-slate-500 dark:text-slate-500 mb-6">Try adjusting your search or filters.</p>
              <Button onClick={() => setSearchQuery('')} className="bg-ui-blue hover:bg-ui-blue/90 text-white">
                Clear Search
              </Button>
            </div>
          )}

          {/* Amendments Section */}
          <div className="mt-24 pt-16 border-t border-slate-200 dark:border-slate-700">
            <h2 className="font-serif text-3xl font-bold text-ui-blue dark:text-white mb-8">Amendment History</h2>
            <div className="space-y-3">
              {amendmentsData.slice(0, 5).map((amendment) => (
                <motion.div
                  key={amendment.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-nobel-gold/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{amendment.date}</span>
                        <span className="text-xs font-mono text-ui-blue dark:text-nobel-gold font-bold">{amendment.id}</span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{amendment.description}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold uppercase rounded-lg whitespace-nowrap ml-4 ${
                      amendment.status === 'Ratified' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      amendment.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {amendment.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Constitution1Page;
