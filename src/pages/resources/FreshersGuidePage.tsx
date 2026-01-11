import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Compass, Map, Check, ChevronDown, ChevronRight,
  Plane, FileCheck, Calendar, Home, Phone, Mail, Clock,
  Download, Search, BookOpen, Users, Coffee, MapPin, Building,
  AlertCircle, CheckCircle2, Circle, Star, Heart, Zap
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface TimelinePhase {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  checklist: { id: string; task: string; description: string }[];
}

const timelinePhases: TimelinePhase[] = [
  {
    id: 'pre-arrival',
    title: 'Pre-Arrival',
    subtitle: 'Before You Arrive',
    icon: Plane,
    color: 'bg-violet-500',
    checklist: [
      { id: 'pa-1', task: 'Accept your admission offer', description: 'Log into the admission portal and accept your offer within the deadline.' },
      { id: 'pa-2', task: 'Pay acceptance fee', description: 'Pay the required acceptance fee through the school portal.' },
      { id: 'pa-3', task: 'Complete biodata form', description: 'Fill out all required personal and academic information online.' },
      { id: 'pa-4', task: 'Print admission letter', description: 'Download and print your official admission letter.' },
      { id: 'pa-5', task: 'Prepare documents', description: 'Original O\'Level results, birth certificate, passport photos (white background).' },
      { id: 'pa-6', task: 'Arrange accommodation', description: 'Apply for hostel or arrange off-campus accommodation.' }
    ]
  },
  {
    id: 'registration',
    title: 'Registration',
    subtitle: 'Week of Arrival',
    icon: FileCheck,
    color: 'bg-emerald-500',
    checklist: [
      { id: 'reg-1', task: 'Physical screening', description: 'Visit Jaja Clinic for medical screening and clearance.' },
      { id: 'reg-2', task: 'Faculty registration', description: 'Report to your faculty for departmental registration.' },
      { id: 'reg-3', task: 'Course registration', description: 'Register your courses on the student portal before deadline.' },
      { id: 'reg-4', task: 'Pay school fees', description: 'Complete school fees payment through designated banks.' },
      { id: 'reg-5', task: 'Get student ID', description: 'Collect your student ID card from the ICT center.' },
      { id: 'reg-6', task: 'Library registration', description: 'Register at Kenneth Dike Library for borrowing privileges.' }
    ]
  },
  {
    id: 'first-week',
    title: 'First Week',
    subtitle: 'Getting Oriented',
    icon: Calendar,
    color: 'bg-amber-500',
    checklist: [
      { id: 'fw-1', task: 'Attend orientation', description: 'Join the official fresher\'s orientation program.' },
      { id: 'fw-2', task: 'Explore campus', description: 'Familiarize yourself with key locations and buildings.' },
      { id: 'fw-3', task: 'Meet your coursemates', description: 'Connect with students in your department and level.' },
      { id: 'fw-4', task: 'Join WhatsApp groups', description: 'Join your department and hall WhatsApp groups.' },
      { id: 'fw-5', task: 'Locate lecture venues', description: 'Find your lecture halls before classes begin.' },
      { id: 'fw-6', task: 'Set up banking', description: 'Open a student bank account if you don\'t have one.' }
    ]
  },
  {
    id: 'settling-in',
    title: 'Settling In',
    subtitle: 'First Month',
    icon: Home,
    color: 'bg-rose-500',
    checklist: [
      { id: 'si-1', task: 'Join associations', description: 'Explore and join departmental and faculty associations.' },
      { id: 'si-2', task: 'Find study groups', description: 'Connect with serious students for group study.' },
      { id: 'si-3', task: 'Explore extracurriculars', description: 'Check out clubs, societies, and sports teams.' },
      { id: 'si-4', task: 'Establish routine', description: 'Create a balanced schedule for classes, study, and rest.' },
      { id: 'si-5', task: 'Know your rights', description: 'Understand the UISU constitution and student rights.' },
      { id: 'si-6', task: 'Register to vote', description: 'Register for student union elections when announced.' }
    ]
  }
];

const survivalTips = [
  { icon: Coffee, title: 'Best Study Spots', description: 'Kenneth Dike Library, Faculty reading rooms, and the new e-library.' },
  { icon: MapPin, title: 'Getting Around', description: 'Campus shuttles run every 15 mins. Get to know the "Back Gate" and "Main Gate" routes.' },
  { icon: Users, title: 'Making Friends', description: 'Join your departmental association. It\'s the fastest way to meet coursemates.' },
  { icon: Heart, title: 'Stay Healthy', description: 'Jaja Clinic offers free consultations. Register early for the semester.' },
  { icon: Zap, title: 'Power Backup', description: 'Invest in a power bank. Charging points are often crowded.' },
  { icon: Star, title: 'Academic Success', description: 'Attend all lectures, especially in your first semester. It sets the tone.' }
];

