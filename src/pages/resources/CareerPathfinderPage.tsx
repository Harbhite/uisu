import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Compass, ChevronRight, Building2, MapPin,
  GraduationCap, Briefcase, TrendingUp, Users, X,
  Calendar, Award, Globe
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CareerPath {
  title: string;
  percentage: number;
  avgSalary: string;
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
    company: string;
  }[];
}

interface DepartmentData {
  name: string;
  faculty: string;
  avgStartingSalary: string;
  topIndustries: string[];
  timeToPromotion: string;
  careerPaths: CareerPath[];
}

const departments: Record<string, DepartmentData> = {
  'computer-science': {
    name: 'Computer Science',
    faculty: 'Science',
    avgStartingSalary: '₦350,000/month',
    topIndustries: ['Fintech', 'Big Tech', 'Consulting', 'Startups'],
    timeToPromotion: '18 months',
    careerPaths: [
      { title: 'Software Engineer', percentage: 45, avgSalary: '₦400k' },
      { title: 'Data Scientist', percentage: 20, avgSalary: '₦450k' },
      { title: 'Product Manager', percentage: 15, avgSalary: '₦500k' },
      { title: 'DevOps Engineer', percentage: 12, avgSalary: '₦380k' },
      { title: 'Other', percentage: 8, avgSalary: 'Varies' }
    ]
  },
  'medicine': {
    name: 'Medicine & Surgery',
    faculty: 'Clinical Sciences',
    avgStartingSalary: '₦250,000/month',
    topIndustries: ['Hospitals', 'Research', 'Public Health', 'Pharma'],
    timeToPromotion: '24 months',
    careerPaths: [
      { title: 'House Officer', percentage: 100, avgSalary: '₦250k' },
      { title: 'Resident Doctor', percentage: 85, avgSalary: '₦400k' },
      { title: 'Consultant', percentage: 40, avgSalary: '₦800k+' },
      { title: 'Private Practice', percentage: 30, avgSalary: 'Varies' }
    ]
  },
  'economics': {
    name: 'Economics',
    faculty: 'Social Sciences',
    avgStartingSalary: '₦180,000/month',
    topIndustries: ['Banking', 'Consulting', 'Government', 'Research'],
    timeToPromotion: '20 months',
    careerPaths: [
      { title: 'Financial Analyst', percentage: 35, avgSalary: '₦250k' },
      { title: 'Investment Banking', percentage: 20, avgSalary: '₦400k' },
      { title: 'Economic Research', percentage: 15, avgSalary: '₦200k' },
      { title: 'Management Consulting', percentage: 18, avgSalary: '₦350k' },
      { title: 'Other', percentage: 12, avgSalary: 'Varies' }
    ]
  },
  'law': {
    name: 'Law',
    faculty: 'Law',
    avgStartingSalary: '₦150,000/month',
    topIndustries: ['Law Firms', 'Corporate', 'Government', 'NGOs'],
    timeToPromotion: '30 months',
    careerPaths: [
      { title: 'Associate Lawyer', percentage: 50, avgSalary: '₦200k' },
      { title: 'Corporate Counsel', percentage: 25, avgSalary: '₦350k' },
      { title: 'Litigation', percentage: 15, avgSalary: '₦250k' },
      { title: 'Legal Tech', percentage: 10, avgSalary: '₦300k' }
    ]
  },
  'engineering': {
    name: 'Electrical Engineering',
    faculty: 'Technology',
    avgStartingSalary: '₦280,000/month',
    topIndustries: ['Oil & Gas', 'Power', 'Telecom', 'Tech'],
    timeToPromotion: '24 months',
    careerPaths: [
      { title: 'Field Engineer', percentage: 30, avgSalary: '₦300k' },
      { title: 'Systems Engineer', percentage: 25, avgSalary: '₦350k' },
      { title: 'Project Engineer', percentage: 20, avgSalary: '₦400k' },
      { title: 'Technical Sales', percentage: 15, avgSalary: '₦280k' },
      { title: 'Other', percentage: 10, avgSalary: 'Varies' }
    ]
  }
};

