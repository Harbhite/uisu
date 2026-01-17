import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const AfricanContext = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const slider = sliderRef.current;

    if (!container || !slider) return;

    const ctx = gsap.context(() => {
        const panels = gsap.utils.toArray(".panel");
        gsap.to(panels, {
            xPercent: -100 * (panels.length - 1),
            ease: "none",
            scrollTrigger: {
                trigger: container,
                pin: true,
                scrub: 1,
                // snap: 1 / (panels.length - 1),
                end: () => "+=" + slider.offsetWidth
            }
        });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="h-screen overflow-hidden bg-gradient-to-br from-black to-ui-dark relative">
       <div className="absolute top-10 left-10 z-10">
            <h2 className="text-4xl font-serif text-nobel-gold">The African Awakening</h2>
            <p className="text-sm text-slate-400">Scroll to explore &rarr;</p>
       </div>

       <div ref={sliderRef} className="flex h-full w-[400vw]">
          {/* Panel 1: WASU */}
          <div className="panel w-screen h-full flex flex-col justify-center items-center p-12 border-r border-white/10 relative">
             <div className="max-w-4xl text-center">
                <h3 className="text-9xl font-bold text-white/5 absolute top-1/4 left-1/2 -translate-x-1/2">WASU</h3>
                <h4 className="text-6xl font-bold text-white mb-6 relative z-10">1925</h4>
                <p className="text-2xl text-slate-300 leading-relaxed max-w-2xl mx-auto relative z-10">
                   Ladipo Solanke founds the <strong>West African Students' Union</strong> in London.
                   It wasn't just a union; it was the intellectual engine room for West African independence.
                </p>
             </div>
          </div>

          {/* Panel 2: Anti-Colonialism */}
          <div className="panel w-screen h-full flex flex-col justify-center items-center p-12 border-r border-white/10 bg-ui-blue/10">
             <div className="grid grid-cols-2 gap-12 max-w-6xl items-center">
                <div className="space-y-6">
                    <h3 className="text-5xl font-serif text-nobel-gold">The Vanguard</h3>
                    <p className="text-xl text-slate-300">
                        Students became the primary agitators against colonial rule. From the Gold Coast to Lagos, the call for "Self-Government Now" echoed in lecture halls before it reached parliaments.
                    </p>
                </div>
                <div className="h-96 w-full bg-slate-800 rounded-lg flex items-center justify-center border border-white/20">
                    <span className="text-slate-500 italic">Archival Image Placeholder</span>
                </div>
             </div>
          </div>

          {/* Panel 3: NUNS */}
          <div className="panel w-screen h-full flex flex-col justify-center items-center p-12 border-r border-white/10">
             <div className="text-center">
                 <h3 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-white mb-8">NUNS</h3>
                 <p className="text-3xl text-white font-light">1956: National Union of Nigerian Students</p>
                 <p className="mt-6 text-slate-400 max-w-xl mx-auto">
                    Inaugurated at University College Ibadan. The first truly national platform for Nigerian students, transcending ethnic and regional divides.
                 </p>
             </div>
          </div>

          {/* Panel 4: Soweto */}
          <div className="panel w-screen h-full flex flex-col justify-center items-center p-12 bg-red-900/20">
             <h3 className="text-9xl font-bold text-red-500/20 absolute">1976</h3>
             <div className="relative z-10 text-center max-w-4xl">
                 <h4 className="text-6xl font-bold text-white mb-8">Soweto Uprising</h4>
                 <p className="text-2xl text-slate-200">
                    The defining moment of African student activism. 20,000 students marched.
                    Their sacrifice proved that students possess the power to shake the foundations of tyranny.
                 </p>
             </div>
          </div>
       </div>
    </section>
  );
};
