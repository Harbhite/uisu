import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BookOpen, Clock, Users, ChevronRight, ChevronLeft,
  CheckCircle2, XCircle, Trophy, Sparkles, Search, BrainCircuit,
  RefreshCcw, Link as LinkIcon, Copy, Pencil, Trash2, Flame, Medal,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import AIToolsHeader from '@/components/resources/AIToolsHeader';
import SocialShare from '@/components/SocialShare';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Quizlet {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
  question_count: number;
  difficulty: string;
  rigidity: string;
  attempt_count: number;
  created_at: string;
  created_by: string | null;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const QuizletsPage = () => {
  const navigate = useNavigate();
  const { id: quizletId } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const { isStaff } = useAdminCheck();
  const [quizlets, setQuizlets] = useState<Quizlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Edit state
  const [editingQuizlet, setEditingQuizlet] = useState<Quizlet | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // Quiz-taking state
  const [activeQuizlet, setActiveQuizlet] = useState<Quizlet | null>(null);
  const [step, setStep] = useState<'browse' | 'quiz' | 'result'>('browse');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);
  const autoAdvanceRef = useRef<number | null>(null);

  // Leaderboard + streak
  interface LeaderboardEntry {
    id: string;
    user_display_name: string | null;
    accuracy: number;
    time_taken_seconds: number;
    score: number;
    total_questions: number;
    created_at: string;
  }
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [streak, setStreak] = useState<{ current_streak: number; longest_streak: number } | null>(null);

  const fetchLeaderboard = async (quizletId: string) => {
    const { data } = await supabase
      .from('quiz_attempts')
      .select('id,user_display_name,accuracy,time_taken_seconds,score,total_questions,created_at')
      .eq('quizlet_id', quizletId)
      .order('accuracy', { ascending: false })
      .order('time_taken_seconds', { ascending: true })
      .limit(10);
    setLeaderboard((data as LeaderboardEntry[]) || []);
  };

  const fetchStreak = async () => {
    if (!user) { setStreak(null); return; }
    const { data } = await supabase
      .from('user_streaks')
      .select('current_streak,longest_streak')
      .eq('user_id', user.id)
      .maybeSingle();
    setStreak(data || { current_streak: 0, longest_streak: 0 });
  };

  useEffect(() => { fetchStreak(); }, [user?.id]);
  useEffect(() => { if (activeQuizlet) fetchLeaderboard(activeQuizlet.id); }, [activeQuizlet?.id]);

  useEffect(() => {
    if (quizletId) {
      fetchSingleQuizlet(quizletId);
    } else {
      fetchQuizlets();
    }
  }, [quizletId]);

  const fetchSingleQuizlet = async (id: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quizlets')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single();
    
    if (error || !data) {
      toast.error('Quiz not found or no longer available');
      navigate('/resources/quizlets');
      setLoading(false);
      return;
    }
    
    const quizlet: Quizlet = {
      ...data,
      questions: (typeof data.questions === 'string' ? JSON.parse(data.questions) : data.questions) as Question[],
    };
    setActiveQuizlet(quizlet);
    setLoading(false);
  };

  const fetchQuizlets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quizlets')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(error);
      toast.error('Failed to load quizlets');
    } else {
      setQuizlets((data || []).map((q: any) => ({
        ...q,
        questions: (typeof q.questions === 'string' ? JSON.parse(q.questions) : q.questions) as Question[],
      })));
    }
    setLoading(false);
  };

  const getQuizletUrl = (id: string) => {
    return `${window.location.origin}/resources/quizlets/${id}`;
  };

  const copyQuizletLink = async (id: string) => {
    try {
      await navigator.clipboard.writeText(getQuizletUrl(id));
      toast.success('Quiz link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const openEdit = (q: Quizlet, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingQuizlet(q);
    setEditTitle(q.title);
    setEditDescription(q.description || '');
  };

  const saveEdit = async () => {
    if (!editingQuizlet || !editTitle.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from('quizlets')
      .update({ title: editTitle.trim(), description: editDescription.trim() || null } as any)
      .eq('id', editingQuizlet.id);
    setSaving(false);
    if (error) {
      toast.error('Failed to update quizlet');
      return;
    }
    toast.success('Quizlet updated!');
    // Update local state
    setQuizlets(prev => prev.map(q => q.id === editingQuizlet.id ? { ...q, title: editTitle.trim(), description: editDescription.trim() || null } : q));
    if (activeQuizlet?.id === editingQuizlet.id) {
      setActiveQuizlet(prev => prev ? { ...prev, title: editTitle.trim(), description: editDescription.trim() || null } : prev);
    }
    setEditingQuizlet(null);
  };

  const deleteQuizlet = async (q: Quizlet, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${q.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('quizlets').delete().eq('id', q.id);
    if (error) {
      toast.error('Failed to delete quizlet');
      return;
    }
    setQuizlets(prev => prev.filter(item => item.id !== q.id));
    toast.success('Quizlet deleted');
  };

  const startQuiz = (quizlet: Quizlet) => {
    setActiveQuizlet(quizlet);
    setQuestions(quizlet.questions);
    setUserAnswers([]);
    setCurrentIdx(0);
    setTimeElapsed(0);
    setStep('quiz');
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => setTimeElapsed(p => p + 1), 1000);
  };

  const handleAnswer = (idx: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIdx] = idx;
    setUserAnswers(newAnswers);
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    if (currentIdx < questions.length - 1) {
      autoAdvanceRef.current = window.setTimeout(() => {
        setCurrentIdx(prev => Math.min(prev + 1, questions.length - 1));
      }, 350);
    }
  };

  const finishQuiz = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStep('result');

    if (activeQuizlet) {
      const finalScore = userAnswers.reduce((acc, val, i) => (val === questions[i]?.correctIndex ? acc + 1 : acc), 0);
      const accuracy = questions.length > 0 ? Math.round((finalScore / questions.length) * 10000) / 100 : 0;

      // Resolve display name (profile full_name or anonymous)
      let displayName: string | null = null;
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
        displayName = profile?.full_name || user.email?.split('@')[0] || 'Student';
      } else {
        displayName = 'Anonymous';
      }

      const { error: attemptError } = await supabase.from('quiz_attempts').insert({
        quizlet_id: activeQuizlet.id,
        user_id: user?.id ?? null,
        user_display_name: displayName,
        score: finalScore,
        total_questions: questions.length,
        accuracy,
        time_taken_seconds: timeElapsed,
      });
      if (attemptError) console.error('Failed to record attempt:', attemptError);

      // Refresh leaderboard for this quizlet
      fetchLeaderboard(activeQuizlet.id);
      // Refresh personal streak
      if (user) fetchStreak();
    }
  };

  const score = userAnswers.reduce((acc, val, i) => (val === questions[i]?.correctIndex ? acc + 1 : acc), 0);
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const filtered = quizlets.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    (q.description || '').toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Direct link landing: show quiz preview before starting
  if (quizletId && activeQuizlet && step === 'browse') {
    return (
      <div className="min-h-screen bg-background">
        <SEO title={`${activeQuizlet.title} - Quizlet`} description={activeQuizlet.description || 'Take this quiz'} />
        <AIToolsHeader title="Quizlets" subtitle="Community Quiz Bank" icon={BookOpen} />
        <div className="container mx-auto px-4 max-w-2xl py-10">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full" />
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-8 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-2">
                <BrainCircuit size={32} className="text-accent" />
              </div>
              <h2 className="font-serif text-3xl text-primary">{activeQuizlet.title}</h2>
              {activeQuizlet.description && (
                <p className="text-sm text-muted-foreground max-w-md mx-auto">{activeQuizlet.description}</p>
              )}
              <div className="flex items-center justify-center gap-6 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                <span className="flex items-center gap-1"><BrainCircuit size={10} /> {activeQuizlet.question_count} Questions</span>
                <span className="flex items-center gap-1"><Users size={10} /> {activeQuizlet.attempt_count} Attempts</span>
                <span className="px-2 py-0.5 bg-muted rounded text-[8px]">{activeQuizlet.difficulty}</span>
              </div>
              
              <div className="pt-4 space-y-3">
                <button
                  onClick={() => startQuiz(activeQuizlet)}
                  className="w-full py-4 bg-accent text-accent-foreground font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all rounded-lg"
                >
                  <BrainCircuit size={16} /> Start Quiz
                </button>
                <button
                  onClick={() => navigate('/resources/quizlets')}
                  className="w-full py-3 border border-border text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:border-accent hover:text-accent transition-all rounded-lg"
                >
                  <ChevronLeft size={14} /> Browse All Quizlets
                </button>
              </div>

              <div className="pt-4 border-t border-border">
                <SocialShare
                  title={activeQuizlet.title}
                  url={getQuizletUrl(activeQuizlet.id)}
                  summary={activeQuizlet.description || `Take this ${activeQuizlet.question_count}-question quiz!`}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'quiz' && activeQuizlet) {
    const q = questions[currentIdx];
    if (!q) return null;
    const progress = ((currentIdx + 1) / questions.length) * 100;
    const answeredCount = userAnswers.filter(a => a !== undefined).length;

    return (
      <div className="min-h-screen bg-background">
        <SEO title={`${activeQuizlet.title} - Quizlet`} description="Take a quiz" />
        <AIToolsHeader title={activeQuizlet.title} icon={BrainCircuit} />
        <div className="container mx-auto px-4 max-w-5xl py-10">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setStep('browse'); if (quizletId) navigate('/resources/quizlets'); }}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent">
              <ChevronLeft size={12} /> Exit Quiz
            </button>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-muted-foreground" />
              <span className="text-lg font-mono text-primary">{formatTime(timeElapsed)}</span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-muted mb-8 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${progress}%` }} className="h-full bg-accent" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div>
                    <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Question {currentIdx + 1} / {questions.length}</span>
                    <h3 className="font-serif text-2xl md:text-3xl text-primary leading-tight mt-3 italic">"{q.question}"</h3>
                  </div>
                  <div className="space-y-3">
                    {q.options.map((opt, i) => {
                      const isSelected = userAnswers[currentIdx] === i;
                      return (
                        <button key={i} onClick={() => handleAnswer(i)}
                          className={`w-full text-left p-4 md:p-5 bg-card border group transition-all flex items-center gap-4 shadow-sm hover:shadow-md rounded-lg ${
                            isSelected ? 'border-accent bg-accent/5' : 'border-border hover:border-primary'
                          }`}>
                          <div className={`w-9 h-9 border flex items-center justify-center font-bold text-xs shrink-0 rounded-md transition-colors ${
                            isSelected ? 'bg-accent text-accent-foreground border-accent' : 'border-border bg-muted/50 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground'
                          }`}>{String.fromCharCode(65 + i)}</div>
                          <span className="text-sm md:text-base text-foreground font-light">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <button onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)} disabled={currentIdx === 0}
                      className="flex items-center gap-2 px-4 py-3 border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent disabled:opacity-30 rounded-lg">
                      <ChevronLeft size={14} /> Previous
                    </button>
                    {currentIdx < questions.length - 1 ? (
                      <button onClick={() => setCurrentIdx(currentIdx + 1)}
                        className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-accent-foreground rounded-lg">
                        Next <ChevronRight size={14} />
                      </button>
                    ) : (
                      <button onClick={finishQuiz} disabled={answeredCount === 0}
                        className="flex items-center gap-2 px-5 py-3 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground disabled:opacity-50 rounded-lg">
                        Finish Quiz <Trophy size={14} />
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-card border border-border p-4 rounded-lg">
                <h4 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Question Map</h4>
                <div className="grid grid-cols-5 gap-1.5">
                  {questions.map((_, i) => {
                    const isAnswered = userAnswers[i] !== undefined;
                    const isCurrent = i === currentIdx;
                    return (
                      <button key={i} onClick={() => { if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current); setCurrentIdx(i); }}
                        className={`w-full aspect-square flex items-center justify-center text-[10px] font-bold rounded-md transition-all ${
                          isCurrent ? 'bg-accent text-accent-foreground ring-2 ring-accent ring-offset-1'
                            : isAnswered ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>{i + 1}</button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'result' && activeQuizlet) {
    const rank = percentage >= 80 ? 'Distinction' : percentage >= 60 ? 'Merit' : percentage >= 40 ? 'Pass' : 'Needs Review';

    return (
      <div className="min-h-screen bg-background">
        <SEO title={`Results - ${activeQuizlet.title}`} description="Quiz results" />
        <AIToolsHeader title={activeQuizlet.title} icon={BrainCircuit} />
        <div className="container mx-auto px-4 max-w-5xl py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-4">
              <div className="bg-primary text-primary-foreground p-7 border-l-8 border-accent shadow-xl relative overflow-hidden rounded-lg">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy size={120} /></div>
                <div className="relative z-10">
                  <div className="text-[9px] font-bold text-accent uppercase tracking-[0.4em] mb-6">Performance</div>
                  <div className="text-6xl font-serif mb-2 leading-none">{percentage}<span className="text-xl text-accent/50">%</span></div>
                  <div className="text-[10px] font-bold text-primary-foreground/40 uppercase tracking-widest border-t border-primary-foreground/10 pt-5 mb-8">
                    Score: {score}/{questions.length}
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-[8px] font-bold text-primary-foreground/30 uppercase tracking-widest mb-1">Rank</div>
                      <div className="text-lg font-serif text-accent">{rank}</div>
                    </div>
                    <div>
                      <div className="text-[8px] font-bold text-primary-foreground/30 uppercase tracking-widest mb-1">Time</div>
                      <div className="text-lg font-serif text-accent">{formatTime(timeElapsed)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={() => startQuiz(activeQuizlet)}
                className="w-full py-4 bg-accent text-accent-foreground font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground border border-accent transition-all rounded-lg">
                <RefreshCcw size={14} /> Retake Quiz
              </button>

              {/* Share quiz link */}
              <button onClick={() => copyQuizletLink(activeQuizlet.id)}
                className="w-full py-3 border border-border text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:border-accent hover:text-accent transition-all rounded-lg">
                <Copy size={14} /> Copy Quiz Link
              </button>

              <div className="bg-card border border-border p-4 rounded-lg">
                <SocialShare
                  title={`I scored ${percentage}% on "${activeQuizlet.title}"! Try it:`}
                  url={getQuizletUrl(activeQuizlet.id)}
                  summary={`${activeQuizlet.question_count}-question quiz • ${activeQuizlet.difficulty}`}
                />
              </div>

              <button onClick={() => { setStep('browse'); if (quizletId) navigate('/resources/quizlets'); }}
                className="w-full py-3 border border-border text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:border-accent hover:text-accent transition-all rounded-lg">
                <ChevronLeft size={14} /> Browse Quizlets
              </button>

              {/* Leaderboard */}
              <div className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={14} className="text-accent" />
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Top Scorers</h4>
                </div>
                {leaderboard.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No attempts yet — be the first!</p>
                ) : (
                  <ol className="space-y-2">
                    {leaderboard.map((entry, idx) => {
                      const isMe = user && entry.user_display_name && (
                        // Highlight current user's most recent entry by matching name and recency
                        false
                      );
                      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
                      return (
                        <li key={entry.id} className={`flex items-center justify-between gap-2 text-xs py-1.5 px-2 rounded ${isMe ? 'bg-accent/10' : ''}`}>
                          <span className="flex items-center gap-2 min-w-0">
                            <span className="shrink-0 w-6 text-center">{medal}</span>
                            <span className="truncate text-foreground">{entry.user_display_name || 'Anonymous'}</span>
                          </span>
                          <span className="shrink-0 text-muted-foreground tabular-nums">
                            {entry.accuracy.toFixed(0)}% · {formatTime(entry.time_taken_seconds)}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                <h3 className="font-serif text-2xl text-primary italic">Corrections</h3>
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{questions.length} Questions</span>
              </div>
              <div className="space-y-6">
                {questions.map((q, i) => {
                  const isCorrect = userAnswers[i] === q.correctIndex;
                  return (
                    <div key={i} className="bg-card border border-border p-5 rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                          {isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Q{i + 1}</span>
                          <h4 className="font-serif text-lg text-primary mb-4 leading-snug">{q.question}</h4>
                          <div className="space-y-1.5 mb-5">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = userAnswers[i] === optIdx;
                              const isTrueCorrect = q.correctIndex === optIdx;
                              return (
                                <div key={optIdx}
                                  className={`p-3 text-sm flex justify-between items-center gap-2 rounded-md ${
                                    isTrueCorrect ? 'bg-emerald-50 text-emerald-800' : isSelected ? 'bg-red-50 text-red-800' : 'text-muted-foreground'
                                  }`}>
                                  <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                  {isTrueCorrect && <span className="text-[8px] font-bold uppercase tracking-widest bg-emerald-200 px-2 py-0.5 text-emerald-800 shrink-0 rounded">Correct</span>}
                                </div>
                              );
                            })}
                          </div>
                          <div className="bg-muted/50 p-4 border-l-4 border-accent rounded-r-lg">
                            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                              <Sparkles size={10} /> Explanation
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed italic">{q.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Browse view
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Quizlets - Community Quiz Bank" description="Browse and take quizzes created by the community." />
      <AIToolsHeader title="Quizlets" subtitle="Community Quiz Bank" icon={BookOpen} />
      
      <div className="container mx-auto px-4 max-w-6xl py-10">
        {user && streak && (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent/15 to-accent/5 border border-accent/30 rounded-full">
              <Flame size={14} className={streak.current_streak > 0 ? 'text-accent' : 'text-muted-foreground'} />
              <span className="text-xs font-bold text-primary tabular-nums">{streak.current_streak}-day streak</span>
            </div>
            {streak.longest_streak > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border rounded-full">
                <Medal size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground tabular-nums">Best: {streak.longest_streak}</span>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quizlets..."
              className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border outline-none text-sm focus:border-accent transition-colors rounded-lg"
            />
          </div>
          <button onClick={() => navigate('/resources/ai-quiz')}
            className="flex items-center gap-2 px-5 py-3 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all rounded-lg">
            <BrainCircuit size={14} /> Create with AI Quiz
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-serif text-xl text-primary mb-2">No quizlets yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Generate a quiz with AI Quiz and save it here for others to take.</p>
            <button onClick={() => navigate('/resources/ai-quiz')}
              className="px-5 py-3 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest rounded-lg">
              Create First Quizlet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((q) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-lg p-6 hover:border-accent/50 hover:shadow-lg transition-all group"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => startQuiz(q)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-serif text-lg text-primary leading-snug group-hover:text-accent transition-colors line-clamp-2">
                      {q.title}
                    </h3>
                    <ChevronRight size={16} className="text-muted-foreground shrink-0 mt-1 group-hover:text-accent transition-colors" />
                  </div>
                  {q.description && (
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{q.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">
                    <span className="flex items-center gap-1"><BrainCircuit size={10} /> {q.question_count} Qs</span>
                    <span className="flex items-center gap-1"><Users size={10} /> {q.attempt_count} attempts</span>
                    <span className="px-2 py-0.5 bg-muted rounded text-[8px]">{q.rigidity}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); copyQuizletLink(q.id); }}
                    className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 hover:text-accent transition-colors"
                    title="Copy shareable link"
                  >
                    <LinkIcon size={10} /> Share Link
                  </button>
                  {isStaff && (
                    <button
                      onClick={(e) => openEdit(q, e)}
                      className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 hover:text-accent transition-colors"
                      title="Edit quizlet"
                    >
                      <Pencil size={10} /> Edit
                    </button>
                  )}
                  {(isStaff || (user && q.created_by === user.id)) && (
                    <button
                      onClick={(e) => deleteQuizlet(q, e)}
                      className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 hover:text-destructive transition-colors"
                      title="Delete quizlet"
                    >
                      <Trash2 size={10} /> Delete
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingQuizlet && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setEditingQuizlet(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-lg p-6 w-full max-w-md space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-serif text-xl text-primary">Edit Quizlet</h3>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Title</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-muted/50 border border-border outline-none text-sm focus:border-accent transition-colors rounded-lg"
                  placeholder="Quiz title..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-muted/50 border border-border outline-none text-sm focus:border-accent transition-colors rounded-lg resize-none"
                  placeholder="Optional description..."
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={saveEdit}
                  disabled={saving || !editTitle.trim()}
                  className="flex-1 py-3 bg-accent text-accent-foreground font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50 rounded-lg"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditingQuizlet(null)}
                  className="px-5 py-3 border border-border text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] hover:border-accent hover:text-accent transition-all rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizletsPage;
