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
        <div className="w-screen min-w-[100vw] md:w-auto md:min-w-[45vw] lg:min-w-[35vw] h-[80vh] flex flex-col justify-center px-8 md:px-16 border-l border-white/10 relative group hover:bg-white/5 transition-colors duration-500 timeline-card-content shrink-0">
            {/* Chapter Watermark */}
            <div className="absolute top-8 left-8 text-[10px] md:text-xs font-bold tracking-[0.2em] text-nobel-gold uppercase opacity-60">
                {chapter} Phase
            </div>

            <div className="relative z-10 mt-auto mb-auto w-full">
                <span className="text-stroke-sm text-transparent font-bold text-6xl md:text-8xl lg:text-9xl block mb-4 md:mb-6 font-serif opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                    {year}
                </span>
                <h3 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-3 uppercase tracking-tighter leading-none break-words">
                    {title}
                </h3>
                <h4 className="text-lg md:text-xl text-ui-blue-light mb-4 md:mb-8 italic font-serif">
                    {subtitle}
                </h4>
                <div className="space-y-4 max-h-[40vh] overflow-y-auto md:overflow-visible pr-4 custom-scrollbar">
                    {description.map((p, i) => (
                        <p key={i} className="text-sm md:text-base lg:text-lg text-slate-300 leading-relaxed font-light">
                            {p}
                        </p>
                    ))}
                </div>
            </div>

            {/* Decorative Line */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/10 hidden md:block">
                <div className="h-full bg-nobel-gold w-0 group-hover:w-full transition-all duration-1000 ease-out" />
            </div>
        </div>
    )
}

export const TimelineJourney: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
        const sections = gsap.utils.toArray(".timeline-item");

        gsap.to(sections, {
            xPercent: -100 * (sections.length - 1),
            ease: "none",
            scrollTrigger: {
                trigger: triggerRef.current,
                pin: true,
                scrub: 1,
                end: () => "+=" + (triggerRef.current?.offsetWidth || 0) * (sections.length / 1.5),
                onUpdate: (self) => {
                    if (progressRef.current) {
                        progressRef.current.style.width = `${self.progress * 100}%`;
                    }
                }
            }
        });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-ui-dark text-white overflow-hidden relative">
        <div ref={triggerRef} className="h-screen flex flex-row flex-nowrap items-center overflow-hidden relative">

            {/* Intro Card */}
            <div className="timeline-item w-screen min-w-[100vw] h-full flex flex-col items-center justify-center bg-ui-dark relative z-10 shrink-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 to-ui-dark z-0"></div>
                <div className="max-w-4xl px-8 text-center z-10">
                    <h2 className="text-5xl md:text-8xl lg:text-9xl font-bold font-serif mb-6 md:mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
                        THE TIMELINE
                    </h2>
                    <p className="text-lg md:text-2xl text-slate-300 max-w-xl md:max-w-2xl mx-auto leading-relaxed mb-12">
                        A definitive chronicle of struggle, evolution, and triumph. <br className="hidden md:block"/>
                        From Bologna to Ibadan.
                    </p>
                    <div className="flex flex-col items-center animate-pulse opacity-60">
                        <span className="text-nobel-gold text-xs uppercase tracking-[0.3em] mb-2">Scroll to Travel Time</span>
                        <div className="w-[1px] h-12 md:h-16 bg-gradient-to-b from-nobel-gold to-transparent"></div>
                    </div>
                </div>
            </div>

            {/* Timeline Loop */}
            {historyTimeline.map((node) => (
                <div key={node.id} className="timeline-item bg-ui-dark flex items-center border-r border-white/5 shrink-0">
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
             <div className="timeline-item w-screen min-w-[100vw] md:w-auto md:min-w-[50vw] h-full flex items-center justify-center bg-ui-dark shrink-0">
                 <div className="text-center px-4">
                    <h3 className="text-3xl md:text-5xl font-serif italic text-slate-500 mb-4">The Future is Unwritten</h3>
                    <p className="text-slate-600">But it belongs to us.</p>
                 </div>
             </div>

             {/* Journey Progress Bar (Pinned with container) */}
             <div className="absolute bottom-0 left-0 w-full h-1 md:h-2 bg-white/5 z-50">
                <div ref={progressRef} className="h-full bg-nobel-gold shadow-[0_0_10px_rgba(197,160,89,0.5)] w-0" />
             </div>

        </div>
    </section>
  );
};
