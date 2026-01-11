import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Search, GraduationCap, CheckCircle2, Circle,
  MapPin, Phone, Mail, Clock, FileText, Download,
  ChevronRight, Users, Building, BookOpen, Heart
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type TimelinePhase = 'pre-arrival' | 'registration' | 'first-week' | 'settling-in';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TimelineStep {
  id: TimelinePhase;
  title: string;
  subtitle: string;
  icon: typeof GraduationCap;
  items: ChecklistItem[];
}

const timelineSteps: TimelineStep[] = [
  {
    id: 'pre-arrival',
    title: 'Pre-Arrival',
    subtitle: 'Before you leave home',
    icon: FileText,
    items: [
      { id: 'pa-1', text: 'Accept your admission offer through JAMB portal', completed: false },
      { id: 'pa-2', text: 'Print admission letter from the school portal', completed: false },
      { id: 'pa-3', text: 'Complete O\'Level result upload if not done', completed: false },
      { id: 'pa-4', text: 'Prepare required documents (Birth certificate, LGA, State of Origin)', completed: false },
      { id: 'pa-5', text: 'Pay acceptance fee through school portal', completed: false },
      { id: 'pa-6', text: 'Arrange accommodation (Hall or off-campus)', completed: false },
      { id: 'pa-7', text: 'Budget for first semester expenses (₦150k-300k minimum)', completed: false },
      { id: 'pa-8', text: 'Pack essential items and personal effects', completed: false }
    ]
  },
  {
    id: 'registration',
    title: 'Registration',
    subtitle: 'Your first official steps',
    icon: BookOpen,
    items: [
      { id: 'rg-1', text: 'Complete biometric data capture at ICT center', completed: false },
      { id: 'rg-2', text: 'Pay school fees via approved bank', completed: false },
      { id: 'rg-3', text: 'Register courses on the school portal', completed: false },
      { id: 'rg-4', text: 'Collect student ID card', completed: false },
      { id: 'rg-5', text: 'Complete faculty registration', completed: false },
      { id: 'rg-6', text: 'Complete departmental registration', completed: false },
      { id: 'rg-7', text: 'Submit original documents for clearance', completed: false },
      { id: 'rg-8', text: 'Collect hall allocation letter (if hostel)', completed: false }
    ]
  },
  {
    id: 'first-week',
    title: 'First Week',
    subtitle: 'Getting oriented',
    icon: Users,
    items: [
      { id: 'fw-1', text: 'Attend general orientation program', completed: false },
      { id: 'fw-2', text: 'Attend faculty/departmental orientation', completed: false },
      { id: 'fw-3', text: 'Locate your lecture halls and faculty buildings', completed: false },
      { id: 'fw-4', text: 'Get your lecture timetable', completed: false },
      { id: 'fw-5', text: 'Join your department\'s WhatsApp group', completed: false },
      { id: 'fw-6', text: 'Meet your class rep and level adviser', completed: false },
      { id: 'fw-7', text: 'Explore Kenneth Dike Library', completed: false },
      { id: 'fw-8', text: 'Locate key places: Health Center, SUB, Banks', completed: false }
    ]
  },
  {
    id: 'settling-in',
    title: 'Settling In',
    subtitle: 'Making UI home',
    icon: Heart,
    items: [
      { id: 'si-1', text: 'Open a student bank account (GTB, First Bank, etc.)', completed: false },
      { id: 'si-2', text: 'Get a good phone data plan (MTN/Airtel for campus)', completed: false },
      { id: 'si-3', text: 'Register with a reading space or carrel', completed: false },
      { id: 'si-4', text: 'Join at least one student organization', completed: false },
      { id: 'si-5', text: 'Establish a study routine', completed: false },
      { id: 'si-6', text: 'Connect with seniors in your department', completed: false },
      { id: 'si-7', text: 'Explore campus food spots (Amala Joint, Chinese, etc.)', completed: false },
      { id: 'si-8', text: 'Learn to balance academics and social life', completed: false }
    ]
  }
];

