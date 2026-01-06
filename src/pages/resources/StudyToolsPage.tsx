import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, Clock, Target, BookOpen, Lightbulb, CheckSquare,
  ArrowLeft, ExternalLink, Timer, Calendar, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEO } from '@/components/SEO';

const studyTechniques = [
  {
    name: 'Pomodoro Technique',
    description: 'Work in 25-minute focused sessions with 5-minute breaks.',
    icon: Timer,
    color: 'bg-red-500',
    steps: ['Set a timer for 25 minutes', 'Focus on one task', 'Take a 5-min break', 'After 4 cycles, take a longer break']
  },
  {
    name: 'Active Recall',
    description: 'Test yourself instead of passively re-reading notes.',
    icon: Brain,
    color: 'bg-purple-500',
    steps: ['Read material once', 'Close your notes', 'Write what you remember', 'Check and repeat']
  },
  {
    name: 'Spaced Repetition',
    description: 'Review material at increasing intervals for better retention.',
    icon: Calendar,
    color: 'bg-blue-500',
    steps: ['Review after 1 day', 'Review after 3 days', 'Review after 1 week', 'Review after 2 weeks']
  },
  {
    name: 'Feynman Technique',
    description: 'Explain concepts in simple terms to truly understand them.',
    icon: Lightbulb,
    color: 'bg-amber-500',
    steps: ['Choose a concept', 'Explain it simply', 'Identify gaps', 'Review and simplify']
  }
];

const productivityTools = [
  { name: 'GPA Tracker', desc: 'Calculate and track your semester GPA', link: '/tools', icon: BarChart3 },
  { name: 'Pomodoro Timer', desc: 'Focus timer with automatic breaks', link: '/tools', icon: Timer },
  { name: 'Quick Todo', desc: 'Simple task management', link: '/tools', icon: CheckSquare },
  { name: 'Quick Notes', desc: 'Scratch pad for ideas', link: '/tools', icon: BookOpen },
];

const timeManagementTips = [
  'Use a planner or digital calendar',
  'Set specific goals for each study session',
  'Prioritize tasks using the Eisenhower Matrix',
  'Batch similar tasks together',
  'Eliminate distractions during study time',
  'Review your week every Sunday',
  'Schedule breaks and downtime',
  'Learn to say no to non-essential activities'
];

const StudyToolsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <SEO
        title="Study Tools - UISU Resources"
        description="Productivity tools, study techniques, and academic success strategies for students."
        image="/screenshots/documents.png"
      />

      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/resources')}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground flex items-center gap-3">
                <Brain className="text-purple-500" /> Study Tools
              </h1>
              <p className="text-muted-foreground mt-1">
                Master your studies with proven techniques and tools
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Access Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-xl font-bold mb-4">Quick Access Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {productivityTools.map((tool, idx) => (
              <Card 
                key={idx} 
                className="cursor-pointer hover:border-accent transition-colors"
                onClick={() => navigate(tool.link)}
              >
                <CardContent className="p-4 text-center">
                  <tool.icon className="mx-auto text-accent mb-2" size={28} />
                  <h3 className="font-medium text-sm">{tool.name}</h3>
                  <p className="text-xs text-muted-foreground">{tool.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Study Techniques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-xl font-bold mb-4">Proven Study Techniques</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {studyTechniques.map((technique, idx) => (
              <Card key={idx} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${technique.color} rounded-lg flex items-center justify-center`}>
                      <technique.icon className="text-white" size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{technique.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{technique.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {technique.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-xs">
                        <span className="w-5 h-5 bg-accent/20 text-accent rounded-full flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        {step}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Time Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="text-accent" /> Time Management Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                {timeManagementTips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                    <Target className="text-accent shrink-0 mt-0.5" size={16} />
                    <span className="text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Button size="lg" className="gap-2" onClick={() => navigate('/tools')}>
            Open All Tools <ExternalLink size={16} />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default StudyToolsPage;