const alumni: Alumni[] = [
  {
    id: '1',
    name: 'Olumide Adeyemi',
    graduationYear: '2018',
    department: 'Computer Science',
    currentRole: 'Senior Software Engineer',
    company: 'Google',
    location: 'London, UK',
    journey: [
      { year: '2018', title: 'Graduate', company: 'University of Ibadan' },
      { year: '2018', title: 'Software Engineer Intern', company: 'Andela' },
      { year: '2019', title: 'Junior Developer', company: 'Paystack' },
      { year: '2021', title: 'Software Engineer', company: 'Google' },
      { year: '2023', title: 'Senior Software Engineer', company: 'Google' }
    ]
  },
  {
    id: '2',
    name: 'Funmilayo Okonkwo',
    graduationYear: '2016',
    department: 'Medicine',
    currentRole: 'Consultant Cardiologist',
    company: 'Lagos University Teaching Hospital',
    location: 'Lagos, Nigeria',
    journey: [
      { year: '2016', title: 'House Officer', company: 'UCH Ibadan' },
      { year: '2017', title: 'Medical Officer', company: 'General Hospital' },
      { year: '2018', title: 'Resident Doctor', company: 'LUTH' },
      { year: '2023', title: 'Consultant Cardiologist', company: 'LUTH' }
    ]
  },
  {
    id: '3',
    name: 'Chukwuemeka Nwosu',
    graduationYear: '2017',
    department: 'Economics',
    currentRole: 'Vice President',
    company: 'Goldman Sachs',
    location: 'New York, USA',
    journey: [
      { year: '2017', title: 'Graduate', company: 'University of Ibadan' },
      { year: '2017', title: 'Graduate Trainee', company: 'GTBank' },
      { year: '2019', title: 'MBA', company: 'Harvard Business School' },
      { year: '2021', title: 'Associate', company: 'Goldman Sachs' },
      { year: '2024', title: 'Vice President', company: 'Goldman Sachs' }
    ]
  },
  {
    id: '4',
    name: 'Adaeze Eze',
    graduationYear: '2019',
    department: 'Law',
    currentRole: 'Senior Associate',
    company: 'Aluko & Oyebode',
    location: 'Lagos, Nigeria',
    journey: [
      { year: '2019', title: 'Law School', company: 'Nigerian Law School' },
      { year: '2020', title: 'Junior Associate', company: 'Templars' },
      { year: '2022', title: 'Associate', company: 'Aluko & Oyebode' },
      { year: '2025', title: 'Senior Associate', company: 'Aluko & Oyebode' }
    ]
  },
  {
    id: '5',
    name: 'Ibrahim Yusuf',
    graduationYear: '2015',
    department: 'Engineering',
    currentRole: 'Engineering Manager',
    company: 'Shell Nigeria',
    location: 'Port Harcourt, Nigeria',
    journey: [
      { year: '2015', title: 'Graduate Trainee', company: 'Shell Nigeria' },
      { year: '2017', title: 'Field Engineer', company: 'Shell Nigeria' },
      { year: '2019', title: 'Senior Engineer', company: 'Shell Nigeria' },
      { year: '2022', title: 'Lead Engineer', company: 'Shell Nigeria' },
      { year: '2024', title: 'Engineering Manager', company: 'Shell Nigeria' }
    ]
  },
  {
    id: '6',
    name: 'Ngozi Okafor',
    graduationYear: '2020',
    department: 'Computer Science',
    currentRole: 'Product Manager',
    company: 'Flutterwave',
    location: 'Lagos, Nigeria',
    journey: [
      { year: '2020', title: 'Associate PM', company: 'Kuda Bank' },
      { year: '2022', title: 'Product Manager', company: 'Paystack' },
      { year: '2024', title: 'Senior PM', company: 'Flutterwave' }
    ]
  }
];

const departmentOptions = [
  { value: 'computer-science', label: 'Computer Science' },
  { value: 'medicine', label: 'Medicine & Surgery' },
  { value: 'economics', label: 'Economics' },
  { value: 'law', label: 'Law' },
  { value: 'engineering', label: 'Electrical Engineering' }
];

