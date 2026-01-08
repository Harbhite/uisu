import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Library, Briefcase, GraduationCap, Heart, Brain,
  Rocket, ShoppingBag, Compass, Users, Activity,
  ArrowRight, ArrowLeft
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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Featured resources for the text grid
  const featuredResources = [
    {
      title: "E-library with course materials",
      description: "Access past questions, lecture notes, and textbooks from all 13 faculties.",
      stat: "500+ files",
      link: "/resources/academic-bank",
      linkText: "Browse library"
    },
    {
      title: "Career opportunities",
      description: "Internships, job listings, and CV templates to kickstart your career.",
      stat: "50+ listings",
      link: "/resources/career-hub",
      linkText: "See opportunities"
    },
    {
      title: "Scholarship database",
      description: "Local and international funding opportunities curated for UI students.",
      stat: "100+ scholarships",
      link: "/resources/scholarships",
      linkText: "Find scholarships"
    },
    {
      title: "Wellness resources",
      description: "Mental health support, counseling services, and self-care tools.",
      stat: "24/7 support",
      link: "/resources/mental-wellness",
      linkText: "Get help"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <SEO
        title="Student Resources"
        description="Access a wealth of resources including academic materials, career tips, scholarships, and more."
      />

      <div className="container mx-auto px-6 lg:px-12">
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
          className="mb-16"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-slate-900 leading-[0.95] mb-8">
            Resources for<br />
            <span className="italic text-slate-400">your success</span>
          </h1>
        </motion.div>

        {/* Featured Grid - Text Links */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-8 mb-20 border-b border-slate-200 pb-16"
        >
          {featuredResources.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group"
            >
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {item.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{item.stat}</span>
                <button
                  onClick={() => navigate(item.link)}
                  className="text-sm font-semibold text-slate-900 underline underline-offset-4 hover:text-nobel-gold transition-colors"
                >
                  {item.linkText}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Category Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {resourceCategories.map((resource, index) => {
            const Icon = iconMap[resource.id];
            const bgColor = colorMap[resource.id] || 'bg-slate-100';
            const isHovered = hoveredCard === resource.id;
            
            return (
              <motion.div
                key={resource.id}
                variants={itemVariants}
                onClick={() => navigate(resource.path)}
                onMouseEnter={() => setHoveredCard(resource.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`
                  ${bgColor} rounded-2xl p-6 cursor-pointer transition-all duration-300
                  ${isHovered ? 'shadow-xl -translate-y-1' : 'shadow-sm'}
                  min-h-[280px] flex flex-col justify-between relative overflow-hidden
                `}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-slate-900/10 flex items-center justify-center mb-auto">
                  {Icon && <Icon size={24} className="text-slate-900" />}
                </div>

                {/* Content */}
                <div className="mt-auto">
                  <span className="text-xs font-medium text-slate-500 mb-2 block">
                    {String(index + 1).padStart(2, '0')}.
                  </span>
                  <h3 className="font-serif text-xl font-bold text-slate-900 mb-3 leading-tight">
                    {resource.title}
                  </h3>
                  
                  {/* Expanded content on hover */}
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: isHovered ? 'auto' : 0,
                      opacity: isHovered ? 1 : 0
                    }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                      {resource.description}
                    </p>
                  </motion.div>

                  {/* Arrow button */}
                  <motion.div
                    initial={false}
                    animate={{ 
                      opacity: isHovered ? 1 : 0,
                      x: isHovered ? 0 : -10
                    }}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-900"
                  >
                    <div className="w-8 h-8 rounded-full border border-slate-900 flex items-center justify-center">
                      <ArrowRight size={14} />
                    </div>
                  </motion.div>
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
