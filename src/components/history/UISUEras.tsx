import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { DecryptionText } from './DecryptionText';

const ArtifactVisual = () => {
    return (
        <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-black/20 to-nobel-gold/5">
             <div className="relative w-48 h-48 animate-[spin_20s_linear_infinite]">
                <div className="absolute inset-0 border border-nobel-gold/20 rounded-full animate-[spin_5s_linear_infinite_reverse]"></div>
                <div className="absolute inset-8 border border-nobel-gold/40 rounded-full rotate-45"></div>
                <div className="absolute inset-16 border border-nobel-gold/60 rounded-full animate-pulse"></div>
                <svg className="absolute inset-0 w-full h-full text-nobel-gold/30" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                    <circle cx="50" cy="50" r="48" strokeDasharray="4 4" />
                </svg>
             </div>
             <div className="absolute inset-0 bg-nobel-gold/5 blur-3xl rounded-full scale-50 pointer-events-none"></div>
        </div>
    )
}

const EraSection = ({ year, title, children, align = 'left' }: { year: string, title: string, children: React.ReactNode, align?: 'left' | 'right' }) => {
    return (
        <div className={`flex flex-col md:flex-row ${align === 'right' ? 'md:flex-row-reverse' : ''} items-center gap-12 py-32`}>
            <div className="flex-1">
                <motion.div
                    initial={{ opacity: 0, x: align === 'left' ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                >
                    <h3 className="text-8xl font-bold text-white/5 mb-[-2rem] relative z-0">{year}</h3>
                    <h4 className="text-4xl font-serif font-bold text-nobel-gold relative z-10 mb-6">
                        <DecryptionText text={title} />
                    </h4>
                    <div className="text-slate-300 text-lg leading-relaxed space-y-4">
                        {children}
                    </div>
                </motion.div>
            </div>
            <div className="flex-1 w-full h-80 bg-white/5 rounded-3xl overflow-hidden border border-white/10 relative">
                 <div className="absolute inset-0">
                    <ArtifactVisual />
                 </div>
                 <div className="absolute bottom-4 left-6 text-xs text-white/30 uppercase tracking-widest">
                    Artifact: The Aluta Knot (Simulation)
                 </div>
            </div>
        </div>
    )
}

export const UISUEras = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, -200]);

    return (
        <section ref={containerRef} className="min-h-screen py-24 px-6 relative overflow-hidden">
            {/* Parallax Background Title */}
            <motion.div style={{ y }} className="absolute top-20 right-10 text-[20vw] font-bold text-black/50 md:text-black/10 whitespace-nowrap pointer-events-none select-none mix-blend-overlay">
                UI STUDENTS' UNION
            </motion.div>

            <div className="container mx-auto relative z-10 max-w-6xl">
                <EraSection year="1948" title="The Foundation">
                    <p>
                        Established as an affiliate of the University of London, the University College Ibadan opened its doors.
                        The Students' Union was formed almost immediately, modeled after the British parliamentary system.
                    </p>
                    <p>
                        It was a gentleman's club of sorts—debates, dinners, and rigorous intellectualism. The first President led a Union that was small, elite, and deeply influential.
                    </p>
                </EraSection>

                <EraSection year="1971" title="Kunle Adepeju" align="right">
                    <p>
                        The innocence of the early years was shattered on February 1, 1971.
                        A protest over cafeteria conditions and hall management escalated. Police were called in.
                    </p>
                    <p>
                        <strong>Kunle Adepeju</strong>, a second-year student, was shot dead. He became the first martyr of student unionism in Nigeria.
                        His death radicalized the Union, transforming it from a consultative body to a resistance movement.
                    </p>
                </EraSection>

                <EraSection year="1990s" title="The Dark Ages">
                    <p>
                        The 90s were characterized by military dictatorship and the rise of campus cultism.
                        The Union faced an existential threat: infiltration by violent groups and suppression by the state.
                    </p>
                    <p>
                        The Union was proscribed multiple times. Yet, underground movements kept the flame alive.
                        Leaders were jailed, expelled, or forced into exile.
                    </p>
                </EraSection>

                <EraSection year="2000s" title="The Reinstatement" align="right">
                    <p>
                        With the return to democracy in 1999, the Union fought for its reinstatement.
                        The 2000s saw the rebuilding of structures—the CEC and the SRC.
                    </p>
                    <p>
                        New challenges emerged: fees, accommodation, and the struggle to maintain relevance in a digital age.
                    </p>
                </EraSection>

                <EraSection year="TODAY" title="The Digital Vanguard">
                    <p>
                        Today, the University of Ibadan Students' Union is evolving.
                        We move beyond just "Aluta" of the streets to intellectual militancy.
                    </p>
                    <p>
                        From the Academic Bank to Digital skill acquisition, the Union is redefining what it means to serve the modern student.
                    </p>
                </EraSection>
            </div>
        </section>
    );
};
