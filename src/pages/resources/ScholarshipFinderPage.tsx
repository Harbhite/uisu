import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Award, Search, Filter, Calendar, MapPin, DollarSign, 
  ArrowLeft, ExternalLink, BookOpen, GraduationCap, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SEO } from '@/components/SEO';

const scholarships = [
  {
    id: '1',
    title: 'MTN Foundation Scholarship',
    provider: 'MTN Nigeria',
    amount: '₦200,000/year',
    deadline: '2024-04-30',
    eligibility: 'Nigerian students in 200-400 level with CGPA ≥ 3.5',
    category: 'Corporate',
    location: 'Nigeria',
    link: '#'
  },
  {
    id: '2',
    title: 'Chevening Scholarship',
    provider: 'UK Government',
    amount: 'Full Tuition + Living',
    deadline: '2024-11-07',
    eligibility: 'Postgraduate students with 2+ years work experience',
    category: 'Government',
    location: 'United Kingdom',
    link: '#'
  },
  {
    id: '3',
    title: 'NNPC/Total Scholarship',
    provider: 'NNPC/Total E&P',
    amount: '₦150,000/year',
    deadline: '2024-05-15',
    eligibility: 'Science & Engineering students, CGPA ≥ 3.0',
    category: 'Corporate',
    location: 'Nigeria',
    link: '#'
  },
  {
    id: '4',
    title: 'Fulbright Foreign Student Program',
    provider: 'U.S. Department of State',
    amount: 'Full Funding',
    deadline: '2024-06-01',
    eligibility: 'Graduate students for Masters/PhD in USA',
    category: 'Government',
    location: 'United States',
    link: '#'
  },
  {
    id: '5',
    title: 'PTDF Overseas Scholarship',
    provider: 'PTDF Nigeria',
    amount: 'Full Funding',
    deadline: '2024-03-31',
    eligibility: 'First class/Second class upper graduates in Oil & Gas fields',
    category: 'Government',
    location: 'Various',
    link: '#'
  },
  {
    id: '6',
    title: 'Mastercard Foundation Scholars',
    provider: 'Mastercard Foundation',
    amount: 'Full Tuition + Stipend',
    deadline: '2024-02-28',
    eligibility: 'Academically talented with financial need',
    category: 'Foundation',
    location: 'Various',
    link: '#'
  }
];

const categories = ['All', 'Corporate', 'Government', 'Foundation', 'University'];
const levels = ['All Levels', 'Undergraduate', 'Postgraduate', 'PhD'];

const ScholarshipFinderPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');

  const filteredScholarships = scholarships.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <SEO
        title="Scholarship Finder - UISU Resources"
        description="Find scholarships, grants, and funding opportunities for Nigerian students."
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
                <Award className="text-amber-500" /> Scholarship Finder
              </h1>
              <p className="text-muted-foreground mt-1">
                Discover funding opportunities for your education
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search scholarships..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(l => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Scholarships Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScholarships.map((scholarship, idx) => (
            <motion.div
              key={scholarship.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="h-full hover:border-accent transition-colors">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                      <Award className="text-amber-500" size={24} />
                    </div>
                    <Badge variant="secondary">{scholarship.category}</Badge>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-1">{scholarship.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{scholarship.provider}</p>

                  <div className="space-y-2 text-sm flex-1">
                    <div className="flex items-center gap-2 text-foreground">
                      <DollarSign size={14} className="text-green-500" />
                      <span className="font-medium">{scholarship.amount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={14} />
                      <span>Deadline: {scholarship.deadline}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe size={14} />
                      <span>{scholarship.location}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-3">{scholarship.eligibility}</p>
                    <Button className="w-full gap-2" size="sm">
                      Apply Now <ExternalLink size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredScholarships.length === 0 && (
          <div className="text-center py-16">
            <Award className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-medium">No scholarships found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarshipFinderPage;