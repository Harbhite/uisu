import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Loader2, Sparkles, CheckCircle2, AlertCircle, RefreshCcw, Upload, FileIcon, Trash2 } from 'lucide-react';
import { SEO } from '@/components/SEO';
import AIToolsHeader from '@/components/resources/AIToolsHeader';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { readFileContent } from '@/lib/file-utils';
import { useAuth } from '@/hooks/useAuth';

const CRITERIA = [
  { id: 'grammar', label: 'Grammar & Mechanics', desc: 'Spelling, punctuation, syntax.' },
  { id: 'structure', label: 'Structure & Flow', desc: 'Thesis, paragraphs, transitions.' },
  { id: 'argument', label: 'Argument Strength', desc: 'Clarity, evidence, logic.' },
  { id: 'citations', label: 'Citations', desc: 'Referencing style & consistency.' },
  { id: 'style', label: 'Style & Tone', desc: 'Voice, clarity, concision.' },
];

interface CriteriaFeedback {
  name: string;
  score: number;
  feedback: string;
  excerpts?: { quote: string; suggestion: string }[];
}

interface Feedback {
  overall_score: number;
  summary: string;
  criteria_feedback: CriteriaFeedback[];
  strengths: string[];
  improvements: string[];
}

const EssayCheckPage = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [essay, setEssay] = useState('');
  const [selected, setSelected] = useState<string[]>(['grammar', 'structure', 'argument', 'citations']);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error('File too large. Max 10MB.'); return; }
    setFile(f);
  };

  const runCheck = async () => {
    let text = essay.trim();
    if (file) {
      try {
        const { text: extracted } = await readFileContent(file);
        text = (text + '\n\n' + extracted).trim();
      } catch {
        toast.error('Failed to read attached file');
        return;
      }
    }
    if (text.length < 50) { toast.error('Essay must be at least 50 characters'); return; }
    if (selected.length === 0) { toast.error('Select at least one criterion'); return; }
    setLoading(true);
    setFeedback(null);
    try {
      const { data, error } = await supabase.functions.invoke('essay-check', {
        body: { essay: text, criteria: selected, title },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      if (!data?.feedback) throw new Error('No feedback returned');
      setFeedback(data.feedback);
      if (user) {
        await supabase.from('essay_checks').insert({
          user_id: user.id,
          title: title || null,
          essay_text: text.substring(0, 40000),
          criteria: selected,
          feedback: data.feedback,
          overall_score: data.feedback.overall_score ?? null,
        });
      }
      toast.success('Essay reviewed!');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to analyze essay');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFeedback(null); setEssay(''); setTitle(''); setFile(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="AI Essay Checker" description="Get structured AI feedback on your essay — grammar, structure, argument strength, and citations." />
      <AIToolsHeader title="Essay Checker" subtitle="AI-powered writing coach" icon={PenLine} />

      <div className="container mx-auto px-4 max-w-5xl py-8">
        {!feedback ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <div className="bg-card border border-border p-5 md:p-6 rounded-2xl space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Title (optional)</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. The Role of Student Unions"
                    className="w-full bg-muted/50 border border-border px-4 py-3 text-sm outline-none focus:border-accent rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Essay Text</label>
                  <textarea
                    value={essay}
                    onChange={e => setEssay(e.target.value)}
                    placeholder="Paste your essay here... (min 50 characters)"
                    rows={14}
                    className="w-full bg-muted/50 border border-border px-4 py-3 text-sm outline-none focus:border-accent rounded-xl resize-none"
                  />
                  <div className="text-[10px] text-muted-foreground mt-1">{essay.length} characters</div>
                </div>
                <input ref={fileRef} type="file" className="hidden" onChange={onFile} accept=".pdf,.docx,.doc,.txt,.md" />
                <AnimatePresence>
                  {file && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-primary text-primary-foreground flex items-center justify-between border-l-4 border-accent rounded-xl">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileIcon size={14} className="text-accent" />
                        <span className="text-xs font-mono truncate">{file.name}</span>
                      </div>
                      <button onClick={() => setFile(null)} className="p-1.5 hover:bg-destructive rounded-full"><Trash2 size={12} /></button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent hover:border-accent rounded-full"
                >
                  <Upload size={12} /> Attach Document
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="bg-primary text-primary-foreground p-5 border-l-4 border-accent rounded-2xl">
                <h3 className="font-serif text-lg italic mb-3 flex items-center gap-2"><PenLine size={16} className="text-accent" /> Criteria</h3>
                <p className="text-xs text-primary-foreground/60 mb-4">Select the areas you want feedback on.</p>
                <div className="space-y-2">
                  {CRITERIA.map(c => (
                    <button key={c.id} onClick={() => toggle(c.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        selected.includes(c.id)
                          ? 'bg-accent text-accent-foreground border-accent'
                          : 'border-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/5'
                      }`}>
                      <div className="text-[10px] font-bold uppercase tracking-widest">{c.label}</div>
                      <div className="text-[10px] opacity-70 mt-0.5">{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={runCheck}
                disabled={loading || (essay.trim().length < 50 && !file)}
                className="w-full py-4 bg-accent text-accent-foreground font-bold uppercase tracking-[0.2em] text-xs hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50 flex items-center justify-center gap-2 rounded-full"
              >
                {loading ? <><Loader2 size={14} className="animate-spin" /> Analyzing...</> : <><Sparkles size={14} /> Check My Essay</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-primary">Feedback Report</h2>
              <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 border border-border hover:border-accent hover:text-accent text-[10px] font-bold uppercase tracking-widest rounded-full">
                <RefreshCcw size={12} /> New Essay
              </button>
            </div>
            <div className="bg-primary text-primary-foreground p-6 border-l-4 border-accent rounded-2xl">
              <div className="text-[9px] font-bold text-accent uppercase tracking-[0.3em] mb-2">Overall Score</div>
              <div className="text-5xl font-serif">{feedback.overall_score}<span className="text-lg text-accent/60">/100</span></div>
              <p className="text-sm text-primary-foreground/80 mt-3 italic">{feedback.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-5 rounded-2xl">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2"><CheckCircle2 size={12} /> Strengths</h3>
                <ul className="space-y-2 text-sm">
                  {feedback.strengths?.map((s, i) => <li key={i} className="text-foreground">• {s}</li>)}
                </ul>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-5 rounded-2xl">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2"><AlertCircle size={12} /> Improvements</h3>
                <ul className="space-y-2 text-sm">
                  {feedback.improvements?.map((s, i) => <li key={i} className="text-foreground">• {s}</li>)}
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              {feedback.criteria_feedback?.map((c, i) => (
                <div key={i} className="bg-card border border-border p-5 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif text-lg text-primary">{c.name}</h3>
                    <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full">{c.score}/100</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{c.feedback}</p>
                  {c.excerpts && c.excerpts.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-border">
                      {c.excerpts.map((ex, j) => (
                        <div key={j} className="bg-muted/50 p-3 rounded-xl text-xs">
                          <div className="italic text-foreground mb-1">"{ex.quote}"</div>
                          <div className="text-accent text-[11px]"><strong>Suggestion:</strong> {ex.suggestion}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EssayCheckPage;
