import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Briefcase, Award, Heart, Brain, 
  ArrowRight, Users, FileText, GraduationCap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SEO } from '@/components/SEO';

const resourceCategories = [
  {
    id: 'academic-bank',
    title: 'Academic Bank',
    description: 'Course materials, lecture notes, past questions, and study resources for all faculties and departments.',
    icon: BookOpen,
    color: 'bg-blue-500',
    href: '/resources/academic-bank',
    stats: 'Course Materials & Notes'
  },
  {
    id: 'career-hub',
    title: 'Career Hub',
    description: 'CV templates, cover letter guides, interview tips, internship opportunities, and job listings for students.',
    icon: Briefcase,
    color: 'bg-emerald-500',
    href: '/resources/career-hub',
    stats: 'Jobs & Internships'
  },
  {
    id: 'scholarship-finder',
    title: 'Scholarship Finder',
    description: 'Comprehensive database of scholarships, grants, fellowships, and funding opportunities for Nigerian students.',
    icon: Award,
    color: 'bg-amber-500',
    href: '/resources/scholarship-finder',
    stats: 'Funding Opportunities'
  },
  {
    id: 'mental-wellness',
    title: 'Mental Wellness',
    description: 'Mental health resources, counseling information, stress management tips, and support services for students.',
    icon: Heart,
    color: 'bg-rose-500',
    href: '/resources/mental-wellness',
    stats: 'Support & Resources'
  },
  {
    id: 'study-tools',
    title: 'Study Tools',
    description: 'Productivity tools, study techniques, time management resources, and academic success strategies.',
    icon: Brain,
    color: 'bg-purple-500',
    href: '/resources/study-tools',
    stats: 'Learning Resources'
  }
];

const ResourcesHubPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <SEO
        title="Student Resources - UISU Archive"
        description="Access academic materials, career resources, scholarships, mental wellness support, and study tools for University of Ibadan students."
        image="/screenshots/documents.png"
      />

      <div className="container mx-auto px-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-6">
            <GraduationCap size={16} />
            Student Resources Hub
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6">
            Everything You Need<br />
            <span className="text-accent">to Succeed</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access curated resources designed to support your academic journey, career growth, 
            and personal wellbeing at the University of Ibadan.
          </p>
        </motion.div>

        {/* Resource Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {resourceCategories.map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card 
                className="h-full cursor-pointer group hover:border-accent transition-all duration-300 overflow-hidden"
                onClick={() => navigate(category.href)}
              >
                <CardContent className="p-6 h-full flex flex-col">
                  <div className={`w-14 h-14 ${category.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <category.icon className="text-white" size={28} />
                  </div>
                  
                  <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                    {category.title}
                  </h2>
                  
                  <p className="text-muted-foreground text-sm mb-4 flex-1">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-xs text-muted-foreground">{category.stats}</span>
                    <ArrowRight 
                      size={18} 
                      className="text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" 
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { icon: FileText, label: 'Resources', value: '500+' },
            { icon: Users, label: 'Students Helped', value: '10K+' },
            { icon: BookOpen, label: 'Faculties Covered', value: '16' },
            { icon: Award, label: 'Scholarships Listed', value: '100+' }
          ].map((stat, idx) => (
            <div key={idx} className="text-center p-4 bg-card rounded-xl border border-border">
              <stat.icon className="mx-auto text-accent mb-2" size={24} />
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ResourcesHubPage;