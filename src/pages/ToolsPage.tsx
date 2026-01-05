import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calculator, Clock, CheckSquare, FileText, 
  Ruler, Globe, Activity, Hash, RefreshCcw, User, 
  Calendar, QrCode, Wand2, Type, Database, Timer, 
  Book, PieChart, Volume2, Save, Trash2, Plus, Minus,
  AlertCircle, Star, Search, Check, X, SortAsc, AlignLeft,
  Settings, Zap, Code, ShieldCheck, Target, Music, Layout, PenTool,
  Quote, Headphones, CreditCard, BarChart3, Award, Layers, Copy, Download, ExternalLink, Play, Square,
  MapPin, ClipboardCheck, GraduationCap, Bus, Wallet, Info, Sparkles,
  ArrowRight, Filter, SortDesc, MousePointer2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Navbar } from '@/components/Navbar';
import { Menu } from '@/components/Menu';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface ToolDefinition {
  id: string;
  name: string;
  category: 'Academic' | 'Utility' | 'Health' | 'Logistics' | 'Research';
  icon: React.ElementType;
  description: string;
  color: string;
  size?: 'small' | 'medium' | 'large' | 'tall' | 'wide';
}

const toolsList: ToolDefinition[] = [
  { id: 'gpa', name: 'GPA Calculator', category: 'Academic', icon: Calculator, description: 'Semester GPA Indexer.', color: 'bg-blue-600', size: 'large' },
  { id: 'pomodoro', name: 'Pomodoro Timer', category: 'Utility', icon: Clock, description: 'Concentration cycles.', color: 'bg-red-600', size: 'medium' },
  { id: 'timetable', name: 'Class Timetable', category: 'Academic', icon: Layout, description: 'Temporal schedule matrix.', color: 'bg-orange-500', size: 'wide' },
  { id: 'todo', name: 'Exam To-Do', category: 'Utility', icon: CheckSquare, description: 'Task fulfillment ledger.', color: 'bg-indigo-600', size: 'medium' },
  { id: 'dictionary', name: 'Mini Dictionary', category: 'Research', icon: Book, description: 'UI lexicon lookup.', color: 'bg-stone-600', size: 'medium' },
  { id: 'cgpa', name: 'CGPA Forecaster', category: 'Academic', icon: PieChart, description: 'Trajectory projection.', color: 'bg-emerald-600', size: 'small' },
  { id: 'converter', name: 'Unit Converter', category: 'Utility', icon: Ruler, description: 'Metric transformation.', color: 'bg-slate-600', size: 'small' },
  { id: 'calculator', name: 'Sci-Calculator', category: 'Utility', icon: Hash, description: 'Binary logic module.', color: 'bg-zinc-800', size: 'small' },
  { id: 'wordcount', name: 'Word Counter', category: 'Research', icon: Type, description: 'Lexical stats.', color: 'bg-teal-600', size: 'small' },
  { id: 'bmi', name: 'Health (BMI)', category: 'Health', icon: Activity, description: 'Physiological index.', color: 'bg-rose-600', size: 'small' },
  { id: 'age', name: 'Age Calculator', category: 'Utility', icon: Calendar, description: 'Cycle breakdown.', color: 'bg-orange-600', size: 'small' },
  { id: 'idcard', name: 'Mock ID Maker', category: 'Logistics', icon: User, description: 'Identity simulation.', color: 'bg-sky-700', size: 'small' },
  { id: 'qr', name: 'QR Generator', category: 'Utility', icon: QrCode, description: 'Custom encryption.', color: 'bg-purple-600', size: 'small' },
  { id: 'picker', name: 'Random Picker', category: 'Utility', icon: Wand2, description: 'Selection algorithm.', color: 'bg-fuchsia-600', size: 'small' },
  { id: 'timer', name: 'Stopwatch', category: 'Utility', icon: Timer, description: 'Precision capture.', color: 'bg-cyan-600', size: 'small' },
  { id: 'budget', name: 'Pocket Budget', category: 'Utility', icon: Database, description: 'Fiscal management.', color: 'bg-lime-700', size: 'small' },
  { id: 'tts', name: 'Text-to-Speech', category: 'Utility', icon: Volume2, description: 'Audio synthesis.', color: 'bg-pink-600', size: 'small' },
  { id: 'percentage', name: 'Perc. Calculator', category: 'Utility', icon: Hash, description: 'Ratio shortcuts.', color: 'bg-violet-600', size: 'small' },
  { id: 'countdown', name: 'Exam Countdown', category: 'Academic', icon: Calendar, description: 'Temporal proximity.', color: 'bg-red-700', size: 'small' },
  { id: 'caseconvert', name: 'Case Converter', category: 'Research', icon: Type, description: 'Text normalization.', color: 'bg-indigo-400', size: 'small' },
  { id: 'listsorter', name: 'List Sorter', category: 'Utility', icon: SortAsc, description: 'Array organization.', color: 'bg-emerald-400', size: 'small' },
  { id: 'lorem', name: 'Lorem Ipsum', category: 'Research', icon: AlignLeft, description: 'Buffer text synth.', color: 'bg-slate-400', size: 'small' },
  { id: 'base64', name: 'Base64 Tool', category: 'Utility', icon: Code, description: 'Encoding logic.', color: 'bg-cyan-800', size: 'small' },
  { id: 'symbols', name: 'Symbol Map', category: 'Research', icon: Star, description: 'Math notation.', color: 'bg-rose-400', size: 'small' },
  { id: 'gradeneed', name: 'Exam Target', category: 'Academic', icon: Target, description: 'Score goal module.', color: 'bg-red-500', size: 'small' },
  { id: 'flashcards', name: 'Flashcards', category: 'Academic', icon: Layers, description: 'Recall training.', color: 'bg-yellow-700', size: 'small' },
  { id: 'class_calc', name: 'Degree Class', category: 'Academic', icon: GraduationCap, description: 'Honors checker.', color: 'bg-indigo-900', size: 'small' },
  { id: 'stress_tips', name: 'Stress Relief', category: 'Health', icon: Sparkles, description: 'Cortisol mitigation.', color: 'bg-rose-500', size: 'small' },
];

const ToolsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('All');
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('ASC');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  const categories = ['All', 'Academic', 'Utility', 'Health', 'Logistics', 'Research'];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const navLinks = [
    { name: "Governance", href: "/governance" },
    { name: "Leaders", href: "/current-leaders" },
    { name: "Past Leaders", href: "/past-leaders" },
    { name: "Documents", href: "/documents" },
    { name: "Inks Vault", href: "/inks-vault" },
    { name: "Campus Map", href: "/campus-map" },
    { name: "Communities", href: "/communities" },
    { name: "Events", href: "/events" },
    { name: "Announcements", href: "/announcements" },
    { name: "Tools", href: "/tools" },
  ];

  const filteredTools = toolsList
    .filter(t => (filterCat === 'All' || t.category === filterCat) && t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
        if (sortDir === 'ASC') return a.name.localeCompare(b.name);
        return b.name.localeCompare(a.name);
    });

  const getGridSpan = (size?: string) => {
    switch (size) {
      case 'large': return 'md:col-span-6 md:row-span-2';
      case 'medium': return 'md:col-span-3 md:row-span-1';
      case 'tall': return 'md:col-span-3 md:row-span-2';
      case 'wide': return 'md:col-span-6 md:row-span-1';
      default: return 'md:col-span-3 md:row-span-1';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SEO 
        title="Tools | UISU Archive"
        description="Student productivity tools including GPA calculator, Pomodoro timer, flashcards, and more."
        image="/screenshots/index.png"
      />
      
      <Navbar
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        user={user}
        handleLogout={handleLogout}
      />

      <Menu
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        navLinks={navLinks}
      />

      <div className="pt-32 pb-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <button 
              onClick={activeTool ? () => setActiveTool(null) : () => navigate('/')}
              className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors"
            >
              <div className="p-2 rounded-none border border-slate-300 group-hover:border-nobel-gold transition-colors">
                <ArrowLeft size={14} />
              </div>
              <span>{activeTool ? 'Return to Matrix' : 'Back to Home'}</span>
            </button>
            
            {!activeTool && (
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-300">
                <Star size={12} fill="currentColor" /> SYSTEM STATUS: OPERATIONAL
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!activeTool ? (
              <motion.div 
                key="hub"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-12">
                  <h1 className="text-5xl md:text-7xl font-serif text-ui-blue mb-4 leading-none">Uite <span className="italic text-slate-300">Matrix</span></h1>
                  <p className="text-lg text-slate-600 font-light max-w-2xl leading-relaxed mb-12">Functional student modules integrated into a high-performance grid system.</p>
                  
                  {/* Hub Controls */}
                  <div className="bg-white border border-slate-200 p-4 md:p-6 mb-8 flex flex-col md:flex-row gap-6 md:items-center shadow-sm">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input 
                        type="text" 
                        placeholder="Find Module..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-none text-sm outline-none focus:border-nobel-gold transition-colors"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Filter size={12} className="text-slate-300" />
                        <select 
                          value={filterCat}
                          onChange={(e) => setFilterCat(e.target.value)}
                          className="bg-slate-50 border border-slate-100 p-2 text-[10px] font-bold uppercase tracking-widest outline-none"
                        >
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <button 
                        onClick={() => setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC')}
                        className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
                      >
                        {sortDir === 'ASC' ? <SortAsc size={14} /> : <SortDesc size={14} />}
                        <span className="text-[10px] font-bold uppercase tracking-widest">{sortDir === 'ASC' ? 'A-Z' : 'Z-A'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bento Grid / Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[180px] gap-3">
                  {filteredTools.map((tool) => (
                    <motion.div 
                      key={tool.id}
                      layoutId={tool.id}
                      whileHover={{ y: -4, scale: 0.99 }}
                      onClick={() => setActiveTool(tool.id)}
                      className={`bg-white border border-slate-200 hover:border-nobel-gold p-6 cursor-pointer group flex flex-col justify-between ${getGridSpan(tool.size)} shadow-sm transition-all duration-300 rounded-none relative overflow-hidden`}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full translate-x-12 -translate-y-12 group-hover:bg-nobel-gold/5 transition-colors pointer-events-none"></div>
                      
                      <div className="relative z-10">
                        <div className={`w-10 h-10 ${tool.color} text-white flex items-center justify-center mb-4 shadow-lg border border-white/20`}>
                          <tool.icon size={20} />
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-nobel-gold mb-1">{tool.category}</div>
                        <h3 className="text-xl font-serif text-ui-blue mb-1 leading-tight">{tool.name}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed font-light line-clamp-2">{tool.description}</p>
                      </div>
                      
                      <div className="relative z-10 mt-auto flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-ui-blue/30 group-hover:text-nobel-gold transition-colors">
                        Execute <MousePointer2 size={10} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="tool-content"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white border border-slate-200 shadow-2xl overflow-hidden min-h-[600px] rounded-none relative"
              >
                <div className="absolute top-0 right-0 p-8 flex items-center gap-4 pointer-events-none opacity-20">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Module ID: {activeTool.toUpperCase()}</div>
                  <Star size={16} fill="currentColor" className="text-nobel-gold" />
                </div>
                
                <div className="p-4 md:p-12 w-full overflow-x-hidden">
                  {renderTool(activeTool)}
                </div>
                
                <div className="bg-slate-50 border-t border-slate-100 p-6 flex justify-between items-center">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">System Record Localized</span>
                  <button onClick={() => setActiveTool(null)} className="text-[9px] font-bold uppercase tracking-widest text-ui-blue hover:text-nobel-gold flex items-center gap-2">Terminating Session <X size={10}/></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// --- TOOL RENDERER LOGIC ---
const renderTool = (id: string) => {
  switch (id) {
    case 'gpa': return <GPACalculator />;
    case 'pomodoro': return <PomodoroTimer />;
    case 'todo': return <ToDoList />;
    case 'wordcount': return <WordCounter />;
    case 'bmi': return <BMICalculator />;
    case 'idcard': return <IDCardGenerator />;
    case 'qr': return <QRGenerator />;
    case 'picker': return <RandomPicker />;
    case 'age': return <AgeCalculator />;
    case 'percentage': return <PercentageCalc />;
    case 'countdown': return <ExamCountdown />;
    case 'timer': return <Stopwatch />;
    case 'budget': return <BudgetTracker />;
    case 'converter': return <UnitConverter />;
    case 'calculator': return <SciCalc />;
    case 'dictionary': return <MiniDictionary />;
    case 'tts': return <TTSApp />;
    case 'cgpa': return <CGPAForecaster />;
    case 'caseconvert': return <CaseConverter />;
    case 'listsorter': return <ListSorter />;
    case 'lorem': return <LoremIpsumGen />;
    case 'base64': return <Base64Tool />;
    case 'symbols': return <SymbolMap />;
    case 'timetable': return <ClassTimetable />;
    case 'gradeneed': return <GradeNeededCalc />;
    case 'flashcards': return <FlashcardsTool />;
    case 'class_calc': return <DegreeClassCalc />;
    case 'stress_tips': return <StressReliefTips />;
    default: return <div className="text-center py-20 text-slate-400">Module not found</div>;
  }
};

// --- TOOL COMPONENTS ---

const GPACalculator = () => {
  const gradeScale: { [key: string]: number } = { 'A': 5.0, 'B': 4.0, 'C': 3.0, 'D': 2.0, 'E': 1.0, 'F': 0.0 };
  const [courses, setCourses] = useState([{ name: 'Course', unit: 3, grade: 'A' }]);

  const addCourse = () => setCourses([...courses, { name: `Course`, unit: 3, grade: 'A' }]);
  const updateCourse = (index: number, field: string, value: string | number) => {
    const updated = [...courses];
    (updated[index] as any)[field] = value;
    setCourses(updated);
  };

  const totalUnits = courses.reduce((sum, c) => sum + c.unit, 0);
  const totalPoints = courses.reduce((sum, c) => sum + (c.unit * gradeScale[c.grade]), 0);
  const gpa = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : '0.00';

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-4xl font-serif text-ui-blue mb-8">Semester GPA Index</h2>
      <div className="space-y-3 mb-8">
        {courses.map((c, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center p-4 bg-slate-50 border border-slate-100">
            <input className="col-span-5 p-3 bg-white border border-slate-100 outline-none text-sm" value={c.name} onChange={e => updateCourse(i, 'name', e.target.value)} />
            <input type="number" className="col-span-3 p-3 bg-white border border-slate-100 outline-none text-sm text-center" value={c.unit} onChange={e => updateCourse(i, 'unit', Number(e.target.value))} />
            <select className="col-span-3 p-3 bg-white border border-slate-100 outline-none text-sm" value={c.grade} onChange={e => updateCourse(i, 'grade', e.target.value)}>
              {Object.keys(gradeScale).map(g => <option key={g}>{g}</option>)}
            </select>
            <button onClick={() => setCourses(courses.filter((_, idx) => idx !== i))} className="col-span-1 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
      <button onClick={addCourse} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ui-blue hover:text-nobel-gold mb-8"><Plus size={14} /> Add Course</button>
      <div className="p-12 bg-ui-blue text-white text-center border-l-8 border-nobel-gold">
        <div className="text-[10px] uppercase tracking-[0.4em] opacity-60 mb-4">Computed Index</div>
        <div className="text-8xl font-serif">{gpa}</div>
        <div className="text-xs mt-4 opacity-40">{totalUnits} Total Units</div>
      </div>
    </div>
  );
};

const CGPAForecaster = () => {
  const [currentCgpa, setCurrentCgpa] = useState(3.5);
  const [currentUnits, setCurrentUnits] = useState(60);
  const [plannedGpa, setPlannedGpa] = useState(4.0);
  const [plannedUnits, setPlannedUnits] = useState(20);

  const forecast = ((currentCgpa * currentUnits) + (plannedGpa * plannedUnits)) / (currentUnits + plannedUnits);

  return (
    <div className="max-w-2xl mx-auto w-full py-12">
      <h2 className="text-4xl font-serif text-ui-blue mb-12">Trajectory Forecast</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-200 border border-slate-200 mb-16 shadow-md">
        <div className="p-8 bg-white"><label className="text-[10px] uppercase font-bold text-slate-300 tracking-widest block mb-4">Base Index</label><input type="number" step="0.01" className="w-full text-4xl font-serif outline-none" value={currentCgpa} onChange={e => setCurrentCgpa(Number(e.target.value))} /></div>
        <div className="p-8 bg-white"><label className="text-[10px] uppercase font-bold text-slate-300 tracking-widest block mb-4">Total Weight</label><input type="number" className="w-full text-4xl font-serif outline-none" value={currentUnits} onChange={e => setCurrentUnits(Number(e.target.value))} /></div>
        <div className="p-8 bg-white"><label className="text-[10px] uppercase font-bold text-slate-300 tracking-widest block mb-4">Target Phase GPA</label><input type="number" step="0.01" className="w-full text-4xl font-serif outline-none" value={plannedGpa} onChange={e => setPlannedGpa(Number(e.target.value))} /></div>
        <div className="p-8 bg-white"><label className="text-[10px] uppercase font-bold text-slate-300 tracking-widest block mb-4">Phase Weight</label><input type="number" className="w-full text-4xl font-serif outline-none" value={plannedUnits} onChange={e => setPlannedUnits(Number(e.target.value))} /></div>
      </div>
      <div className="p-20 bg-emerald-900 text-white text-center border-l-8 border-nobel-gold relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5"><PieChart size={200} /></div>
        <div className="relative z-10">
          <div className="text-[10px] opacity-60 uppercase tracking-[0.4em] mb-6 font-bold">Projected Cumulative Final</div>
          <div className="text-9xl font-serif leading-none">{forecast.toFixed(2)}</div>
          <p className="mt-12 text-[9px] uppercase tracking-[0.3em] opacity-40">Systemic calculation across {currentUnits + plannedUnits} units</p>
        </div>
      </div>
    </div>
  );
};

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      const nextMode = mode === 'study' ? 'break' : 'study';
      setMode(nextMode);
      setTimeLeft(nextMode === 'study' ? 25 * 60 : 5 * 60);
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col items-center py-20 w-full text-center">
      <div className="flex gap-px bg-slate-200 border border-slate-200 mb-20 shadow-xl">
        <button onClick={() => { setMode('study'); setTimeLeft(25 * 60); setIsActive(false); }} className={`px-10 py-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${mode === 'study' ? 'bg-ui-blue text-white' : 'bg-white text-slate-400 hover:text-ui-blue'}`}>Deep focus</button>
        <button onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }} className={`px-10 py-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${mode === 'break' ? 'bg-nobel-gold text-ui-blue' : 'bg-white text-slate-400 hover:text-nobel-gold'}`}>Recovery</button>
      </div>
      <div className="text-[8rem] md:text-[12rem] font-serif leading-none text-ui-blue tabular-nums mb-20 flex items-center justify-center tracking-tighter">
        {minutes.toString().padStart(2, '0')}<span className="text-slate-100 opacity-50 px-4">:</span>{seconds.toString().padStart(2, '0')}
      </div>
      <div className="flex gap-px bg-slate-100 border border-slate-100">
        <button onClick={() => setIsActive(!isActive)} className={`px-16 py-6 font-bold uppercase text-[10px] tracking-[0.5em] text-white transition-all ${isActive ? 'bg-red-700' : 'bg-ui-blue shadow-2xl scale-105'}`}>{isActive ? 'Interrupt' : 'Initialize Cycle'}</button>
        <button onClick={() => { setTimeLeft(mode === 'study' ? 25 * 60 : 5 * 60); setIsActive(false); }} className="p-6 bg-white text-slate-200 hover:text-slate-600 transition-colors"><RefreshCcw size={24}/></button>
      </div>
    </div>
  );
};

const ToDoList = () => {
  const [tasks, setTasks] = useState<{text: string; done: boolean}[]>([]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { text: newTask.trim(), done: false }]);
      setNewTask('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h2 className="text-4xl font-serif text-ui-blue mb-8">Task Ledger</h2>
      <div className="flex gap-2 mb-8">
        <input 
          className="flex-1 p-4 bg-slate-50 border border-slate-100 outline-none" 
          placeholder="New task..." 
          value={newTask} 
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
        />
        <button onClick={addTask} className="px-6 bg-ui-blue text-white"><Plus size={20} /></button>
      </div>
      <div className="space-y-2">
        {tasks.map((t, i) => (
          <div key={i} className={`flex items-center gap-4 p-4 bg-white border border-slate-100 ${t.done ? 'opacity-50' : ''}`}>
            <button onClick={() => { const updated = [...tasks]; updated[i].done = !updated[i].done; setTasks(updated); }} className={`w-6 h-6 border-2 flex items-center justify-center ${t.done ? 'bg-nobel-gold border-nobel-gold text-white' : 'border-slate-300'}`}>
              {t.done && <Check size={14} />}
            </button>
            <span className={`flex-1 ${t.done ? 'line-through' : ''}`}>{t.text}</span>
            <button onClick={() => setTasks(tasks.filter((_, idx) => idx !== i))} className="text-red-400"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const WordCounter = () => {
  const [text, setText] = useState("");
  const stats = {
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    chars: text.length,
    sentences: text.split(/[.!?]+/).filter(Boolean).length,
    reading: Math.ceil((text.trim() ? text.trim().split(/\s+/).length : 0) / 200)
  };
  return (
    <div className="max-w-4xl mx-auto w-full py-12">
      <h2 className="text-4xl font-serif text-ui-blue mb-12">Lexical Breakdown</h2>
      <textarea className="w-full h-64 p-8 border border-slate-200 focus:border-nobel-gold focus:outline-none font-serif text-xl leading-relaxed mb-8 resize-none bg-slate-50/50 shadow-inner" placeholder="Input buffer for parsing..." value={text} onChange={e => setText(e.target.value)} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 border border-slate-200 shadow-xl">
        {[
          { label: 'Words', val: stats.words },
          { label: 'Characters', val: stats.chars },
          { label: 'Sentences', val: stats.sentences },
          { label: 'Read Time', val: `${stats.reading} min` }
        ].map(s => (
          <div key={s.label} className="p-8 bg-white text-center hover:bg-slate-50 transition-colors">
            <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-300 mb-4">{s.label}</div>
            <div className="text-4xl font-serif text-ui-blue tracking-tighter">{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BMICalculator = () => {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
  return (
    <div className="max-w-2xl mx-auto w-full py-12 text-center">
      <h2 className="text-4xl font-serif text-ui-blue mb-16 leading-none">Physiological Index</h2>
      <div className="space-y-12 mb-16 px-8">
        <div><div className="flex justify-between mb-4"><span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">Mass (KG)</span><span className="font-serif text-2xl text-ui-blue">{weight}</span></div><input type="range" min="40" max="150" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full h-1 bg-slate-200 accent-ui-blue cursor-pointer" /></div>
        <div><div className="flex justify-between mb-4"><span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">Stature (CM)</span><span className="font-serif text-2xl text-ui-blue">{height}</span></div><input type="range" min="100" max="220" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full h-1 bg-slate-200 accent-ui-blue cursor-pointer" /></div>
      </div>
      <div className="p-16 border-l-8 border-rose-600 bg-slate-900 text-white shadow-2xl">
        <div className="text-[10px] uppercase tracking-[0.5em] font-bold text-slate-500 mb-6">Body Mass Index</div>
        <div className="text-8xl font-serif leading-none tracking-tighter">{bmi}</div>
      </div>
    </div>
  );
};

const IDCardGenerator = () => {
  const [name, setName] = useState("STUDENT IDENTITY");
  const [hall, setHall] = useState("HALL CONSTITUENCY");
  const [dept, setDept] = useState("FACULTY ARCHIVE");
  const [level, setLevel] = useState("L00");
  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-12 items-center w-full py-12">
      <div className="flex-1 w-full space-y-6">
        <h2 className="text-4xl font-serif text-ui-blue leading-none">Identity Simulation</h2>
        <input className="w-full p-4 bg-slate-50 border border-slate-100 outline-none text-lg font-serif text-ui-blue focus:border-nobel-gold" value={name} onChange={e => setName(e.target.value.toUpperCase())} />
        <div className="grid grid-cols-2 gap-4">
          <input className="w-full p-3 bg-slate-50 border border-slate-100 outline-none text-xs font-bold uppercase tracking-widest focus:border-nobel-gold" value={hall} onChange={e => setHall(e.target.value.toUpperCase())} />
          <input className="w-full p-3 bg-slate-50 border border-slate-100 outline-none text-xs font-bold uppercase tracking-widest focus:border-nobel-gold" value={dept} onChange={e => setDept(e.target.value.toUpperCase())} />
        </div>
        <input className="w-full p-3 bg-slate-50 border border-slate-100 outline-none text-xs font-bold uppercase tracking-widest focus:border-nobel-gold" value={level} onChange={e => setLevel(e.target.value.toUpperCase())} />
      </div>
      <div className="w-full sm:w-[420px] h-[260px] bg-slate-900 text-white p-8 relative overflow-hidden border border-slate-800 shadow-[0_40px_80px_rgba(0,0,0,0.4)] flex flex-col justify-between group">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/5 rotate-45 group-hover:bg-nobel-gold/10 transition-colors duration-1000"></div>
        <div className="flex justify-between items-start relative z-10">
          <div className="w-16 h-20 bg-white/5 border border-white/10 flex items-center justify-center"><User size={40} className="text-white/10"/></div>
          <div className="text-right border-r-2 border-nobel-gold pr-4">
            <div className="text-[11px] font-bold tracking-[0.3em] uppercase leading-tight text-slate-400">University of Ibadan</div>
            <div className="text-[9px] tracking-[0.2em] uppercase opacity-40 font-light mt-1">Students' Union Matrix</div>
          </div>
        </div>
        <div className="relative z-10">
          <div className="text-xl font-serif font-bold uppercase tracking-tight mb-2 text-nobel-gold">{name || 'SYSTEM USER'}</div>
          <div className="text-[8px] tracking-[0.5em] uppercase text-slate-500 font-bold border-t border-white/5 pt-4">{dept} | {level} | {hall}</div>
        </div>
      </div>
    </div>
  );
};

const QRGenerator = () => {
  const [val, setVal] = useState("HTTPS://UISU.ARCHIVE");
  return (
    <div className="max-w-2xl mx-auto text-center w-full py-12">
      <h2 className="text-4xl font-serif text-ui-blue mb-8 italic">QR Encoder</h2>
      <input className="w-full p-6 bg-slate-50 border border-slate-100 focus:border-nobel-gold focus:outline-none text-2xl font-serif mb-12 text-center text-ui-blue" value={val} onChange={e => setVal(e.target.value.toUpperCase())} />
      <div className="w-64 h-64 mx-auto border-[12px] border-slate-900 p-6 flex items-center justify-center relative bg-white shadow-2xl">
        <QrCode size={160} className="text-slate-900 opacity-10" />
        <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
          <Star size={32} className="text-nobel-gold animate-pulse" fill="currentColor" />
          <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-400">Processing</span>
        </div>
      </div>
    </div>
  );
};

const RandomPicker = () => {
  const [names, setNames] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const pick = () => { if (!names.trim()) return; setPicking(true); setTimeout(() => { const list = names.split('\n').filter(Boolean); setResult(list[Math.floor(Math.random() * list.length)]); setPicking(false); }, 1200); };
  return (
    <div className="max-w-2xl mx-auto w-full py-12">
      <h2 className="text-4xl font-serif text-ui-blue mb-8 italic">Stochastic Selection</h2>
      <textarea className="w-full h-48 p-8 bg-slate-50 border border-slate-100 mb-6 outline-none focus:border-nobel-gold font-light text-lg leading-relaxed resize-none" placeholder="LOG ENTRIES PER LINE..." value={names} onChange={e => setNames(e.target.value.toUpperCase())} />
      <button onClick={pick} disabled={picking} className="w-full py-6 bg-slate-900 text-white font-bold uppercase tracking-[0.5em] text-[11px] shadow-2xl hover:bg-ui-blue transition-all border-l-8 border-nobel-gold">{picking ? 'DETERMINING...' : 'EXECUTE SELECTION'}</button>
      {result && <div className="mt-8 p-12 bg-nobel-gold text-ui-blue text-center text-3xl font-serif border-l-8 border-ui-blue">{result}</div>}
    </div>
  );
};

const AgeCalculator = () => {
  const [dob, setDob] = useState("2000-01-01");
  const birthDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <h2 className="text-4xl font-serif text-ui-blue mb-12 italic">Cycle Breakdown</h2>
      <input type="date" className="p-6 bg-slate-50 border border-slate-100 text-2xl font-serif outline-none mb-12" value={dob} onChange={e => setDob(e.target.value)} />
      <div className="p-16 bg-ui-blue text-white border-l-8 border-nobel-gold">
        <div className="text-[10px] uppercase tracking-[0.4em] opacity-60 mb-4">Computed Age</div>
        <div className="text-8xl font-serif">{age}</div>
        <div className="text-xs opacity-40 mt-4">Years Elapsed</div>
      </div>
    </div>
  );
};

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (running) {
      interval = setInterval(() => setTime(t => t + 10), 10);
    }
    return () => clearInterval(interval);
  }, [running]);

  const format = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <h2 className="text-4xl font-serif text-ui-blue mb-12 italic">Precision Capture</h2>
      <div className="text-8xl font-mono text-ui-blue mb-12 tabular-nums">{format(time)}</div>
      <div className="flex gap-4 justify-center">
        <button onClick={() => setRunning(!running)} className={`px-12 py-4 font-bold uppercase tracking-widest ${running ? 'bg-red-600 text-white' : 'bg-ui-blue text-white'}`}>{running ? 'Stop' : 'Start'}</button>
        <button onClick={() => { setTime(0); setRunning(false); }} className="px-12 py-4 bg-slate-200 font-bold uppercase tracking-widest">Reset</button>
      </div>
    </div>
  );
};

const BudgetTracker = () => {
  const [budget, setBudget] = useState(10000);
  const [spent, setSpent] = useState(0);
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h2 className="text-4xl font-serif text-ui-blue mb-12 italic">Fiscal Management</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-6 bg-slate-50 border border-slate-100">
          <label className="text-[9px] font-bold uppercase tracking-widest text-slate-300 block mb-2">Budget</label>
          <input type="number" className="w-full text-3xl font-serif outline-none bg-transparent" value={budget} onChange={e => setBudget(Number(e.target.value))} />
        </div>
        <div className="p-6 bg-slate-50 border border-slate-100">
          <label className="text-[9px] font-bold uppercase tracking-widest text-slate-300 block mb-2">Spent</label>
          <input type="number" className="w-full text-3xl font-serif outline-none bg-transparent" value={spent} onChange={e => setSpent(Number(e.target.value))} />
        </div>
      </div>
      <div className="p-12 bg-emerald-800 text-white text-center border-l-8 border-nobel-gold">
        <div className="text-[10px] uppercase tracking-widest opacity-60 mb-4">Remaining</div>
        <div className="text-6xl font-serif">₦{(budget - spent).toLocaleString()}</div>
      </div>
    </div>
  );
};

const MiniDictionary = () => {
  const [word, setWord] = useState("");
  const [def, setDef] = useState("");
  const lookup = async () => {
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await res.json();
      setDef(data[0]?.meanings[0]?.definitions[0]?.definition || "No definition found");
    } catch { setDef("Error fetching definition"); }
  };
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h2 className="text-4xl font-serif text-ui-blue mb-8 italic">Lexicon Lookup</h2>
      <div className="flex gap-2 mb-8">
        <input className="flex-1 p-4 bg-slate-50 border border-slate-100 outline-none text-lg" placeholder="Enter word..." value={word} onChange={e => setWord(e.target.value)} />
        <button onClick={lookup} className="px-8 bg-ui-blue text-white font-bold uppercase tracking-widest">Search</button>
      </div>
      {def && <div className="p-8 bg-slate-50 border border-slate-100 font-serif text-lg italic">{def}</div>}
    </div>
  );
};

const UnitConverter = () => {
  const [cm, setCm] = useState(100);
  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <h2 className="text-4xl font-serif text-ui-blue mb-12 italic">Metric Transformation</h2>
      <div className="flex items-center gap-6 bg-slate-50 p-8 border border-slate-100">
        <div className="flex-1">
          <label className="text-[9px] font-bold text-slate-300 uppercase block mb-2">Centimeters</label>
          <input type="number" className="w-full text-3xl font-serif bg-transparent outline-none text-center" value={cm} onChange={e => setCm(Number(e.target.value))} />
        </div>
        <ArrowRight className="text-nobel-gold" />
        <div className="flex-1">
          <label className="text-[9px] font-bold text-slate-300 uppercase block mb-2">Inches</label>
          <div className="text-3xl font-serif text-ui-blue">{(cm * 0.393701).toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

const SciCalc = () => {
  const [expr, setExpr] = useState("");
  const solve = () => { try { setExpr(String(eval(expr))); } catch { setExpr("Error"); } };
  return (
    <div className="max-w-md mx-auto py-12">
      <h2 className="text-4xl font-serif text-ui-blue mb-8 italic text-center">Binary Logic</h2>
      <div className="bg-slate-900 p-6 shadow-2xl border-l-8 border-nobel-gold">
        <div className="bg-white/10 p-4 text-right text-2xl font-mono text-white mb-4 h-16 overflow-hidden">{expr || "0"}</div>
        <div className="grid grid-cols-4 gap-2">
          {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','C','+'].map(k => (
            <button key={k} onClick={() => k === 'C' ? setExpr("") : setExpr(expr + k)} className="p-4 bg-white/5 hover:bg-white/10 text-white font-bold">{k}</button>
          ))}
          <button onClick={solve} className="col-span-4 p-4 bg-nobel-gold text-ui-blue font-bold uppercase tracking-widest">Execute</button>
        </div>
      </div>
    </div>
  );
};

const TTSApp = () => {
  const [text, setText] = useState("");
  const speak = () => {
    const ut = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(ut);
  };
  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <h2 className="text-4xl font-serif text-ui-blue mb-8 italic">Audio Synthesis</h2>
      <textarea className="w-full p-6 bg-slate-50 border border-slate-100 mb-6 font-serif text-lg h-48 outline-none focus:border-nobel-gold" placeholder="Type for narration..." value={text} onChange={e => setText(e.target.value)} />
      <button onClick={speak} className="px-12 py-4 bg-ui-blue text-white font-bold uppercase tracking-[0.4em] hover:bg-nobel-gold transition-colors">Transmit</button>
    </div>
  );
};

const PercentageCalc = () => {
  const [val, setVal] = useState(100);
  const [percent, setPercent] = useState(10);
  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <h2 className="text-4xl font-serif text-ui-blue mb-12 italic">Ratio Determinant</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-6 bg-slate-50 border border-slate-100">
          <label className="text-[9px] font-bold text-slate-300 uppercase block mb-2">Value</label>
          <input type="number" className="w-full text-3xl font-serif bg-transparent outline-none text-center" value={val} onChange={e => setVal(Number(e.target.value))} />
        </div>
        <div className="p-6 bg-slate-50 border border-slate-100">
          <label className="text-[9px] font-bold text-slate-300 uppercase block mb-2">Percentage</label>
          <input type="number" className="w-full text-3xl font-serif bg-transparent outline-none text-center" value={percent} onChange={e => setPercent(Number(e.target.value))} />
        </div>
      </div>
      <div className="p-12 bg-slate-900 text-white border-l-8 border-nobel-gold">
        <div className="text-[10px] uppercase tracking-widest opacity-60 mb-4">Result</div>
        <div className="text-6xl font-serif">{((val * percent) / 100).toFixed(2)}</div>
      </div>
    </div>
  );
};

const ExamCountdown = () => {
  const [targetDate, setTargetDate] = useState("2025-06-01");
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date(targetDate).getTime() - new Date().getTime();
      setTimeLeft(Math.max(0, diff));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <h2 className="text-4xl font-serif text-ui-blue mb-12 italic">Temporal Proximity</h2>
      <input type="date" className="p-4 bg-slate-50 border border-slate-100 mb-8 text-xl font-serif outline-none" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
      <div className="grid grid-cols-3 gap-4">
        <div className="p-8 bg-ui-blue text-white"><div className="text-5xl font-serif">{days}</div><div className="text-[9px] uppercase tracking-widest opacity-40">Days</div></div>
        <div className="p-8 bg-slate-900 text-white"><div className="text-5xl font-serif">{hours}</div><div className="text-[9px] uppercase tracking-widest opacity-40">Hours</div></div>
        <div className="p-8 bg-nobel-gold text-ui-blue"><div className="text-5xl font-serif">{mins}</div><div className="text-[9px] uppercase tracking-widest opacity-40">Mins</div></div>
      </div>
    </div>
  );
};

const CaseConverter = () => {
  const [text, setText] = useState("");
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h2 className="text-4xl font-serif text-ui-blue mb-8 italic text-center">Text Normalization</h2>
      <textarea className="w-full p-6 border border-slate-200 h-48 mb-6 outline-none font-serif text-lg" value={text} onChange={e => setText(e.target.value)} />
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setText(text.toUpperCase())} className="p-4 bg-slate-900 text-white font-bold uppercase tracking-widest">Uppercase</button>
        <button onClick={() => setText(text.toLowerCase())} className="p-4 bg-slate-900 text-white font-bold uppercase tracking-widest">Lowercase</button>
      </div>
    </div>
  );
};

const ListSorter = () => {
  const [list, setList] = useState("");
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h2 className="text-4xl font-serif text-ui-blue mb-8 italic text-center">Array Organization</h2>
      <textarea className="w-full p-6 border border-slate-200 h-64 mb-6 outline-none font-mono" value={list} onChange={e => setList(e.target.value)} />
      <button onClick={() => setList(list.split('\n').sort().join('\n'))} className="w-full py-4 bg-ui-blue text-white font-bold uppercase tracking-widest">Alphabetize</button>
    </div>
  );
};

const LoremIpsumGen = () => {
  const [count, setCount] = useState(1);
  const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aluta continua, victoria ascerta. ".repeat(count);
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h2 className="text-4xl font-serif text-ui-blue mb-8 italic text-center">Buffer Synth</h2>
      <div className="flex gap-4 mb-6">
        <input type="number" className="p-4 border border-slate-200 w-24 text-center" value={count} onChange={e => setCount(Number(e.target.value))} />
        <button className="flex-1 bg-slate-900 text-white font-bold uppercase tracking-widest" onClick={() => navigator.clipboard.writeText(text)}>Copy</button>
      </div>
      <div className="p-8 bg-slate-50 border border-slate-100 font-serif leading-relaxed italic max-h-64 overflow-y-auto">{text}</div>
    </div>
  );
};

const Base64Tool = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const encode = () => setOutput(btoa(input));
  const decode = () => { try { setOutput(atob(input)); } catch { setOutput("Invalid Base64"); } };
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h2 className="text-4xl font-serif text-ui-blue mb-8 italic text-center">Encoding Logic</h2>
      <textarea className="w-full p-4 border border-slate-200 h-24 mb-4" value={input} onChange={e => setInput(e.target.value)} placeholder="Input..." />
      <div className="flex gap-px bg-slate-200 mb-4">
        <button onClick={encode} className="flex-1 p-3 bg-slate-900 text-white font-bold uppercase tracking-widest">Encode</button>
        <button onClick={decode} className="flex-1 p-3 bg-slate-900 text-white font-bold uppercase tracking-widest">Decode</button>
      </div>
      <div className="p-4 bg-slate-50 border border-slate-100 font-mono text-sm break-all min-h-[60px]">{output}</div>
    </div>
  );
};

