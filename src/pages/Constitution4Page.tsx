import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { constitutionData, amendmentsData } from '@/lib/data';
import { Search, Scale, BookOpen, Columns3, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Constitution4Page: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('constitution4-dark') === 'true');
  const [columnCount, setColumnCount] = useState<2 | 3>(2);
  const [selectedArticles, setSelectedArticles] = useState<string[]>(
    constitutionData.slice(0, 2).map(a => a.id)
  );

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => { localStorage.setItem('constitution4-dark', String(darkMode)); }, [darkMode]);

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

  const toggleArticleSelection = (id: string) => {
    setSelectedArticles(prev =>
      prev.includes(id)
        ? prev.filter(a => a !== id)
        : [...prev, id].slice(-columnCount)
    );
  };

  const displayedArticles = filteredArticles.filter(a => selectedArticles.includes(a.id));

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 dark' : 'bg-nobel-cream'
    }`}>
      <SEO
        title="Constitution (Multi-Column Design) | UISU SPACE"
        description="The Constitution of UISU - Multi-Column Comparison View"
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
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-nobel-gold/20 rounded-lg">
                <Columns3 className="text-nobel-gold" size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Multi-Column View</span>
                <h1 className="font-serif text-5xl md:text-6xl font-bold text-white">The Constitution</h1>
              </div>
            </div>
            <p className="text-lg text-slate-200 leading-relaxed max-w-3xl">
              Compare multiple articles side-by-side in a powerful multi-column layout. Select articles to analyze and compare their provisions.
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
                placeholder="Search articles to add to comparison..."
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
                onClick={() => setColumnCount(2)}
                className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                  columnCount === 2
                    ? 'bg-nobel-gold text-ui-blue'
                    : darkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200'
                }`}
              >
                2 Cols
              </button>
              <button
                onClick={() => setColumnCount(3)}
                className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                  columnCount === 3
                    ? 'bg-nobel-gold text-ui-blue'
                    : darkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200'
                }`}
              >
                3 Cols
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
        <div className="max-w-7xl mx-auto">
          {/* Article Selector */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl font-bold text-ui-blue dark:text-white">
                Select Articles to Compare
              </h2>
              <span className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {selectedArticles.length} / {columnCount} selected
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredArticles.slice(0, 12).map(article => (
                <motion.button
                  key={article.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleArticleSelection(article.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedArticles.includes(article.id)
                      ? 'border-nobel-gold bg-nobel-gold/10'
                      : darkMode
                        ? 'border-slate-700 bg-slate-800 hover:border-nobel-gold/50'
                        : 'border-slate-200 bg-white hover:border-nobel-gold/50'
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
                    Article {article.id.replace('article-', '')}
                  </div>
                  <div className="text-sm font-bold text-ui-blue dark:text-white line-clamp-2">
                    {article.title}
                  </div>
                  {selectedArticles.includes(article.id) && (
                    <div className="mt-2 text-xs font-bold text-nobel-gold">
                      ✓ Selected
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Comparison Grid */}
          {selectedArticles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={`grid gap-6 mb-16 ${
                columnCount === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'
              }`}
            >
              {displayedArticles.map((article, colIdx) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: colIdx * 0.1 }}
                  className={`rounded-lg border-2 overflow-hidden ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  {/* Column Header */}
                  <div className={`p-6 border-b-2 border-nobel-gold/20 ${
                    darkMode
                      ? 'bg-slate-700/50'
                      : 'bg-slate-50'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          Article {article.id.replace('article-', '')}
                        </span>
                        <h3 className="font-serif text-xl font-bold text-ui-blue dark:text-white mt-2">
                          {article.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => toggleArticleSelection(article.id)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Eye size={18} className="text-nobel-gold" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {article.sections.length} sections
                    </p>
                  </div>

                  {/* Column Content */}
                  <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                    {article.sections.map((section, sIdx) => (
                      <motion.div
                        key={sIdx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: sIdx * 0.05 }}
                        className="border-l-4 border-nobel-gold pl-4"
                      >
                        <h4 className="font-bold text-sm text-ui-blue dark:text-white mb-2">
                          {section.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4">
                          {section.content}
                        </p>
                        {section.subSections && section.subSections.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {section.subSections.slice(0, 3).map((sub, subIdx) => (
                              <div key={subIdx} className="text-xs text-slate-500 dark:text-slate-500 flex gap-2">
                                <span className="flex-shrink-0">•</span>
                                <span className="line-clamp-1">{sub}</span>
                              </div>
                            ))}
                            {section.subSections.length > 3 && (
                              <p className="text-xs text-nobel-gold font-medium">
                                +{section.subSections.length - 3} more
                              </p>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Column Footer */}
                  <div className={`p-4 border-t-2 border-slate-700 flex gap-2 ${
                    darkMode
                      ? 'bg-slate-900/50'
                      : 'bg-slate-50'
                  }`}>
                    <button className="flex-1 px-3 py-2 rounded-lg bg-nobel-gold/10 hover:bg-nobel-gold/20 text-nobel-gold text-xs font-bold uppercase transition-colors">
                      <Download size={14} className="inline mr-1" /> Export
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {selectedArticles.length === 0 && (
            <div className="py-20 text-center">
              <Columns3 className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
              <h3 className="text-lg font-serif text-slate-600 dark:text-slate-400 mb-2">Select Articles to Compare</h3>
              <p className="text-slate-500 dark:text-slate-500 mb-6">Choose up to {columnCount} articles from the selector above.</p>
            </div>
          )}

          {/* Amendments Overview */}
          <div className="mt-24 pt-16 border-t border-slate-200 dark:border-slate-700">
            <h2 className="font-serif text-3xl font-bold text-ui-blue dark:text-white mb-8">Amendment Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {amendmentsData.slice(0, 6).map((amendment) => (
                <motion.div
                  key={amendment.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-lg border ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      {amendment.date}
                    </span>
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${
                      amendment.status === 'Ratified' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      amendment.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {amendment.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-ui-blue dark:text-white mb-2">{amendment.id}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {amendment.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Constitution4Page;
