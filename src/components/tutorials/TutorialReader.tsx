import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import {
  Type,
  Minus,
  Plus,
  AlignLeft,
  Moon,
  Sun,
  BookOpen,
  Share2,
  Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TutorialReaderProps {
  title: string;
  content: string; // HTML or Markdown content
  author: string;
  readTime?: string;
}

const TutorialReader = ({ title, content, author, readTime = "5 min read" }: TutorialReaderProps) => {
  const [progress, setProgress] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('serif');
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const totalHeight = contentRef.current.clientHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      const newProgress = Math.min(100, Math.max(0, (scrollPosition / totalHeight) * 100));

      setProgress(newProgress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <div className={cn("min-h-screen transition-colors duration-300", getThemeClasses())}>
      {/* Sticky Reading Progress Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-gray-200/20">
        <div
          className="h-full bg-purple-600 transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Reader Toolbar */}
      <div className={cn(
        "sticky top-16 z-30 flex items-center justify-between px-4 py-3 border-b backdrop-blur-md transition-colors",
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
                    <Button
                      variant={fontFamily === 'serif' ? "default" : "outline"}
                      size="sm"
                      className="flex-1 font-serif"
                      onClick={() => setFontFamily('serif')}
                    >
                      Serif
                    </Button>
                    <Button
                      variant={fontFamily === 'sans' ? "default" : "outline"}
                      size="sm"
                      className="flex-1 font-sans"
                      onClick={() => setFontFamily('sans')}
                    >
                      Sans
                    </Button>
                    <Button
                      variant={fontFamily === 'mono' ? "default" : "outline"}
                      size="sm"
                      className="flex-1 font-mono"
                      onClick={() => setFontFamily('mono')}
                    >
                      Mono
                    </Button>
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

          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bookmark size={16} />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Share2 size={16} />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div
        ref={contentRef}
        className="max-w-3xl mx-auto px-6 py-12 md:py-20"
      >
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
          {/* In a real app, render safe HTML or Markdown here */}
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />

          {/* Placeholder content if empty (since mock data might be short) */}
          {!content && (
            <>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              <h2>The Principles of Design</h2>
              <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              <blockquote>
                "Design is not just what it looks like and feels like. Design is how it works."
              </blockquote>
              <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
              <ul>
                 <li>Contrast and Balance</li>
                 <li>Typography and Readability</li>
                 <li>Color Theory</li>
              </ul>
              <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
            </>
          )}
        </article>

        <div className="mt-20 pt-10 border-t border-current opacity-20 flex justify-between items-center">
           <div className="text-sm opacity-60">Last updated: Oct 24, 2024</div>
           <Button variant="outline" className="gap-2 border-current hover:bg-current hover:text-white hover:bg-opacity-10">
             <Share2 size={14} /> Share this article
           </Button>
        </div>
      </div>
    </div>
  );
};

export default TutorialReader;