const survivalTips = [
  { title: 'Always carry your ID', description: 'Security checks are common. Keep your student ID with you at all times.' },
  { title: 'Attend lectures', description: 'UI takes attendance seriously. Some courses have 75% attendance requirements.' },
  { title: 'Respect the 6PM curfew', description: 'University gates close at certain hours. Plan your movements accordingly.' },
  { title: 'Know your Porter', description: 'Hall porters are key contacts. Be respectful and they\'ll help you navigate hall life.' },
  { title: 'Study early', description: 'Don\'t wait until exams. UI academics are rigorous – start studying from week one.' },
  { title: 'Avoid "expo"', description: 'Exam malpractice carries severe penalties including expulsion. Study hard instead.' }
];

const contacts = [
  { title: 'Student Affairs', phone: '+234 803 XXX XXXX', email: 'studentaffairs@ui.edu.ng', location: 'Admin Building' },
  { title: 'Health Center', phone: '+234 802 XXX XXXX', email: 'health@ui.edu.ng', location: 'Jaja Clinic' },
  { title: 'Security', phone: '+234 803 XXX XXXX', email: 'security@ui.edu.ng', location: 'Main Gate' },
  { title: 'ICT Center', phone: '+234 805 XXX XXXX', email: 'ict@ui.edu.ng', location: 'Senate Building' }
];

const downloads = [
  { title: 'Campus Map (PDF)', description: 'Detailed map of all UI buildings and landmarks' },
  { title: 'Orientation Schedule', description: '2025/2026 session orientation timetable' },
  { title: 'Course Registration Guide', description: 'Step-by-step guide with screenshots' },
  { title: 'Hall Allocation Form', description: 'Hostel application template' }
];

const faqs = [
  { q: 'How much are school fees?', a: 'School fees vary by faculty and state of origin. Sciences range from ₦50,000-80,000 for indigenes and ₦120,000-200,000 for non-indigenes. Check the bursary for exact figures.' },
  { q: 'Can I stay off-campus as a fresher?', a: 'Yes, but hall accommodation is recommended for first years to help you adjust. Off-campus options include Agbowo, Bodija, and Sango areas.' },
  { q: 'What\'s the dress code?', a: 'Smart casual is expected. No shorts to lectures, no revealing clothing. Some faculties have specific dress codes (e.g., covered shoes for labs).' },
  { q: 'How do I change my course?', a: 'Course change is possible within your first semester through the Admissions Office. You\'ll need to meet the requirements for the new course.' },
  { q: 'Is there WiFi on campus?', a: 'Limited WiFi is available in some areas. Most students rely on mobile data. MTN and Airtel have the best coverage.' },
  { q: 'Where do I eat on campus?', a: 'Options include hall kitchens, the SUB (Student Union Building), Amala joints near Faculty of Arts, and various "Mama Put" spots around campus.' }
];

