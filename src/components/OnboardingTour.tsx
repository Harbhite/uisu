import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, BookOpen, User, X, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

const steps = [
  {
    icon: Search,
    title: 'Quick Search',
    description: 'Find anything across the platform — leaders, documents, events, and more.',
  },
  {
    icon: Command,
    title: 'Command Palette',
    description: 'Press Ctrl+K (or ⌘K) anytime to quickly navigate to any page.',
  },
  {
    icon: BookOpen,
    title: 'Student Resources',
    description: 'Access AI study tools, flashcards, GPA calculator, career hub, and more.',
  },
  {
    icon: User,
    title: 'Your Profile',
    description: 'Complete your profile to personalize your experience and connect with the community.',
  },
];

export const OnboardingTour = ({ userId }: { userId: string }) => {
  const { getAppData, setAppData } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const completed = getAppData<boolean>(`onboarding_done_${userId}`);
    if (!completed) {
      // Delay showing the tour
      const t = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(t);
    }
  }, [userId, getAppData]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setAppData(`onboarding_done_${userId}`, true);
  };

  if (!visible) return null;

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card border border-border rounded-xl p-8 max-w-sm w-full shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={handleDismiss} className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>

          {/* Progress */}
          <div className="flex gap-1.5 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
            <Icon size={28} className="text-primary" />
          </div>

          <h3 className="font-bold text-lg mb-2">{step.title}</h3>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{step.description}</p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{currentStep + 1} of {steps.length}</span>
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest rounded-full hover:bg-primary/90 transition-colors"
            >
              {currentStep < steps.length - 1 ? (
                <>Next <ArrowRight size={12} /></>
              ) : (
                'Get Started'
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
