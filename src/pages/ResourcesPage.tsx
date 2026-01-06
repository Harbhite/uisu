import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Library, Briefcase, GraduationCap, Heart, Brain,
  Rocket, ShoppingBag, Compass, Users, Activity,
  ArrowRight, Star, ArrowLeft
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
  visible: { opacity: 1, y: 0 }
};

const ResourcesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-16">
      <SEO
        title="Student Resources"
        description="Access a wealth of resources including academic materials, career tips, scholarships, and more."
      />

      <div className="container mx-auto px-6">
        <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-12"
        >
            <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
                <ArrowLeft size={14} />
            </div>
            <span>Back to Home</span>
        </button>

        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <Star className="text-nobel-gold w-6 h-6" fill="currentColor" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-500">Student Support</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif text-ui-blue leading-tight mb-6"
          >
            Resource <span className="italic text-slate-300">Hub</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 max-w-2xl font-light leading-relaxed"
          >
            Everything you need to succeed at the University of Ibadan. From lecture notes to career opportunities, we've got you covered.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {resourceCategories.map((resource) => {
            const Icon = iconMap[resource.id];
            return (
              <motion.div
                key={resource.id}
                variants={itemVariants}
                onClick={() => navigate(resource.path)}
                className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ${resource.color}`}></div>

                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 text-white shadow-lg ${resource.color}`}>
                  {Icon && <Icon size={24} />}
                </div>

                <h3 className="font-serif text-xl font-bold text-slate-900 mb-3 group-hover:text-ui-blue transition-colors">
                  {resource.title}
                </h3>

                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  {resource.description}
                </p>

                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-ui-blue transition-colors mt-auto">
                  Explore <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default ResourcesPage;
