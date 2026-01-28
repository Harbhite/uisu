import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Loader2, Star, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';

interface Hall {
  id: string;
  name: string;
  alias: string | null;
  motto: string | null;
  description: string | null;
  color: string | null;
  slug: string;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const HallsPage = () => {
  const navigate = useNavigate();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHalls = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('halls')
        .select('id, name, alias, motto, description, color, slug')
        .order('name');

      if (error) {
        console.error('Error fetching halls:', error);
      } else {
        setHalls(data || []);
      }
      setLoading(false);
    };

    fetchHalls();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-16">
      <SEO
        title="The Republics - Halls of Residence"
        description="Explore the Halls of Residence of the University of Ibadan. The autonomous republics within the union."
        image="/og/pages-screenshot/halls.png"
      />
      <div className="container mx-auto px-6">
        <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-12"
        >
            <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
                <ArrowLeft size={14} />
            </div>
            <span>Back to Home</span>
        </button>

        <div className="mb-20 relative">
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-4"
             >
                <Shield className="text-nobel-gold w-6 h-6" fill="currentColor" />
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-500">Autonomous Territories</span>
             </motion.div>

             <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-9xl font-serif text-ui-blue leading-[0.9]"
             >
                The <br/> <span className="italic text-slate-300">Republics</span>
             </motion.h1>

             <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 text-xl md:text-2xl text-slate-600 max-w-2xl leading-relaxed font-light"
             >
                The foundational constituencies of the Union. Explore the traditions, history, and leadership of each Hall.
             </motion.p>
        </div>

        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            ) : halls.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    No halls found
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {halls.map((hall, index) => (
                        <Link to={`/governance/hall/${hall.slug}`} key={hall.id}>
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -6, scale: 1.02 }}
                                className="relative overflow-hidden group cursor-pointer h-full shadow-lg hover:shadow-2xl transition-all duration-500"
                                style={{
                                    backgroundColor: hall.color || '#003366',
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30"></div>
                                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>

                                <div className="relative z-10 p-8 flex flex-col h-[420px]">
                                    {/* Header with icon and alias badge */}
                                    <div className="flex items-center gap-3 mb-6">
                                        <motion.div
                                            className="p-3 bg-white/10 backdrop-blur-sm border border-white/20"
                                            animate={{ scale: [1, 1.03, 1] }}
                                            transition={{ duration: 2.5 + index * 0.2, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <MapPin size={20} className="text-nobel-gold" />
                                        </motion.div>
                                        {hall.alias && (
                                            <span className="px-3 py-1.5 bg-nobel-gold/20 text-nobel-gold text-[10px] font-bold uppercase tracking-[0.15em] border border-nobel-gold/30">
                                                {hall.alias}
                                            </span>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <h3 className="text-3xl md:text-4xl font-serif mb-3 leading-[1.1] text-white">
                                        {hall.name}
                                    </h3>

                                    {/* Motto */}
                                    {hall.motto && (
                                        <p className="font-serif italic text-white/70 text-base mb-4">"{hall.motto}"</p>
                                    )}

                                    {/* Description */}
                                    {hall.description && (
                                        <p className="text-white/60 leading-relaxed text-sm font-light mb-6 line-clamp-3 flex-grow">
                                            {hall.description}
                                        </p>
                                    )}

                                    {/* Explore link at bottom */}
                                    <div className="mt-auto flex items-center gap-3 pt-6 border-t border-white/10">
                                        <span className="text-xs font-bold uppercase tracking-[0.15em] text-white group-hover:tracking-[0.2em] transition-all duration-300">
                                            Enter Territory
                                        </span>
                                        <motion.div
                                            className="w-8 group-hover:w-14 h-0.5 bg-white transition-all duration-500"
                                            animate={{ opacity: [0.7, 1, 0.7] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            )}
        </motion.div>
      </div>
    </div>
  );
};

export default HallsPage;