const importantContacts = [
  { name: 'Student Affairs', phone: '0803-XXX-XXXX', email: 'studentaffairs@ui.edu.ng', icon: Users },
  { name: 'Jaja Clinic', phone: '0803-XXX-XXXX', email: 'jajaclinic@ui.edu.ng', icon: Heart },
  { name: 'Security (Emergency)', phone: '0803-XXX-XXXX', email: 'security@ui.edu.ng', icon: AlertCircle },
  { name: 'ICT Support', phone: '0803-XXX-XXXX', email: 'ict@ui.edu.ng', icon: Zap },
  { name: 'UISU Secretariat', phone: '0803-XXX-XXXX', email: 'secretariat@uisu.org', icon: Building }
];

const downloads = [
  { title: 'Orientation Schedule 2025/2026', format: 'PDF', size: '2.3 MB' },
  { title: 'Campus Map (Detailed)', format: 'PDF', size: '5.1 MB' },
  { title: 'Student Handbook', format: 'PDF', size: '4.8 MB' },
  { title: 'Course Registration Guide', format: 'PDF', size: '1.2 MB' }
];

const faqs = [
  { q: 'When does registration close?', a: 'Course registration typically closes 4 weeks after resumption. Check the academic calendar for exact dates.' },
  { q: 'Can I change my course after registration?', a: 'Yes, you can add/drop courses within the first 2 weeks. Visit your department for the process.' },
  { q: 'How do I apply for hostel accommodation?', a: 'Hostel allocation is done through the portal. Apply early as spaces are limited. Consider off-campus options as backup.' },
  { q: 'What\'s the dress code on campus?', a: 'There\'s no strict dress code, but dress modestly and appropriately. Some faculties have specific requirements for practicals.' },
  { q: 'How do I join the Students\' Union?', a: 'Every registered student is automatically a member of UISU. Get involved through your hall or departmental associations.' },
  { q: 'Where can I print documents on campus?', a: 'Business centers near faculties, Kenneth Dike Library, and various spots around the halls.' },
  { q: 'Is WiFi available on campus?', a: 'Yes, UI has campus-wide WiFi (eduroam). Register at ICT with your matric number.' },
  { q: 'What banks are on campus?', a: 'GTBank, First Bank, and UBA have branches on campus. ATMs are available at multiple locations.' }
];

const useChecklist = () => {
  const [completed, setCompleted] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('fresher-checklist');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem('fresher-checklist', JSON.stringify(completed));
  }, [completed]);

  const toggle = (id: string) => {
    setCompleted(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const isCompleted = (id: string) => completed.includes(id);
  const getPhaseProgress = (phase: TimelinePhase) => {
    const completedInPhase = phase.checklist.filter(item => completed.includes(item.id)).length;
    return { completed: completedInPhase, total: phase.checklist.length };
  };

  return { completed, toggle, isCompleted, getPhaseProgress };
};

const TimelineStep: React.FC<{
  phase: TimelinePhase;
  index: number;
  isActive: boolean;
  onClick: () => void;
  progress: { completed: number; total: number };
}> = ({ phase, index, isActive, onClick, progress }) => {
  const Icon = phase.icon;
  const isComplete = progress.completed === progress.total;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {index < timelinePhases.length - 1 && (
        <div className={`absolute left-6 top-16 w-0.5 h-full ${isComplete ? 'bg-emerald-300' : 'bg-border'}`} />
      )}

      <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
          isActive ? 'bg-card border border-nobel-gold shadow-lg' : 'hover:bg-muted/50'
        }`}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
          isComplete ? 'bg-emerald-100 text-emerald-600' : isActive ? phase.color + ' text-white' : 'bg-muted text-muted-foreground'
        }`}>
          {isComplete ? <Check size={24} /> : <Icon size={24} />}
        </div>

        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Phase {index + 1}
            </span>
            {isComplete && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full">
                Complete
              </span>
            )}
          </div>
          <h3 className="font-serif text-lg text-foreground">{phase.title}</h3>
          <p className="text-xs text-muted-foreground">{phase.subtitle}</p>
        </div>

        <div className="text-right">
          <div className="text-sm font-medium text-foreground">{progress.completed}/{progress.total}</div>
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            />
          </div>
        </div>

        <ChevronRight size={20} className={`text-muted-foreground transition-transform ${isActive ? 'rotate-90' : ''}`} />
      </button>
    </motion.div>
  );
};

