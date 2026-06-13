import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Loader2,
  Shield,
  Crown,
  Users,
  Search,
  ChevronRight,
  Sparkles,
  BookOpen,
  Award,
} from 'lucide-react';
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
  hall_type?: string | null;
  established_year?: number | null;
  capacity?: number | null;
}

type HallType = 'all' | 'male' | 'female' | 'mixed';

const HORPage = () => {
  const navigate = useNavigate();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<HallType>('all');
  const [hoveredHall, setHoveredHall] = useState<string | null>(null);

  // Fetch halls from Supabase
  useEffect(() => {
    const fetchHalls = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('halls')
        .select('id, name, alias, motto, description, color, slug, hall_type, established_year, capacity')
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

  // Filter and search logic
  const filteredHalls = useMemo(() => {
    return halls.filter((hall) => {
      const matchesSearch =
        hall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hall.alias?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hall.motto?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        activeFilter === 'all' ||
        (hall.hall_type && hall.hall_type.toLowerCase() === activeFilter);

      return matchesSearch && matchesFilter;
    });
  }, [halls, searchQuery, activeFilter]);

  // Get type icon and label
  const getTypeInfo = (hallType: string | null | undefined) => {
    const type = hallType?.toLowerCase() || 'mixed';
    const icons: Record<string, React.ReactNode> = {
      male: <Shield size={16} className="text-blue-600" />,
      female: <Crown size={16} className="text-pink-600" />,
      mixed: <Users size={16} className="text-purple-600" />,
    };
    const labels: Record<string, string> = {
      male: 'Male Hall',
      female: 'Female Hall',
      mixed: 'Mixed Hall',
    };
    return { icon: icons[type] || icons.mixed, label: labels[type] || 'Mixed Hall' };
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const hallCardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    hover: { y: -8, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO
        title="The Republics - Halls of Residence | UISU"
        description="Explore the Halls of Residence of the University of Ibadan. Discover the autonomous republics, their histories, leadership, and vibrant cultures."
        image="/og/og-campus-map.png"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Halls of Residence', url: '/halls' },
        ]}
      />

      <div className="pt-32 pb-20">
        {/* Back Button */}
        <div className="container mx-auto px-6 mb-16">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/')}
            className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-600 hover:text-nobel-gold transition-colors"
          >
            <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
              <ArrowLeft size={14} />
            </div>
            <span>Back to Home</span>
          </motion.button>
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-6 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-1 w-12 bg-nobel-gold" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-500">
              Autonomous Territories
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl font-serif text-ui-blue leading-[0.95] mb-4">
              The <span className="italic text-slate-300">Republics</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed font-light">
              The foundational constituencies of the Union. Each hall is an autonomous republic with its own culture, traditions, and leadership. Explore the histories, mottos, and vibrant communities that define the residential experience at the University of Ibadan.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-4 md:gap-6 mb-12"
          >
            <div className="bg-white border border-slate-200 p-6 rounded-lg">
              <div className="text-3xl md:text-4xl font-serif text-nobel-gold mb-2">
                {halls.length}
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Halls
              </p>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-lg">
              <div className="text-3xl md:text-4xl font-serif text-nobel-gold mb-2">
                {halls.filter((h) => h.hall_type?.toLowerCase() === 'male').length}
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Male Halls
              </p>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-lg">
              <div className="text-3xl md:text-4xl font-serif text-nobel-gold mb-2">
                {halls.filter((h) => h.hall_type?.toLowerCase() === 'female').length}
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Female Halls
              </p>
            </div>
          </motion.div>
        </div>

        {/* Search & Filter Section */}
        <div className="container mx-auto px-6 mb-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Search Bar */}
            <motion.div variants={itemVariants} className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search halls by name, alias, or motto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nobel-gold focus:border-transparent transition-all"
              />
            </motion.div>

            {/* Filter Tabs */}
            <motion.div variants={itemVariants} className="flex gap-3 flex-wrap">
              {(['all', 'male', 'female', 'mixed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                    activeFilter === filter
                      ? 'bg-ui-blue text-white shadow-lg'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-nobel-gold hover:text-nobel-gold'
                  }`}
                >
                  {filter === 'all' ? 'All Halls' : filter === 'male' ? 'Male' : filter === 'female' ? 'Female' : 'Mixed'}
                </button>
              ))}
            </motion.div>

            {/* Results Count */}
            <motion.p variants={itemVariants} className="text-sm text-slate-500">
              Showing <span className="font-bold text-slate-700">{filteredHalls.length}</span> of{' '}
              <span className="font-bold text-slate-700">{halls.length}</span> halls
            </motion.p>
          </motion.div>
        </div>

        {/* Halls Grid */}
        <div className="container mx-auto px-6">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-24"
            >
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </motion.div>
          ) : filteredHalls.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No halls found matching your search.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="mt-4 text-nobel-gold font-bold text-sm uppercase tracking-wider hover:underline"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredHalls.map((hall, index) => {
                const { icon, label } = getTypeInfo(hall.hall_type);
                const isHovered = hoveredHall === hall.id;

                return (
                  <Link to={`/governance/hall/${hall.slug}`} key={hall.id}>
                    <motion.div
                      variants={hallCardVariants}
                      whileHover="hover"
                      onHoverStart={() => setHoveredHall(hall.id)}
                      onHoverEnd={() => setHoveredHall(null)}
                      className="relative overflow-hidden group h-full cursor-pointer"
                    >
                      {/* Card Background */}
                      <div
                        className="absolute inset-0 transition-all duration-700"
                        style={{
                          backgroundColor: hall.color || '#003366',
                        }}
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/40" />

                      {/* Animated Accent */}
                      <motion.div
                        className="absolute -bottom-32 -right-32 w-64 h-64 bg-white/5 rounded-full blur-3xl"
                        animate={{ scale: isHovered ? 1.2 : 1 }}
                        transition={{ duration: 0.6 }}
                      />

                      {/* Content */}
                      <div className="relative z-10 p-8 flex flex-col h-full min-h-[420px]">
                        {/* Header: Icon & Type Badge */}
                        <div className="flex items-start justify-between mb-6">
                          <motion.div
                            className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg"
                            animate={{ scale: isHovered ? 1.1 : 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {icon}
                          </motion.div>
                          {hall.alias && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="px-3 py-1.5 bg-nobel-gold/20 text-nobel-gold text-[10px] font-bold uppercase tracking-[0.15em] border border-nobel-gold/40 rounded"
                            >
                              {hall.alias}
                            </motion.span>
                          )}
                        </div>

                        {/* Hall Name */}
                        <h3 className="text-3xl md:text-4xl font-serif text-white mb-2 leading-[1.1] line-clamp-2">
                          {hall.name}
                        </h3>

                        {/* Type Label */}
                        <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-4">
                          {label}
                        </p>

                        {/* Motto */}
                        {hall.motto && (
                          <p className="font-serif italic text-white/70 text-sm mb-6 line-clamp-2">
                            "{hall.motto}"
                          </p>
                        )}

                        {/* Description */}
                        {hall.description && (
                          <p className="text-white/60 leading-relaxed text-sm font-light mb-6 line-clamp-3 flex-grow">
                            {hall.description}
                          </p>
                        )}

                        {/* Established Year */}
                        {hall.established_year && (
                          <div className="flex items-center gap-2 text-white/50 text-xs mb-6">
                            <BookOpen size={14} />
                            <span>Established {hall.established_year}</span>
                          </div>
                        )}

                        {/* CTA Footer */}
                        <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between group/cta">
                          <span className="text-xs font-bold uppercase tracking-[0.15em] text-white group-hover/cta:tracking-[0.2em] transition-all duration-300">
                            Explore Hall
                          </span>
                          <motion.div
                            className="w-6 h-0.5 bg-white"
                            animate={{ width: isHovered ? 24 : 24, opacity: isHovered ? 1 : 0.7 }}
                            transition={{ duration: 0.3 }}
                          />
                          <ChevronRight size={16} className="text-white opacity-0 group-hover/cta:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
          className="container mx-auto px-6 mt-24 pt-16 border-t border-slate-200"
        >
          <div className="bg-gradient-to-r from-ui-blue to-ui-dark rounded-xl p-12 text-white text-center">
            <Award className="w-12 h-12 mx-auto mb-4 text-nobel-gold" />
            <h2 className="text-4xl font-serif mb-4">Find Your Republic</h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              Each hall represents a unique community with its own traditions, leadership, and culture. Discover where you belong within the University of Ibadan's residential ecosystem.
            </p>
            <Link
              to="/campus-map"
              className="inline-flex items-center gap-2 px-8 py-4 bg-nobel-gold text-ui-blue font-bold text-sm uppercase tracking-wider rounded-lg hover:shadow-lg transition-all"
            >
              <MapPin size={18} />
              View Campus Map
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HORPage;
