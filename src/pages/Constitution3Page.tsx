import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { constitutionData, amendmentsData } from '@/lib/data';
import { Search, Scale, ChevronDown, BookOpen, Zap, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Constitution3Page: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedArticles, setExpandedArticles] = useState<string[]>([constitutionData[0]?.id || '']);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('constitution3-dark') === 'true');

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => { localStorage.setItem('constitution3-dark', String(darkMode)); }, [darkMode]);

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

  const expandAll = () => {
    setExpandedArticles(filteredArticles.map(a => a.id));
  };

  const collapseAll = () => {
    setExpandedArticles([]);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 dark' : 'bg-nobel-cream'
    }`}>
      <SEO
        title="Constitution (Accordion Design) | UISU SPACE"
        description="The Constitution of UISU - Interactive Accordion-Based Design"
        image="/og/pages-screenshot/constitution.png"
      />

      {/* Reading Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-nobel-gold z-50 origin-left" style={{ scaleX }} />

      {/* Header */}
      <div className={`relative pt-20 pb-16 px-6 md:px-12 lg:px-20 border-b ${
        darkMode
          ? 'bg-ui-dark border-slate-800'
          : 'bg-ui-blue border-slate-200'
      }`}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-nobel-gold/20 rounded-lg">
                <Zap className="text-nobel-gold" size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Interactive Format</span>
                <h1 className="font-serif text-5xl md:text-6xl font-bold text-white">The Constitution</h1>
              </div>
            </div>
            <p className="text-lg text-slate-200 leading-relaxed max-w-3xl">
              Explore the constitution through an interactive accordion interface. Expand and collapse sections to focus on what matters to you.
            </p>
          </motion.div>

          {/* Controls */}
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
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full border pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-nobel-gold transition-all ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-4 py-3 bg-nobel-gold hover:bg-nobel-gold/90 text-ui-blue rounded-lg font-medium text-sm transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                  darkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200'
                }`}
              >
                Collapse All
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                  darkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200'
                }`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-6 md:px-12 lg:px-20 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`mb-12 p-6 rounded-lg border ${
              darkMode
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-2">Document Overview</span>
                <p className="text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-ui-blue dark:text-nobel-gold">{filteredArticles.length}</span> articles • 
                  <span className="font-bold text-ui-blue dark:text-nobel-gold ml-2">{amendmentsData.length}</span> amendments
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-2">Expanded</span>
                <p className="text-2xl font-bold text-nobel-gold">{expandedArticles.length}</p>
              </div>
            </div>
          </motion.div>

          {/* Accordion Items */}
          <div className="space-y-3">
            {filteredArticles.map((article, idx) => {
              const isExpanded = expandedArticles.includes(article.id);
              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.02 }}
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleExpanded(article.id)}
                    className={`w-full text-left p-5 rounded-lg border-2 transition-all duration-300 ${
                      isExpanded
                        ? darkMode
                          ? 'bg-slate-800 border-nobel-gold shadow-lg shadow-nobel-gold/20'
                          : 'bg-white border-nobel-gold shadow-lg shadow-nobel-gold/10'
                        : darkMode
                          ? 'bg-slate-800 border-slate-700 hover:border-nobel-gold/50'
                          : 'bg-white border-slate-200 hover:border-nobel-gold/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            Article {article.id.replace('article-', '')}
                          </span>
                          <span className="text-[10px] font-mono text-ui-blue dark:text-nobel-gold bg-ui-blue/10 dark:bg-nobel-gold/10 px-2 py-1 rounded">
                            {article.sections.length} sections
                          </span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-ui-blue dark:text-white">
                          {article.title}
                        </h3>
                        {!isExpanded && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-1">
                            {article.sections[0]?.content}
                          </p>
                        )}
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-4 flex-shrink-0"
                      >
                        <ChevronDown size={24} className="text-nobel-gold" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Accordion Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`overflow-hidden rounded-lg border-2 border-t-0 border-nobel-gold ${
                          darkMode ? 'bg-slate-900' : 'bg-slate-50'
                        }`}
                      >
                        <div className="p-6 space-y-6">
                          {article.sections.map((section, sIdx) => (
                            <motion.div
                              key={sIdx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: sIdx * 0.05 }}
                              className="border-l-4 border-nobel-gold pl-6"
                            >
                              <h4 className="font-bold text-lg text-ui-blue dark:text-white mb-3">
                                {section.title}
                              </h4>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                                {section.content}
                              </p>
                              {section.subSections && section.subSections.length > 0 && (
                                <div className={`rounded-lg p-4 space-y-2 ${
                                  darkMode
                                    ? 'bg-slate-800'
                                    : 'bg-white'
                                }`}>
                                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
                                    Sub-sections
                                  </p>
                                  {section.subSections.map((sub, subIdx) => (
                                    <div key={subIdx} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                                      <span className="font-bold text-nobel-gold flex-shrink-0">•</span>
                                      <span>{sub}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          ))}

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-4 border-t border-slate-300 dark:border-slate-700">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-nobel-gold/10 hover:bg-nobel-gold/20 text-nobel-gold text-sm font-medium transition-colors">
                              <Copy size={16} /> Copy
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white text-sm font-medium transition-colors">
                              <Share2 size={16} /> Share
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
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

          {/* Amendments Section */}
          <div className="mt-24 pt-16 border-t border-slate-200 dark:border-slate-700">
            <h2 className="font-serif text-3xl font-bold text-ui-blue dark:text-white mb-8">Amendment Log</h2>
            <div className="space-y-2">
              {amendmentsData.slice(0, 10).map((amendment, idx) => (
                <motion.div
                  key={amendment.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`p-4 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 hover:border-nobel-gold/50'
                      : 'bg-white border-slate-200 hover:border-nobel-gold/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{amendment.date}</span>
                        <span className="text-xs font-mono text-ui-blue dark:text-nobel-gold font-bold">{amendment.id}</span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{amendment.description}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold uppercase rounded whitespace-nowrap ml-4 ${
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

export default Constitution3Page;
