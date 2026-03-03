import { motion } from "framer-motion";
import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";

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

const MAX_RECENT = 5;

const PageWrapper = ({ children }: PageWrapperProps) => {
  const { pathname } = useLocation();
  const setLastVisitedRoute = useAppStore((s) => s.setLastVisitedRoute);
  const setAppData = useAppStore((s) => s.setAppData);
  const getAppData = useAppStore((s) => s.getAppData);

  // Track last visited route, recent routes & scroll to top on route change
  useEffect(() => {
    setLastVisitedRoute(pathname);
    window.scrollTo({ top: 0, behavior: "instant" });

    // Track recent routes (deduped, max 5)
    const recent = getAppData<string[]>('recentRoutes') || [];
    const updated = [pathname, ...recent.filter(r => r !== pathname)].slice(0, MAX_RECENT);
    setAppData('recentRoutes', updated);
  }, [pathname, setLastVisitedRoute, setAppData, getAppData]);

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
