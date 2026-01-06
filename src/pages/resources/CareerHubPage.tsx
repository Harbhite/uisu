import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, FileText, Video, Users, MapPin, Clock, ExternalLink,
  ArrowLeft, Search, Filter, Building, GraduationCap, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEO } from '@/components/SEO';

// Sample data - in production, this would come from Supabase
const careerResources = {
  templates: [
    { id: '1', title: 'Professional CV Template', type: 'CV', downloads: 1250, description: 'Clean, ATS-friendly resume template' },
    { id: '2', title: 'Cover Letter Guide', type: 'Guide', downloads: 890, description: 'How to write compelling cover letters' },
    { id: '3', title: 'LinkedIn Optimization', type: 'Guide', downloads: 650, description: 'Maximize your LinkedIn profile impact' },
    { id: '4', title: 'Interview Prep Checklist', type: 'Checklist', downloads: 720, description: 'Essential interview preparation steps' },
  ],
  opportunities: [
    { id: '1', company: 'MTN Nigeria', role: 'Graduate Trainee', type: 'Full-time', location: 'Lagos', deadline: '2024-03-15' },
    { id: '2', company: 'Access Bank', role: 'IT Intern', type: 'Internship', location: 'Lagos', deadline: '2024-02-28' },
    { id: '3', company: 'Andela', role: 'Software Engineering Intern', type: 'Internship', location: 'Remote', deadline: '2024-03-01' },
    { id: '4', company: 'Shell Nigeria', role: 'Graduate Program', type: 'Full-time', location: 'Port Harcourt', deadline: '2024-04-30' },
  ],
  tips: [
    { id: '1', title: 'Ace Your Technical Interview', category: 'Interview', readTime: '8 min' },
    { id: '2', title: 'Networking for Introverts', category: 'Networking', readTime: '5 min' },
    { id: '3', title: 'Salary Negotiation Basics', category: 'Negotiation', readTime: '6 min' },
    { id: '4', title: 'Building Your Personal Brand', category: 'Branding', readTime: '7 min' },
  ]
};

const CareerHubPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <SEO
        title="Career Hub - UISU Resources"
        description="CV templates, job opportunities, internships, and career development resources for students."
        image="/screenshots/documents.png"
      />

      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/resources')}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground flex items-center gap-3">
                <Briefcase className="text-emerald-500" /> Career Hub
              </h1>
              <p className="text-muted-foreground mt-1">
                Launch your career with the right tools and opportunities
              </p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="opportunities" className="space-y-8">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="tips">Career Tips</TabsTrigger>
          </TabsList>

          {/* Opportunities */}
          <TabsContent value="opportunities">
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input placeholder="Search jobs, companies..." className="pl-10" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {careerResources.opportunities.map(job => (
                <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="hover:border-accent transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Building className="text-muted-foreground" size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold">{job.role}</h3>
                            <p className="text-sm text-muted-foreground">{job.company}</p>
                          </div>
                        </div>
                        <Badge variant={job.type === 'Internship' ? 'secondary' : 'default'}>
                          {job.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> Deadline: {job.deadline}</span>
                      </div>
                      <Button className="w-full mt-4 gap-2" variant="outline">
                        Apply Now <ExternalLink size={14} />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {careerResources.templates.map(template => (
                <motion.div key={template.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <Card className="hover:border-accent transition-colors cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                        <FileText className="text-emerald-500" size={32} />
                      </div>
                      <h3 className="font-bold mb-1">{template.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
                      <Badge variant="secondary">{template.downloads} downloads</Badge>
                      <Button className="w-full mt-4 gap-2" size="sm">
                        <Download size={14} /> Download
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Tips */}
          <TabsContent value="tips">
            <div className="grid md:grid-cols-2 gap-4">
              {careerResources.tips.map(tip => (
                <motion.div key={tip.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <Card className="hover:border-accent transition-colors cursor-pointer">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                        <GraduationCap className="text-accent" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold">{tip.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <Badge variant="outline">{tip.category}</Badge>
                          <span className="flex items-center gap-1"><Clock size={12} /> {tip.readTime}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CareerHubPage;