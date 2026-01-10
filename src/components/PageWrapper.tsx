import { motion } from "framer-motion";
import { ReactNode, Suspense } from "react";
import LoadingFallback from "./LoadingFallback";

interface PageWrapperProps {
  children: ReactNode;
}

const PageWrapper = ({ children }: PageWrapperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // Custom bezier for smooth feel
      className="w-full"
    >
      <Suspense fallback={<LoadingFallback />}>
        {children}
      </Suspense>
    </motion.div>
  );
};

export default PageWrapper;
