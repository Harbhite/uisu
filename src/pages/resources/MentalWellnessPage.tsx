import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Heart, Phone, BookOpen, MessageCircle, Users,
  Clock, AlertTriangle, ExternalLink, Play, Pause, RotateCcw,
  Wind, Sparkles, Sun, Moon, Coffee, Leaf, Send, ChevronRight,
  Shield, Brain, HeartHandshake, Smile, Calendar
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Article {
  id: string;
  title: string;
  category: string;
  readTime: string;
  description: string;
}

const articles: Article[] = [
  { id: 'art-1', title: 'Managing Exam Anxiety', category: 'Stress', readTime: '5 min', description: 'Practical techniques to stay calm and focused during exam periods.' },
  { id: 'art-2', title: 'Building Healthy Sleep Habits', category: 'Self-Care', readTime: '4 min', description: 'How quality sleep improves your mental health and academic performance.' },
  { id: 'art-3', title: 'Dealing with Homesickness', category: 'Adjustment', readTime: '6 min', description: 'Tips for freshers adjusting to life away from home.' },
  { id: 'art-4', title: 'When to Seek Professional Help', category: 'Guidance', readTime: '3 min', description: 'Signs that indicate you might benefit from counseling services.' },
  { id: 'art-5', title: 'Mindfulness for Students', category: 'Self-Care', readTime: '7 min', description: 'Simple mindfulness practices you can do between classes.' },
  { id: 'art-6', title: 'Coping with Academic Pressure', category: 'Stress', readTime: '5 min', description: 'Healthy ways to handle the pressure of university expectations.' }
];

const selfAssessments = [
  { title: 'Stress Level Check', description: 'Quick 2-minute assessment of your current stress levels', icon: Brain, color: 'bg-violet-100 text-violet-600' },
  { title: 'Sleep Quality Quiz', description: 'Evaluate your sleep patterns and get tips for improvement', icon: Moon, color: 'bg-indigo-100 text-indigo-600' },
  { title: 'Mood Tracker', description: 'Log your daily mood and identify patterns over time', icon: Smile, color: 'bg-amber-100 text-amber-600' },
  { title: 'Anxiety Screening', description: 'PHQ-9 validated screening tool (not a diagnosis)', icon: HeartHandshake, color: 'bg-rose-100 text-rose-600' }
];

