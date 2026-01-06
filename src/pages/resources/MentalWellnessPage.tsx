import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Phone, MessageCircle, BookOpen, Users, Clock,
  ArrowLeft, ExternalLink, Shield, Smile, Brain, Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEO } from '@/components/SEO';

const emergencyContacts = [
  { name: 'UI Counseling Center', phone: '+234 XXX XXX XXXX', hours: 'Mon-Fri 8am-5pm' },
  { name: 'Nigeria Suicide Prevention', phone: '0800 123 4567', hours: '24/7' },
  { name: 'Campus Security', phone: '+234 XXX XXX XXXX', hours: '24/7' },
];

const resources = [
  {
    title: 'Stress Management',
    description: 'Techniques and strategies to manage academic stress and maintain balance.',
    icon: Brain,
    color: 'bg-purple-500',
    tips: ['Practice deep breathing', 'Take regular breaks', 'Exercise regularly', 'Get enough sleep']
  },
  {
    title: 'Anxiety Support',
    description: 'Understanding and coping with anxiety during your university journey.',
    icon: Shield,
    color: 'bg-blue-500',
    tips: ['Identify triggers', 'Practice mindfulness', 'Talk to someone', 'Limit caffeine']
  },
  {
    title: 'Building Resilience',
    description: 'Develop mental strength to overcome challenges and setbacks.',
    icon: Sun,
    color: 'bg-amber-500',
    tips: ['Set realistic goals', 'Learn from failures', 'Build connections', 'Stay optimistic']
  },
  {
    title: 'Social Wellbeing',
    description: 'Maintaining healthy relationships and combating loneliness.',
    icon: Smile,
    color: 'bg-green-500',
    tips: ['Join student clubs', 'Attend events', 'Reach out to friends', 'Volunteer']
  }
];

const selfCareChecklist = [
  'Did you get 7-8 hours of sleep?',
  'Did you eat balanced meals today?',
  'Did you drink enough water?',
  'Did you take a break from screens?',
  'Did you do something you enjoy?',
  'Did you move your body today?',
  'Did you connect with someone?',
  'Did you practice gratitude?'
];

const MentalWellnessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <SEO
        title="Mental Wellness - UISU Resources"
        description="Mental health resources, counseling services, and wellness support for University of Ibadan students."
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
                <Heart className="text-rose-500" /> Mental Wellness
              </h1>
              <p className="text-muted-foreground mt-1">
                Your mental health matters. Find support and resources here.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Emergency Support Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Card className="bg-rose-500/10 border-rose-500/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-foreground mb-1">Need Immediate Support?</h2>
                  <p className="text-muted-foreground text-sm">
                    If you're in crisis or need someone to talk to, help is available 24/7.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {emergencyContacts.map((contact, idx) => (
                    <Button key={idx} variant="outline" size="sm" className="gap-2">
                      <Phone size={14} /> {contact.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {resources.map((resource, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${resource.color} rounded-xl flex items-center justify-center`}>
                      <resource.icon className="text-white" size={24} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="text-sm font-medium mb-3">Quick Tips:</h4>
                  <ul className="space-y-2">
                    {resource.tips.map((tip, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Self-Care Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smile className="text-accent" /> Daily Self-Care Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {selfCareChecklist.map((item, idx) => (
                  <label key={idx} className="flex items-center gap-3 p-3 bg-muted rounded-lg cursor-pointer hover:bg-accent/10 transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded border-border" />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Counseling Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="py-8">
              <Users className="mx-auto text-accent mb-4" size={48} />
              <h3 className="text-xl font-bold mb-2">University Counseling Services</h3>
              <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
                The University of Ibadan offers free, confidential counseling services to all students.
                Professional counselors are available to help with academic stress, personal issues, and more.
              </p>
              <Button className="gap-2">
                Book an Appointment <ExternalLink size={14} />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MentalWellnessPage;