const FreshersGuidePage = () => {
  const navigate = useNavigate();
  const [activePhase, setActivePhase] = useState<string>('pre-arrival');
  const [searchTerm, setSearchTerm] = useState('');
  const { toggle, isCompleted, getPhaseProgress } = useChecklist();

  const currentPhase = timelinePhases.find(p => p.id === activePhase);

  const filteredFaqs = faqs.filter(faq =>
    faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProgress = timelinePhases.reduce((acc, phase) => {
    const progress = getPhaseProgress(phase);
    return { completed: acc.completed + progress.completed, total: acc.total + progress.total };
  }, { completed: 0, total: 0 });

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <SEO
        title="Freshers' Compass - Resources"
        description="Your complete guide to starting life at the University of Ibadan."
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
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">New Students</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif text-ui-blue leading-[0.9] mb-6"
          >
            Freshers' <br />
            <span className="italic text-muted-foreground">Compass</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground font-light max-w-2xl leading-relaxed"
          >
            Welcome to UI! This guide will help you navigate your first days, from pre-arrival preparation to settling into campus life.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl p-8 mb-12 text-white"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-serif text-3xl mb-2">Your Progress</h2>
              <p className="text-white/70">Track your journey from admission to settled Uite</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-serif">{totalProgress.completed}</div>
                <div className="text-xs text-white/60 uppercase tracking-widest">Completed</div>
              </div>
              <div className="w-px h-16 bg-white/20" />
              <div className="text-center">
                <div className="text-5xl font-serif">{totalProgress.total - totalProgress.completed}</div>
                <div className="text-xs text-white/60 uppercase tracking-widest">Remaining</div>
              </div>
              <div className="w-px h-16 bg-white/20" />
              <div className="text-center">
                <div className="text-5xl font-serif">{Math.round((totalProgress.completed / totalProgress.total) * 100)}%</div>
                <div className="text-xs text-white/60 uppercase tracking-widest">Complete</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Timeline</h2>
            {timelinePhases.map((phase, index) => (
              <TimelineStep
                key={phase.id}
                phase={phase}
                index={index}
                isActive={activePhase === phase.id}
                onClick={() => setActivePhase(phase.id)}
                progress={getPhaseProgress(phase)}
              />
            ))}
          </div>

          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {currentPhase && (
                <motion.div
                  key={currentPhase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-card rounded-xl border border-border p-8"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 rounded-lg ${currentPhase.color} text-white`}>
                      <currentPhase.icon size={24} />
                    </div>
                    <div>
                      <h2 className="font-serif text-2xl text-foreground">{currentPhase.title}</h2>
                      <p className="text-sm text-muted-foreground">{currentPhase.subtitle}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {currentPhase.checklist.map((item) => {
                      const completed = isCompleted(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggle(item.id)}
                          className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                            completed
                              ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900'
                              : 'bg-muted/30 border-border hover:border-nobel-gold'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                            completed ? 'bg-emerald-500 text-white' : 'border-2 border-muted-foreground'
                          }`}>
                            {completed && <Check size={14} />}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${completed ? 'text-emerald-700 dark:text-emerald-300 line-through' : 'text-foreground'}`}>
                              {item.task}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <section className="mb-16">
          <h2 className="font-serif text-3xl text-foreground mb-2">Campus Survival Tips</h2>
          <p className="text-muted-foreground mb-8">Quick tips to help you thrive at UI</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {survivalTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card p-6 rounded-xl border border-border hover:border-nobel-gold hover:shadow-lg transition-all group"
                >
                  <div className="p-3 bg-muted rounded-lg w-fit mb-4 group-hover:bg-ui-blue group-hover:text-white transition-colors">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-serif text-lg text-foreground mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="font-serif text-3xl text-foreground mb-2">Important Contacts</h2>
          <p className="text-muted-foreground mb-8">Key offices and their contact information</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {importantContacts.map((contact, index) => {
              const Icon = contact.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card p-5 rounded-xl border border-border"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-muted rounded-lg">
                      <Icon size={20} className="text-ui-blue" />
                    </div>
                    <h3 className="font-medium text-foreground">{contact.name}</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone size={14} /> {contact.phone}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail size={14} /> {contact.email}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="font-serif text-3xl text-foreground mb-2">Fresher's Toolkit</h2>
          <p className="text-muted-foreground mb-8">Download essential documents and guides</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {downloads.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card p-5 rounded-xl border border-border hover:border-nobel-gold transition-all group"
              >
                <div className="p-3 bg-muted rounded-lg w-fit mb-4">
                  <Download size={20} className="text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-1">{item.title}</h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>{item.format}</span>
                  <span>{item.size}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Download size={14} /> Download
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-3xl text-foreground mb-2">Frequently Asked Questions</h2>
          <p className="text-muted-foreground mb-6">Quick answers to common fresher questions</p>

          <div className="relative max-w-2xl mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base rounded-full border-border"
            />
          </div>

          <Accordion type="single" collapsible className="space-y-3 max-w-4xl">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="bg-card rounded-xl border border-border px-6"
              >
                <AccordionTrigger className="hover:no-underline py-5">
                  <span className="text-left font-medium text-foreground">{faq.q}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-5">
                  <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filteredFaqs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Search className="mx-auto text-muted-foreground mb-4" size={48} />
              <p className="text-muted-foreground">No FAQs match your search</p>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FreshersGuidePage;
