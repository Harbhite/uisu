import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Twitter, Instagram, Linkedin, ArrowUpRight } from 'lucide-react';
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
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeOut" }
            }}
            className="relative"
        >
            {/* Glow effect on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />
            
            <Link 
                to={`/leaders/${leader.id}`}
                className="group block bg-background border border-border hover:border-accent hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300"
            >
                {/* Image Container - Sharp corners */}
                <div className="aspect-[4/5] bg-muted relative overflow-hidden">
                    {/* Fallback / Placeholder View */}
                    <div className={`absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground group-hover:text-primary/60 transition-all duration-500 ${showImage ? '' : 'z-10'}`}>
                        <User size={80} strokeWidth={1} />
                    </div>

                    {showImage && (
                        <img
                            src={leader.image}
                            alt={leader.name}
                            className="relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 z-20 bg-gradient-to-t from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <div className="flex gap-4 text-primary-foreground">
                            {leader.socials.twitter && (
                                <a 
                                    href={leader.socials.twitter} 
                                    className="hover:text-accent transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Twitter size={18} />
                                </a>
                            )}
                            {leader.socials.linkedin && (
                                <a 
                                    href={leader.socials.linkedin} 
                                    className="hover:text-accent transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Linkedin size={18} />
                                </a>
                            )}
                            {leader.socials.instagram && (
                                <a 
                                    href={leader.socials.instagram} 
                                    className="hover:text-accent transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Instagram size={18} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content - Sharp corners, clean typography */}
                <div className="p-6 border-t border-border">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">
                            {leader.role}
                        </span>
                        <ArrowUpRight 
                            size={14} 
                            className="text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0 mt-0.5"
                        />
                    </div>
                    
                    <h3 className="font-serif text-xl text-foreground mb-3 group-hover:text-primary transition-colors">
                        {leader.name}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                        {leader.bio || 'Student leader at the University of Ibadan.'}
                    </p>

                    <a 
                        href={`mailto:${leader.email}`} 
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-[0.15em]"
                    >
                        <Mail size={12} /> Email Office
                    </a>
                </div>
            </Link>
        </motion.div>
    );
};
