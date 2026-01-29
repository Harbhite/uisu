import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { constitutionData, amendmentsData } from '@/lib/data';
import { Search, Gavel, Scale, Printer, ChevronRight, Check, ShieldAlert, History, Link as LinkIcon, Type, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ConstitutionPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState(constitutionData[0]?.id || '');
  const [fontSize, setFontSize] = useState(100); // Percentage

  // Progress Bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Filter articles based on search
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

  // Scroll Spy Logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset

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

  const handleCopyLink = (id: string, title: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
    toast.custom((t) => (
      <div className="bg-slate-900 text-white p-4 shadow-2xl border-l-4 border-nobel-gold flex items-center gap-4 w-full rounded-md">
        <Check className="text-green-500" size={16} />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest text-nobel-gold">Citation Copied</span>
          <span className="text-xs text-slate-300">Link to "{title}" ready.</span>
        </div>
      </div>
    ));
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  const adjustFontSize = (increment: boolean) => {
    setFontSize(prev => {
      const newSize = increment ? prev + 10 : prev - 10;
      return Math.min(Math.max(newSize, 80), 150); // Limit between 80% and 150%
    });
  };

  return (
    <div className="min-h-screen bg-nobel-cream selection:bg-nobel-gold selection:text-ui-blue print:bg-white">
      <SEO
        title="The Constitution | UISU SPACE"
        description="The Supreme Constitution of the University of Ibadan Students' Union. Digital Legislative Registry."
        image="/og/pages-screenshot/constitution.png"
      />

      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-nobel-gold z-50 origin-left print:hidden"
        style={{ scaleX }}
      />

      {/* --- SIDEBAR NAVIGATION (Desktop) --- */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200 z-30 hidden xl:flex flex-col pt-24 pb-8 overflow-hidden print:hidden">
        <div className="px-8 mb-6">
          <div className="flex items-center gap-2 text-ui-blue mb-2">
            <Gavel size={20} className="text-nobel-gold" />
            <h2 className="font-serif font-bold text-xl tracking-tight">Legislative Index</h2>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Supreme Registry v2.4</p>
        </div>

        <div className="px-6 mb-4">
           <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search Articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-ui-blue transition-colors rounded-sm font-medium text-ui-blue"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
          {filteredArticles.map((article) => (
            <button
              key={article.id}
              onClick={() => scrollToSection(article.id)}
              className={`w-full text-left px-4 py-3 text-[11px] font-medium transition-all rounded-sm flex items-center justify-between group ${
                activeSection === article.id
                  ? 'bg-ui-blue text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-ui-blue'
              }`}
            >
              <span className="line-clamp-1">{article.title.split(':')[0]}</span>
              {activeSection === article.id && <ChevronRight size={12} className="text-nobel-gold" />}
            </button>
          ))}
          {filteredArticles.length === 0 && (
             <div className="p-4 text-center text-xs text-slate-400 italic">
               No articles match your query.
             </div>
          )}
        </nav>

        {/* Font Controls */}
        <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Text Size</span>
            <div className="flex items-center gap-1 bg-slate-50 rounded-sm border border-slate-200 p-1">
                <button
                  onClick={() => adjustFontSize(false)}
                  className="p-1 hover:bg-white hover:shadow-sm rounded-sm transition-all"
                  disabled={fontSize <= 80}
                  aria-label="Decrease font size"
                >
                    <Minus size={12} className={fontSize <= 80 ? "text-slate-300" : "text-slate-600"}/>
                </button>
                <span className="text-[10px] font-mono w-8 text-center">{fontSize}%</span>
                <button
                  onClick={() => adjustFontSize(true)}
                  className="p-1 hover:bg-white hover:shadow-sm rounded-sm transition-all"
                  disabled={fontSize >= 150}
                  aria-label="Increase font size"
                >
                    <Plus size={12} className={fontSize >= 150 ? "text-slate-300" : "text-slate-600"}/>
                </button>
            </div>
        </div>

        <div className="px-8 mt-2 pt-2 border-t border-slate-100">
           <Button onClick={handlePrint} variant="outline" className="w-full gap-2 text-xs font-bold uppercase tracking-widest border-slate-300 hover:border-ui-blue hover:text-ui-blue">
            <Printer size={14}/> Print PDF
          </Button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="xl:pl-72 w-full transition-all duration-300">

        {/* Header Branding */}
        <div className="bg-ui-blue text-white pt-32 pb-20 px-6 md:px-12 lg:px-20 relative overflow-hidden print:pt-10 print:pb-10 print:text-black print:bg-white">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay print:hidden"></div>
          <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none print:hidden">
            <Scale size={300} strokeWidth={0.5} />
          </div>

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-6 print:hidden">
              <span className="px-3 py-1 bg-nobel-gold text-ui-blue text-[10px] font-bold uppercase tracking-widest rounded-sm">Official Document</span>
              <span className="px-3 py-1 border border-white/20 text-white/60 text-[10px] font-bold uppercase tracking-widest rounded-sm">Public Record</span>
            </div>

            <h1 className="font-serif text-5xl md:text-7xl font-medium mb-6 leading-none">
              The Union <br/> <span className="italic text-nobel-gold print:text-black">Constitution</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-light leading-relaxed print:text-slate-600">
              The supreme law governing the University of Ibadan Students' Union.
              Enacted to promote welfare, foster excellence, and defend student rights.
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div
            className="px-6 md:px-12 lg:px-20 py-16 max-w-5xl mx-auto transition-all duration-300"
            style={{ fontSize: `${fontSize}%` }}
        >

          {/* Mobile Search (Visible only on mobile) */}
          <div className="xl:hidden mb-12 print:hidden">
             <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search Legislative Articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-ui-blue focus:ring-1 focus:ring-ui-blue transition-all shadow-sm rounded-md font-medium text-ui-blue"
              />
            </div>
          </div>

          <div className="space-y-16">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <section
                  key={article.id}
                  id={article.id}
                  className="scroll-mt-32 group"
                >
                  {/* Article Header */}
                  <div className="mb-8 border-b-4 border-ui-blue pb-4 flex items-end justify-between print:border-black">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-2 print:text-black">Legislative Protocol</div>
                      <h2
                        className="font-serif text-3xl md:text-4xl text-ui-blue cursor-pointer hover:text-nobel-gold transition-colors flex items-center gap-3 print:text-black"
                        onClick={() => handleCopyLink(article.id, article.title)}
                        title="Click to copy citation link"
                      >
                        {article.title}
                        <LinkIcon size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                      </h2>
                    </div>
                    <Gavel className="text-slate-200 mb-1 group-hover:text-nobel-gold/20 transition-colors print:hidden" size={48} />
                  </div>

                  {/* Sections */}
                  <div className="space-y-8 pl-0 md:pl-8 border-l-0 md:border-l border-slate-200 print:border-l-0 print:pl-0">
                    {article.sections.map((section) => (
                      <div key={section.id} className="relative">
                        {section.title && (
                          <h3 className="font-serif text-xl text-ui-blue mb-3 font-bold italic print:text-black">{section.title}</h3>
                        )}
                        <p className="text-slate-700 leading-relaxed text-lg font-light mb-4 print:text-black print:text-sm">
                          {section.content}
                        </p>

                        {section.subSections && (
                          <ul className="pl-6 space-y-4 text-slate-600 print:text-black print:text-sm">
                            {section.subSections.map((sub, idx) => (
                              <li key={idx} className="flex gap-4">
                                <span className="block w-2 h-2 mt-2 rounded-full bg-nobel-gold flex-shrink-0" />
                                <span className="leading-relaxed">{sub}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="py-20 text-center border border-dashed border-slate-300 rounded-lg bg-slate-50">
                 <ShieldAlert className="mx-auto text-slate-300 mb-4" size={48} />
                 <h3 className="text-lg font-serif text-slate-600">No Articles Found</h3>
                 <p className="text-slate-400 text-sm">Try adjusting your search query.</p>
                 <Button
                   variant="link"
                   onClick={() => setSearchQuery('')}
                   className="mt-2 text-ui-blue"
                 >
                   Clear Search
                 </Button>
              </div>
            )}
          </div>

          {/* AMENDMENTS LEDGER */}
          <section className="mt-32 pt-16 border-t border-slate-200 print:mt-10 print:pt-10">
            <div className="flex items-center gap-4 mb-8">
              <History className="text-nobel-gold" size={28} />
              <h2 className="font-serif text-3xl text-ui-blue">Amendments Ledger</h2>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm overflow-hidden rounded-sm print:border-black">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-500 print:bg-slate-200 print:text-black">
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Ref ID</div>
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              {/* Rows */}
              {amendmentsData.map((amendment) => (
                <div key={amendment.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors items-center text-sm print:border-slate-300">
                   <div className="col-span-2 font-mono text-xs text-slate-500">{amendment.date}</div>
                   <div className="col-span-2 font-mono text-xs text-ui-blue font-bold">{amendment.id}</div>
                   <div className="col-span-6 text-slate-700">
                     <div className="font-bold text-xs mb-1 text-slate-900">{amendment.articleRef}</div>
                     <p className="line-clamp-2 text-xs text-slate-500">{amendment.description}</p>
                   </div>
                   <div className="col-span-2 text-right">
                     <span className={`
                       inline-flex px-2 py-1 text-[8px] font-bold uppercase tracking-widest border rounded-sm
                       ${amendment.status === 'Ratified' ? 'bg-green-50 text-green-600 border-green-200' : ''}
                       ${amendment.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : ''}
                       ${amendment.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-200' : ''}
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

      {/* Print Footer style */}
      <div className="hidden print:block fixed bottom-0 left-0 w-full text-center p-4 border-t border-black text-[10px]">
        UISU SPACE • Official Constitution Document • Printed from uisu.space
      </div>

    </div>
  );
};

export default ConstitutionPage;
