import { Link, useLocation } from "react-router-dom";
import { useEffect, Suspense } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { SEO } from "@/components/SEO";
import NotFoundScene from "@/components/NotFoundScene";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 relative overflow-hidden">
      <SEO title="Page Not Found" description="The page you are looking for does not exist." />

      {/* 3D ASCII Background */}
      <Suspense fallback={<div className="absolute inset-0 bg-ui-blue/20 animate-pulse" />}>
        <NotFoundScene />
      </Suspense>

      {/* Content Overlay */}
      <div className="text-center max-w-md relative z-10 backdrop-blur-sm bg-background/30 p-8 rounded-2xl border border-white/10 shadow-2xl">
        <h1 className="text-9xl font-serif text-white font-bold opacity-80 mb-4 select-none drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]">404</h1>
        <h2 className="text-3xl font-serif text-nobel-gold font-bold mb-4 drop-shadow-md">Page Not Found</h2>
        <p className="text-gray-200 mb-8 font-medium drop-shadow-sm">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ui-blue text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-nobel-gold hover:text-ui-blue transition-colors shadow-lg border border-white/20"
            >
                <Home size={16} /> Return Home
            </Link>
             <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-colors backdrop-blur-md border border-white/10"
            >
                <ArrowLeft size={16} /> Go Back
            </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
