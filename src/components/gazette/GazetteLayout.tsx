import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper, BookOpen, Users, Bookmark, PenTool, Menu as MenuIcon, Search, Home, Archive, Tag, X, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = ['News', 'Opinion', 'Sports', 'Campus Life', 'Official Notice', 'Resolution', 'Minutes'];

const GazetteLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const links = [
    { icon: Newspaper, label: 'Home', to: '/gazette' },
    { icon: Archive, label: 'Issues', to: '/gazette/issues' },
    { icon: Users, label: 'Board', to: '/gazette/editorial-board' },
    { icon: Bookmark, label: 'Saved', to: '/gazette/bookmarks' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/gazette/category/all?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isActive = (to: string) =>
    to === '/gazette' ? location.pathname === '/gazette' : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-primary border-b border-primary-foreground/10">
        {/* Upper bar */}
        <div className="flex items-center justify-between px-4 md:px-8 h-14">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-primary-foreground/70 hover:text-primary-foreground"
            >
              {isMobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
            </button>

            <Link to="/gazette" className="flex items-center gap-2">
              <span className="text-[9px] text-accent uppercase tracking-[0.5em] font-bold hidden sm:block">UISU</span>
              <span className="text-xl font-serif text-primary-foreground font-bold tracking-tight">
                Gazette<span className="text-accent">.</span>
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-all relative",
                  isActive(link.to)
                    ? "text-accent"
                    : "text-primary-foreground/60 hover:text-primary-foreground"
                )}
              >
                <link.icon size={14} />
                {link.label}
                {isActive(link.to) && (
                  <motion.div
                    layoutId="gazette-nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-accent"
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 bg-primary-foreground/5 border border-primary-foreground/10 px-3 py-1.5 focus-within:border-accent/40 transition-colors">
              <Search size={14} className="text-primary-foreground/40" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-32 lg:w-48 placeholder:text-primary-foreground/30 text-primary-foreground"
              />
            </form>

            <Link
              to="/gazette/editor/new"
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-accent/90 transition-colors"
            >
              <PenTool size={12} />
              <span className="hidden sm:inline">Write</span>
            </Link>

            <Link
              to="/"
              className="text-primary-foreground/40 hover:text-primary-foreground transition-colors"
              title="Back to Main Site"
            >
              <Home size={16} />
            </Link>
          </div>
        </div>

        {/* Category strip */}
        <div className="hidden md:flex items-center gap-0 px-8 border-t border-primary-foreground/5 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const catSlug = cat.toLowerCase().replace(/\s+/g, '-');
            const active = location.pathname === `/gazette/category/${catSlug}`;
            return (
              <Link
                key={cat}
                to={`/gazette/category/${catSlug}`}
                className={cn(
                  "px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap border-b-2",
                  active
                    ? "text-accent border-accent"
                    : "text-primary-foreground/40 border-transparent hover:text-primary-foreground/70 hover:border-primary-foreground/20"
                )}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-primary shadow-2xl md:hidden flex flex-col"
            >
              <div className="p-6 border-b border-primary-foreground/10">
                <span className="text-xl font-serif text-primary-foreground font-bold">
                  Gazette<span className="text-accent">.</span>
                </span>
              </div>

              <form onSubmit={(e) => { handleSearch(e); setIsMobileMenuOpen(false); }} className="mx-6 mt-4 flex items-center gap-2 bg-primary-foreground/5 border border-primary-foreground/10 px-3 py-2">
                <Search size={14} className="text-primary-foreground/40" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs w-full placeholder:text-primary-foreground/30 text-primary-foreground"
                />
              </form>

              <nav className="flex-1 py-4 overflow-y-auto">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.15em] transition-all border-l-2",
                      isActive(link.to)
                        ? "text-accent border-accent bg-accent/10"
                        : "text-primary-foreground/50 border-transparent hover:text-primary-foreground hover:bg-primary-foreground/5"
                    )}
                  >
                    <link.icon size={16} />
                    {link.label}
                  </Link>
                ))}

                <div className="px-6 pt-6 pb-2">
                  <span className="text-[9px] text-primary-foreground/30 uppercase tracking-[0.3em] font-bold">Categories</span>
                </div>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    to={`/gazette/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-6 py-2.5 text-xs transition-all",
                      location.pathname === `/gazette/category/${cat.toLowerCase().replace(/\s+/g, '-')}`
                        ? "text-accent font-bold"
                        : "text-primary-foreground/40 hover:text-primary-foreground/70"
                    )}
                  >
                    {cat}
                    <ChevronRight size={12} />
                  </Link>
                ))}
              </nav>

              <div className="p-6 border-t border-primary-foreground/10">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.15em] text-primary-foreground/40 hover:text-primary-foreground transition-colors"
                >
                  <Home size={14} />
                  Main Site
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-3.5rem)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary border-t border-primary-foreground/10 py-8 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-serif text-primary-foreground font-bold">
              The UISU Gazette<span className="text-accent">.</span>
            </span>
            <span className="text-[10px] text-primary-foreground/30">— Campus news & official notices</span>
          </div>
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-[10px] uppercase tracking-[0.15em] text-primary-foreground/40 hover:text-primary-foreground transition-colors font-bold"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GazetteLayout;
