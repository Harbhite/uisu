import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper, BookOpen, Users, Bookmark, PenTool, Menu as MenuIcon, Search, Home, Archive, Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = ['News', 'Opinion', 'Sports', 'Campus Life', 'Official Notice', 'Resolution', 'Minutes'];

const SidebarItem = ({
  icon: Icon, label, to, isActive
}: {
  icon: React.ElementType; label: string; to: string; isActive: boolean;
}) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all group relative overflow-hidden border-l-2",
      isActive
        ? "text-foreground border-accent bg-accent/10"
        : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted hover:border-accent/40"
    )}
  >
    <Icon size={18} className="relative z-10" />
    <span className="relative z-10">{label}</span>
  </Link>
);

const GazetteLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const links = [
    { icon: Newspaper, label: 'Home', to: '/gazette' },
    { icon: Archive, label: 'Issues', to: '/gazette/issues' },
    { icon: Users, label: 'Editorial Board', to: '/gazette/editorial-board' },
    { icon: Bookmark, label: 'Bookmarks', to: '/gazette/bookmarks' },
    { icon: PenTool, label: 'Write', to: '/gazette/editor/new' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/gazette/category/all?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-primary backdrop-blur-xl border-r border-primary-foreground/10 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col shadow-2xl",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 border-b border-primary-foreground/10">
          <Link to="/gazette" className="flex flex-col gap-1">
            <span className="text-[10px] text-accent uppercase tracking-[0.4em] font-bold">UISU</span>
            <span className="text-2xl font-serif text-primary-foreground font-bold tracking-tight">
              The Gazette<span className="text-accent">.</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <SidebarItem
              key={link.to}
              icon={link.icon}
              label={link.label}
              to={link.to}
              isActive={
                link.to === '/gazette'
                  ? location.pathname === '/gazette'
                  : location.pathname.startsWith(link.to)
              }
            />
          ))}

          <div className="px-6 pt-6 pb-2">
            <span className="text-[10px] text-primary-foreground/40 uppercase tracking-[0.3em] font-bold">Categories</span>
          </div>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/gazette/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
              className={cn(
                "flex items-center gap-3 px-6 py-2.5 text-xs font-medium transition-all border-l-2",
                location.pathname === `/gazette/category/${cat.toLowerCase().replace(/\s+/g, '-')}`
                  ? "text-primary-foreground border-accent bg-accent/10"
                  : "text-primary-foreground/50 border-transparent hover:text-primary-foreground hover:bg-primary-foreground/5"
              )}
            >
              <Tag size={14} />
              {cat}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-primary-foreground/10">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground/50 hover:text-primary-foreground transition-colors hover:bg-primary-foreground/5 border border-transparent hover:border-primary-foreground/10">
            <Home size={16} />
            <span>Back to Main Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="bg-card/60 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-8 shrink-0 sticky top-0 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-muted-foreground hover:text-foreground"
          >
            <MenuIcon />
          </button>

          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-3 text-muted-foreground w-full max-w-xl bg-muted/50 px-4 py-2 border border-transparent focus-within:border-accent/30 transition-colors">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground text-foreground"
            />
          </form>

          <div className="flex items-center gap-4">
            <Link
              to="/gazette/editor/new"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-widest hover:bg-accent/90 transition-colors"
            >
              <PenTool size={14} />
              Write
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default GazetteLayout;
