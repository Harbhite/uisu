import { useEffect, useRef } from 'react';
import anime from 'animejs';
import { Globe } from 'lucide-react';
import { DecryptionText } from './DecryptionText';

export const GlobalOrigins = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
                targets: '.bologna-card',
                translateX: [-100, 0],
                opacity: [0, 1],
                delay: anime.stagger(200),
                easing: 'spring(1, 80, 10, 0)'
            });

            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const title = "The Global Genesis";

  return (
    <section ref={sectionRef} className="min-h-screen relative py-24 px-6 overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
         <Globe size={800} strokeWidth={0.5} className="absolute -right-1/4 top-10" />
      </div>

      <div className="container mx-auto relative z-10">
        <h2 className="text-6xl md:text-8xl font-serif font-bold mb-16 text-slate-100">
          <DecryptionText text={title} />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bologna-card bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-xl opacity-0">
                <div className="text-nobel-gold text-5xl font-bold mb-4">1088 AD</div>
                <h3 className="text-2xl text-white font-serif mb-4">University of Bologna</h3>
                <p className="text-slate-300 leading-relaxed">
                    The term <em>universitas</em> was coined not by masters, but by students.
                    Facing exploitation from locals and rigid rules, students formed guilds—or "nations"—to protect their rights.
                    This was the birth of collective bargaining in education.
                </p>
            </div>

            <div className="bologna-card bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-xl opacity-0 transform md:translate-y-24">
                <div className="text-nobel-gold text-5xl font-bold mb-4">1200 AD</div>
                <h3 className="text-2xl text-white font-serif mb-4">University of Paris</h3>
                <p className="text-slate-300 leading-relaxed">
                    The archetype of the "master's university" emerged, but student power remained pivotal.
                    Strikes and boycotts—the <em>cessatio</em>—were powerful tools used to protest police brutality and high rents.
                </p>
            </div>
        </div>
      </div>
    </section>
  );
};
