import React from 'react';
import { motion } from 'framer-motion';

const eras = [
    { title: "The Colonial Era", years: "1948 - 1960", color: "bg-amber-900/40", desc: "British traditions met Nigerian nationalism." },
    { title: "The Golden Age", years: "1960 - 1975", color: "bg-blue-900/40", desc: "Independence, expansion, and the rise of radical unionism." },
    { title: "The Resistance", years: "1978 - 1999", color: "bg-red-900/40", desc: "Ali Must Go, Anti-SAP, and the fight for democracy." },
    { title: "The Digital Turn", years: "2000 - Present", color: "bg-emerald-900/40", desc: "Information technology and intellectual unionism." },
];

export const LegacyGallery: React.FC = () => {
    return (
        <section className="min-h-screen bg-ui-dark py-32 px-6">
            <div className="container mx-auto">
                <div className="mb-24 text-center">
                    <h2 className="text-5xl md:text-7xl font-serif text-white mb-6">Eras of Evolution</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        The Union has worn many faces over the decades. Each era defined by its challenges and its champions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {eras.map((era, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.6 }}
                            viewport={{ once: true }}
                            className={`group relative h-[60vh] rounded-[2rem] overflow-hidden ${era.color} border border-white/5 p-8 flex flex-col justify-between hover:border-nobel-gold/50 transition-colors duration-500`}
                        >
                            {/* Abstract Background Noise */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('/noise.svg')] mix-blend-overlay"></div>

                            <div className="relative z-10">
                                <span className="inline-block px-4 py-2 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest text-white mb-4 backdrop-blur-sm">
                                    {era.years}
                                </span>
                                <h3 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                                    {era.title}
                                </h3>
                            </div>

                            <div className="relative z-10 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                <p className="text-xl text-slate-200 font-serif leading-relaxed">
                                    {era.desc}
                                </p>
                                <div className="mt-6 w-12 h-12 rounded-full bg-nobel-gold flex items-center justify-center text-ui-dark">
                                    <span className="text-xl">↗</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
