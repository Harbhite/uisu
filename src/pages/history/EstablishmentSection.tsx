import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, GraduationCap, HandMetal, Library, BookOpen } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const CrowdStrip = ({ direction = 1, speed = 1 }: { direction?: number, speed?: number }) => {
    // Generate a "crowd" of icons
    const icons = [Users, GraduationCap, HandMetal, Library, BookOpen];
    const crowd = Array.from({ length: 30 }).map((_, i) => {
        const Icon = icons[i % icons.length];
        return (
            <div key={i} className="flex flex-col items-center justify-end px-2 transform hover:-translate-y-2 transition-transform duration-300">
                <Icon size={40 + Math.random() * 20} className="text-ui-dark opacity-80" strokeWidth={1} />
            </div>
        )
    });

    return (
        <div className="flex flex-row flex-nowrap w-[200vw] overflow-hidden py-4 border-b border-ui-dark/10">
            {crowd}
            {crowd} {/* Repeat for density */}
        </div>
    )
}

export const EstablishmentSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const crowdRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
        // Pin the text
        ScrollTrigger.create({
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom bottom",
            pin: textRef.current,
            scrub: true,
        });

        // Parallax/Movement for crowd
        gsap.to(crowdRef.current, {
            xPercent: -50,
            ease: "none",
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        });

        // Text reveal
        gsap.from(textRef.current, {
            scale: 0.8,
            opacity: 0,
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top center",
                end: "center center",
                scrub: true
            }
        })

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="h-[200vh] w-full relative bg-nobel-cream text-ui-dark overflow-hidden flex flex-col justify-end">

        {/* Pinned Title Container */}
        <div className="absolute top-0 left-0 w-full h-screen flex flex-col items-center justify-center z-10 pointer-events-none">
            <h1 ref={textRef} className="text-[12vw] leading-[0.9] font-serif font-bold text-center text-ui-dark tracking-tighter">
                ONCE IN A <br />
                <span className="italic text-nobel-gold">LIFETIME</span>
            </h1>
            <p className="mt-8 text-xl font-sans max-w-lg text-center opacity-80">
                From the Ashby Commission to the establishment of the premier university. The struggle for student rights begins here.
            </p>
        </div>

        {/* Parallax Crowd at Bottom */}
        <div ref={crowdRef} className="w-[400vw] flex flex-col justify-end pb-0 opacity-90 grayscale hover:grayscale-0 transition-all duration-700">
            {/* Multiple rows to simulate depth */}
            <div className="translate-x-[10vw] opacity-50 scale-90"><CrowdStrip speed={0.5} /></div>
            <div className="-translate-x-[20vw] opacity-70 scale-95 z-10"><CrowdStrip speed={0.8} /></div>
            <div className="translate-x-[5vw] z-20"><CrowdStrip speed={1.2} /></div>
        </div>
    </section>
  );
};
