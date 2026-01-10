import { motion } from "framer-motion";
import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";

interface PageWrapperProps {
  children: ReactNode;
}

const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.98 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1 
  },
  exit: { 
    opacity: 0, 
    y: -10,
    scale: 0.99 
  }
};

const pageTransition = {
  type: "tween",
  ease: [0.25, 0.46, 0.45, 0.94],
  duration: 0.4
};

const PageWrapper = ({ children }: PageWrapperProps) => {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <motion.div
      key={pathname}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;
