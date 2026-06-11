import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { constitutionData, amendmentsData } from '@/lib/data';
import { Search, Scale, BookOpen, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Constitution2Page: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedArticles, setExpandedArticles] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('constitution2-dark') === 'true');
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('constitution2-bookmarks') || '[]'); } catch { return []; }
  });

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => { localStorage.setItem('constitution2-dark', String(darkMode)); }, [darkMode]);
  useEffect(() => { localStorage.setItem('constitution2-bookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);

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

  const toggleExpanded = (id: string) => {
    setExpandedArticles(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const toggleBookmark = (id: string) => {
    setBookmarks(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 dark' : 'bg-nobel-cream'
    }`}>
      <SEO
        title="Constitution (Timeline Design) | UISU SPACE"
        description="The Constitution of UISU - Elegant Timeline-Based Design"
        image="/og/pages-screenshot/constitution.png"
      />

      {/* Reading Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-nobel-gold z-50 origin-left" style={{ scaleX }} />

      {/* Header */}
      <div className={`relative pt-24 pb-20 px-6 md:px-12 lg:px-20 ${
        darkMode ? 'bg-ui-dark' : 'bg-ui-blue'
      }`}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-nobel-gold/20 rounded-lg">
                <Scale className="text-nobel-gold" size={28} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Constitutional Timeline</span>
                <h1 className="font-serif text-5xl md:text-6xl font-bold text-white">The Constitution</h1>
              </div>
            </div>
            <p className="text-lg text-slate-200 leading-relaxed max-w-2xl">
              Navigate through the constitutional framework in a chronological, elegant timeline format. Discover the structure and amendments that govern the Students' Union.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-10 flex gap-4"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search articles, sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full border pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-nobel-gold transition-all ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-colors ${
                darkMode
                  ? 'bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white'
                  : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-900'
              }`}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Main Timeline Content */}
      <main className="px-6 md:px-12 lg:px-20 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Timeline Header Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-3 gap-4 mb-16"
          >
            <div className={`p-4 rounded-lg border ${
              darkMode
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Total Articles</div>
              <div className="text-3xl font-serif font-bold text-ui-blue dark:text-nobel-gold">{constitutionData.length}</div>
            </div>
            <div className={`p-4 rounded-lg border ${
              darkMode
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Amendments</div>
              <div className="text-3xl font-serif font-bold text-nobel-gold">{amendmentsData.length}</div>
            </div>
            <div className={`p-4 rounded-lg border ${
              darkMode
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Bookmarks</div>
              <div className="text-3xl font-serif font-bold text-nobel-gold">{bookmarks.length}</div>
            </div>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-ui-blue via-nobel-gold to-ui-blue"></div>

            {/* Timeline Items */}
            <div className="space-y-8">
              {filteredArticles.map((article, idx) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="relative pl-24"
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-2 w-16 h-16 flex items-center justify-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all ${
                      expandedArticles.includes(article.id)
                        ? 'bg-nobel-gold border-nobel-gold scale-110'
                        : 'bg-ui-blue border-ui-blue hover:scale-105'
                    }`}>
                      <BookOpen size={20} className="text-white" />
                    </div>
                  </div>

                  {/* Timeline Card */}
                  <div
                    onClick={() => toggleExpanded(article.id)}
                    className={`rounded-lg border-2 transition-all cursor-pointer overflow-hidden ${
                      expandedArticles.includes(article.id)
                        ? darkMode
                          ? 'bg-slate-800 border-nobel-gold shadow-lg shadow-nobel-gold/20'
                          : 'bg-white border-nobel-gold shadow-lg shadow-nobel-gold/10'
                        : darkMode
                          ? 'bg-slate-800 border-slate-700 hover:border-nobel-gold/50'
                          : 'bg-white border-slate-200 hover:border-nobel-gold/50'
                    }`}
                  >
                    {/* Card Header */}
                    <div className={`p-6 border-b ${
                      darkMode
                        ? 'bg-slate-700/50 border-slate-700'
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            Article {article.id.replace('article-', '')}
                          </span>
                          <h3 className="font-serif text-2xl font-bold text-ui-blue dark:text-white mt-2">
                            {article.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(article.id);
                            }}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Bookmark
                              size={20}
                              className={bookmarks.includes(article.id) ? 'fill-nobel-gold text-nobel-gold' : 'text-slate-400'}
                            />
                          </button>
                          <div className="text-slate-400">
                            {expandedArticles.includes(article.id) ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {expandedArticles.includes(article.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-6 space-y-4"
                      >
                        {article.sections.map((section, sIdx) => (
                          <div key={sIdx} className="border-l-4 border-nobel-gold pl-4">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">{section.title}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                              {section.content}
                            </p>
                            {section.subSections && section.subSections.length > 0 && (
                              <ul className="mt-3 space-y-1 ml-4">
                                {section.subSections.map((sub, subIdx) => (
                                  <li key={subIdx} className="text-xs text-slate-500 dark:text-slate-500 list-disc">
                                    {sub}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {filteredArticles.length === 0 && (
            <div className="py-20 text-center">
              <BookOpen className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
              <h3 className="text-lg font-serif text-slate-600 dark:text-slate-400 mb-2">No Articles Found</h3>
              <p className="text-slate-500 dark:text-slate-500 mb-6">Try adjusting your search query.</p>
              <Button onClick={() => setSearchQuery('')} className="bg-ui-blue hover:bg-ui-blue/90 text-white">
                Clear Search
              </Button>
            </div>
          )}

          {/* Amendments Timeline Section */}
          <div className="mt-24 pt-16 border-t border-slate-200 dark:border-slate-700">
            <h2 className="font-serif text-3xl font-bold text-ui-blue dark:text-white mb-12">Amendment Timeline</h2>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-nobel-gold to-nobel-gold"></div>

              {/* Amendment Items */}
              <div className="space-y-6">
                {amendmentsData.slice(0, 8).map((amendment, idx) => (
                  <motion.div
                    key={amendment.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="relative pl-24"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-2 top-2 w-12 h-12 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-nobel-gold border-4 border-white dark:border-slate-950"></div>
                    </div>

                    {/* Amendment Card */}
                    <div className={`p-4 rounded-lg border ${
                      darkMode
                        ? 'bg-slate-800 border-slate-700'
                        : 'bg-white border-slate-200'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{amendment.date}</span>
                          <span className="ml-3 text-xs font-mono text-ui-blue dark:text-nobel-gold font-bold">{amendment.id}</span>
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold uppercase rounded-sm ${
                          amendment.status === 'Ratified' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          amendment.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {amendment.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{amendment.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Constitution2Page;
