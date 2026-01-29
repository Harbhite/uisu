import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Heart, Phone, AlertTriangle, ExternalLink,
  Clock, Play, Pause, RotateCcw, Sparkles, BookOpen,
  Users, MessageCircle, ChevronRight
} from 'lucide-react';
import { SEO } from '@/components/SEO';

type ResourceCategory = 'all' | 'crisis' | 'self-care' | 'counseling' | 'peer';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'crisis' | 'self-care' | 'counseling' | 'peer';
  link?: string;
  isExternal?: boolean;
}

const resources: Resource[] = [
  {
    id: 'sos-helpline',
    title: 'SOS Crisis Helpline',
    description: '24/7 emotional support for students in distress. Confidential and free.',
    category: 'crisis',
    link: 'tel:+234800HELPME',
    isExternal: true
  },
  {
    id: 'ui-counseling',
    title: 'UI Counseling Center',
    description: 'Professional counseling services for all UI students. Located at the Student Affairs building.',
    category: 'counseling',
    link: '#'
  },
  {
    id: 'peer-support',
    title: 'Peer Support Network',
    description: 'Trained student volunteers ready to listen and support fellow students.',
    category: 'peer',
    link: '#'
  },
  {
    id: 'mindfulness-app',
    title: 'Headspace (Student Plan)',
    description: 'Free meditation and mindfulness app for students. Manage stress and anxiety.',
    category: 'self-care',
    link: 'https://www.headspace.com/studentplan',
    isExternal: true
  },
  {
    id: 'mental-health-first-aid',
    title: 'Mental Health First Aid Guide',
    description: 'Learn to recognize signs and support peers experiencing mental health challenges.',
    category: 'peer',
    link: '#'
  },
  {
    id: 'anxiety-assessment',
    title: 'GAD-7 Anxiety Screening',
    description: 'Validated self-assessment tool for generalized anxiety. Takes 2 minutes.',
    category: 'self-care',
    link: 'https://www.mdcalc.com/gad-7-general-anxiety-disorder-7',
    isExternal: true
  },
  {
    id: 'depression-assessment',
    title: 'PHQ-9 Depression Screening',
    description: 'Quick screening tool for depression symptoms. Not a diagnosis, but a starting point.',
    category: 'self-care',
    link: 'https://www.mdcalc.com/phq-9-patient-health-questionnaire-9',
    isExternal: true
  },
  {
    id: 'group-therapy',
    title: 'Group Therapy Sessions',
    description: 'Weekly support groups for anxiety, grief, and academic stress. Free for UI students.',
    category: 'counseling',
    link: '#'
  }
];

const articles = [
  { title: 'Managing Exam Anxiety', readTime: '5 min', category: 'Stress' },
  { title: 'Building Healthy Sleep Habits', readTime: '4 min', category: 'Self-Care' },
  { title: 'When to Seek Professional Help', readTime: '6 min', category: 'Guide' },
  { title: 'Coping with Homesickness', readTime: '4 min', category: 'Adjustment' }
];

const BreathingExercise: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [seconds, setSeconds] = useState(4);

  const phaseConfig = {
    inhale: { duration: 4, next: 'hold' as const, text: 'Breathe In' },
    hold: { duration: 4, next: 'exhale' as const, text: 'Hold' },
    exhale: { duration: 6, next: 'inhale' as const, text: 'Breathe Out' }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            const nextPhase = phaseConfig[phase].next;
            setPhase(nextPhase);
            return phaseConfig[nextPhase].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, phase]);

  const reset = () => {
    setIsActive(false);
    setPhase('inhale');
    setSeconds(4);
  };

  return (
    <div className="bg-white border border-slate-100 p-8">
      <h3 className="font-serif text-xl text-ui-blue mb-2">4-4-6 Breathing</h3>
      <p className="text-slate-500 text-sm font-light mb-8">A calming technique to reduce anxiety</p>
      
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40 mb-8">
          <motion.div
            animate={{
              scale: isActive ? (phase === 'exhale' ? 0.8 : 1.2) : 1,
            }}
            transition={{ duration: phaseConfig[phase].duration, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-rose-100 border-2 border-rose-200"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-serif text-4xl text-rose-600">{seconds}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">
              {phaseConfig[phase].text}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-colors"
          >
            {isActive ? <Pause size={14} /> : <Play size={14} />}
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:border-rose-300 transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

const GroundingExercise: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { count: 5, sense: 'things you can SEE', color: 'bg-purple-100 text-purple-600 border-purple-200' },
    { count: 4, sense: 'things you can TOUCH', color: 'bg-blue-100 text-blue-600 border-blue-200' },
    { count: 3, sense: 'things you can HEAR', color: 'bg-green-100 text-green-600 border-green-200' },
    { count: 2, sense: 'things you can SMELL', color: 'bg-amber-100 text-amber-600 border-amber-200' },
    { count: 1, sense: 'thing you can TASTE', color: 'bg-rose-100 text-rose-600 border-rose-200' }
  ];

  return (
    <div className="bg-white border border-slate-100 p-8">
      <h3 className="font-serif text-xl text-ui-blue mb-2">5-4-3-2-1 Grounding</h3>
      <p className="text-slate-500 text-sm font-light mb-8">Use your senses to return to the present</p>

      <div className="space-y-3 mb-8">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => setCurrentStep(i)}
            className={`w-full p-4 border text-left transition-all ${
              i === currentStep 
                ? step.color 
                : i < currentStep 
                  ? 'bg-slate-50 border-slate-100 text-slate-400 line-through'
                  : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
            }`}
          >
            <span className="font-serif text-lg mr-2">{step.count}</span>
            <span className="text-sm">{step.sense}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="flex-1 py-3 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:border-slate-300 disabled:opacity-50 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
          disabled={currentStep === steps.length - 1}
          className="flex-1 py-3 bg-purple-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-purple-600 disabled:opacity-50 transition-colors"
        >
          Next Sense
        </button>
      </div>
    </div>
  );
};

