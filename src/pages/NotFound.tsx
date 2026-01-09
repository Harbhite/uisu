import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Home, AlertOctagon } from "lucide-react";
import { SEO } from "@/components/SEO";

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

      {/* Background Graphic */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <AlertOctagon size={600} strokeWidth={0.5} />
      </div>

      <div className="text-center max-w-md relative z-10">
        <h1 className="text-9xl font-serif text-ui-blue font-bold opacity-20 mb-4 select-none">404</h1>
        <h2 className="text-3xl font-serif text-ui-blue font-bold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ui-blue text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-nobel-gold hover:text-ui-blue transition-colors shadow-lg"
            >
                <Home size={16} /> Return Home
            </Link>
             <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted text-muted-foreground rounded-full font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors"
            >
                <ArrowLeft size={16} /> Go Back
            </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
