import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float, TorusKnot, MeshDistortMaterial } from '@react-three/drei';

const Artifact3D = () => {
    return (
        <Canvas>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Float speed={4} rotationIntensity={1} floatIntensity={2}>
                <TorusKnot args={[1, 0.3, 100, 16]}>
                    <MeshDistortMaterial color="#C5A059" speed={2} distort={0.4} roughness={0.2} />
                </TorusKnot>
            </Float>
        </Canvas>
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
                    <h4 className="text-4xl font-serif font-bold text-nobel-gold relative z-10 mb-6">{title}</h4>
                    <div className="text-slate-300 text-lg leading-relaxed space-y-4">
                        {children}
                    </div>
                </motion.div>
            </div>
            <div className="flex-1 w-full h-80 bg-white/5 rounded-3xl overflow-hidden border border-white/10 relative">
                 {/* 3D Artifact embedded in each section */}
                 <div className="absolute inset-0">
                    <Artifact3D />
                 </div>
                 <div className="absolute bottom-4 left-6 text-xs text-white/30 uppercase tracking-widest">
                    Artifact: The Aluta Knot
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
        <section ref={containerRef} className="min-h-screen py-24 px-6 relative bg-ui-blue overflow-hidden">
            {/* Parallax Background Title */}
            <motion.div style={{ y }} className="absolute top-20 right-10 text-[20vw] font-bold text-black/10 whitespace-nowrap pointer-events-none select-none">
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
