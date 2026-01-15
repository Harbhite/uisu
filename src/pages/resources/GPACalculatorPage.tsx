import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Calculator, GraduationCap, 
  RotateCcw, Download, TrendingUp, Award, BookOpen
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Course {
  id: string;
  name: string;
  units: number;
  grade: string;
}

const gradePoints: { [key: string]: number } = {
  'A': 5.0,
  'B': 4.0,
  'C': 3.0,
  'D': 2.0,
  'E': 1.0,
  'F': 0.0,
};

const gradeDescriptions: { [key: string]: string } = {
  'A': 'Excellent (70-100%)',
  'B': 'Very Good (60-69%)',
  'C': 'Good (50-59%)',
  'D': 'Fair (45-49%)',
  'E': 'Pass (40-44%)',
  'F': 'Fail (0-39%)',
};

const classificationRanges = [
  { min: 4.5, max: 5.0, label: 'First Class', color: 'bg-emerald-500', icon: Award },
  { min: 3.5, max: 4.49, label: 'Second Class Upper', color: 'bg-blue-500', icon: TrendingUp },
  { min: 2.5, max: 3.49, label: 'Second Class Lower', color: 'bg-amber-500', icon: BookOpen },
  { min: 1.5, max: 2.49, label: 'Third Class', color: 'bg-orange-500', icon: GraduationCap },
  { min: 1.0, max: 1.49, label: 'Pass', color: 'bg-red-400', icon: Calculator },
  { min: 0, max: 0.99, label: 'Fail', color: 'bg-red-600', icon: Calculator },
];

const GPACalculatorPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: '', units: 3, grade: '' }
  ]);
  const [semesterName, setSemesterName] = useState('First Semester');
  const [academicYear, setAcademicYear] = useState('2024/2025');

  const addCourse = () => {
    setCourses([...courses, { 
      id: Date.now().toString(), 
      name: '', 
      units: 3, 
      grade: '' 
    }]);
  };

  const removeCourse = (id: string) => {
    if (courses.length > 1) {
      setCourses(courses.filter(c => c.id !== id));
    } else {
      toast.error('You need at least one course');
    }
  };

  const updateCourse = (id: string, field: keyof Course, value: string | number) => {
    setCourses(courses.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const calculateGPA = () => {
    const validCourses = courses.filter(c => c.grade && c.units > 0);
    if (validCourses.length === 0) return 0;

    const totalPoints = validCourses.reduce((sum, course) => {
      return sum + (gradePoints[course.grade] * course.units);
    }, 0);

    const totalUnits = validCourses.reduce((sum, course) => sum + course.units, 0);
    return totalUnits > 0 ? totalPoints / totalUnits : 0;
  };

  const getTotalUnits = () => {
    return courses.filter(c => c.grade).reduce((sum, c) => sum + c.units, 0);
  };

  const getClassification = (gpa: number) => {
    return classificationRanges.find(r => gpa >= r.min && gpa <= r.max) || classificationRanges[5];
  };

  const resetCalculator = () => {
    setCourses([{ id: '1', name: '', units: 3, grade: '' }]);
    toast.success('Calculator reset');
  };

  const exportResults = () => {
    const gpa = calculateGPA();
    const classification = getClassification(gpa);
    const validCourses = courses.filter(c => c.grade);
    
    const content = `
GPA CALCULATION REPORT
======================
${semesterName} - ${academicYear}
Generated: ${new Date().toLocaleDateString()}

COURSES:
${validCourses.map(c => `- ${c.name || 'Course'}: ${c.units} units, Grade ${c.grade}`).join('\n')}

SUMMARY:
Total Units: ${getTotalUnits()}
GPA: ${gpa.toFixed(2)}
Classification: ${classification.label}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GPA_Report_${academicYear.replace('/', '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  const gpa = calculateGPA();
  const classification = getClassification(gpa);
  const ClassificationIcon = classification.icon;

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <SEO 
        title="GPA Calculator - Resources" 
        description="Calculate your semester and cumulative GPA with our easy-to-use tool." 
      />

      <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/resources')}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-nobel-gold transition-colors mb-12"
        >
          <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Back to Resources</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Calculator size={16} className="text-nobel-gold" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Academic Tool</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-serif text-ui-blue leading-tight mb-4">
            GPA <span className="italic text-slate-400">Calculator</span>
          </h1>
          
          <p className="text-slate-500 max-w-xl text-lg leading-relaxed">
            Calculate your Grade Point Average using the Nigerian university 5.0 scale. Track your academic performance across semesters.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            {/* Semester Info */}
            <div className="bg-white border border-slate-200 p-6 mb-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Semester Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Semester</label>
                  <Select value={semesterName} onValueChange={setSemesterName}>
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="First Semester">First Semester</SelectItem>
                      <SelectItem value="Second Semester">Second Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Academic Year</label>
                  <Select value={academicYear} onValueChange={setAcademicYear}>
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024/2025">2024/2025</SelectItem>
                      <SelectItem value="2023/2024">2023/2024</SelectItem>
                      <SelectItem value="2022/2023">2022/2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Courses Table */}
            <div className="bg-white border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Courses</h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetCalculator}
                    className="text-xs"
                  >
                    <RotateCcw size={14} className="mr-1" />
                    Reset
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={exportResults}
                    className="text-xs"
                    disabled={getTotalUnits() === 0}
                  >
                    <Download size={14} className="mr-1" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-3 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <div className="col-span-5">Course Name</div>
                <div className="col-span-2 text-center">Units</div>
                <div className="col-span-3 text-center">Grade</div>
                <div className="col-span-2 text-center">Points</div>
              </div>

              {/* Course Rows */}
              <div className="divide-y divide-slate-100">
                <AnimatePresence>
                  {courses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-4 items-center"
                    >
                      {/* Course Name */}
                      <div className="sm:col-span-5">
                        <label className="sm:hidden text-xs font-medium text-slate-400 mb-1 block">Course Name</label>
                        <Input
                          placeholder={`Course ${index + 1}`}
                          value={course.name}
                          onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                          className="bg-slate-50 border-slate-200"
                        />
                      </div>

                      {/* Units */}
                      <div className="sm:col-span-2">
                        <label className="sm:hidden text-xs font-medium text-slate-400 mb-1 block">Units</label>
                        <Select 
                          value={course.units.toString()} 
                          onValueChange={(v) => updateCourse(course.id, 'units', parseInt(v))}
                        >
                          <SelectTrigger className="bg-slate-50 border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6].map(u => (
                              <SelectItem key={u} value={u.toString()}>{u}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Grade */}
                      <div className="sm:col-span-3">
                        <label className="sm:hidden text-xs font-medium text-slate-400 mb-1 block">Grade</label>
                        <Select 
                          value={course.grade} 
                          onValueChange={(v) => updateCourse(course.id, 'grade', v)}
                        >
                          <SelectTrigger className="bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(gradePoints).map(([grade, points]) => (
                              <SelectItem key={grade} value={grade}>
                                {grade} ({points.toFixed(1)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Points & Delete */}
                      <div className="sm:col-span-2 flex items-center justify-between sm:justify-center gap-2">
                        <span className="text-lg font-serif text-ui-blue">
                          {course.grade ? (gradePoints[course.grade] * course.units).toFixed(1) : '—'}
                        </span>
                        <button
                          onClick={() => removeCourse(course.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add Course Button */}
              <div className="p-4 border-t border-slate-200">
                <Button 
                  variant="outline" 
                  onClick={addCourse}
                  className="w-full border-dashed border-slate-300 hover:border-nobel-gold hover:text-nobel-gold"
                >
                  <Plus size={16} className="mr-2" />
                  Add Course
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* GPA Result */}
            <div className={`${classification.color} text-white p-8 relative overflow-hidden`}>
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <ClassificationIcon size={120} />
              </div>
              
              <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-2">Your GPA</p>
              <div className="text-6xl font-serif mb-4">{gpa.toFixed(2)}</div>
              <p className="text-lg font-medium">{classification.label}</p>
              
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Total Units</span>
                  <span className="font-bold">{getTotalUnits()}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="opacity-80">Total Points</span>
                  <span className="font-bold">{(gpa * getTotalUnits()).toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Grade Scale Reference */}
            <div className="bg-white border border-slate-200 p-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Grade Scale</h3>
              <div className="space-y-3">
                {Object.entries(gradePoints).map(([grade, points]) => (
                  <div key={grade} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 flex items-center justify-center bg-slate-100 font-bold text-ui-blue">
                        {grade}
                      </span>
                      <span className="text-slate-500 text-xs">{gradeDescriptions[grade]}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-700">{points.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Classification Reference */}
            <div className="bg-white border border-slate-200 p-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Classification</h3>
              <div className="space-y-2">
                {classificationRanges.slice(0, 5).map((range) => (
                  <div key={range.label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{range.label}</span>
                    <span className="font-mono text-slate-400 text-xs">
                      {range.min.toFixed(2)} - {range.max.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GPACalculatorPage;
