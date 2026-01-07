import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowUpRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 pt-32 pb-16">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
          {/* Left side - Label */}
          <div className="flex items-center gap-3 text-slate-400 text-xs font-mono uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>404 Error. Page not found</span>
          </div>

          {/* Center - Main content */}
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif italic text-slate-100 leading-tight mb-8">
              If you're reading this, something has gone terribly, terribly wrong.
            </h1>

            <Link
              to="/"
              className="group inline-flex items-center gap-3 px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all duration-300"
            >
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                Return home
              </span>
              <ArrowUpRight 
                size={16} 
                className="text-slate-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" 
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Giant 404 Typography */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none select-none overflow-hidden">
        <div className="relative w-full" style={{ height: '50vh' }}>
          {/* Back layer - darkest */}
          <div 
            className="absolute inset-0 flex items-end justify-center"
            style={{ transform: 'translateY(35%)' }}
          >
            <span 
              className="font-sans font-black text-[clamp(12rem,35vw,40rem)] leading-none tracking-tighter"
              style={{ 
                color: 'transparent',
                WebkitTextStroke: '2px rgba(100, 116, 139, 0.15)',
              }}
            >
              404
            </span>
          </div>

          {/* Middle layer */}
          <div 
            className="absolute inset-0 flex items-end justify-center"
            style={{ transform: 'translateY(25%)' }}
          >
            <span 
              className="font-sans font-black text-[clamp(12rem,35vw,40rem)] leading-none tracking-tighter text-slate-800"
            >
              404
            </span>
          </div>

          {/* Front layer - lightest */}
          <div 
            className="absolute inset-0 flex items-end justify-center"
            style={{ transform: 'translateY(15%)' }}
          >
            <span 
              className="font-sans font-black text-[clamp(12rem,35vw,40rem)] leading-none tracking-tighter text-slate-600"
            >
              404
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
