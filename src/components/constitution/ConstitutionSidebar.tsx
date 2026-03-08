import React from 'react';
import { Search, Gavel, ChevronRight, Printer, Minus, Plus, Moon, Sun, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ConstitutionArticle } from '@/lib/data';
import ConstitutionExport from './ConstitutionExport';

interface ConstitutionSidebarProps {
  filteredArticles: ConstitutionArticle[];
  allArticles: ConstitutionArticle[];
  activeSection: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onScrollToSection: (id: string) => void;
  fontSize: number;
  onAdjustFontSize: (increment: boolean) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  bookmarks: string[];
}

const ConstitutionSidebar: React.FC<ConstitutionSidebarProps> = ({
  filteredArticles, allArticles, activeSection, searchQuery, onSearchChange,
  onScrollToSection, fontSize, onAdjustFontSize, darkMode, onToggleDarkMode, bookmarks,
}) => {
  const bookmarkedArticles = allArticles.filter(a => bookmarks.includes(a.id));

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 z-30 hidden xl:flex flex-col pt-24 pb-8 overflow-hidden print:hidden">
      <div className="px-8 mb-6">
        <div className="flex items-center gap-2 text-ui-blue dark:text-white mb-2">
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-ui-blue transition-colors rounded-sm font-medium text-ui-blue dark:text-white"
          />
        </div>
      </div>

      {/* Bookmarks Section */}
      {bookmarkedArticles.length > 0 && (
        <Collapsible defaultOpen className="px-4 mb-2">
          <CollapsibleTrigger className="w-full flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-nobel-gold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm transition-colors">
            <Bookmark size={10} /> Bookmarks ({bookmarkedArticles.length})
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-0.5 mt-1">
              {bookmarkedArticles.map(article => (
                <button
                  key={article.id}
                  onClick={() => onScrollToSection(article.id)}
                  className="w-full text-left px-4 py-2 text-[11px] font-medium bg-nobel-gold/10 dark:bg-nobel-gold/5 text-ui-blue dark:text-nobel-gold rounded-sm hover:bg-nobel-gold/20 transition-colors line-clamp-1"
                >
                  {article.title.split(':')[0]}
                </button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
        {filteredArticles.map((article) => (
          <button
            key={article.id}
            onClick={() => onScrollToSection(article.id)}
            className={`w-full text-left px-4 py-3 text-[11px] font-medium transition-all rounded-sm flex items-center justify-between group ${
              activeSection === article.id
                ? 'bg-ui-blue text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-ui-blue dark:hover:text-white'
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

      {/* Dark Mode Toggle */}
      <div className="px-8 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {darkMode ? <Moon size={12} /> : <Sun size={12} />}
          Night Mode
        </div>
        <Switch checked={darkMode} onCheckedChange={onToggleDarkMode} />
      </div>

      {/* Font Controls */}
      <div className="px-8 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Text Size</span>
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded-sm border border-slate-200 dark:border-slate-600 p-1">
          <button onClick={() => onAdjustFontSize(false)} className="p-1 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-sm transition-all" disabled={fontSize <= 80}>
            <Minus size={12} className={fontSize <= 80 ? "text-slate-300" : "text-slate-600 dark:text-slate-400"} />
          </button>
          <span className="text-[10px] font-mono w-8 text-center text-slate-500">{fontSize}%</span>
          <button onClick={() => onAdjustFontSize(true)} className="p-1 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-sm transition-all" disabled={fontSize >= 150}>
            <Plus size={12} className={fontSize >= 150 ? "text-slate-300" : "text-slate-600 dark:text-slate-400"} />
          </button>
        </div>
      </div>

      <div className="px-8 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 space-y-2">
        <Button onClick={() => window.print()} variant="outline" className="w-full gap-2 text-xs font-bold uppercase tracking-widest border-slate-300 dark:border-slate-600 hover:border-ui-blue hover:text-ui-blue dark:hover:border-nobel-gold dark:hover:text-nobel-gold dark:text-slate-300">
          <Printer size={14} /> Print PDF
        </Button>
        <ConstitutionExport />
      </div>
    </aside>
  );
};

export default ConstitutionSidebar;
