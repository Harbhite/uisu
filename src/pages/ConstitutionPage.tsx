import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { constitutionData, amendmentsData } from '@/lib/data';
import { Search, Scale, ShieldAlert, History, Download, Share2, Printer, Bookmark, Zap, Copy, FileText, TrendingUp } from 'lucide-react';
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
  const [showComparison, setShowComparison] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [citationFormat, setCitationFormat] = useState<'APA' | 'MLA' | 'Chicago'>('APA');

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

  // NEW FEATURE 1: Article Comparison Tool
  const toggleArticleSelection = (id: string) => {
    setSelectedArticles(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  // NEW FEATURE 4: Citation Generator
  const generateCitation = (articleId: string) => {
    const article = constitutionData.find(a => a.id === articleId);
    if (!article) return '';
    
    const baseUrl = 'https://uisu.space/constitution';
    const citations = {
      APA: `UISU. (2024). ${article.title}. In The Union Constitution. Retrieved from ${baseUrl}#${articleId}`,
      MLA: `"${article.title}." The Union Constitution, UISU, 2024, ${baseUrl}#${articleId}.`,
      Chicago: `UISU. "${article.title}." The Union Constitution. Accessed 2024. ${baseUrl}#${articleId}.`
    };
    return citations[citationFormat];
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

            {/* Feature Action Bar */}
            <div className="flex flex-wrap gap-4 mt-8 print:hidden">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2 backdrop-blur-sm">
                <Download size={16} /> Download PDF
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2 backdrop-blur-sm">
                <Share2 size={16} /> Share
              </Button>
              <Button variant="outline" onClick={() => window.print()} className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2 backdrop-blur-sm">
                <Printer size={16} /> Print
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2 backdrop-blur-sm">
                <Bookmark size={16} /> Bookmarks ({bookmarks.length})
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 md:px-12 lg:px-20 py-16 max-w-5xl mx-auto transition-all duration-300" style={{ fontSize: `${fontSize}%` }}>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 print:hidden">
            <div className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Articles</div>
              <div className="text-2xl font-serif text-ui-blue dark:text-nobel-gold">{constitutionData.length}</div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Amendments</div>
              <div className="text-2xl font-serif text-ui-blue dark:text-nobel-gold">{amendmentsData.length}</div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Last Update</div>
              <div className="text-2xl font-serif text-ui-blue dark:text-nobel-gold">2024</div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</div>
              <div className="text-2xl font-serif text-green-600 dark:text-green-400">Active</div>
            </div>
          </div>

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

          {/* Legislative Highlights */}
          <div className="mb-16 p-8 bg-ui-blue/5 dark:bg-nobel-gold/5 border border-ui-blue/10 dark:border-nobel-gold/10 rounded-2xl print:hidden">
            <h3 className="font-serif text-xl text-ui-blue dark:text-nobel-gold mb-4 flex items-center gap-2">
              <Zap size={18} /> Legislative Highlights
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-bold text-ui-blue dark:text-white block mb-1">Supremacy of the Constitution</span>
                This constitution is supreme and its provisions shall have binding force on all members of the Students' Union.
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-bold text-ui-blue dark:text-white block mb-1">Student Rights & Welfare</span>
                The primary objective of the Union is to promote the welfare of its members and defend their fundamental rights.
              </div>
            </div>
          </div>

          {/* NEW FEATURE 1: Article Comparison Tool */}
          <div className="mb-12 p-6 bg-gradient-to-r from-ui-blue/10 to-nobel-gold/10 border border-ui-blue/20 rounded-xl print:hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg text-ui-blue dark:text-nobel-gold flex items-center gap-2">
                <TrendingUp size={20} /> Article Comparison Tool
              </h3>
              <Button 
                onClick={() => setShowComparison(!showComparison)}
                className="text-xs font-bold uppercase"
                variant={showComparison ? "default" : "outline"}
              >
                {showComparison ? 'Hide' : 'Show'} Comparison
              </Button>
            </div>
            {showComparison && (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <p className="mb-3">Select articles to compare their provisions side-by-side.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {constitutionData.slice(0, 6).map(article => (
                    <label key={article.id} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={selectedArticles.includes(article.id)}
                        onChange={() => toggleArticleSelection(article.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-xs font-medium">{article.title}</span>
                    </label>
                  ))}
                </div>
                {selectedArticles.length > 0 && (
                  <Button className="mt-4 w-full bg-ui-blue hover:bg-ui-blue/90 text-white">
                    Compare {selectedArticles.length} Article{selectedArticles.length !== 1 ? 's' : ''}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* NEW FEATURE 2: Amendment Timeline */}
          <div className="mb-12 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl print:hidden">
            <h3 className="font-serif text-lg text-amber-900 dark:text-amber-200 flex items-center gap-2 mb-4">
              <History size={20} /> Amendment Timeline
            </h3>
            <div className="space-y-3">
              {amendmentsData.slice(0, 3).map((amendment, idx) => (
                <div key={amendment.id} className="flex gap-4 items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-600 dark:bg-amber-400"></div>
                    {idx < 2 && <div className="w-0.5 h-8 bg-amber-300 dark:bg-amber-700"></div>}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-amber-900 dark:text-amber-200">{amendment.date}</div>
                    <div className="text-sm text-amber-800 dark:text-amber-300">{amendment.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NEW FEATURE 3: Related Articles Sidebar */}
          <div className="mb-12 p-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl print:hidden">
            <h3 className="font-serif text-lg text-ui-blue dark:text-nobel-gold flex items-center gap-2 mb-4">
              <FileText size={20} /> Related Articles
            </h3>
            <div className="space-y-2">
              {constitutionData.slice(0, 5).map(article => (
                <button
                  key={article.id}
                  onClick={() => scrollToSection(article.id)}
                  className="w-full text-left p-3 bg-white dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-ui-blue dark:hover:text-nobel-gold"
                >
                  {article.title}
                </button>
              ))}
            </div>
          </div>

          {/* NEW FEATURE 4: Citation Generator */}
          <div className="mb-12 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl print:hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg text-purple-900 dark:text-purple-200 flex items-center gap-2">
                <Copy size={20} /> Citation Generator
              </h3>
              <div className="flex gap-2">
                {(['APA', 'MLA', 'Chicago'] as const).map(format => (
                  <button
                    key={format}
                    onClick={() => setCitationFormat(format)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                      citationFormat === format 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-white dark:bg-slate-700 text-purple-900 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Example citation ({citationFormat}):</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">
                {generateCitation(constitutionData[0]?.id || '')}
              </p>
              <Button className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white gap-2">
                <Copy size={14} /> Copy Citation
              </Button>
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

          {/* Feedback & Reporting */}
          <section className="mt-20 p-8 bg-slate-100 dark:bg-slate-900 rounded-2xl text-center print:hidden">
            <ShieldAlert className="mx-auto text-ui-blue dark:text-nobel-gold mb-4" size={32} />
            <h3 className="font-serif text-2xl text-ui-blue dark:text-white mb-2">Notice a Discrepancy?</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-6">
              If you believe there is an error in this digital version or wish to report a constitutional violation, please contact the Judicial Council.
            </p>
            <Button className="bg-ui-blue hover:bg-ui-blue/90 text-white rounded-full px-8">
              Report Issue
            </Button>
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
