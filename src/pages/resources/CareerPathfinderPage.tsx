import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Compass, GraduationCap, Briefcase, TrendingUp,
  MapPin, Building2, Calendar, ChevronRight, Users, Star,
  Globe, DollarSign, Clock, Filter, Search, X, Award
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Department {
  id: string;
  name: string;
  faculty: string;
}

interface CareerPath {
  department: string;
  avgStartingSalary: string;
  topIndustries: string[];
  timeToPromotion: string;
  commonRoles: string[];
}

interface Alumni {
  id: string;
  name: string;
  graduationYear: string;
  department: string;
  currentRole: string;
  company: string;
  location: string;
  journey: {
    year: string;
    title: string;
    description: string;
  }[];
  industries: string[];
}

const departments: Department[] = [
  { id: 'cs', name: 'Computer Science', faculty: 'Science' },
  { id: 'economics', name: 'Economics', faculty: 'Social Sciences' },
  { id: 'medicine', name: 'Medicine & Surgery', faculty: 'Clinical Sciences' },
  { id: 'law', name: 'Law', faculty: 'Law' },
  { id: 'accounting', name: 'Accounting', faculty: 'Management Sciences' },
  { id: 'eng-electrical', name: 'Electrical Engineering', faculty: 'Technology' },
  { id: 'eng-civil', name: 'Civil Engineering', faculty: 'Technology' },
  { id: 'pharmacy', name: 'Pharmacy', faculty: 'Pharmacy' },
  { id: 'english', name: 'English', faculty: 'Arts' },
  { id: 'mass-comm', name: 'Mass Communication', faculty: 'Social Sciences' },
  { id: 'microbiology', name: 'Microbiology', faculty: 'Science' },
  { id: 'biochemistry', name: 'Biochemistry', faculty: 'Science' }
];

const careerPaths: CareerPath[] = [
  {
    department: 'cs',
    avgStartingSalary: '₦350,000 - ₦600,000',
    topIndustries: ['Fintech', 'E-commerce', 'Consulting', 'Telecommunications'],
    timeToPromotion: '18-24 months',
    commonRoles: ['Software Engineer', 'Data Analyst', 'Product Manager', 'DevOps Engineer']
  },
  {
    department: 'economics',
    avgStartingSalary: '₦200,000 - ₦400,000',
    topIndustries: ['Banking', 'Consulting', 'Government', 'NGOs'],
    timeToPromotion: '24-30 months',
    commonRoles: ['Financial Analyst', 'Economist', 'Policy Analyst', 'Investment Banker']
  },
  {
    department: 'medicine',
    avgStartingSalary: '₦150,000 - ₦300,000 (Housemanship)',
    topIndustries: ['Healthcare', 'Pharmaceuticals', 'Research', 'Public Health'],
    timeToPromotion: '5-7 years (Residency)',
    commonRoles: ['Medical Doctor', 'Surgeon', 'Consultant', 'Medical Researcher']
  },
  {
    department: 'law',
    avgStartingSalary: '₦180,000 - ₦350,000',
    topIndustries: ['Legal Practice', 'Corporate', 'Government', 'NGOs'],
    timeToPromotion: '3-5 years (Senior Associate)',
    commonRoles: ['Associate Lawyer', 'Corporate Counsel', 'Magistrate', 'Legal Consultant']
  },
  {
    department: 'accounting',
    avgStartingSalary: '₦200,000 - ₦400,000',
    topIndustries: ['Audit Firms', 'Banking', 'Oil & Gas', 'Consulting'],
    timeToPromotion: '2-3 years',
    commonRoles: ['Auditor', 'Financial Controller', 'Tax Consultant', 'CFO']
  },
  {
    department: 'eng-electrical',
    avgStartingSalary: '₦250,000 - ₦500,000',
    topIndustries: ['Power', 'Telecommunications', 'Oil & Gas', 'Manufacturing'],
    timeToPromotion: '2-3 years',
    commonRoles: ['Power Engineer', 'Control Systems Engineer', 'Project Manager', 'Technical Director']
  },
  {
    department: 'eng-civil',
    avgStartingSalary: '₦200,000 - ₦400,000',
    topIndustries: ['Construction', 'Real Estate', 'Government', 'Consulting'],
    timeToPromotion: '3-4 years',
    commonRoles: ['Site Engineer', 'Structural Engineer', 'Project Manager', 'Construction Manager']
  },
  {
    department: 'pharmacy',
    avgStartingSalary: '₦150,000 - ₦300,000',
    topIndustries: ['Pharmaceutical Companies', 'Hospitals', 'Retail Pharmacy', 'Research'],
    timeToPromotion: '2-3 years',
    commonRoles: ['Pharmacist', 'Clinical Pharmacist', 'Regulatory Affairs', 'Medical Rep']
  },
  {
    department: 'english',
    avgStartingSalary: '₦120,000 - ₦250,000',
    topIndustries: ['Media', 'Education', 'Publishing', 'Marketing'],
    timeToPromotion: '2-3 years',
    commonRoles: ['Content Writer', 'Editor', 'Teacher', 'Communications Manager']
  },
  {
    department: 'mass-comm',
    avgStartingSalary: '₦150,000 - ₦300,000',
    topIndustries: ['Media', 'Advertising', 'PR', 'Digital Marketing'],
    timeToPromotion: '2-3 years',
    commonRoles: ['Journalist', 'PR Specialist', 'Brand Manager', 'Content Strategist']
  },
  {
    department: 'microbiology',
    avgStartingSalary: '₦150,000 - ₦280,000',
    topIndustries: ['Pharmaceuticals', 'Food & Beverage', 'Research', 'Healthcare'],
    timeToPromotion: '2-3 years',
    commonRoles: ['Lab Scientist', 'Quality Control', 'Research Scientist', 'Microbiologist']
  },
  {
    department: 'biochemistry',
    avgStartingSalary: '₦150,000 - ₦300,000',
    topIndustries: ['Pharmaceuticals', 'Biotechnology', 'Research', 'Healthcare'],
    timeToPromotion: '2-3 years',
    commonRoles: ['Biochemist', 'Research Scientist', 'Clinical Scientist', 'QA Analyst']
  }
];

