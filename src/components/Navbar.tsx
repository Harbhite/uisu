import { motion, AnimatePresence } from "framer-motion";
import { X, Menu, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";

interface NavbarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  user: User | null;
  handleLogout: () => void;
}

export const Navbar = ({ isMenuOpen, setIsMenuOpen, user, handleLogout }: NavbarProps) => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-14 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-40">
      <div className="bg-ui-blue/95 backdrop-blur-md text-white rounded-none px-6 py-3 flex justify-between items-center shadow-2xl border border-white/10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:text-nobel-gold transition-colors"
        >
          <AnimatePresence mode="wait">
            {isMenuOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={18}/></motion.div>
            ) : (
              <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><Menu size={18}/></motion.div>
            )}
          </AnimatePresence>
          <span className="hidden md:inline">Menu</span>
        </motion.button>

        <motion.div whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }} transition={{ duration: 0.5 }} className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 cursor-pointer">
          <Link to="/" className="flex items-center gap-3">
            <img src="/uisu-logo.png" alt="UISU Logo" className="h-14 w-auto object-contain drop-shadow-md" />
            <span className="font-serif font-bold text-2xl tracking-tight hidden md:inline text-white">UISU</span>
          </Link>
        </motion.div>

        <div className="flex items-center gap-4">
          {user && (
            <Link to="/admin" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-nobel-gold transition-colors">
              Admin
            </Link>
          )}
          {user ? (
            <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-nobel-gold transition-colors">
              <LogOut size={14} />
            </button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
              className="bg-nobel-gold text-ui-blue px-5 py-2 rounded-none text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors border border-nobel-gold shadow-md"
            >
              Enter
            </motion.button>
          )}
        </div>
      </div>
    </nav>
  );
};
