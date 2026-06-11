import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { constitutionData, amendmentsData } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Lightbulb, GitBranch, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Constitution4Page: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('constitution4-dark') === 'true');
  const [selectedArticle, setSelectedArticle] = useState(constitutionData[0]?.id || '');

  const categories = {
    governance: constitutionData.filter((_, i) => i < 5),
    rights: constitutionData.filter((_, i) => i >= 5 && i < 10),
    procedures: constitutionData.filter((_, i) => i >= 10 && i < 15),
    committees: constitutionData.filter((_, i) => i >= 15),
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      <SEO
        title="Constitution (Tabbed View) | UISU SPACE"
        description="Organized tabbed view of the University of Ibadan Students' Union Constitution by category."
      />

      {/* Header */}
      <div className={`pt-32 pb-20 px-6 md:px-12 lg:px-20 relative overflow-hidden ${
        darkMode ? 'bg-slate-900' : 'bg-gradient-to-r from-ui-blue via-ui-dark to-ui-blue'
      } text-white`}>
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1200 600">
            <defs>
              <pattern id="dots" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                <circle cx="25" cy="25" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="1200" height="600" fill="url(#dots)" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-nobel-gold/20 rounded-full backdrop-blur-sm">
              <BookOpen size={24} className="text-nobel-gold" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-nobel-gold">Organized by Category</span>
          </div>

          <h1 className="font-serif text-6xl md:text-7xl mb-6 leading-tight">
            Constitution <span className="text-nobel-gold">Explorer</span>
          </h1>

          <p className="text-lg text-slate-200 max-w-2xl">
            Navigate the constitution organized by key categories. Compare articles, track amendments, and understand the legal framework.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20">
        <Tabs defaultValue="governance" className="w-full">
          <TabsList className={cn(
            'grid w-full grid-cols-4 mb-12 p-1 rounded-xl',
            darkMode ? 'bg-slate-800' : 'bg-slate-200'
          )}>
            <TabsTrigger value="governance" className="flex items-center gap-2">
              <BarChart3 size={16} />
              <span className="hidden sm:inline">Governance</span>
            </TabsTrigger>
            <TabsTrigger value="rights" className="flex items-center gap-2">
              <Lightbulb size={16} />
              <span className="hidden sm:inline">Rights</span>
            </TabsTrigger>
            <TabsTrigger value="procedures" className="flex items-center gap-2">
              <GitBranch size={16} />
              <span className="hidden sm:inline">Procedures</span>
            </TabsTrigger>
            <TabsTrigger value="committees" className="flex items-center gap-2">
              <BookOpen size={16} />
              <span className="hidden sm:inline">Committees</span>
            </TabsTrigger>
          </TabsList>

          {/* Governance Tab */}
          <TabsContent value="governance" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {categories.governance.map((article) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'p-6 rounded-xl border-2 cursor-pointer transition-all',
                    selectedArticle === article.id
                      ? darkMode
                        ? 'border-nobel-gold bg-slate-800 shadow-lg shadow-nobel-gold/20'
                        : 'border-nobel-gold bg-white shadow-lg shadow-nobel-gold/20'
                      : darkMode
                      ? 'border-slate-700 bg-slate-800 hover:border-nobel-gold/50'
                      : 'border-slate-200 bg-white hover:border-nobel-gold/50'
                  )}
                  onClick={() => setSelectedArticle(article.id)}
                >
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    Article {article.id.replace('article-', '')}\n                  </span>\n                  <h3 className=\"font-serif text-lg text-ui-blue dark:text-nobel-gold mt-2\">\n                    {article.title}\n                  </h3>\n                  <p className=\"text-sm text-slate-600 dark:text-slate-400 mt-3 line-clamp-2\">\n                    {article.sections[0]?.content.substring(0, 100)}...\n                  </p>\n                </motion.div>\n              ))}\n            </div>\n          </TabsContent>\n\n          {/* Rights Tab */}\n          <TabsContent value=\"rights\" className=\"space-y-6\">\n            <div className=\"grid md:grid-cols-2 gap-6\">\n              {categories.rights.map((article) => (\n                <motion.div\n                  key={article.id}\n                  initial={{ opacity: 0, y: 10 }}\n                  animate={{ opacity: 1, y: 0 }}\n                  className={cn(\n                    'p-6 rounded-xl border-2 cursor-pointer transition-all',\n                    selectedArticle === article.id\n                      ? darkMode\n                        ? 'border-nobel-gold bg-slate-800 shadow-lg shadow-nobel-gold/20'\n                        : 'border-nobel-gold bg-white shadow-lg shadow-nobel-gold/20'\n                      : darkMode\n                      ? 'border-slate-700 bg-slate-800 hover:border-nobel-gold/50'\n                      : 'border-slate-200 bg-white hover:border-nobel-gold/50'\n                  )}\n                  onClick={() => setSelectedArticle(article.id)}\n                >\n                  <span className=\"text-[9px] font-bold uppercase tracking-widest text-slate-400\">\n                    Article {article.id.replace('article-', '')}\n                  </span>\n                  <h3 className=\"font-serif text-lg text-ui-blue dark:text-nobel-gold mt-2\">\n                    {article.title}\n                  </h3>\n                  <p className=\"text-sm text-slate-600 dark:text-slate-400 mt-3 line-clamp-2\">\n                    {article.sections[0]?.content.substring(0, 100)}...\n                  </p>\n                </motion.div>\n              ))}\n            </div>\n          </TabsContent>\n\n          {/* Procedures Tab */}\n          <TabsContent value=\"procedures\" className=\"space-y-6\">\n            <div className=\"grid md:grid-cols-2 gap-6\">\n              {categories.procedures.map((article) => (\n                <motion.div\n                  key={article.id}\n                  initial={{ opacity: 0, y: 10 }}\n                  animate={{ opacity: 1, y: 0 }}\n                  className={cn(\n                    'p-6 rounded-xl border-2 cursor-pointer transition-all',\n                    selectedArticle === article.id\n                      ? darkMode\n                        ? 'border-nobel-gold bg-slate-800 shadow-lg shadow-nobel-gold/20'\n                        : 'border-nobel-gold bg-white shadow-lg shadow-nobel-gold/20'\n                      : darkMode\n                      ? 'border-slate-700 bg-slate-800 hover:border-nobel-gold/50'\n                      : 'border-slate-200 bg-white hover:border-nobel-gold/50'\n                  )}\n                  onClick={() => setSelectedArticle(article.id)}\n                >\n                  <span className=\"text-[9px] font-bold uppercase tracking-widest text-slate-400\">\n                    Article {article.id.replace('article-', '')}\n                  </span>\n                  <h3 className=\"font-serif text-lg text-ui-blue dark:text-nobel-gold mt-2\">\n                    {article.title}\n                  </h3>\n                  <p className=\"text-sm text-slate-600 dark:text-slate-400 mt-3 line-clamp-2\">\n                    {article.sections[0]?.content.substring(0, 100)}...\n                  </p>\n                </motion.div>\n              ))}\n            </div>\n          </TabsContent>\n\n          {/* Committees Tab */}\n          <TabsContent value=\"committees\" className=\"space-y-6\">\n            <div className=\"grid md:grid-cols-2 gap-6\">\n              {categories.committees.map((article) => (\n                <motion.div\n                  key={article.id}\n                  initial={{ opacity: 0, y: 10 }}\n                  animate={{ opacity: 1, y: 0 }}\n                  className={cn(\n                    'p-6 rounded-xl border-2 cursor-pointer transition-all',\n                    selectedArticle === article.id\n                      ? darkMode\n                        ? 'border-nobel-gold bg-slate-800 shadow-lg shadow-nobel-gold/20'\n                        : 'border-nobel-gold bg-white shadow-lg shadow-nobel-gold/20'\n                      : darkMode\n                      ? 'border-slate-700 bg-slate-800 hover:border-nobel-gold/50'\n                      : 'border-slate-200 bg-white hover:border-nobel-gold/50'\n                  )}\n                  onClick={() => setSelectedArticle(article.id)}\n                >\n                  <span className=\"text-[9px] font-bold uppercase tracking-widest text-slate-400\">\n                    Article {article.id.replace('article-', '')}\n                  </span>\n                  <h3 className=\"font-serif text-lg text-ui-blue dark:text-nobel-gold mt-2\">\n                    {article.title}\n                  </h3>\n                  <p className=\"text-sm text-slate-600 dark:text-slate-400 mt-3 line-clamp-2\">\n                    {article.sections[0]?.content.substring(0, 100)}...\n                  </p>\n                </motion.div>\n              ))}\n            </div>\n          </TabsContent>\n        </Tabs>\n\n        {/* Selected Article Detail */}\n        <AnimatePresence>\n          {selectedArticle && (\n            <motion.div\n              initial={{ opacity: 0, y: 20 }}\n              animate={{ opacity: 1, y: 0 }}\n              exit={{ opacity: 0, y: 20 }}\n              className={cn(\n                'mt-16 p-8 rounded-2xl border-2',\n                darkMode\n                  ? 'bg-slate-800 border-slate-700'\n                  : 'bg-white border-slate-200'\n              )}\n            >\n              {constitutionData.find(a => a.id === selectedArticle) && (\n                <div>\n                  <span className=\"text-[10px] font-bold uppercase tracking-widest text-slate-400\">\n                    Article {selectedArticle.replace('article-', '')}\n                  </span>\n                  <h2 className=\"font-serif text-3xl text-ui-blue dark:text-nobel-gold mt-3 mb-6\">\n                    {constitutionData.find(a => a.id === selectedArticle)?.title}\n                  </h2>\n                  <div className=\"space-y-4\">\n                    {constitutionData.find(a => a.id === selectedArticle)?.sections.map((section, idx) => (\n                      <div key={idx} className=\"text-slate-700 dark:text-slate-300 leading-relaxed\">\n                        <p className=\"font-bold text-ui-blue dark:text-nobel-gold mb-2\">Section {idx + 1}</p>\n                        <p>{section.content}</p>\n                      </div>\n                    ))}\n                  </div>\n                </div>\n              )}\n            </motion.div>\n          )}\n        </AnimatePresence>\n      </div>\n    </div>\n  );\n};\n\nexport default Constitution4Page;\n
