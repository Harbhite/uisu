import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Library, Briefcase, GraduationCap, Heart, Brain,
  Rocket, ShoppingBag, Compass, Users, Activity,
  ArrowLeft, Search
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
  health: Activity
};

const colorMap: { [key: string]: string } = {
  academic: 'bg-pink-200',
  career: 'bg-lime-300',
  scholarship: 'bg-amber-400',
  wellness: 'bg-rose-100',
  study: 'bg-violet-200',
  skills: 'bg-orange-300',
  market: 'bg-teal-200',
  freshers: 'bg-indigo-200',
  alumni: 'bg-cyan-200',
  health: 'bg-red-200'
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const ResourcesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = resourceCategories.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <SEO
        title="Student Resources"
        description="Access a wealth of resources including academic materials, career tips, scholarships, and more."
      />

      <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-8"
        >
          <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Back to Home</span>
        </button>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-6xl font-serif text-slate-900 leading-tight mb-4">
            Resources for <span className="italic text-slate-400">your success</span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto mb-8">
            Everything you need to excel in your academic journey.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative mb-16">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Try a search instead"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-lg outline-none"
            />
          </div>
        </motion.div>

        {/* Category Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-6">Browse by subject</h2>

          {filteredResources.length === 0 ? (
             <div className="text-center py-12">
               <p className="text-slate-500">No resources found matching your search.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map((resource) => {
                const Icon = iconMap[resource.id];
                const bgColor = colorMap[resource.id] || 'bg-slate-100';

                return (
                  <motion.div
                    key={resource.id}
                    variants={itemVariants}
                    onClick={() => navigate(resource.path)}
                    className={`
                      ${bgColor} rounded-2xl p-6 cursor-pointer transition-all duration-300
                      hover:shadow-lg hover:-translate-y-1
                      min-h-[120px] flex items-center justify-between relative overflow-hidden group
                    `}
                  >
                     {/* Title */}
                     <div className="z-10 relative max-w-[70%]">
                        <h3 className="font-serif text-2xl font-bold text-slate-900 leading-tight">
                          {resource.title}
                        </h3>
                     </div>

                    {/* Icon */}
                    <div className="z-10 relative w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                      {Icon && <Icon size={32} className="text-slate-900" />}
                    </div>

                    {/* Decorative Background Element (Subtle) */}
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResourcesPage;
