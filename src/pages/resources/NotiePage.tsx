import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import {
  BookOpen, Trash2, Clock, ChevronLeft, Calendar, FileText, Bookmark
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AIToolsHeader from '@/components/resources/AIToolsHeader';
import { format } from 'date-fns';

interface Notie {
  id: string;
  created_at: string;
  title: string;
  content: string;
  mode: string | null;
}

const NotiePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [noties, setNoties] = useState<Notie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotie, setSelectedNotie] = useState<Notie | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please sign in to view your notes');
      navigate('/auth');
    } else if (user) {
      fetchNoties();
    }
  }, [user, authLoading, navigate]);

  const fetchNoties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('noties')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNoties(data || []);
    } catch (error: any) {
      console.error('Error fetching noties:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const deleteNotie = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const { error } = await supabase.from('noties').delete().eq('id', id);
      if (error) throw error;
      setNoties(noties.filter(n => n.id !== id));
      if (selectedNotie?.id === id) {
        setSelectedNotie(null);
      }
      toast.success('Note deleted successfully');
    } catch (error: any) {
      console.error('Error deleting notie:', error);
      toast.error('Failed to delete note');
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <SEO
        title="MyNotes - Saved Study Outputs"
        description="Access and review your saved generated content from StudyBuddy."
      />

      <AIToolsHeader title="MyNotes" subtitle="Saved Study Outputs" icon={Bookmark} />

      <div className="container mx-auto px-4 max-w-6xl py-10">
        <AnimatePresence mode="wait">
          {selectedNotie ? (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-card border border-border rounded-lg overflow-hidden shadow-sm"
            >
              <div className="p-6 md:p-8 border-b border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => setSelectedNotie(null)}
                    className="mt-1 p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-2xl font-serif text-primary mb-2">{selectedNotie.title}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {format(new Date(selectedNotie.created_at), 'PPP p')}
                      </div>
                      {selectedNotie.mode && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-accent/10 text-accent rounded-full font-medium">
                          {selectedNotie.mode}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => deleteNotie(selectedNotie.id, e)}
                    className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-md transition-colors text-sm font-medium"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>

              <div className="p-6 md:p-10 prose prose-slate dark:prose-invert max-w-none prose-headings:font-serif prose-headings:text-primary prose-a:text-accent">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedNotie.content}
                </ReactMarkdown>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif text-primary">Your Saved Notes</h2>
                <div className="text-sm text-muted-foreground">
                  {noties.length} {noties.length === 1 ? 'note' : 'notes'}
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-muted animate-pulse rounded-lg border border-border" />
                  ))}
                </div>
              ) : noties.length === 0 ? (
                <div className="text-center py-20 bg-card border border-border rounded-lg">
                  <FileText size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="font-serif text-xl text-primary mb-2">No notes yet</h3>
                  <p className="text-muted-foreground mb-6">You haven't saved any StudyBuddy outputs.</p>
                  <button
                    onClick={() => navigate('/resources/study-buddy')}
                    className="px-6 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors font-medium text-sm"
                  >
                    Try StudyBuddy
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {noties.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNotie(note)}
                      className="group bg-card border border-border hover:border-accent/50 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md flex flex-col h-64 relative"
                    >
                      <div className="flex justify-between items-start mb-4">
                        {note.mode ? (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-1 rounded">
                            {note.mode}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Note
                          </span>
                        )}
                        <button
                          onClick={(e) => deleteNotie(note.id, e)}
                          className="text-muted-foreground/50 hover:text-destructive p-1 transition-colors z-10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <h3 className="font-serif text-xl text-primary mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                        {note.title}
                      </h3>

                      <p className="text-sm text-muted-foreground line-clamp-3 mb-auto">
                        {note.content.replace(/[#*`_]/g, '').substring(0, 150)}...
                      </p>

                      <div className="mt-4 pt-4 border-t border-border/50 flex items-center text-xs text-muted-foreground gap-2">
                        <Clock size={14} />
                        {format(new Date(note.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotiePage;
