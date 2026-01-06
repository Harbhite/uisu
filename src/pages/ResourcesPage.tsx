import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Library, Briefcase, GraduationCap, Heart, Brain,
  Rocket, ShoppingBag, Compass, Users, Activity,
  ArrowRight, Star
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';

interface ResourceCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  path: string;
}

const resources: ResourceCategory[] = [
  {
    id: 'academic',
    title: 'Academic Bank',
    description: 'E-library with course materials, past questions, and general knowledge resources.',
    icon: Library,
    color: 'bg-blue-500',
    path: '/resources/academic-bank'
  },
  {
    id: 'career',
    title: 'Career Hub',
    description: 'Job listings, internship opportunities, CV templates, and career advice.',
    icon: Briefcase,
    color: 'bg-green-500',
    path: '/resources/career-hub'
  },
  {
    id: 'scholarship',
    title: 'Scholarship Finder',
    description: 'Database of local and international funding opportunities for students.',
    icon: GraduationCap,
    color: 'bg-yellow-500',
    path: '/resources/scholarships'
  },
  {
    id: 'wellness',
    title: 'Mental Wellness',
    description: 'Resources for mental health, counseling services, and self-care tools.',
    icon: Heart,
    color: 'bg-rose-500',
    path: '/resources/mental-wellness'
  },
  {
    id: 'study',
    title: 'Study Tools',
    description: 'Productivity apps, study techniques, and time management tools.',
    icon: Brain,
    color: 'bg-purple-500',
    path: '/resources/study-tools'
  },
  {
    id: 'skills',
    title: 'Skill Up',
    description: 'Workshops, tutorials, and certification courses to boost your portfolio.',
    icon: Rocket,
    color: 'bg-orange-500',
    path: '/resources/skill-up'
  },
  {
    id: 'market',
    title: 'Student Mart',
    description: 'Buy and sell textbooks, gadgets, and hostel essentials within the campus.',
    icon: ShoppingBag,
    color: 'bg-teal-500',
    path: '/resources/student-mart'
  },
  {
    id: 'freshers',
    title: 'Freshers\' Compass',
    description: 'Orientation guides, campus maps, and survival tips for new students.',
    icon: Compass,
    color: 'bg-indigo-500',
    path: '/resources/freshers-guide'
  },
  {
    id: 'alumni',
    title: 'Alumni Network',
    description: 'Connect with past students, find mentors, and explore alumni stories.',
    icon: Users,
    color: 'bg-cyan-500',
    path: '/resources/alumni-network'
  },
  {
    id: 'health',
    title: 'Campus Health',
    description: 'Clinic schedules, emergency contacts, and physical health resources.',
    icon: Activity,
    color: 'bg-red-500',
    path: '/resources/campus-health'
  }
];

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
          {resources.map((resource) => (
            <motion.div
              key={resource.id}
              variants={itemVariants}
              onClick={() => navigate(resource.path)}
              className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ${resource.color}`}></div>

              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 text-white shadow-lg ${resource.color}`}>
                <resource.icon size={24} />
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
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ResourcesPage;
