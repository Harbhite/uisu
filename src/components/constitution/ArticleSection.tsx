import React, { useState } from 'react';
import { Gavel, LinkIcon, Bookmark, BookmarkCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ConstitutionArticle } from '@/lib/data';
import HighlightText from './HighlightText';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

interface ArticleSectionProps {
  article: ConstitutionArticle;
  searchQuery: string;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

const ArticleSection: React.FC<ArticleSectionProps> = ({ article, searchQuery, isBookmarked, onToggleBookmark }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleCopyLink = (id: string, title: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
    toast.custom(() => (
      <div className="bg-slate-900 text-white p-4 shadow-2xl border-l-4 border-nobel-gold flex items-center gap-4 w-full rounded-md">
        <Check className="text-green-500" size={16} />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest text-nobel-gold">Citation Copied</span>
          <span className="text-xs text-slate-300">Link to "{title}" ready.</span>
        </div>
      </div>
    ));
  };

  return (
    <section id={article.id} className="scroll-mt-32 group">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Article Header */}
        <div className="mb-8 border-b-4 border-ui-blue dark:border-nobel-gold pb-4 flex items-end justify-between print:border-black">
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 mb-2 print:text-black">Legislative Protocol</div>
            <div className="flex items-center gap-2">
              <h2
                className="font-serif text-3xl md:text-4xl text-ui-blue dark:text-white cursor-pointer hover:text-nobel-gold transition-colors flex items-center gap-3 print:text-black"
                onClick={() => handleCopyLink(article.id, article.title)}
                title="Click to copy citation link"
              >
                <HighlightText text={article.title} query={searchQuery} />
                <LinkIcon size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => onToggleBookmark(article.id)}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors print:hidden"
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark this article'}
            >
              {isBookmarked ? (
                <BookmarkCheck size={20} className="text-nobel-gold" />
              ) : (
                <Bookmark size={20} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
              )}
            </button>

            <CollapsibleTrigger asChild>
              <button className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors print:hidden" title={isOpen ? 'Collapse' : 'Expand'}>
                {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
              </button>
            </CollapsibleTrigger>

            <Gavel className="text-slate-200 dark:text-slate-700 group-hover:text-nobel-gold/20 transition-colors print:hidden" size={48} />
          </div>
        </div>

        {/* Sections */}
        <CollapsibleContent>
          <div className="space-y-8 pl-0 md:pl-8 border-l-0 md:border-l border-slate-200 dark:border-slate-700 print:border-l-0 print:pl-0">
            {article.sections.map((section) => (
              <div key={section.id} className="relative">
                {section.title && (
                  <h3 className="font-serif text-xl text-ui-blue dark:text-nobel-gold mb-3 font-bold italic print:text-black">
                    <HighlightText text={section.title} query={searchQuery} />
                  </h3>
                )}
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg font-light mb-4 print:text-black print:text-sm">
                  <HighlightText text={section.content} query={searchQuery} />
                </p>

                {section.subSections && (
                  <ul className="pl-6 space-y-4 text-slate-600 dark:text-slate-400 print:text-black print:text-sm">
                    {section.subSections.map((sub, idx) => (
                      <li key={idx} className="flex gap-4">
                        <span className="block w-2 h-2 mt-2 rounded-full bg-nobel-gold flex-shrink-0" />
                        <span className="leading-relaxed">
                          <HighlightText text={sub} query={searchQuery} />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
};

export default ArticleSection;
