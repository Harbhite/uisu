import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight, ArrowDownRight, ArrowUpLeft } from "lucide-react";

interface LinkItemProps {
  to: string;
  title: string;
  subtitle: string;
}

const LinkItem = ({ to, title, subtitle }: LinkItemProps) => (
  <Link
    to={to}
    className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-ui-blue/5 rounded-xl border border-transparent hover:border-ui-blue/10 transition-all duration-300"
  >
    <div className="flex flex-col">
      <span className="font-bold text-slate-800 group-hover:text-ui-blue transition-colors">{title}</span>
      <span className="text-xs text-slate-500">{subtitle}</span>
    </div>
    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-ui-blue group-hover:border-ui-blue/30 transition-all">
       <ArrowRight size={14} className="group-hover:-rotate-45 transition-transform duration-300" />
    </div>
  </Link>
);

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50 p-4 md:p-8 overflow-hidden relative">

      {/* Decorative Arrows - Desktop only to avoid clutter on mobile */}
      <ArrowDownRight
        className="hidden md:block absolute top-[15%] left-[20%] text-rose-400/20 w-24 h-24 -rotate-12 animate-pulse"
        strokeWidth={1.5}
      />
      <ArrowUpLeft
        className="hidden md:block absolute bottom-[15%] right-[20%] text-rose-400/20 w-24 h-24 -rotate-12 animate-pulse"
        strokeWidth={1.5}
      />

      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-6xl w-full z-10">

        {/* Left '4' */}
        <div className="flex-1 flex items-center justify-center select-none">
           <span className="text-[12rem] md:text-[20rem] lg:text-[25rem] font-bold text-ui-blue leading-none font-sans tracking-tighter">4</span>
        </div>

        {/* Center Card (The '0') */}
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10 flex flex-col justify-center border border-slate-100 relative overflow-hidden mx-auto">
           {/* Decorative corner */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100%] -mr-16 -mt-16 z-0 pointer-events-none"></div>

           <div className="relative z-10 space-y-8">
               <div className="space-y-2 text-center md:text-left">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-nobel-gold font-bold">... 404 Error ...</p>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight">
                       Sorry, page not found
                    </h2>
                    <p className="text-slate-500 text-sm font-medium pt-2">
                       Go to other sections to learn more about UISU Archive.
                    </p>
               </div>

               <div className="space-y-3">
                  <LinkItem to="/governance" title="Governance" subtitle="Structure & Laws" />
                  <LinkItem to="/resources" title="Resources" subtitle="Student tools & materials" />
                  <LinkItem to="/inks-vault" title="Inks Vault" subtitle="Editorial content" />
               </div>
           </div>
        </div>

        {/* Right '4' */}
        <div className="flex-1 flex items-center justify-center select-none">
           <span className="text-[12rem] md:text-[20rem] lg:text-[25rem] font-bold text-ui-blue leading-none font-sans tracking-tighter">4</span>
        </div>

      </div>
    </div>
  );
};

export default NotFound;
