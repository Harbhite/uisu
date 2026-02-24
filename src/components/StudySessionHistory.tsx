import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, BookOpen, CalendarDays, Layers, Swords, ChevronRight, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Session {
  id: string;
  mode: string;
  topic: string | null;
  material_preview: string | null;
  response: string;
  created_at: string;
}

const modeIcons: Record<string, React.ElementType> = {
  explainer: BookOpen,
  planner: CalendarDays,
  synthesizer: Layers,
  debater: Swords,
};

interface StudySessionHistoryProps {
  onLoadSession: (session: Session) => void;
}

export const StudySessionHistory: React.FC<StudySessionHistoryProps> = ({ onLoadSession }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('study_sessions' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    setSessions((data as any as Session[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) fetchSessions();
  }, [isOpen]);

  const deleteSession = async (id: string) => {
    await supabase.from('study_sessions' as any).delete().eq('id', id);
    setSessions(prev => prev.filter(s => s.id !== id));
    toast.success('Session deleted');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-3 border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent hover:border-accent transition-all rounded-lg"
      >
        <History size={14} /> Past Sessions
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-card border border-border rounded-lg overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <History size={14} className="text-accent" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Past Sessions</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X size={14} />
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto divide-y divide-border">
        {loading ? (
          <div className="p-4 text-center text-xs text-muted-foreground">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">No saved sessions yet. Generate a response to save one.</div>
        ) : (
          sessions.map(session => {
            const Icon = modeIcons[session.mode] || BookOpen;
            return (
              <div key={session.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group">
                <Icon size={14} className="text-accent shrink-0" />
                <button
                  onClick={() => { onLoadSession(session); setIsOpen(false); }}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="text-xs font-medium text-foreground truncate">
                    {session.topic || 'Untitled session'}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {session.mode} • {format(new Date(session.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 size={12} />
                </button>
                <ChevronRight size={12} className="text-muted-foreground/30" />
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
