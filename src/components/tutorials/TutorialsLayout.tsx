import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Layout,
  Upload,
  User,
  Menu as MenuIcon,
  X,
  Search,
  LogOut,
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
      "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors group relative overflow-hidden",
      isActive
        ? "text-nobel-gold bg-white/5"
        : "text-slate-400 hover:text-white hover:bg-white/5"
    )}
  >
    <div className={cn(
      "absolute left-0 top-0 bottom-0 w-1 bg-nobel-gold transition-transform duration-300",
      isActive ? "translate-x-0" : "-translate-x-full"
    )} />
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
        "fixed inset-y-0 left-0 z-50 w-64 bg-ui-dark border-r border-white/5 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2 mb-1">
            <span className="text-xl font-serif text-white font-bold tracking-tight">UISU <span className="text-nobel-gold italic">Tutors</span></span>
          </Link>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Learn & Teach</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <SidebarItem
              key={link.to}
              {...link}
              isActive={location.pathname === link.to || (link.to !== '/tutorials' && location.pathname.startsWith(link.to))}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <Home size={18} />
            <span>Back to Main Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header (Mobile Only / Search) */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-slate-600 hover:text-ui-blue"
          >
            <MenuIcon />
          </button>

          <div className="hidden md:flex items-center gap-2 text-slate-400">
             <Search size={16} />
             <span className="text-sm">Search tutorials...</span>
          </div>

          <div className="flex items-center gap-4">
             {/* Placeholder for User Profile / Notifications */}
             <div className="w-8 h-8 rounded-full bg-ui-blue/10 flex items-center justify-center text-ui-blue font-bold text-xs">
               U
             </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TutorialsLayout;
