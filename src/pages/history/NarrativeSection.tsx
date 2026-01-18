import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Globe, Map, Flag } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const NarrativeCard = ({
    year,
    title,
    subtitle,
    description,
    icon: Icon
}: {
    year: string,
    title: string,
    subtitle: string,
    description: string,
    icon: any
}) => {
    return (
        <div className="min-w-[80vw] md:min-w-[60vw] h-[70vh] flex flex-col justify-center px-8 md:px-16 border-l border-white/20 relative">
            <div className="absolute top-10 left-10 opacity-20">
                <Icon size={200} strokeWidth={0.5} />
            </div>

            <div className="relative z-10">
                <span className="text-nobel-gold font-bold text-6xl md:text-8xl block mb-4 font-serif">{year}</span>
                <h3 className="text-4xl md:text-6xl font-bold text-white mb-2 uppercase tracking-tighter leading-none">{title}</h3>
                <h4 className="text-xl md:text-2xl text-slate-400 mb-8 italic">{subtitle}</h4>
                <p className="text-lg md:text-xl text-slate-300 max-w-xl leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    )
}

export const NarrativeSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
        const sections = gsap.utils.toArray(".narrative-item");

        gsap.to(sections, {
            xPercent: -100 * (sections.length - 1),
            ease: "none",
            scrollTrigger: {
                trigger: triggerRef.current,
                pin: true,
                scrub: 1,
                snap: 1 / (sections.length - 1),
                end: () => "+=" + (triggerRef.current?.offsetWidth || 0)
            }
        });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-ui-dark text-white overflow-hidden">
        <div ref={triggerRef} className="h-screen flex flex-row flex-nowrap items-center overflow-hidden">

            {/* Intro / Global */}
            <div className="narrative-item min-w-[100vw] h-full flex items-center justify-center bg-ui-dark relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 to-ui-dark z-0"></div>
                <div className="max-w-4xl px-6 text-center z-10">
                    <h2 className="text-5xl md:text-7xl font-bold font-serif mb-6">The Journey Begins</h2>
                    <p className="text-xl text-slate-300">
                        Before the University of Ibadan, there was a global movement. <br/>
                        A story of students rising to demand their rights.
                    </p>
                    <div className="mt-12 animate-bounce">
                        <span className="text-nobel-gold text-sm uppercase tracking-widest">Scroll to Explore</span>
                    </div>
                </div>
            </div>

            {/* Global Context */}
            <div className="narrative-item bg-ui-dark flex items-center">
                <NarrativeCard
                    year="1088"
                    title="Bologna & Paris"
                    subtitle="The Birth of the Guild"
                    description="The term 'universitas' was coined by students facing exploitation. In Bologna and Paris, they formed guilds (nations) to protect their rights, marking the birth of collective bargaining in education."
                    icon={Globe}
                />
            </div>

            {/* African Context */}
            <div className="narrative-item bg-ui-dark flex items-center">
                <NarrativeCard
                    year="1925"
                    title="WASU"
                    subtitle="West African Students' Union"
                    description="Founded in London by Ladipo Solanke, WASU became the training ground for West Africa's independence leaders. It wasn't just a union; it was a political force fighting against colonialism."
                    icon={Map}
                />
            </div>

            {/* Nigerian Context */}
            <div className="narrative-item bg-ui-dark flex items-center">
                <NarrativeCard
                    year="1956"
                    title="NUNS"
                    subtitle="National Union of Nigerian Students"
                    description="As Nigeria approached independence, NUNS was formed to unify student voices across the nation, setting the stage for organized student activism within the newly established universities."
                    icon={Flag}
                />
            </div>

        </div>
    </section>
  );
};
