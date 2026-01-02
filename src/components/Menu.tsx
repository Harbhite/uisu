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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 top-0 z-40 bg-ui-blue text-white flex pt-20 overflow-hidden"
        >
          {/* Left Side: Navigation Links */}
          <div className="flex-1 flex flex-col justify-center items-center h-full relative z-10">
             <div className="flex flex-col gap-6 text-center overflow-y-auto max-h-[70vh] w-full px-6 no-scrollbar">
                {navLinks.map((link, index) => (
                    <motion.div
                        key={link.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                    >
                        <Link
                        to={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="font-serif text-xl md:text-2xl uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors block py-2"
                        >
                        {link.name}
                        </Link>
                    </motion.div>
                ))}
             </div>

             {/* Footer Contact Info (mimicking reference) */}
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center text-xs tracking-widest text-slate-400"
             >
                <p>University of Ibadan</p>
                <p className="mt-1">archive@uisu.org</p>
             </motion.div>
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-[80%] my-auto bg-white/10 hidden md:block"></div>
          <div className="w-px h-[80%] my-auto bg-white/10 md:hidden"></div>

          {/* Right Side: Logo / Arch */}
          <div className="w-1/3 min-w-[100px] flex items-center justify-center relative bg-ui-blue/50">
             {/* Arch Shape Background */}
             <div className="absolute inset-x-2 top-[15%] bottom-[15%] border border-white/10 rounded-t-full rounded-b-lg pointer-events-none opacity-50"></div>

             <motion.img
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                src="/uisu-logo.png"
                alt="UISU Logo"
                className="w-2/3 h-auto object-contain brightness-0 invert opacity-80"
             />
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};
