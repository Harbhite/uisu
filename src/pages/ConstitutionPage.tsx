import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { constitutionData, amendmentsData } from '@/lib/data';
import { Search, Scale, ShieldAlert, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConstitutionSidebar from '@/components/constitution/ConstitutionSidebar';
import ArticleSection from '@/components/constitution/ArticleSection';
import MobileTOCDrawer from '@/components/constitution/MobileTOCDrawer';

const ConstitutionPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState(constitutionData[0]?.id || '');
  const [fontSize, setFontSize] = useState(100);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('constitution-dark') === 'true');
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('constitution-bookmarks') || '[]'); } catch { return []; }
  });

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Persist dark mode
  useEffect(() => { localStorage.setItem('constitution-dark', String(darkMode)); }, [darkMode]);

  // Persist bookmarks
  useEffect(() => { localStorage.setItem('constitution-bookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

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

  // Scroll Spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const article of constitutionData) {
        const element = document.getElementById(article.id);
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveSection(article.id);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  const adjustFontSize = (increment: boolean) => {
    setFontSize(prev => Math.min(Math.max(increment ? prev + 10 : prev - 10, 80), 150));
  };

  return (
    <div className={`min-h-screen selection:bg-nobel-gold selection:text-ui-blue print:bg-white transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 dark' : 'bg-nobel-cream'
    }`}>
      <SEO
        title="The Constitution | UISU SPACE"
        description="The Supreme Constitution of the University of Ibadan Students' Union. Digital Legislative Registry."
        image="/og/pages-screenshot/constitution.png"
      />

      {/* Reading Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-nobel-gold z-50 origin-left print:hidden" style={{ scaleX }} />

      {/* Sidebar */}
      <ConstitutionSidebar
        filteredArticles={filteredArticles}
        allArticles={constitutionData}
        activeSection={activeSection}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onScrollToSection={scrollToSection}
        fontSize={fontSize}
        onAdjustFontSize={adjustFontSize}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        bookmarks={bookmarks}
      />

      {/* Mobile TOC */}
      <MobileTOCDrawer
        articles={constitutionData}
        activeSection={activeSection}
        bookmarks={bookmarks}
        onSelect={scrollToSection}
      />

      {/* Main Content */}
      <main className="xl:pl-72 w-full transition-all duration-300">
        {/* Header */}
        <div className="bg-ui-blue text-white pt-32 pb-20 px-6 md:px-12 lg:px-20 relative overflow-hidden print:pt-10 print:pb-10 print:text-black print:bg-white">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay print:hidden" />
          <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none print:hidden">
            <Scale size={300} strokeWidth={0.5} />
          </div>
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-6 print:hidden">
              <span className="px-3 py-1 bg-nobel-gold text-ui-blue text-[10px] font-bold uppercase tracking-widest rounded-sm">Official Document</span>
              <span className="px-3 py-1 border border-white/20 text-white/60 text-[10px] font-bold uppercase tracking-widest rounded-sm">Public Record</span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-medium mb-6 leading-none">
              The Union <br /> <span className="italic text-nobel-gold print:text-black">Constitution</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-light leading-relaxed print:text-slate-600">
              The supreme law governing the University of Ibadan Students' Union.
              Enacted to promote welfare, foster excellence, and defend student rights.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 md:px-12 lg:px-20 py-16 max-w-5xl mx-auto transition-all duration-300" style={{ fontSize: `${fontSize}%` }}>
          {/* Mobile Search */}
          <div className="xl:hidden mb-12 print:hidden">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search Legislative Articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-ui-blue focus:ring-1 focus:ring-ui-blue transition-all shadow-sm rounded-md font-medium text-ui-blue dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-16">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <ArticleSection
                  key={article.id}
                  article={article}
                  searchQuery={searchQuery}
                  isBookmarked={bookmarks.includes(article.id)}
                  onToggleBookmark={toggleBookmark}
                />
              ))
            ) : (
              <div className="py-20 text-center border border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <ShieldAlert className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                <h3 className="text-lg font-serif text-slate-600 dark:text-slate-400">No Articles Found</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm">Try adjusting your search query.</p>
                <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2 text-ui-blue dark:text-nobel-gold">
                  Clear Search
                </Button>
              </div>
            )}
          </div>

          {/* Amendments Ledger */}
          <section className="mt-32 pt-16 border-t border-slate-200 dark:border-slate-700 print:mt-10 print:pt-10">
            <div className="flex items-center gap-4 mb-8">
              <History className="text-nobel-gold" size={28} />
              <h2 className="font-serif text-3xl text-ui-blue dark:text-white">Amendments Ledger</h2>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden rounded-sm print:border-black">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 print:bg-slate-200 print:text-black">
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Ref ID</div>
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-right">Status</div>
              </div>
              {amendmentsData.map((amendment) => (
                <div key={amendment.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors items-center text-sm print:border-slate-300">
                  <div className="col-span-2 font-mono text-xs text-slate-500 dark:text-slate-400">{amendment.date}</div>
                  <div className="col-span-2 font-mono text-xs text-ui-blue dark:text-nobel-gold font-bold">{amendment.id}</div>
                  <div className="col-span-6 text-slate-700 dark:text-slate-300">
                    <div className="font-bold text-xs mb-1 text-slate-900 dark:text-white">{amendment.articleRef}</div>
                    <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{amendment.description}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className={`inline-flex px-2 py-1 text-[8px] font-bold uppercase tracking-widest border rounded-sm
                      ${amendment.status === 'Ratified' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' : ''}
                      ${amendment.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' : ''}
                      ${amendment.status === 'Rejected' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' : ''}
                    `}>
                      {amendment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-[10px] text-slate-400 text-center font-mono uppercase tracking-widest">
              End of Public Registry • Last Updated: March 2024
            </div>
          </section>
        </div>
      </main>

      {/* Print Footer */}
      <div className="hidden print:block fixed bottom-0 left-0 w-full text-center p-4 border-t border-black text-[10px]">
        UISU SPACE • Official Constitution Document • Printed from uisu.space
      </div>
    </div>
  );
};

export default ConstitutionPage;