const BreathingExercise: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [count, setCount] = useState(4);
  const [cycles, setCycles] = useState(0);

  const phases = {
    inhale: { duration: 4, next: 'hold' as const, instruction: 'Breathe In' },
    hold: { duration: 7, next: 'exhale' as const, instruction: 'Hold' },
    exhale: { duration: 8, next: 'rest' as const, instruction: 'Breathe Out' },
    rest: { duration: 2, next: 'inhale' as const, instruction: 'Rest' }
  };

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          const currentPhase = phases[phase];
          if (phase === 'rest') {
            setCycles(c => c + 1);
          }
          setPhase(currentPhase.next);
          return phases[currentPhase.next].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase]);

  const reset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCount(4);
    setCycles(0);
  };

  const circleScale = phase === 'inhale' ? 1.3 : phase === 'exhale' ? 0.8 : 1;

  return (
    <div className="bg-gradient-to-br from-violet-50 to-rose-50 dark:from-violet-950/30 dark:to-rose-950/30 rounded-2xl p-8 text-center">
      <h3 className="font-serif text-2xl text-foreground mb-2">4-7-8 Breathing</h3>
      <p className="text-sm text-muted-foreground mb-8">A calming technique to reduce anxiety</p>

      <div className="relative w-48 h-48 mx-auto mb-8">
        <motion.div
          animate={{ scale: isActive ? circleScale : 1 }}
          transition={{ duration: phases[phase].duration, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-300 to-rose-300 opacity-30"
        />
        <motion.div
          animate={{ scale: isActive ? circleScale * 0.85 : 0.85 }}
          transition={{ duration: phases[phase].duration, ease: 'easeInOut' }}
          className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-400 to-rose-400 opacity-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-serif text-foreground">{count}</span>
          <span className="text-sm font-medium text-muted-foreground mt-1">
            {isActive ? phases[phase].instruction : 'Ready'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          onClick={() => setIsActive(!isActive)}
          className="gap-2"
          variant={isActive ? 'destructive' : 'default'}
        >
          {isActive ? <Pause size={18} /> : <Play size={18} />}
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={reset} variant="outline" className="gap-2">
          <RotateCcw size={18} /> Reset
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">Cycles completed: {cycles}</p>
    </div>
  );
};

const GroundingExercise: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const steps = [
    { count: 5, sense: 'things you can SEE', icon: Sun, color: 'text-amber-500' },
    { count: 4, sense: 'things you can TOUCH', icon: Leaf, color: 'text-emerald-500' },
    { count: 3, sense: 'things you can HEAR', icon: Wind, color: 'text-blue-500' },
    { count: 2, sense: 'things you can SMELL', icon: Coffee, color: 'text-orange-500' },
    { count: 1, sense: 'thing you can TASTE', icon: Sparkles, color: 'text-rose-500' }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsActive(false);
      setCurrentStep(0);
      toast.success('Great job! You completed the grounding exercise.');
    }
  };

  const start = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  if (!isActive) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/30 rounded-2xl p-8 text-center">
        <h3 className="font-serif text-2xl text-foreground mb-2">5-4-3-2-1 Grounding</h3>
        <p className="text-sm text-muted-foreground mb-8">Bring yourself back to the present moment</p>

        <div className="flex justify-center gap-2 mb-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className={`p-3 bg-white dark:bg-card rounded-full shadow-sm ${step.color}`}>
                <Icon size={20} />
              </div>
            );
          })}
        </div>

        <Button onClick={start} className="gap-2">
          <Play size={18} /> Begin Exercise
        </Button>
      </div>
    );
  }

  const current = steps[currentStep];
  const Icon = current.icon;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/30 rounded-2xl p-8 text-center">
      <div className="flex justify-center gap-2 mb-8">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i < currentStep ? 'bg-emerald-500' : i === currentStep ? 'bg-emerald-500 scale-150' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-white dark:bg-card shadow-lg flex items-center justify-center ${current.color}`}>
          <Icon size={36} />
        </div>
        <div className="text-6xl font-serif text-foreground mb-2">{current.count}</div>
        <p className="text-lg text-muted-foreground">{current.sense}</p>
      </motion.div>

      <p className="text-sm text-muted-foreground mb-6">Take your time. When ready, continue.</p>

      <Button onClick={nextStep} className="gap-2">
        {currentStep === steps.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={18} />
      </Button>
    </div>
  );
};

const ConcernForm: React.FC = () => {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setSubmitted(true);
      setMessage('');
      toast.success('Your concern has been submitted anonymously.');
    }
  };

  if (submitted) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield size={32} />
        </div>
        <h3 className="font-serif text-xl text-foreground mb-2">Submission Received</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your concern has been submitted anonymously. A counselor will review it within 24-48 hours.
        </p>
        <Button onClick={() => setSubmitted(false)} variant="outline">
          Submit Another
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-violet-100 text-violet-600 rounded-lg">
          <Shield size={20} />
        </div>
        <div>
          <h3 className="font-medium text-foreground">Anonymous Concern Form</h3>
          <p className="text-xs text-muted-foreground">Your identity is protected</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your concern or situation. This will be reviewed by a counselor who may reach out through general announcements if they feel guidance could help others in similar situations."
          className="min-h-[120px] mb-4"
        />
        <Button type="submit" className="w-full gap-2" disabled={!message.trim()}>
          <Send size={16} /> Submit Anonymously
        </Button>
      </form>
    </div>
  );
};

const MentalWellnessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <SEO
        title="Mental Wellness - Resources"
        description="Mental health resources, counseling services, and self-care tools for UI students."
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-rose-500 to-orange-400 rounded-2xl p-6 md:p-8 mb-12 text-white"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="p-4 bg-white/20 rounded-full">
              <AlertTriangle size={32} />
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-2xl md:text-3xl mb-2">Need Immediate Help?</h2>
              <p className="text-white/80 mb-4">
                If you're in crisis or having thoughts of self-harm, please reach out immediately. You are not alone.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-white text-rose-600 hover:bg-white/90 gap-2">
                  <Phone size={18} /> Call Helpline (0800-UI-CARE)
                </Button>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                  <MessageCircle size={18} /> Chat with Counselor
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <Heart className="text-rose-400 w-8 h-8" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">Your Wellbeing Matters</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif text-ui-blue leading-[0.9] mb-6"
          >
            Mental <br />
            <span className="italic text-rose-300">Wellness</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground font-light max-w-2xl leading-relaxed"
          >
            Your mental health is just as important as your academics. Explore resources, learn coping techniques, and know that support is always available.
          </motion.p>
        </div>

        <Tabs defaultValue="resources" className="w-full">
          <TabsList className="w-full max-w-2xl grid grid-cols-4 mb-8">
            <TabsTrigger value="resources" className="gap-2">
              <BookOpen size={16} /> Resources
            </TabsTrigger>
            <TabsTrigger value="exercises" className="gap-2">
              <Wind size={16} /> Exercises
            </TabsTrigger>
            <TabsTrigger value="counseling" className="gap-2">
              <Users size={16} /> Counseling
            </TabsTrigger>
            <TabsTrigger value="support" className="gap-2">
              <HeartHandshake size={16} /> Peer Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resources">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-2">Self-Assessment Tools</h2>
                  <p className="text-muted-foreground mb-6">Quick check-ins to understand how you're doing</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selfAssessments.map((assessment, index) => {
                      const Icon = assessment.icon;
                      return (
                        <motion.a
                          key={index}
                          href="#"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-card p-5 rounded-xl border border-border hover:border-rose-300 hover:shadow-lg transition-all group block"
                        >
                          <div className={`p-3 rounded-lg w-fit mb-3 ${assessment.color}`}>
                            <Icon size={20} />
                          </div>
                          <h3 className="font-medium text-foreground group-hover:text-rose-600 transition-colors mb-1">
                            {assessment.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{assessment.description}</p>
                        </motion.a>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-2">Curated Articles</h2>
                  <p className="text-muted-foreground mb-6">Expert-written guides on common student challenges</p>

                  <div className="space-y-4">
                    {articles.map((article, index) => (
                      <motion.a
                        key={article.id}
                        href="#"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-rose-300 transition-all group block"
                      >
                        <div className="p-3 bg-muted rounded-lg group-hover:bg-rose-100 transition-colors">
                          <BookOpen size={20} className="text-muted-foreground group-hover:text-rose-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-widest rounded">
                              {article.category}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock size={12} /> {article.readTime}
                            </span>
                          </div>
                          <h3 className="font-medium text-foreground group-hover:text-rose-600 transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{article.description}</p>
                        </div>
                        <ExternalLink size={16} className="text-muted-foreground group-hover:text-rose-600" />
                      </motion.a>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <ConcernForm />

                <div className="bg-gradient-to-br from-violet-100 to-rose-100 dark:from-violet-950/50 dark:to-rose-950/50 p-6 rounded-xl">
                  <h3 className="font-serif text-lg text-foreground mb-2">Quick Relaxation</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Take a moment to breathe. Even 1 minute can make a difference.
                  </p>
                  <Button variant="outline" className="w-full gap-2" onClick={() => document.getElementById('exercises-tab')?.click()}>
                    <Wind size={16} /> Try Breathing Exercise
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="exercises">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <BreathingExercise />
              <GroundingExercise />
            </div>

            <div className="mt-8 bg-card p-6 rounded-xl border border-border">
              <h3 className="font-serif text-xl text-foreground mb-4">More Techniques</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Progressive Muscle Relaxation', duration: '10 min', icon: Leaf },
                  { title: 'Guided Meditation', duration: '5-15 min', icon: Moon },
                  { title: 'Positive Affirmations', duration: '2 min', icon: Sparkles }
                ].map((technique, i) => {
                  const Icon = technique.icon;
                  return (
                    <a
                      key={i}
                      href="#"
                      className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors flex items-center gap-3"
                    >
                      <div className="p-2 bg-card rounded-lg">
                        <Icon size={20} className="text-rose-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground text-sm">{technique.title}</h4>
                        <span className="text-xs text-muted-foreground">{technique.duration}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="counseling">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card p-8 rounded-xl border border-border">
                  <h2 className="font-serif text-2xl text-foreground mb-2">Campus Counseling Center</h2>
                  <p className="text-muted-foreground mb-6">
                    Free, confidential counseling services available to all registered students.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Office Hours</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Monday - Friday: 8:00 AM - 4:00 PM</p>
                        <p>Saturday: 9:00 AM - 1:00 PM</p>
                        <p>Sunday: Closed (Emergency line available)</p>
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Location</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Student Affairs Building, 2nd Floor<br />
                        Room 201-203
                      </p>
                      <a href="#" className="text-sm text-rose-600 hover:underline">View on campus map</a>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button className="gap-2">
                      <Calendar size={16} /> Book Appointment
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Phone size={16} /> Call: 0803-XXX-XXXX
                    </Button>
                  </div>
                </div>

                <div className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="font-serif text-xl text-foreground mb-4">Services Offered</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'Individual Counseling',
                      'Group Therapy Sessions',
                      'Stress Management',
                      'Academic Support',
                      'Relationship Counseling',
                      'Crisis Intervention',
                      'Grief Counseling',
                      'Career Guidance'
                    ].map((service, i) => (
                      <div key={i} className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-rose-400" />
                        {service}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-rose-500 to-orange-400 p-6 rounded-xl text-white">
                  <h3 className="font-serif text-xl mb-2">What to Expect</h3>
                  <p className="text-sm text-white/80 mb-4">
                    Your first session is about getting to know you. There's no judgment - just support.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Shield size={16} className="shrink-0 mt-0.5" />
                      100% confidential
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart size={16} className="shrink-0 mt-0.5" />
                      No judgment, just support
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock size={16} className="shrink-0 mt-0.5" />
                      Sessions are 45-60 minutes
                    </li>
                  </ul>
                </div>

                <div className="bg-card p-6 rounded-xl border border-border">
                  <h4 className="font-medium text-foreground mb-3">Emergency Contacts</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Crisis Hotline</span>
                      <span className="font-medium text-foreground">0800-UI-CARE</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">After Hours</span>
                      <span className="font-medium text-foreground">0803-XXX-XXXX</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Campus Security</span>
                      <span className="font-medium text-foreground">0803-XXX-XXXX</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="support">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card p-8 rounded-xl border border-border">
                  <h2 className="font-serif text-2xl text-foreground mb-2">Peer Support Network</h2>
                  <p className="text-muted-foreground mb-6">
                    Connect with trained student volunteers who understand what you're going through.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-5 bg-muted/50 rounded-lg">
                      <Users className="text-rose-500 mb-3" size={32} />
                      <h4 className="font-medium text-foreground mb-1">Peer Counselors</h4>
                      <p className="text-sm text-muted-foreground">
                        Trained students available for informal conversations and support.
                      </p>
                    </div>
                    <div className="p-5 bg-muted/50 rounded-lg">
                      <HeartHandshake className="text-rose-500 mb-3" size={32} />
                      <h4 className="font-medium text-foreground mb-1">Support Groups</h4>
                      <p className="text-sm text-muted-foreground">
                        Weekly group sessions on various topics - anxiety, stress, relationships.
                      </p>
                    </div>
                  </div>

                  <Button className="gap-2">
                    <MessageCircle size={16} /> Join Peer Support
                  </Button>
                </div>

                <div className="bg-gradient-to-r from-violet-100 to-rose-100 dark:from-violet-950/50 dark:to-rose-950/50 p-6 rounded-xl">
                  <h3 className="font-serif text-xl text-foreground mb-2">Become a Peer Counselor</h3>
                  <p className="text-muted-foreground mb-4">
                    Want to help fellow students? Join our peer counselor training program.
                  </p>
                  <Button variant="outline">Learn More</Button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="font-medium text-foreground mb-4">Upcoming Group Sessions</h3>
                  <div className="space-y-4">
                    {[
                      { title: 'Managing Exam Stress', day: 'Tuesdays', time: '4:00 PM' },
                      { title: 'Building Self-Esteem', day: 'Wednesdays', time: '5:00 PM' },
                      { title: 'Healthy Relationships', day: 'Thursdays', time: '4:00 PM' }
                    ].map((session, i) => (
                      <div key={i} className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-medium text-foreground text-sm">{session.title}</h4>
                        <p className="text-xs text-muted-foreground">{session.day} at {session.time}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card p-6 rounded-xl border border-border text-center">
                  <Heart className="text-rose-400 mx-auto mb-3" size={32} />
                  <p className="text-sm text-muted-foreground">
                    "You don't have to struggle alone. Reaching out is a sign of strength."
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MentalWellnessPage;
