import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Twitter, Instagram, Linkedin, ArrowUpRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Leader } from '@/lib/data';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export const LeaderCard = ({ leader }: { leader: Leader }) => {
    const showImage = leader.image && leader.image !== "/placeholder.svg";

    return (
        <motion.div 
            variants={itemVariants}
            whileHover={{ 
                y: -12, 
                scale: 1.03,
                transition: { duration: 0.3, ease: "easeOut" }
            }}
            className="relative h-full"
        >
            {/* Premium glow effect on hover */}
            <div className="absolute -inset-1 bg-gradient-to-br from-ui-blue/30 via-nobel-gold/20 to-ui-dark/30 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10 rounded-lg" />
            
            <Link 
                to={`/leaders/${leader.id}`}
                className="group block h-full bg-white border-2 border-slate-200 hover:border-nobel-gold hover:shadow-premium-lg transition-all duration-300 rounded-lg overflow-hidden flex flex-col"
            >
                {/* Image Container */}
                <div className="aspect-[4/5] bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden flex-shrink-0">
                    {/* Fallback / Placeholder View */}
                    <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-ui-blue/10 to-ui-blue/5 text-slate-300 group-hover:text-ui-blue/40 transition-all duration-500 ${showImage ? '' : 'z-10'}`}>
                        <User size={80} strokeWidth={1.5} />
                    </div>

                    {showImage && (
                        <img
                            src={leader.image}
                            alt={leader.name}
                            className="relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    )}

                    {/* Hover Overlay with gradient */}
                    <div className="absolute inset-0 z-20 bg-gradient-to-t from-ui-blue via-ui-blue/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <div className="flex gap-3 text-white">
                            {leader.socials.twitter && (
                                <motion.a 
                                    href={leader.socials.twitter} 
                                    className="p-2 bg-white/20 hover:bg-white/40 rounded-lg transition-all duration-300 backdrop-blur-sm"
                                    onClick={(e) => e.stopPropagation()}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Twitter size={18} />
                                </motion.a>
                            )}
                            {leader.socials.linkedin && (
                                <motion.a 
                                    href={leader.socials.linkedin} 
                                    className="p-2 bg-white/20 hover:bg-white/40 rounded-lg transition-all duration-300 backdrop-blur-sm"
                                    onClick={(e) => e.stopPropagation()}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Linkedin size={18} />
                                </motion.a>
                            )}
                            {leader.socials.instagram && (
                                <motion.a 
                                    href={leader.socials.instagram} 
                                    className="p-2 bg-white/20 hover:bg-white/40 rounded-lg transition-all duration-300 backdrop-blur-sm"
                                    onClick={(e) => e.stopPropagation()}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Instagram size={18} />
                                </motion.a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 border-t-2 border-slate-100 flex flex-col flex-grow">
                    <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="text-[10px] font-bold text-ui-blue uppercase tracking-widest bg-ui-blue/10 px-3 py-1 rounded-full">
                            {leader.role}
                        </span>
                        <motion.div 
                            className="text-slate-300 group-hover:text-nobel-gold transition-colors flex-shrink-0"
                            animate={{ rotate: [0, 45, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                        >
                            <ArrowUpRight size={16} />
                        </motion.div>
                    </div>
                    
                    <h3 className="font-serif text-xl font-semibold text-slate-900 mb-2 group-hover:text-ui-blue transition-colors leading-tight">
                        {leader.name}
                    </h3>
                    
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4 flex-grow">
                        {leader.bio || 'Student leader at the University of Ibadan.'}
                    </p>

                    <motion.a 
                        href={`mailto:${leader.email}`} 
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-ui-blue transition-all duration-300 uppercase tracking-widest group/link"
                        whileHover={{ x: 4 }}
                    >
                        <Mail size={12} className="group-hover/link:rotate-12 transition-transform" /> 
                        <span>Email Office</span>
                        <ExternalLink size={10} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </motion.a>
                </div>
            </Link>
        </motion.div>
    );
};
