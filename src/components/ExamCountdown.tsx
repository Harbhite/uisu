import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ExamEvent {
  id: string;
  title: string;
  event_date: string;
  event_type: string;
}

export const ExamCountdown: React.FC = () => {
  const [exam, setExam] = useState<ExamEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('academic_calendar')
        .select('*')
        .gte('event_date', today)
        .ilike('event_type', '%exam%')
        .order('event_date', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (data) setExam(data as any);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading || !exam) return null;

  const daysUntil = Math.max(0, Math.ceil(
    (new Date(exam.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  ));

  const urgency = daysUntil <= 3 ? 'critical' : daysUntil <= 14 ? 'warning' : 'normal';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative overflow-hidden rounded-2xl border-2 p-6 md:p-8 shadow-xl ${
        urgency === 'critical'
          ? 'bg-red-950 border-red-500 text-white'
          : urgency === 'warning'
          ? 'bg-amber-50 border-amber-400 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100'
          : 'bg-ui-blue border-nobel-gold text-white'
      }`}
    >
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-current opacity-5" />
      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${urgency === 'critical' ? 'bg-red-500/20' : 'bg-current/10'}`}>
            <Calendar size={24} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70 mb-1 flex items-center gap-2">
              <Clock size={10} /> Upcoming Exam
            </div>
            <div className="font-serif text-xl md:text-2xl leading-tight">{exam.title}</div>
            <div className="text-xs opacity-70 mt-1">
              {new Date(exam.event_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-serif font-bold leading-none">{daysUntil}</div>
            <div className="text-[9px] font-bold uppercase tracking-widest opacity-70 mt-1">
              {daysUntil === 1 ? 'Day Left' : 'Days Left'}
            </div>
          </div>
          <Link
            to="/resources/study-tools"
            className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur text-xs font-bold uppercase tracking-widest rounded-full transition-colors whitespace-nowrap"
          >
            <BookOpen size={12} /> Study Now <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
