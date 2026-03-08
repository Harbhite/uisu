import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import {
  Type, Minus, Plus, Moon, Sun, Share2, Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface TutorialReaderProps {
  title: string;
  content: string;
  author: string;
  readTime?: string;
  updatedAt?: string;
  scrollContainerId?: string;
}

const TutorialReader = ({ title, content, author, readTime = "5 min read", updatedAt, scrollContainerId }: TutorialReaderProps) => {
  const [progress, setProgress] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('serif');
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [bookmarked, setBookmarked] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // Fix #4: Use scroll container instead of window
  useEffect(() => {
    const scrollEl = scrollContainerId
      ? document.getElementById(scrollContainerId)
      : window;

    const handleScroll = () => {
      if (!contentRef.current) return;

      if (scrollContainerId) {
        const container = document.getElementById(scrollContainerId);
        if (!container) return;
        const totalHeight = container.scrollHeight - container.clientHeight;
        const scrollPosition = container.scrollTop;
        setProgress(totalHeight > 0 ? Math.min(100, Math.max(0, (scrollPosition / totalHeight) * 100)) : 0);
      } else {
        const totalHeight = contentRef.current.clientHeight - window.innerHeight;
        const scrollPosition = window.scrollY;
        setProgress(totalHeight > 0 ? Math.min(100, Math.max(0, (scrollPosition / totalHeight) * 100)) : 0);
      }
    };

    if (scrollEl) {
      scrollEl.addEventListener('scroll', handleScroll);
      return () => scrollEl.removeEventListener('scroll', handleScroll);
    }
  }, [scrollContainerId]);

  const getThemeClasses = () => {
    switch(theme) {
      case 'sepia': return "bg-[#f4ecd8] text-[#5b4636]";
      case 'dark': return "bg-[#1a1a1a] text-[#e0e0e0]";
      default: return "bg-white text-slate-800";
    }
  };

  const getFontClass = () => {
    switch(fontFamily) {
      case 'sans': return "font-sans";
      case 'mono': return "font-mono";
      default: return "font-serif";
    }
  };

  // Fix #5: Wire bookmark and share
  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? 'Bookmark removed' : 'Bookmarked!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  // Fix #7: Derive date from prop
  const formattedDate = updatedAt ? format(new Date(updatedAt), 'MMM dd, yyyy') : null;

  return (
    <div className={cn("min-h-screen transition-colors duration-300", getThemeClasses())}>
      {/* Sticky Reading Progress Bar */}
      <div className="sticky top-0 left-0 right-0 z-40 h-1 bg-gray-200/20">
        <div
          className="h-full bg-purple-600 transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Reader Toolbar */}
      <div className={cn(
        "sticky top-1 z-30 flex items-center justify-between px-4 py-3 border-b backdrop-blur-md transition-colors",
        theme === 'dark' ? "border-white/10 bg-[#1a1a1a]/80" : "border-slate-200/60 bg-white/80",
        theme === 'sepia' && "bg-[#f4ecd8]/80 border-[#e3d7bf]"
      )}>
        <div className="flex items-center gap-3">
           <span className="text-xs font-bold uppercase tracking-widest opacity-60 truncate max-w-[200px] hidden md:block">
             {title}
           </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Typography Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Type size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">Font Size</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => setFontSize(Math.max(12, fontSize - 2))}>
                      <Minus size={12} />
                    </Button>
                    <span className="text-xs w-6 text-center">{fontSize}</span>
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => setFontSize(Math.min(32, fontSize + 2))}>
                      <Plus size={12} />
                    </Button>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-500">Font Family</span>
                  <div className="flex gap-2">
                    {(['serif', 'sans', 'mono'] as const).map(f => (
                      <Button key={f} variant={fontFamily === f ? "default" : "outline"} size="sm" className={`flex-1 font-${f}`} onClick={() => setFontFamily(f)}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('sepia')}>Sepia</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-4 w-[1px] bg-current opacity-20 mx-2" />

          <Button variant="ghost" size="sm" className={cn("h-8 w-8 p-0", bookmarked && "text-yellow-500")} onClick={handleBookmark}>
            <Bookmark size={16} className={bookmarked ? "fill-current" : ""} />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleShare}>
            <Share2 size={16} />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div ref={contentRef} className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <header className="mb-12 text-center">
           <Badge variant="outline" className="mb-4 border-current opacity-50">{readTime}</Badge>
           <h1 className={cn("text-4xl md:text-5xl font-bold mb-6 leading-tight", fontFamily === 'serif' ? "font-serif" : "font-sans")}>
             {title}
           </h1>
           <div className="flex items-center justify-center gap-2 opacity-70 text-sm">
              <span>By {author}</span>
              <span>•</span>
              <span>The Union Editorial</span>
           </div>
        </header>

        <article
          className={cn(
            "prose prose-lg max-w-none transition-all",
            getFontClass(),
            theme === 'dark' ? "prose-invert" : "",
            theme === 'sepia' ? "prose-sepia" : ""
          )}
          style={{ fontSize: `${fontSize}px` }}
        >
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
          {!content && (
            <p className="text-slate-400 italic">No content available for this module yet.</p>
          )}
        </article>

        <div className="mt-20 pt-10 border-t border-current opacity-20 flex justify-between items-center">
           {formattedDate && <div className="text-sm opacity-60">Last updated: {formattedDate}</div>}
           <Button variant="outline" className="gap-2 border-current hover:bg-current hover:text-white hover:bg-opacity-10" onClick={handleShare}>
             <Share2 size={14} /> Share this article
           </Button>
        </div>
      </div>
    </div>
  );
};

export default TutorialReader;