const alumni: Alumni[] = [
  {
    id: 'alum-1',
    name: 'Adaeze Okonkwo',
    graduationYear: '2018',
    department: 'cs',
    currentRole: 'Senior Software Engineer',
    company: 'Google',
    location: 'United States',
    journey: [
      { year: '2018', title: 'B.Sc. Computer Science, UI', description: 'Graduated with First Class Honours' },
      { year: '2018-2019', title: 'Software Developer at Andela', description: 'Started career building products for US clients' },
      { year: '2019-2021', title: 'Backend Engineer at Paystack', description: 'Built payment infrastructure serving millions' },
      { year: '2021-Present', title: 'Senior Software Engineer at Google', description: 'Working on Google Cloud Platform' }
    ],
    industries: ['Tech', 'Fintech']
  },
  {
    id: 'alum-2',
    name: 'Olumide Bankole',
    graduationYear: '2015',
    department: 'economics',
    currentRole: 'Investment Director',
    company: 'Helios Investment Partners',
    location: 'Nigeria',
    journey: [
      { year: '2015', title: 'B.Sc. Economics, UI', description: 'Graduated top 5 in class' },
      { year: '2015-2017', title: 'Analyst at Access Bank', description: 'Started in corporate banking division' },
      { year: '2017-2019', title: 'MBA at London Business School', description: 'Full scholarship recipient' },
      { year: '2019-Present', title: 'Investment Director at Helios', description: 'Managing $500M+ portfolio' }
    ],
    industries: ['Finance', 'Private Equity']
  },
  {
    id: 'alum-3',
    name: 'Dr. Funke Adeyemi',
    graduationYear: '2012',
    department: 'medicine',
    currentRole: 'Consultant Cardiologist',
    company: 'Lagos University Teaching Hospital',
    location: 'Nigeria',
    journey: [
      { year: '2012', title: 'MBBS, UI', description: 'Graduated with distinctions in Medicine' },
      { year: '2012-2013', title: 'Housemanship at UCH', description: 'Completed rotations in all major departments' },
      { year: '2013-2019', title: 'Residency at LUTH', description: 'Specialized in Cardiology' },
      { year: '2019-Present', title: 'Consultant Cardiologist', description: 'Leading cardiac intervention unit' }
    ],
    industries: ['Healthcare']
  },
  {
    id: 'alum-4',
    name: 'Chukwuemeka Obi',
    graduationYear: '2016',
    department: 'law',
    currentRole: 'Partner',
    company: 'Olaniwun Ajayi LP',
    location: 'Nigeria',
    journey: [
      { year: '2016', title: 'LL.B, UI', description: 'Best Graduating Student in Faculty of Law' },
      { year: '2017', title: 'Called to Bar', description: 'Nigerian Law School' },
      { year: '2017-2020', title: 'Associate at Aluko & Oyebode', description: 'Corporate and Commercial practice' },
      { year: '2020-Present', title: 'Partner at Olaniwun Ajayi', description: 'Leading M&A transactions' }
    ],
    industries: ['Legal', 'Corporate']
  },
  {
    id: 'alum-5',
    name: 'Aisha Mohammed',
    graduationYear: '2017',
    department: 'accounting',
    currentRole: 'CFO',
    company: 'Piggyvest',
    location: 'Nigeria',
    journey: [
      { year: '2017', title: 'B.Sc. Accounting, UI', description: 'CGPA 4.8/5.0' },
      { year: '2017-2019', title: 'Audit Associate at KPMG', description: 'Worked on major banking audits' },
      { year: '2019-2021', title: 'Finance Manager at Flutterwave', description: 'Built financial operations' },
      { year: '2021-Present', title: 'CFO at Piggyvest', description: 'Managing finances of leading fintech' }
    ],
    industries: ['Finance', 'Fintech']
  },
  {
    id: 'alum-6',
    name: 'Tunde Adeleke',
    graduationYear: '2014',
    department: 'eng-electrical',
    currentRole: 'Engineering Director',
    company: 'Microsoft',
    location: 'United Kingdom',
    journey: [
      { year: '2014', title: 'B.Sc. Electrical Engineering, UI', description: 'First Class Honours' },
      { year: '2014-2016', title: 'Engineer at MTN Nigeria', description: 'Network optimization' },
      { year: '2016-2018', title: 'M.Sc. at Imperial College London', description: 'Communications Engineering' },
      { year: '2018-Present', title: 'Engineering Director at Microsoft', description: 'Azure infrastructure team' }
    ],
    industries: ['Tech', 'Telecommunications']
  },
  {
    id: 'alum-7',
    name: 'Ngozi Eze',
    graduationYear: '2019',
    department: 'mass-comm',
    currentRole: 'Head of Communications',
    company: 'Jumia',
    location: 'Nigeria',
    journey: [
      { year: '2019', title: 'B.Sc. Mass Communication, UI', description: 'Award for Best Student Project' },
      { year: '2019-2020', title: 'Content Creator at TechCabal', description: 'Covered African tech ecosystem' },
      { year: '2020-2022', title: 'PR Manager at Kuda Bank', description: 'Led brand communications' },
      { year: '2022-Present', title: 'Head of Communications at Jumia', description: 'Regional communications strategy' }
    ],
    industries: ['Media', 'Tech']
  },
  {
    id: 'alum-8',
    name: 'Dr. Yusuf Ibrahim',
    graduationYear: '2013',
    department: 'pharmacy',
    currentRole: 'Director of Regulatory Affairs',
    company: 'GSK',
    location: 'United Kingdom',
    journey: [
      { year: '2013', title: 'B.Pharm, UI', description: 'Second Class Upper' },
      { year: '2013-2015', title: 'Pharmacist at Nigerian Army Medical Corps', description: 'NYSC and extended service' },
      { year: '2015-2018', title: 'M.Sc. Pharmaceutical Sciences, UCL', description: 'Regulatory Science focus' },
      { year: '2018-Present', title: 'Director at GSK', description: 'Leading African regulatory strategy' }
    ],
    industries: ['Pharmaceutical']
  },
  {
    id: 'alum-9',
    name: 'Chiamaka Nwosu',
    graduationYear: '2020',
    department: 'biochemistry',
    currentRole: 'Research Scientist',
    company: 'Pfizer',
    location: 'United States',
    journey: [
      { year: '2020', title: 'B.Sc. Biochemistry, UI', description: 'Best Project Award' },
      { year: '2020-2022', title: 'Research Assistant at IITA', description: 'Agricultural biotechnology research' },
      { year: '2022-2024', title: 'Ph.D. Biochemistry, MIT', description: 'Full fellowship' },
      { year: '2024-Present', title: 'Research Scientist at Pfizer', description: 'Drug discovery team' }
    ],
    industries: ['Biotechnology', 'Pharmaceutical']
  },
  {
    id: 'alum-10',
    name: 'Babatunde Ogunlana',
    graduationYear: '2016',
    department: 'eng-civil',
    currentRole: 'Project Director',
    company: 'Julius Berger',
    location: 'Nigeria',
    journey: [
      { year: '2016', title: 'B.Sc. Civil Engineering, UI', description: 'COREN registered' },
      { year: '2016-2018', title: 'Site Engineer at RCC', description: 'Lagos infrastructure projects' },
      { year: '2018-2021', title: 'Project Manager at Dangote', description: 'Refinery construction' },
      { year: '2021-Present', title: 'Project Director at Julius Berger', description: 'Major highway projects' }
    ],
    industries: ['Construction', 'Infrastructure']
  },
  {
    id: 'alum-11',
    name: 'Folake Adeyanju',
    graduationYear: '2017',
    department: 'english',
    currentRole: 'Managing Editor',
    company: 'Guardian Nigeria',
    location: 'Nigeria',
    journey: [
      { year: '2017', title: 'B.A. English, UI', description: 'First Class Honours' },
      { year: '2017-2019', title: 'Staff Writer at The Cable', description: 'Investigative journalism' },
      { year: '2019-2022', title: 'Senior Editor at BusinessDay', description: 'Business and economy desk' },
      { year: '2022-Present', title: 'Managing Editor at Guardian', description: 'Editorial strategy' }
    ],
    industries: ['Media', 'Publishing']
  },
  {
    id: 'alum-12',
    name: 'Emeka Chukwu',
    graduationYear: '2015',
    department: 'cs',
    currentRole: 'CTO',
    company: 'Moniepoint',
    location: 'Nigeria',
    journey: [
      { year: '2015', title: 'B.Sc. Computer Science, UI', description: 'First Class Honours' },
      { year: '2015-2017', title: 'Software Engineer at Interswitch', description: 'Payment systems' },
      { year: '2017-2019', title: 'Senior Engineer at Konga', description: 'E-commerce platform' },
      { year: '2019-Present', title: 'CTO at Moniepoint', description: 'Building financial infrastructure' }
    ],
    industries: ['Fintech', 'Tech']
  },
  {
    id: 'alum-13',
    name: 'Halima Yusuf',
    graduationYear: '2018',
    department: 'economics',
    currentRole: 'Policy Advisor',
    company: 'World Bank',
    location: 'United States',
    journey: [
      { year: '2018', title: 'B.Sc. Economics, UI', description: 'Valedictorian' },
      { year: '2018-2020', title: 'Research Analyst at CBN', description: 'Monetary policy research' },
      { year: '2020-2022', title: 'M.P.P. at Harvard Kennedy School', description: 'Joint degree with MBA' },
      { year: '2022-Present', title: 'Policy Advisor at World Bank', description: 'African development programs' }
    ],
    industries: ['Government', 'International Development']
  },
  {
    id: 'alum-14',
    name: 'Oluwaseun Bakare',
    graduationYear: '2019',
    department: 'microbiology',
    currentRole: 'Quality Director',
    company: 'Nigerian Breweries',
    location: 'Nigeria',
    journey: [
      { year: '2019', title: 'B.Sc. Microbiology, UI', description: 'Second Class Upper' },
      { year: '2019-2021', title: 'QC Analyst at Chi Limited', description: 'Beverage quality control' },
      { year: '2021-2023', title: 'QA Manager at Nestlé', description: 'Regional quality assurance' },
      { year: '2023-Present', title: 'Quality Director at Nigerian Breweries', description: 'National quality strategy' }
    ],
    industries: ['Food & Beverage', 'Manufacturing']
  },
  {
    id: 'alum-15',
    name: 'Kemi Adebayo',
    graduationYear: '2016',
    department: 'accounting',
    currentRole: 'Partner',
    company: 'PwC Nigeria',
    location: 'Nigeria',
    journey: [
      { year: '2016', title: 'B.Sc. Accounting, UI', description: 'ICAN prize winner' },
      { year: '2016-2019', title: 'Audit Associate at PwC', description: 'Financial services audit' },
      { year: '2019-2022', title: 'Manager at PwC', description: 'Banking and Capital Markets' },
      { year: '2022-Present', title: 'Partner at PwC', description: 'Advisory services' }
    ],
    industries: ['Consulting', 'Audit']
  }
];

