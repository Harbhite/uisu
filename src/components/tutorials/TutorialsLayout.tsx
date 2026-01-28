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
        ? "text-nobel-gold border-nobel-gold bg-gradient-to-r from-nobel-gold/10 to-transparent"
        : "text-slate-400 border-transparent hover:text-white hover:bg-white/5 hover:border-white/20"
    )}
  >
    {isActive && (
       <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_0_0,_var(--tw-gradient-stops))] from-nobel-gold/20 via-white/5 to-transparent opacity-50" />
    )}
    <Icon size={18} className="relative z-10" />
    <span className="relative z-10">{label}</span>
  </Link>
);

const TutorialsLayout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { icon: Layout, label: 'Dashboard', to: '/tutorials' },
    { icon: BookOpen, label: 'Browse Catalog', to: '/tutorials/catalog' },
    { icon: Upload, label: 'Upload Tutorial', to: '/tutorials/upload' },
    { icon: User, label: 'My Profile', to: '/tutorials/profile' },
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-ui-dark/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col shadow-2xl",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Conical Gradient accent at top-left */}
        <div className="absolute top-0 left-0 w-full h-32 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-nobel-gold/20 via-ui-blue/10 to-transparent opacity-40 pointer-events-none" />

        <div className="p-8 border-b border-white/10 relative z-10">
          <Link to="/" className="flex flex-col gap-1 mb-1">
             <span className="text-[10px] text-nobel-gold uppercase tracking-[0.4em] font-bold">The Union</span>
             <span className="text-2xl font-serif text-white font-bold tracking-tight">Tutors<span className="text-nobel-gold">.</span></span>
          </Link>
        </div>

        <nav className="flex-1 py-6 space-y-1 overflow-y-auto relative z-10">
          {links.map((link) => (
            <SidebarItem
              key={link.to}
              {...link}
              isActive={location.pathname === link.to || (link.to !== '/tutorials' && location.pathname.startsWith(link.to))}
            />
          ))}
        </nav>

        <div className="p-6 border-t border-white/10 relative z-10">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors hover:bg-white/5 border border-transparent hover:border-white/10">
            <Home size={16} />
            <span>Back to Main Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50/50">
        {/* Background Noise/Gradient */}
        <div className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-nobel-gold/5 via-transparent to-transparent" />

        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 h-16 flex items-center justify-between px-8 shrink-0 sticky top-0 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-slate-600 hover:text-ui-blue"
          >
            <MenuIcon />
          </button>

          <div className="hidden md:flex items-center gap-3 text-slate-400 w-full max-w-xl bg-slate-100/50 px-4 py-2 rounded-none border border-transparent focus-within:border-nobel-gold/50 transition-colors">
             <Search size={16} />
             <input
                type="text"
                placeholder="Search tutorials..."
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 text-slate-800"
             />
          </div>

          <div className="flex items-center gap-4">
             <div className="w-8 h-8 bg-ui-blue text-white flex items-center justify-center font-bold text-xs border border-ui-blue hover:bg-transparent hover:text-ui-blue transition-colors cursor-pointer shadow-sm">
               U
             </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TutorialsLayout;
