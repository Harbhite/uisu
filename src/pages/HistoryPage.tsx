import { Suspense, useEffect, useRef } from 'react';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Components
import { ThreeHero } from "@/components/history/ThreeHero";
import { GlobalOrigins } from "@/components/history/GlobalOrigins";
import { AfricanContext } from "@/components/history/AfricanContext";
import { NigerianEvolution } from "@/components/history/NigerianEvolution";
import { UISUEras } from "@/components/history/UISUEras";

import anime from 'animejs';

const HistoryPage = () => {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    // Global Scroll Progress Line
    if (pathRef.current) {
        const path = pathRef.current;
        const pathLength = anime.setDashoffset(path);
        path.setAttribute('stroke-dashoffset', pathLength.toString());

        const handleScroll = () => {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPos = window.scrollY;
            const progress = Math.min(Math.max(scrollPos / docHeight, 0), 1);

            // Draw the line based on scroll
            path.style.strokeDashoffset = (pathLength - (pathLength * progress)).toString();
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="bg-ui-dark min-h-screen text-slate-100 font-sans selection:bg-nobel-gold selection:text-ui-blue w-full overflow-x-hidden">
      <SEO
        title="History of Unionism"
        description="A journey through time: The evolution of student activism from Bologna to Ibadan."
        image="/screenshots/history.png"
      />

      <Navbar isMenuOpen={false} setIsMenuOpen={() => {}} user={null} handleLogout={() => {}} />

      {/* Global Fixed Background Path */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 hidden lg:block">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
           <path
             ref={pathRef}
             d="M 50 0 C 50 10, 40 20, 40 30 S 60 40, 60 50 S 50 60, 50 70 S 40 80, 40 90 S 50 100, 50 100"
             fill="none"
             stroke="#C5A059"
             strokeWidth="0.5"
             vectorEffect="non-scaling-stroke"
           />
        </svg>
      </div>

      <main className="relative">
        {/* 1. Hero with Three.js */}
        <div className="relative h-screen w-full overflow-hidden">
             <div className="absolute inset-0 z-0">
                <Suspense fallback={<div className="w-full h-full bg-black"></div>}>
                    <ThreeHero />
                </Suspense>
             </div>
             <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center pointer-events-none">
                <h1 className="text-6xl md:text-9xl font-bold font-serif text-white mix-blend-difference tracking-tighter">
                    THE CHRONICLE
                </h1>
                <p className="mt-6 text-xl text-nobel-gold/80 uppercase tracking-[0.5em]">
                    Of Student Unionism
                </p>
             </div>
        </div>

        {/* 2. Global Origins (Anime.js) */}
        <div className="relative z-10 bg-gradient-to-b from-transparent to-ui-dark">
            <GlobalOrigins />
        </div>

        {/* 3. African Context (GSAP Horizontal) */}
        <div className="relative z-10">
            <AfricanContext />
        </div>

        {/* 4. Nigerian Evolution (Framer Motion) */}
        <div className="relative z-10">
            <NigerianEvolution />
        </div>

        {/* 5. UI/UISU Eras (Mixed Parallax) */}
        <div className="relative z-10">
            <UISUEras />
        </div>

        {/* Footer Area */}
        <div className="py-32 bg-black text-center relative z-10">
            <h2 className="text-4xl font-serif text-slate-500 mb-8">History is still being written.</h2>
            <div className="w-px h-24 bg-gradient-to-b from-nobel-gold to-transparent mx-auto"></div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HistoryPage;
