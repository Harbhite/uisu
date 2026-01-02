import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

interface MenuProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  navLinks: { name: string; href: string }[];
}

export const Menu = ({ isMenuOpen, setIsMenuOpen, navLinks }: MenuProps) => {
  return (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed top-28 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white rounded-none shadow-2xl z-30 p-8 flex flex-col gap-6 text-center border border-slate-200"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-xl font-serif text-ui-blue hover:text-nobel-gold transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