const SymbolMap = () => {
  const syms = ['Σ', 'Δ', 'Ω', 'μ', 'π', 'θ', 'λ', 'φ', '√', '∞', '∫', '≈', '≠', '≤', '≥'];
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h2 className="text-4xl font-serif text-ui-blue mb-8 italic text-center">Notation Archive</h2>
      <div className="grid grid-cols-5 gap-3">
        {syms.map(s => (
          <button key={s} onClick={() => navigator.clipboard.writeText(s)} className="p-8 bg-white border border-slate-100 text-3xl hover:bg-nobel-gold hover:text-white transition-colors">{s}</button>
        ))}
      </div>
    </div>
  );
};

const ClassTimetable = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const times = ['8AM', '10AM', '12PM', '2PM', '4PM'];
  return (
    <div className="max-w-4xl mx-auto py-12">
      <h2 className="text-4xl font-serif text-ui-blue mb-8 italic">Temporal Matrix</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-4 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest">Time</th>
              {days.map(d => <th key={d} className="p-4 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest">{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {times.map(t => (
              <tr key={t}>
                <td className="p-4 bg-slate-100 text-xs font-bold uppercase tracking-widest text-center">{t}</td>
                {days.map(d => <td key={d} className="p-4 border border-slate-100 bg-white text-center text-sm text-slate-400 hover:bg-nobel-gold/10 cursor-pointer">-</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const GradeNeededCalc = () => {
  const [current, setCurrent] = useState(70);
  const [target, setTarget] = useState(80);
  const [weight, setWeight] = useState(40);
  const needed = ((target - current * (1 - weight/100)) / (weight/100));
  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <h2 className="text-4xl font-serif text-ui-blue mb-12 italic">Score Goal Module</h2>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-slate-50 border border-slate-100">
          <label className="text-[9px] font-bold text-slate-300 uppercase block mb-2">Current %</label>
          <input type="number" className="w-full text-2xl font-serif bg-transparent outline-none text-center" value={current} onChange={e => setCurrent(Number(e.target.value))} />
        </div>
        <div className="p-4 bg-slate-50 border border-slate-100">
          <label className="text-[9px] font-bold text-slate-300 uppercase block mb-2">Target %</label>
          <input type="number" className="w-full text-2xl font-serif bg-transparent outline-none text-center" value={target} onChange={e => setTarget(Number(e.target.value))} />
        </div>
        <div className="p-4 bg-slate-50 border border-slate-100">
          <label className="text-[9px] font-bold text-slate-300 uppercase block mb-2">Exam Weight %</label>
          <input type="number" className="w-full text-2xl font-serif bg-transparent outline-none text-center" value={weight} onChange={e => setWeight(Number(e.target.value))} />
        </div>
      </div>
      <div className="p-12 bg-ui-blue text-white border-l-8 border-nobel-gold">
        <div className="text-[10px] uppercase tracking-widest opacity-60 mb-4">Score Needed</div>
        <div className="text-6xl font-serif">{Math.max(0, needed).toFixed(1)}%</div>
      </div>
    </div>
  );
};

const FlashcardsTool = () => {
  const [cards] = useState([{ front: 'Charter Year?', back: '1948' }, { front: 'Founder?', back: 'Kenneth Mellamby' }]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const next = () => { setFlipped(false); setTimeout(() => setCurrent((current + 1) % cards.length), 100); };
  const prev = () => { setFlipped(false); setTimeout(() => setCurrent((current - 1 + cards.length) % cards.length), 100); };
  
  return (
    <div className="max-w-2xl mx-auto text-center w-full py-12 flex flex-col items-center">
      <h2 className="text-4xl font-serif text-ui-blue mb-12 italic text-center">Recall Matrix</h2>
      <div className="w-full aspect-[1.6/1] cursor-pointer mb-12" onClick={() => setFlipped(!flipped)}>
        <motion.div className="w-full h-full relative shadow-2xl border-4 border-slate-900" animate={{ rotateY: flipped ? 180 : 0 }} style={{ transformStyle: 'preserve-3d' }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-white border border-slate-100" style={{ backfaceVisibility: 'hidden' }}>
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-200 mb-6">Question</span>
            <h3 className="text-4xl font-serif text-ui-blue leading-tight">{cards[current].front}</h3>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-ui-blue border border-ui-blue" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/30 mb-6">Answer</span>
            <h3 className="text-4xl font-serif text-white leading-tight border-b-4 border-nobel-gold pb-4">{cards[current].back}</h3>
          </div>
        </motion.div>
      </div>
      <div className="flex items-center justify-center gap-12 p-px bg-slate-900 shadow-xl">
        <button onClick={prev} className="p-6 text-white hover:bg-white/10 transition-colors border-r border-white/5"><ArrowLeft size={20}/></button>
        <div className="text-[11px] font-bold uppercase tracking-[0.5em] text-nobel-gold px-8">{current + 1} / {cards.length}</div>
        <button onClick={next} className="p-6 text-white hover:bg-white/10 transition-colors border-l border-white/5"><ArrowRight size={20}/></button>
      </div>
    </div>
  );
};

const DegreeClassCalc = () => {
  const [cgpa, setCgpa] = useState(3.5);
  const getClass = (c: number) => {
    if (c >= 4.5) return "First Class Honors";
    if (c >= 3.5) return "Second Class Upper";
    if (c >= 2.4) return "Second Class Lower";
    return "Third Class";
  };
  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <h2 className="text-4xl font-serif text-ui-blue mb-12 italic">Honors Determinant</h2>
      <input type="number" step="0.1" className="text-6xl font-serif text-ui-blue outline-none text-center w-full mb-12 bg-transparent" value={cgpa} onChange={e => setCgpa(Number(e.target.value))} />
      <div className="p-12 bg-nobel-gold text-ui-blue font-serif text-3xl">{getClass(cgpa)}</div>
    </div>
  );
};

const StressReliefTips = () => (
  <div className="max-w-2xl mx-auto py-12">
    <h2 className="text-4xl font-serif text-ui-blue mb-12 italic">Cortisol Mitigation</h2>
    <div className="space-y-4">
      <div className="p-6 border-l-4 border-nobel-gold bg-slate-50 italic font-serif text-lg">"Take a 10-minute walk near the Tower."</div>
      <div className="p-6 border-l-4 border-nobel-gold bg-slate-50 italic font-serif text-lg">"Hydrate at the SUB fountain."</div>
      <div className="p-6 border-l-4 border-nobel-gold bg-slate-50 italic font-serif text-lg">"Listen to Ivory Lo-fi."</div>
      <div className="p-6 border-l-4 border-nobel-gold bg-slate-50 italic font-serif text-lg">"Practice 4-7-8 breathing."</div>
    </div>
  </div>
);

export default ToolsPage;