const categoryConfig = {
  crisis: { icon: AlertTriangle, label: 'Crisis Support', color: 'text-red-600' },
  'self-care': { icon: Sparkles, label: 'Self-Care', color: 'text-purple-600' },
  counseling: { icon: Users, label: 'Counseling', color: 'text-ui-blue' },
  peer: { icon: MessageCircle, label: 'Peer Support', color: 'text-emerald-600' }
};

const MentalWellnessPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<ResourceCategory>('all');

  const filteredResources = resources.filter(r => 
    activeCategory === 'all' || r.category === activeCategory
  );

  const categories: { value: ResourceCategory; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'crisis', label: 'Crisis' },
    { value: 'self-care', label: 'Self-Care' },
    { value: 'counseling', label: 'Counseling' },
    { value: 'peer', label: 'Peer Support' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <SEO 
        title="Mental Wellness - Resources" 
        description="Mental health resources and support for University of Ibadan students." 
        image="/og/pages-screenshot/resources_mental-wellness.png"
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

        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <Heart className="text-rose-400 w-6 h-6" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Your Wellbeing</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl text-ui-blue mb-6"
          >
            Mental <span className="italic text-rose-300">Wellness</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 font-light max-w-2xl leading-relaxed"
          >
            Your mental health matters. Access resources, learn coping techniques, and find support. You're not alone.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-rose-500 to-rose-400 text-white p-8 md:p-12 mb-16 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-none">
                <Phone size={24} />
              </div>
              <div>
                <h2 className="font-serif text-2xl mb-2">Need Immediate Support?</h2>
                <p className="text-white/80 font-light">If you're in crisis, help is available 24/7. You don't have to face this alone.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href="tel:+234800HELPME"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white text-rose-500 text-xs font-bold uppercase tracking-widest hover:bg-rose-50 transition-colors"
              >
                <Phone size={16} />
                Call Helpline
              </a>
              <a 
                href="#"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white/20 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/30 transition-colors"
              >
                <MessageCircle size={16} />
                Chat Now
              </a>
            </div>
          </div>
        </motion.div>

        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Guided Exercises</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <BreathingExercise />
            <GroundingExercise />
          </div>
        </div>

        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Resources</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeCategory === cat.value
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-rose-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, i) => {
              const config = categoryConfig[resource.category];
              const Icon = config.icon;

              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-slate-100 p-8 hover:border-rose-200 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-10 h-10 bg-slate-50 border border-slate-100 flex items-center justify-center ${config.color}`}>
                      <Icon size={18} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${config.color}`}>
                      {config.label}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl text-ui-blue group-hover:text-rose-500 transition-colors mb-3">
                    {resource.title}
                  </h3>

                  <p className="text-slate-600 font-light text-sm leading-relaxed mb-6">
                    {resource.description}
                  </p>

                  {resource.link && (
                    <a
                      href={resource.link}
                      target={resource.isExternal ? '_blank' : undefined}
                      rel={resource.isExternal ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-ui-blue transition-colors"
                    >
                      {resource.isExternal ? 'Visit Resource' : 'Learn More'}
                      {resource.isExternal ? <ExternalLink size={12} /> : <ChevronRight size={12} />}
                    </a>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Articles</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.map((article, i) => (
              <motion.a
                key={i}
                href="#"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-slate-100 p-6 hover:border-rose-200 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-rose-400">{article.category}</span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock size={10} /> {article.readTime}
                  </span>
                </div>
                <h3 className="font-serif text-lg text-ui-blue group-hover:text-rose-500 transition-colors">
                  {article.title}
                </h3>
              </motion.a>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-8 md:p-12 max-w-3xl">
          <h3 className="font-serif text-2xl text-ui-blue mb-4">Anonymous Concern Form</h3>
          <p className="text-slate-500 font-light mb-8">Share a concern about yourself or a fellow student. All submissions are confidential.</p>
          
          <form className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Type of Concern
              </label>
              <select className="w-full p-4 border border-slate-200 focus:border-rose-300 focus:outline-none bg-white text-slate-700">
                <option>Self - I need support</option>
                <option>Peer - Worried about someone</option>
                <option>General - Campus mental health</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Your Message
              </label>
              <textarea 
                rows={4}
                placeholder="Share what's on your mind..."
                className="w-full p-4 border border-slate-200 focus:border-rose-300 focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Contact Email (Optional)
              </label>
              <input 
                type="email"
                placeholder="If you'd like us to follow up"
                className="w-full p-4 border border-slate-200 focus:border-rose-300 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-rose-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-rose-600 transition-colors"
            >
              Submit Anonymously
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MentalWellnessPage;