const CareerPathfinderPage = () => {
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
  const [industryFilter, setIndustryFilter] = useState<string>('all');

  const deptData = selectedDept ? departments[selectedDept] : null;
  
  const filteredAlumni = alumni.filter(a => {
    if (!selectedDept) return true;
    const deptName = departments[selectedDept]?.name;
    return a.department === deptName;
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <SEO 
        title="Career Pathfinder - Resources" 
        description="Explore career paths and alumni journeys from the University of Ibadan." 
        image="/og/pages-screenshot/resources_career-pathfinder.png"
      />

      <div className="container mx-auto px-6">
        <button
          onClick={() => navigate('/resources')}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-12"
        >
          <div className="p-2 border border-slate-200 group-hover:border-nobel-gold transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Resources</span>
        </button>

        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <Compass className="text-nobel-gold w-6 h-6" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Discover Your Future</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl text-ui-blue mb-6"
          >
            Career <span className="italic text-slate-300">Pathfinder</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 font-light max-w-2xl leading-relaxed"
          >
            Explore where your degree can take you. See career trajectories, salary insights, and learn from alumni who walked this path before you.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Select Your Department</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="w-full max-w-md h-14 bg-white border-slate-200 rounded-none text-lg font-serif">
              <SelectValue placeholder="Choose a department..." />
            </SelectTrigger>
            <SelectContent>
              {departmentOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <AnimatePresence mode="wait">
          {deptData && (
            <motion.div
              key={selectedDept}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-20"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 border border-slate-200 mb-12">
                <div className="bg-white p-8">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-2">Avg. Starting Salary</div>
                  <div className="font-serif text-2xl text-ui-blue">{deptData.avgStartingSalary}</div>
                </div>
                <div className="bg-white p-8">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-2">Time to Promotion</div>
                  <div className="font-serif text-2xl text-ui-blue">{deptData.timeToPromotion}</div>
                </div>
                <div className="bg-white p-8">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-2">Faculty</div>
                  <div className="font-serif text-2xl text-ui-blue">{deptData.faculty}</div>
                </div>
                <div className="bg-white p-8">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-2">Top Industries</div>
                  <div className="font-serif text-lg text-ui-blue">{deptData.topIndustries.slice(0, 2).join(', ')}</div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <h3 className="font-serif text-2xl text-ui-blue mb-6">Career Distribution</h3>
                  <div className="space-y-4">
                    {deptData.careerPaths.map((path, i) => (
                      <div key={i} className="bg-white border border-slate-100 p-6">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-serif text-lg text-ui-blue">{path.title}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-nobel-gold">{path.avgSalary}</span>
                        </div>
                        <div className="h-2 bg-slate-100 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${path.percentage}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="h-full bg-ui-blue"
                          />
                        </div>
                        <div className="text-right mt-2">
                          <span className="text-xs text-slate-400">{path.percentage}% of graduates</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-2xl text-ui-blue mb-6">Top Industries</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {deptData.topIndustries.map((industry, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white border border-slate-100 p-6 hover:border-nobel-gold/50 transition-colors"
                      >
                        <Building2 size={24} className="text-slate-300 mb-4" />
                        <span className="font-serif text-lg text-ui-blue">{industry}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Alumni Spotlights</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((person, i) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-slate-100 hover:border-nobel-gold/50 hover:shadow-lg transition-all group"
            >
              <div className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-ui-blue group-hover:text-nobel-gold transition-colors">
                      {person.name}
                    </h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Class of {person.graduationYear}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Briefcase size={14} className="text-slate-300" />
                    {person.currentRole}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Building2 size={14} className="text-slate-300" />
                    {person.company}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={14} className="text-slate-300" />
                    {person.location}
                  </div>
                </div>

                <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border border-slate-100">
                  {person.department}
                </span>
              </div>

              <div className="px-8 py-4 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => setSelectedAlumni(person)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-ui-blue text-white text-[10px] font-bold uppercase tracking-widest hover:bg-nobel-gold transition-colors"
                >
                  View Journey <ChevronRight size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedAlumni && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-ui-blue/20 backdrop-blur-sm z-40"
                onClick={() => setSelectedAlumni(null)}
              />
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white border border-slate-200 shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-nobel-gold">Career Journey</span>
                    <h2 className="font-serif text-2xl text-ui-blue">{selectedAlumni.name}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedAlumni(null)}
                    className="p-2 hover:bg-slate-50 transition-colors"
                  >
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 border border-slate-100 p-4">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Current Role</div>
                      <div className="font-serif text-lg text-ui-blue">{selectedAlumni.currentRole}</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-4">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Company</div>
                      <div className="font-serif text-lg text-ui-blue">{selectedAlumni.company}</div>
                    </div>
                  </div>

                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Career Timeline</h3>
                  
                  <div className="relative pl-8 border-l-2 border-slate-200 space-y-6">
                    {selectedAlumni.journey.map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative"
                      >
                        <div className="absolute -left-[25px] w-4 h-4 bg-white border-2 border-ui-blue rounded-full" />
                        <div className="bg-slate-50 border border-slate-100 p-4">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-nobel-gold">{step.year}</span>
                          <h4 className="font-serif text-lg text-ui-blue">{step.title}</h4>
                          <p className="text-sm text-slate-500">{step.company}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CareerPathfinderPage;
