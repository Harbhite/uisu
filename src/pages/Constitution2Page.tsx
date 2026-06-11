import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { constitutionData } from '@/lib/data';
import { ChevronDown, ChevronUp, Lightbulb, BookMarked } from 'lucide-react';
import { cn } from '@/lib/utils';

const Constitution2Page: React.FC = () => {
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set([constitutionData[0]?.id]));
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('constitution2-dark') === 'true');

  const toggleArticle = (id: string) => {
    const newExpanded = new Set(expandedArticles);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedArticles(newExpanded);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-slate-950' : 'bg-slate-50'
    }`}>
      <SEO
        title="Constitution (Interactive Timeline) | UISU SPACE"
        description="Interactive timeline view of the University of Ibadan Students' Union Constitution."
      />

      {/* Header */}
      <div className={`pt-32 pb-20 px-6 md:px-12 lg:px-20 relative overflow-hidden ${
        darkMode ? 'bg-slate-900' : 'bg-gradient-to-r from-ui-blue to-ui-dark'
      } text-white`}>
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
            backgroundSize: '200% 200%',
          }} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-nobel-gold/20 rounded-full backdrop-blur-sm">
            <Lightbulb size={16} className="text-nobel-gold" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-nobel-gold">Interactive Exploration</span>
          </div>

          <h1 className="font-serif text-6xl md:text-7xl mb-6 leading-tight">
            Constitutional <span className="text-nobel-gold">Journey</span>
          </h1>

          <p className="text-lg text-slate-200 max-w-2xl">
            Navigate through the constitution in a flowing, interconnected timeline. Click any article to explore its sections and provisions.
          </p>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-20">
        {/* Vertical Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-ui-blue via-nobel-gold to-ui-blue opacity-30" />

          {/* Timeline Items */}
          <div className="space-y-6">
            {constitutionData.map((article, index) => {
              const isExpanded = expandedArticles.has(article.id);
              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-24"
                >
                  {/* Timeline Dot */}
                  <div className={cn(
                    'absolute left-0 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300',
                    isExpanded
                      ? 'bg-nobel-gold text-ui-blue shadow-lg shadow-nobel-gold/50'
                      : darkMode
                      ? 'bg-slate-800 text-nobel-gold border-2 border-slate-700'
                      : 'bg-white text-ui-blue border-2 border-slate-200'
                  )}>
                    <span className="font-bold text-sm">{index + 1}</span>
                  </div>

                  {/* Content Card */}
                  <button
                    onClick={() => toggleArticle(article.id)}
                    className={cn(
                      'w-full text-left p-6 rounded-2xl transition-all duration-300 group',
                      isExpanded
                        ? darkMode
                          ? 'bg-slate-800 border-2 border-nobel-gold shadow-lg'
                          : 'bg-white border-2 border-nobel-gold shadow-xl'
                        : darkMode
                        ? 'bg-slate-800 border border-slate-700 hover:border-nobel-gold/50'
                        : 'bg-white border border-slate-200 hover:border-nobel-gold/50'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Article {article.id.replace('article-', '')}</span>
                        <h3 className="font-serif text-2xl text-ui-blue dark:text-white mt-1 group-hover:text-nobel-gold transition-colors">
                          {article.title}
                        </h3>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="text-nobel-gold" size={24} />
                      </motion.div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4"
                      >
                        {article.sections.map((section, sIdx) => (
                          <div key={sIdx} className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            <span className="font-bold text-ui-blue dark:text-nobel-gold block mb-2">Section {sIdx + 1}</span>
                            <p className="line-clamp-3">{section.content}</p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={cn(
            'mt-20 p-8 rounded-2xl text-center',
            darkMode ? 'bg-slate-800' : 'bg-slate-100'
          )}
        >
          <BookMarked className="mx-auto text-nobel-gold mb-4" size={32} />
          <h3 className="font-serif text-2xl text-ui-blue dark:text-white mb-2">Complete Overview</h3>
          <p className="text-slate-600 dark:text-slate-400">
            You've explored {expandedArticles.size} of {constitutionData.length} articles. Click to expand and learn more.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Constitution2Page;
