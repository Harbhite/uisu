import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { List, ChevronRight, Bookmark } from 'lucide-react';
import { ConstitutionArticle } from '@/lib/data';

interface MobileTOCDrawerProps {
  articles: ConstitutionArticle[];
  activeSection: string;
  bookmarks: string[];
  onSelect: (id: string) => void;
}

const MobileTOCDrawer: React.FC<MobileTOCDrawerProps> = ({ articles, activeSection, bookmarks, onSelect }) => {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  const bookmarkedArticles = articles.filter(a => bookmarks.includes(a.id));

  return (
    <div className="xl:hidden fixed bottom-6 right-6 z-40 print:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="w-14 h-14 rounded-full bg-ui-blue text-white shadow-xl flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
            <List size={24} />
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[70vh] rounded-t-2xl dark:bg-slate-900 dark:border-slate-700">
          <SheetHeader>
            <SheetTitle className="font-serif text-ui-blue dark:text-nobel-gold">Table of Contents</SheetTitle>
          </SheetHeader>

          {bookmarkedArticles.length > 0 && (
            <div className="mb-4 mt-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-nobel-gold mb-2 flex items-center gap-1">
                <Bookmark size={10} /> Bookmarks
              </p>
              <div className="space-y-1">
                {bookmarkedArticles.map(article => (
                  <button
                    key={article.id}
                    onClick={() => handleSelect(article.id)}
                    className="w-full text-left px-3 py-2 text-xs font-medium bg-nobel-gold/10 text-ui-blue dark:text-nobel-gold rounded-sm"
                  >
                    {article.title.split(':')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <nav className="space-y-1 overflow-y-auto max-h-[50vh] mt-2">
            {articles.map(article => (
              <button
                key={article.id}
                onClick={() => handleSelect(article.id)}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-all rounded-md flex items-center justify-between ${
                  activeSection === article.id
                    ? 'bg-ui-blue text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="line-clamp-1">{article.title.split(':')[0]}</span>
                {activeSection === article.id && <ChevronRight size={14} className="text-nobel-gold" />}
              </button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileTOCDrawer;
