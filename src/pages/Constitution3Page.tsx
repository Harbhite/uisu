import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { constitutionData } from '@/lib/data';
import { FileText, Maximize2, Moon, Sun } from 'lucide-react';

const Constitution3Page: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('constitution3-dark') === 'true');
  const [fontSize, setFontSize] = useState(100);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
    }`}>
      <SEO
        title="Constitution (Minimalist) | UISU SPACE"
        description="Clean, minimalist view of the University of Ibadan Students' Union Constitution."
      />

      {/* Floating Toolbar */}
      <div className="fixed top-6 right-6 z-40 flex gap-2 p-4 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          title="Toggle dark mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="w-px bg-slate-200 dark:bg-slate-700" />
        <button
          onClick={() => setFontSize(Math.max(80, fontSize - 10))}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-sm font-bold"
          title="Decrease font size"
        >
          A−
        </button>
        <button
          onClick={() => setFontSize(Math.min(150, fontSize + 10))}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-sm font-bold"
          title="Increase font size"
        >
          A+
        </button>
      </div>

      {/* Minimal Header */}
      <header className="pt-20 pb-12 px-6 md:px-12 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-ui-blue" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Official Document
            </span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl mb-4 leading-tight">
            The Constitution
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            The supreme law of the University of Ibadan Students' Union, governing all matters affecting student welfare and union operations.
          </p>
        </div>
      </header>

      {/* Main Content - Clean Reading Experience */}
      <main className="max-w-3xl mx-auto px-6 md:px-12 py-20" style={{ fontSize: `${fontSize}%` }}>
        <div className="space-y-20">
          {constitutionData.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="scroll-mt-20"
              id={article.id}
            >
              {/* Article Header */}
              <div className="mb-8 pb-6 border-b-2 border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Article {article.id.replace('article-', '')}
                </span>
                <h2 className="font-serif text-4xl mt-2 text-ui-blue dark:text-nobel-gold leading-tight">
                  {article.title}
                </h2>
              </div>

              {/* Sections */}
              <div className="space-y-8">
                {article.sections.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-3">
                    {section.subSections && section.subSections.length > 0 && (
                      <div className="space-y-2">
                        {section.subSections.map((subsection, subIdx) => (
                          <div key={subIdx} className="pl-4 border-l-4 border-slate-300 dark:border-slate-700">
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                              {subsection}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Article Divider */}
              {index < constitutionData.length - 1 && (
                <div className="mt-12 pt-12 border-t-2 border-slate-200 dark:border-slate-800 flex justify-center">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    ))}
                  </div>
                </div>
              )}
            </motion.article>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-600">
            End of Constitution • Last Updated March 2024
          </p>
        </div>
      </main>
    </div>
  );
};

export default Constitution3Page;