const FreshersGuidePage = () => {
  const navigate = useNavigate();
  const [activePhase, setActivePhase] = useState<TimelinePhase>('pre-arrival');
  const [searchTerm, setSearchTerm] = useState('');
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem('freshers-checklist');
    return saved ? JSON.parse(saved) : {};
  });

  const toggleItem = (id: string) => {
    const updated = { ...checklist, [id]: !checklist[id] };
    setChecklist(updated);
    localStorage.setItem('freshers-checklist', JSON.stringify(updated));
  };

  const currentStep = timelineSteps.find(s => s.id === activePhase)!;
  const completedCount = currentStep.items.filter(i => checklist[i.id]).length;

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <SEO 
        title="Fresher's Guide - Resources" 
        description="Everything you need to know as a new student at the University of Ibadan." 
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
            <GraduationCap className="text-nobel-gold w-6 h-6" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">New Students</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl text-ui-blue mb-6"
          >
            Fresher's <span className="italic text-slate-300">Guide</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 font-light max-w-2xl leading-relaxed"
          >
            Welcome to the University of Ibadan. Everything you need to navigate your first steps as a Uite, from admission to settling in.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Your Journey</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 border border-slate-200">
            {timelineSteps.map((step, i) => {
              const Icon = step.icon;
              const isActive = step.id === activePhase;
              const stepCompleted = step.items.filter(item => checklist[item.id]).length;
              const totalItems = step.items.length;
              
              return (
                <button
                  key={step.id}
                  onClick={() => setActivePhase(step.id)}
                  className={`p-6 md:p-8 text-left transition-all ${
                    isActive ? 'bg-ui-blue text-white' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-nobel-gold' : 'text-slate-300'}`}>
                      Step {i + 1}
                    </span>
                  </div>
                  <Icon size={24} className={isActive ? 'text-nobel-gold' : 'text-slate-400'} />
                  <h3 className={`font-serif text-xl mt-4 mb-1 ${isActive ? 'text-white' : 'text-ui-blue'}`}>
                    {step.title}
                  </h3>
                  <p className={`text-xs ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                    {stepCompleted}/{totalItems} completed
                  </p>
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12 mb-20">
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-nobel-gold">{currentStep.subtitle}</span>
                  <h2 className="font-serif text-3xl text-ui-blue">{currentStep.title}</h2>
                </div>
                <div className="text-right">
                  <div className="font-serif text-3xl text-ui-blue">{completedCount}/{currentStep.items.length}</div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Completed</span>
                </div>
              </div>

              <div className="space-y-3">
                {currentStep.items.map((item, i) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => toggleItem(item.id)}
                    className={`w-full flex items-center gap-4 p-4 border transition-all text-left ${
                      checklist[item.id]
                        ? 'bg-green-50 border-green-100'
                        : 'bg-slate-50 border-slate-100 hover:border-nobel-gold/50'
                    }`}
                  >
                    {checklist[item.id] ? (
                      <CheckCircle2 size={20} className="text-green-600 shrink-0" />
                    ) : (
                      <Circle size={20} className="text-slate-300 shrink-0" />
                    )}
                    <span className={`text-sm ${checklist[item.id] ? 'text-green-700 line-through' : 'text-slate-700'}`}>
                      {item.text}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-ui-blue text-white p-8">
              <h3 className="font-serif text-xl mb-6">Fresher's Toolkit</h3>
              <div className="space-y-3">
                {downloads.map((item, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 transition-colors text-left"
                  >
                    <Download size={18} className="text-nobel-gold shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="text-xs text-white/60">{item.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Survival Tips</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {survivalTips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-slate-100 p-8 hover:border-nobel-gold/50 transition-colors"
              >
                <h3 className="font-serif text-xl text-ui-blue mb-3">{tip.title}</h3>
                <p className="text-slate-600 font-light text-sm leading-relaxed">{tip.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Important Contacts</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contacts.map((contact, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-slate-100 p-6"
              >
                <h3 className="font-serif text-lg text-ui-blue mb-4">{contact.title}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone size={14} className="text-slate-300" />
                    {contact.phone}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Mail size={14} className="text-slate-300" />
                    {contact.email}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin size={14} className="text-slate-300" />
                    {contact.location}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">FAQ</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="max-w-3xl">
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 focus:border-nobel-gold focus:outline-none text-lg font-serif transition-colors"
              />
            </div>

            <div className="bg-white border border-slate-100">
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-b border-slate-100 last:border-0">
                    <AccordionTrigger className="px-6 py-5 text-left hover:no-underline hover:bg-slate-50 group">
                      <span className="font-serif text-lg text-ui-blue group-hover:text-nobel-gold transition-colors pr-4">
                        {faq.q}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <p className="text-slate-600 font-light leading-relaxed">{faq.a}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreshersGuidePage;
