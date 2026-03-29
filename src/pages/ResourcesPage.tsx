import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Library, Briefcase, GraduationCap, Heart, Brain,
  Rocket, ShoppingBag, Compass, Users, Activity,
  ArrowLeft, Search, ArrowRight, Star, Calculator, Grip
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { resourceCategories } from '@/lib/data';

const iconMap: { [key: string]: React.ElementType } = {
  academic: Library,
  career: Briefcase,
  scholarship: GraduationCap,
  wellness: Heart,
  study: Brain,
  skills: Rocket,
  market: ShoppingBag,
  freshers: Compass,
  alumni: Users,
  health: Activity,
  gpa: Calculator,
  calculators: Grip,
  studybuddy: Brain,
  aiquiz: Brain,
  timetable: Grip,
  gpatracker: Calculator,
  pastquestions: Library,
};

const colorMap: { [key: string]: string } = {
  academic: 'bg-ui-blue',
  career: 'bg-emerald-800',
  scholarship: 'bg-amber-700',
  wellness: 'bg-rose-800',
  study: 'bg-violet-800',
  skills: 'bg-orange-700',
  market: 'bg-teal-800',
  freshers: 'bg-indigo-800',
  alumni: 'bg-cyan-800',
  health: 'bg-red-800',
  gpa: 'bg-emerald-700',
  calculators: 'bg-violet-700',
  studybuddy: 'bg-blue-800',
  aiquiz: 'bg-rose-800'
};

interface ResourceCardProps {
  resource: typeof resourceCategories[0];
  index: number;
}

const ResourceCard = ({ resource, index }: ResourceCardProps) => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const Icon = iconMap[resource.id];
  const bgColor = colorMap[resource.id] || 'bg-slate-800';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={() => navigate(resource.path)}
      className={`
        ${bgColor} cursor-pointer shadow-xl border border-white/10 overflow-hidden group 
        transition-all duration-300 relative h-52
      `}
    >
      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between z-10 text-white">
        <div className="flex justify-between items-start">
          <div className="p-2.5 bg-white/10 backdrop-blur-md border border-white/10">
            {Icon && <Icon size={22} />}
          </div>
          <div className="w-8 h-8 flex items-center justify-center border border-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-45">
            <ArrowRight size={14} />
          </div>
        </div>
        
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-60 mb-2">Resource</p>
          <h3 className="font-serif text-2xl leading-tight tracking-tight mb-2">
            {resource.title}
          </h3>
          <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
          <div className="w-0 group-hover:w-10 h-0.5 bg-nobel-gold mt-3 transition-all duration-500" />
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-50" />
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-black/20 rounded-full blur-3xl group-hover:bg-nobel-gold/10 transition-colors duration-700"></div>
    </motion.div>
  );
};

const ResourcesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  const filteredResources = resourceCategories.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <SEO
        title="Student Resources"
        description="Access a wealth of resources including academic materials, career tips, scholarships, and more."
        image="/og/pages-screenshot/resources.png"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Resources', url: '/resources' }
        ]}
      />

      <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-nobel-gold transition-colors mb-12"
        >
          <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Back to Home</span>
        </motion.button>

        {/* Hero Section */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <Star size={16} className="text-nobel-gold" fill="currentColor" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Student Hub</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif text-ui-blue leading-tight mb-6">
            Resources for <span className="italic text-slate-400">Success</span>
          </h1>
          
          <p className="text-slate-500 max-w-xl text-lg leading-relaxed mb-10">
            Everything you need to excel in your academic journey and beyond. Curated tools, guides, and opportunities.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-base outline-none focus:border-nobel-gold focus:ring-2 focus:ring-nobel-gold/20 transition-all"
            />
          </div>
        </motion.div>

        {/* Category Cards Grid */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-0.5 bg-nobel-gold"></div>
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Browse Categories</h2>
          </div>

          {filteredResources.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white border border-slate-200"
            >
              <Search size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">No resources found matching your search.</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-nobel-gold font-medium hover:underline"
              >
                Clear search
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource, index) => (
                <ResourceCard key={resource.id} resource={resource} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <p className="text-slate-400 text-sm mb-4">
            Can't find what you're looking for?
          </p>
          <button
            onClick={() => navigate('/communities')}
            className="inline-flex items-center gap-2 text-nobel-gold font-bold text-sm uppercase tracking-widest hover:gap-4 transition-all"
          >
            <span>Join a Community</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ResourcesPage;