const JourneyModal: React.FC<{
  alumni: Alumni | null;
  onClose: () => void;
}> = ({ alumni, onClose }) => {
  if (!alumni) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl z-50 p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4 mb-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-2xl font-serif text-ui-blue">
            {alumni.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="font-serif text-2xl text-foreground">{alumni.name}</h2>
            <p className="text-muted-foreground">{alumni.currentRole} at {alumni.company}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="gap-1">
                <MapPin size={12} /> {alumni.location}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <GraduationCap size={12} /> Class of {alumni.graduationYear}
              </Badge>
            </div>
          </div>
        </div>

        <h3 className="font-serif text-lg text-foreground mb-4">Career Journey</h3>
        <div className="relative pl-6 border-l-2 border-nobel-gold space-y-6">
          {alumni.journey.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="absolute -left-[29px] w-4 h-4 rounded-full bg-nobel-gold" />
              <div className="text-xs font-bold text-nobel-gold uppercase tracking-widest mb-1">{step.year}</div>
              <h4 className="font-medium text-foreground">{step.title}</h4>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Industries</h4>
          <div className="flex flex-wrap gap-2">
            {alumni.industries.map((industry, i) => (
              <Badge key={i} variant="outline">{industry}</Badge>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
};

const CareerPathfinderPage = () => {
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  const currentPath = careerPaths.find(p => p.department === selectedDepartment);
  const departmentInfo = departments.find(d => d.id === selectedDepartment);

  const filteredAlumni = useMemo(() => {
    return alumni.filter(a => {
      const matchesDept = !selectedDepartment || a.department === selectedDepartment;
      const matchesIndustry = industryFilter === 'all' || a.industries.some(i => i.toLowerCase().includes(industryFilter.toLowerCase()));
      const matchesLocation = locationFilter === 'all' || 
        (locationFilter === 'nigeria' && a.location === 'Nigeria') ||
        (locationFilter === 'abroad' && a.location !== 'Nigeria');
      return matchesDept && matchesIndustry && matchesLocation;
    });
  }, [selectedDepartment, industryFilter, locationFilter]);

  const allIndustries = [...new Set(alumni.flatMap(a => a.industries))];

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <SEO
        title="Career Pathfinder - Resources"
        description="Discover career paths and connect with UI alumni across various industries."
      />

      <div className="container mx-auto px-6">
        <button
          onClick={() => navigate('/resources')}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-8"
        >
          <div className="p-2 rounded-full border border-border group-hover:border-nobel-gold transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Back to Resources</span>
        </button>

        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <Compass className="text-nobel-gold w-8 h-8" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">Career Discovery</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif text-ui-blue leading-[0.9] mb-6"
          >
            Career <br />
            <span className="italic text-muted-foreground">Pathfinder</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground font-light max-w-2xl leading-relaxed"
          >
            Explore career trajectories based on your department and learn from UI alumni who've walked the path before you.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card p-6 rounded-xl border border-border mb-8"
        >
          <h2 className="font-serif text-lg text-foreground mb-4">Select Your Department</h2>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-full max-w-md h-12">
              <SelectValue placeholder="Choose your department..." />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name} ({dept.faculty})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <AnimatePresence mode="wait">
          {currentPath && departmentInfo && (
            <motion.div
              key={selectedDepartment}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-12"
            >
              <div className="bg-gradient-to-r from-ui-blue to-ui-dark rounded-2xl p-8 text-white mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                  <div>
                    <Badge className="bg-white/20 text-white border-white/30 mb-2">{departmentInfo.faculty}</Badge>
                    <h2 className="font-serif text-3xl">{departmentInfo.name}</h2>
                    <p className="text-white/70">Career trajectory insights</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white/10 rounded-xl p-5">
                    <DollarSign className="text-nobel-gold mb-2" size={24} />
                    <div className="text-xs text-white/60 uppercase tracking-widest mb-1">Avg. Starting Salary</div>
                    <div className="font-serif text-lg">{currentPath.avgStartingSalary}</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-5">
                    <Clock className="text-nobel-gold mb-2" size={24} />
                    <div className="text-xs text-white/60 uppercase tracking-widest mb-1">Time to Promotion</div>
                    <div className="font-serif text-lg">{currentPath.timeToPromotion}</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-5 md:col-span-2">
                    <Building2 className="text-nobel-gold mb-2" size={24} />
                    <div className="text-xs text-white/60 uppercase tracking-widest mb-1">Top Industries</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentPath.topIndustries.map((industry, i) => (
                        <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-serif text-xl text-foreground mb-4">Common Career Paths</h3>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {currentPath.commonRoles.map((role, index) => (
                    <React.Fragment key={role}>
                      <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full whitespace-nowrap">
                        <span className="text-xs font-bold text-muted-foreground">Year {index + 1}-{index + 3}</span>
                        <span className="font-medium text-foreground">{role}</span>
                      </div>
                      {index < currentPath.commonRoles.length - 1 && (
                        <ChevronRight className="text-muted-foreground shrink-0" size={20} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="font-serif text-2xl text-foreground">Alumni Spotlights</h2>
              <p className="text-muted-foreground">Learn from those who've walked the path</p>
            </div>

            <div className="flex gap-3">
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {allIndustries.map(industry => (
                    <SelectItem key={industry} value={industry.toLowerCase()}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="nigeria">Nigeria</SelectItem>
                  <SelectItem value="abroad">International</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredAlumni.map((alum, index) => (
                <motion.div
                  key={alum.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl border border-border hover:border-nobel-gold hover:shadow-xl transition-all p-6 group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center text-lg font-serif text-ui-blue group-hover:bg-ui-blue group-hover:text-white transition-colors">
                      {alum.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-lg text-foreground truncate">{alum.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{alum.currentRole}</p>
                      <p className="text-xs text-nobel-gold font-medium">{alum.company}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="gap-1 text-[10px]">
                      <GraduationCap size={10} /> {alum.graduationYear}
                    </Badge>
                    <Badge variant="secondary" className="gap-1 text-[10px]">
                      <MapPin size={10} /> {alum.location}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground mb-4">
                    {departments.find(d => d.id === alum.department)?.name}
                  </div>

                  <Button
                    onClick={() => setSelectedAlumni(alum)}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    View Journey <ChevronRight size={16} />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredAlumni.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Users className="mx-auto text-muted-foreground mb-4" size={64} />
              <h3 className="text-xl font-serif text-foreground mb-2">No alumni found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </motion.div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {selectedAlumni && (
          <JourneyModal
            alumni={selectedAlumni}
            onClose={() => setSelectedAlumni(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CareerPathfinderPage;
