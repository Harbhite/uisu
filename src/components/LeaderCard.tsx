import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Leader } from '@/lib/data';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export const LeaderCard = ({ leader }: { leader: Leader }) => (
    <motion.div
        variants={itemVariants}
        className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-nobel-gold hover:shadow-lg transition-all duration-300"
    >
        <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
             {/* Placeholder for actual image */}
             <div className="absolute inset-0 flex items-center justify-center bg-slate-200 text-slate-400">
                <User size={64} />
             </div>
             <img src={leader.image} alt={leader.name} className="w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                 <div className="flex gap-4 text-white">
                     {leader.socials.twitter && <a href={leader.socials.twitter} className="hover:text-nobel-gold transition-colors"><Twitter size={18} /></a>}
                     {leader.socials.linkedin && <a href={leader.socials.linkedin} className="hover:text-nobel-gold transition-colors"><Linkedin size={18} /></a>}
                     {leader.socials.instagram && <a href={leader.socials.instagram} className="hover:text-nobel-gold transition-colors"><Instagram size={18} /></a>}
                 </div>
             </div>
        </div>

        <div className="p-6">
            <div className="text-xs font-bold text-nobel-gold uppercase tracking-widest mb-2">{leader.role}</div>
            <h3 className="font-serif text-xl text-slate-900 mb-3">{leader.name}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-3">{leader.bio}</p>

            <a href={`mailto:${leader.email}`} className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-ui-blue transition-colors uppercase tracking-wider">
                <Mail size={12} /> Email Office
            </a>
        </div>
    </motion.div>
);
