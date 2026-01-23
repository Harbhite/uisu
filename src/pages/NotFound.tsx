import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { SEO } from "@/components/SEO";
import Dither from "@/components/Dither";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ui-dark text-foreground relative overflow-hidden">
      <SEO title="Page Not Found" description="The page you are looking for does not exist." />

      {/* Dither Animation Background */}
      <div className="absolute inset-0 z-0">
        <Dither
          waveColor={[0.0, 0.2, 0.4]} // UI Blue adapted for shader
          disableAnimation={false}
          enableMouseInteraction
          mouseRadius={0.3}
          colorNum={4}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.05}
        />
      </div>

      {/* Content Overlay */}
      <div className="text-center max-w-lg relative z-10 backdrop-blur-md bg-ui-dark/40 p-10 rounded-3xl border border-white/10 shadow-2xl">
        <div className="mb-6">
            <h1 className="text-9xl font-serif text-white/90 font-bold tracking-tighter drop-shadow-xl select-none">
              404
            </h1>
        </div>

        <h2 className="text-3xl font-serif text-nobel-gold font-bold mb-4 drop-shadow-lg tracking-wide">
          Lost in the Ether
        </h2>

        <p className="text-gray-200 mb-8 font-medium text-lg leading-relaxed drop-shadow-sm">
            The page you are looking for has been moved, removed, or never existed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
                to="/"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-3 bg-ui-blue text-white rounded-full font-bold uppercase tracking-widest text-xs overflow-hidden transition-all hover:bg-nobel-gold hover:text-ui-blue shadow-lg border border-white/20"
            >
                <span className="relative z-10 flex items-center gap-2">
                   <Home size={16} /> Return Home
                </span>
            </Link>
             <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/5 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-colors backdrop-blur-md border border-white/10"
            >
                <ArrowLeft size={16} /> Go Back
            </button>
        </div>
      </div>

      {/* Decorative footer text */}
      <div className="absolute bottom-6 text-white/20 text-xs font-mono uppercase tracking-[0.2em] z-10">
        University of Ibadan Students' Union
      </div>
    </div>
  );
};

export default NotFound;
