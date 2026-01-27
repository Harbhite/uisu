import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Layout,
  Upload,
  User,
  Menu as MenuIcon,
  Search,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SidebarItem = ({
  icon: Icon,
  label,
  to,
  isActive
}: {
  icon: React.ElementType;
  label: string;
  to: string;
  isActive: boolean;
}) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all group relative overflow-hidden border-l-2",
      isActive
        ? "text-nobel-gold border-nobel-gold bg-white/5"
        : "text-slate-400 border-transparent hover:text-white hover:bg-white/5 hover:border-white/20"
    )}
  >
    <Icon size={18} />
    <span>{label}</span>
  </Link>
);

const TutorialsLayout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { icon: Layout, label: 'Dashboard', to: '/tutorials' },
    { icon: BookOpen, label: 'Browse Catalog', to: '/tutorials/catalog' },
    { icon: Upload, label: 'Upload Tutorial', to: '/tutorials/upload' },
    { icon: User, label: 'My Profile', to: '/tutorials/profile' }, // Placeholder
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-ui-dark border-r border-white/5 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 border-b border-white/5">
          <Link to="/" className="flex flex-col gap-1 mb-1">
             <span className="text-[10px] text-nobel-gold uppercase tracking-[0.4em] font-bold">The Union</span>
             <span className="text-2xl font-serif text-white font-bold tracking-tight">Tutors<span className="text-nobel-gold">.</span></span>
          </Link>
        </div>

        <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <SidebarItem
              key={link.to}
              {...link}
              isActive={location.pathname === link.to || (link.to !== '/tutorials' && location.pathname.startsWith(link.to))}
            />
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors hover:bg-white/5 border border-transparent hover:border-white/10">
            <Home size={16} />
            <span>Back to Main Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50">
        {/* Top Header (Mobile Only / Search) */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-slate-600 hover:text-ui-blue"
          >
            <MenuIcon />
          </button>

          <div className="hidden md:flex items-center gap-3 text-slate-400 w-full max-w-xl">
             <Search size={16} />
             <input
                type="text"
                placeholder="Search tutorials..."
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 text-slate-800"
             />
          </div>

          <div className="flex items-center gap-4">
             {/* Placeholder for User Profile / Notifications */}
             <div className="w-8 h-8 bg-ui-blue text-white flex items-center justify-center font-bold text-xs border border-ui-blue hover:bg-white hover:text-ui-blue transition-colors cursor-pointer">
               U
             </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TutorialsLayout;
