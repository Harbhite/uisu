import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { historyTimeline } from './content';

gsap.registerPlugin(ScrollTrigger);

const TimelineCard = ({
    year,
    title,
    subtitle,
    description,
    chapter
}: {
    year: string,
    title: string,
    subtitle: string,
    description: string[],
    chapter: string
}) => {
    return (
        <div className="min-w-[90vw] md:min-w-[45vw] lg:min-w-[35vw] h-[80vh] flex flex-col justify-center px-8 md:px-12 border-l border-white/10 relative group hover:bg-white/5 transition-colors duration-500">
            {/* Chapter Watermark */}
            <div className="absolute top-8 left-8 text-xs font-bold tracking-[0.2em] text-nobel-gold uppercase opacity-60">
                {chapter} Phase
            </div>

            <div className="relative z-10 mt-auto mb-auto">
                <span className="text-stroke-sm text-transparent font-bold text-7xl md:text-9xl block mb-6 font-serif opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                    {year}
                </span>
                <h3 className="text-3xl md:text-5xl font-bold text-white mb-3 uppercase tracking-tighter leading-none">
                    {title}
                </h3>
                <h4 className="text-xl text-ui-blue-light mb-8 italic font-serif">
                    {subtitle}
                </h4>
                <div className="space-y-4">
                    {description.map((p, i) => (
                        <p key={i} className="text-base md:text-lg text-slate-300 leading-relaxed font-light">
                            {p}
                        </p>
                    ))}
                </div>
            </div>

            {/* Progress Line */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/10">
                <div className="h-full bg-nobel-gold w-0 group-hover:w-full transition-all duration-1000 ease-out" />
            </div>
        </div>
    )
}

export const TimelineJourney: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
        const sections = gsap.utils.toArray(".timeline-item");
        const totalWidth = (sections.length - 1) * 100; // rough estimate

        gsap.to(sections, {
            xPercent: -100 * (sections.length - 1),
            ease: "none",
            scrollTrigger: {
                trigger: triggerRef.current,
                pin: true,
                scrub: 1,
                // Adjust duration based on number of items to make scrolling feel substantial
                end: () => "+=" + (triggerRef.current?.offsetWidth || 0) * (sections.length / 2)
            }
        });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-ui-dark text-white overflow-hidden relative">
        <div ref={triggerRef} className="h-screen flex flex-row flex-nowrap items-center overflow-hidden">

            {/* Intro Card */}
            <div className="timeline-item min-w-[100vw] h-full flex flex-col items-center justify-center bg-ui-dark relative z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 to-ui-dark z-0"></div>
                <div className="max-w-4xl px-6 text-center z-10">
                    <h2 className="text-6xl md:text-9xl font-bold font-serif mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
                        THE TIMELINE
                    </h2>
                    <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        A definitive chronicle of struggle, evolution, and triumph. <br/>
                        From the cobbled streets of Bologna to the Student Union Building in Ibadan.
                    </p>
                    <div className="mt-16 flex flex-col items-center animate-pulse opacity-60">
                        <span className="text-nobel-gold text-xs uppercase tracking-[0.3em] mb-2">Scroll to Travel Time</span>
                        <div className="w-[1px] h-16 bg-gradient-to-b from-nobel-gold to-transparent"></div>
                    </div>
                </div>
            </div>

            {/* Timeline Loop */}
            {historyTimeline.map((node) => (
                <div key={node.id} className="timeline-item bg-ui-dark flex items-center border-r border-white/5">
                    <TimelineCard
                        year={node.year}
                        title={node.title}
                        subtitle={node.subtitle}
                        description={node.description}
                        chapter={node.chapter}
                    />
                </div>
            ))}

            {/* Outro Card */}
             <div className="timeline-item min-w-[50vw] h-full flex items-center justify-center bg-ui-dark">
                 <div className="text-center">
                    <h3 className="text-4xl font-serif italic text-slate-500">The Future is Unwritten</h3>
                 </div>
             </div>

        </div>
    </section>
  );
};
