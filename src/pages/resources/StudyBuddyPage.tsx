import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft, BookOpen, CalendarDays, Layers, CreditCard,
  Send, Loader2, Sparkles, ImageIcon, RefreshCcw, Copy, Check
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type Mode = 'explainer' | 'planner' | 'synthesizer' | 'examiner';

interface ModeConfig {
  id: Mode;
  label: string;
  icon: React.ElementType;
  description: string;
  placeholder: string;
  color: string;
}

const modes: ModeConfig[] = [
  {
    id: 'explainer',
    label: 'Explainer',
    icon: BookOpen,
    description: 'Breaks down concepts with analogies, diagrams and step-by-step logic',
    placeholder: 'Enter a topic or paste material to break down... e.g. "Explain the Krebs Cycle" or "Solve: ∫x²dx"',
    color: 'bg-primary',
  },
  {
    id: 'planner',
    label: 'Planner',
    icon: CalendarDays,
    description: 'Creates a tailored 7-day study schedule',
    placeholder: 'What topic or exam are you preparing for? e.g. "Contract Law midterm" or "Organic Chemistry final"',
    color: 'bg-emerald-800',
  },
  {
    id: 'synthesizer',
    label: 'Synthesizer',
    icon: Layers,
    description: 'Summarizes materials into hierarchical briefs',
    placeholder: 'Paste your lecture notes, textbook excerpts, or any study material to summarize...',
    color: 'bg-violet-800',
  },
  {
    id: 'examiner',
    label: 'Examiner',
    icon: CreditCard,
    description: 'Generates 15 flashcards from your material',
    placeholder: 'Paste material to generate flashcards from... e.g. lecture notes, chapter summaries',
    color: 'bg-amber-800',
  },
];

const StudyBuddyPage = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<Mode>('explainer');
  const [topic, setTopic] = useState('');
  const [material, setMaterial] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [copied, setCopied] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);

  const currentMode = modes.find(m => m.id === activeMode)!;

  const STUDY_BUDDY_URL = `${import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')}/functions/v1/study-buddy`;

  const handleSubmit = useCallback(async () => {
    if (!topic.trim() && !material.trim()) {
      toast.error('Please enter a topic or paste some material');
      return;
    }

    setIsLoading(true);
    setResponse('');
    setGeneratedImage(null);

    try {
      const resp = await fetch(STUDY_BUDDY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ mode: activeMode, topic: topic.trim(), material: material.trim() }),
      });

      if (resp.status === 429) {
        toast.error('Rate limit reached. Please wait a moment and try again.');
        setIsLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast.error('AI credits exhausted. Please top up in Settings → Workspace → Usage.');
        setIsLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error('Failed to start stream');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
              setResponse(fullText);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
              setResponse(fullText);
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [activeMode, topic, material, STUDY_BUDDY_URL]);

  const handleGenerateImage = useCallback(async () => {
    if (!topic.trim() && !material.trim()) {
      toast.error('Enter a topic first to generate a visual');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const resp = await fetch(STUDY_BUDDY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          mode: activeMode,
          topic: topic.trim(),
          material: material.trim(),
          generateImage: true,
        }),
      });

      if (resp.status === 429) { toast.error('Rate limit reached.'); return; }
      if (resp.status === 402) { toast.error('AI credits exhausted.'); return; }
      if (!resp.ok) throw new Error('Image generation failed');

      const data = await resp.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (imageUrl) {
        setGeneratedImage(imageUrl);
        toast.success('Visual generated!');
      } else {
        toast.error('No image was generated. Try a different topic.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Image generation failed.');
    } finally {
      setIsGeneratingImage(false);
    }
  }, [topic, material, activeMode, STUDY_BUDDY_URL]);

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setResponse('');
    setTopic('');
    setMaterial('');
    setGeneratedImage(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="StudyBuddy AI - Smart Study Tool"
        description="AI-powered study companion that explains, plans, summarizes, and creates flashcards across all fields of knowledge."
      />

      {/* Hero */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 pt-28 pb-14 max-w-6xl">
          <button
            onClick={() => navigate('/resources')}
            className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/60 hover:text-accent transition-colors mb-8"
          >
            <div className="p-2 border border-primary-foreground/20 group-hover:border-accent transition-colors">
              <ArrowLeft size={14} />
            </div>
            <span>Back to Resources</span>
          </button>

          <div className="flex items-center gap-3 mb-3">
            <Sparkles size={16} className="text-accent" fill="currentColor" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary-foreground/50">AI-Powered</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-serif font-bold mb-4 leading-tight">
            StudyBuddy
          </h1>
          <p className="text-primary-foreground/60 font-light max-w-xl text-lg">
            Your intelligent study companion. Explain, plan, synthesize, and quiz across every field of knowledge.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-10">
        {/* Mode Selector */}
        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-4 flex items-center gap-2">
            <div className="w-6 h-0.5 bg-accent" /> Select Mode
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isActive = activeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => { setActiveMode(mode.id); setResponse(''); setGeneratedImage(null); }}
                  className={`p-4 md:p-5 border text-left transition-all group ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                      : 'bg-card border-border hover:border-accent hover:shadow-sm'
                  }`}
                >
                  <Icon size={20} className={`mb-3 ${isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-accent'}`} />
                  <div className="text-xs font-bold uppercase tracking-widest mb-1">{mode.label}</div>
                  <p className={`text-[10px] leading-relaxed ${isActive ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                    {mode.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-card border border-border p-5 md:p-6">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Topic or Question
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={currentMode.placeholder}
                className="w-full bg-muted/50 border border-border p-3 md:p-4 text-sm outline-none focus:border-accent transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSubmit()}
              />

              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 mt-5">
                Additional Material <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <textarea
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="Paste lecture notes, textbook excerpts, or any study material..."
                className="w-full bg-muted/50 border border-border p-3 md:p-4 text-sm outline-none focus:border-accent transition-colors resize-none h-32 md:h-40"
              />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className={`${currentMode.color} text-white p-5 md:p-6 border-l-4 border-accent`}>
              <div className="flex items-center gap-2 mb-4">
                <currentMode.icon size={18} className="text-accent" />
                <h3 className="font-serif text-lg italic">{currentMode.label} Mode</h3>
              </div>
              <p className="text-xs text-white/60 leading-relaxed mb-6">{currentMode.description}</p>
              <div className="text-[9px] font-bold uppercase tracking-widest text-white/30">Ready for input</div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || (!topic.trim() && !material.trim())}
              className="w-full py-5 bg-accent text-accent-foreground font-bold uppercase tracking-[0.2em] text-xs border border-accent hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <><Send size={16} /> Generate</>}
            </button>

            <button
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || (!topic.trim() && !material.trim())}
              className="w-full py-4 border border-border text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] hover:border-accent hover:text-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isGeneratingImage ? <><Loader2 size={14} className="animate-spin" /> Generating Visual...</> : <><ImageIcon size={14} /> Generate Visual</>}
            </button>
          </div>
        </div>

        {/* Response Area */}
        <AnimatePresence>
          {(response || generatedImage) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              ref={responseRef}
            >
              {/* Actions Bar */}
              <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-accent" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">AI Response</span>
                </div>
                <div className="flex gap-2">
                  {response && (
                    <button
                      onClick={handleCopy}
                      className="p-2 border border-border hover:border-accent text-muted-foreground hover:text-accent transition-colors"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  )}
                  <button
                    onClick={handleReset}
                    className="p-2 border border-border hover:border-accent text-muted-foreground hover:text-accent transition-colors"
                  >
                    <RefreshCcw size={14} />
                  </button>
                </div>
              </div>

              {/* Generated Image */}
              {generatedImage && (
                <div className="mb-8 bg-card border border-border p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                    <ImageIcon size={12} /> Generated Visual
                  </p>
                  <img src={generatedImage} alt="AI-generated educational visual" className="max-w-full max-h-[500px] object-contain mx-auto" />
                </div>
              )}

              {/* Text Response */}
              {response && (
                <div className="bg-card border border-border p-6 md:p-10">
                  <div className="prose prose-sm md:prose-base max-w-none prose-headings:font-serif prose-headings:text-primary prose-strong:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-pre:bg-primary prose-pre:text-primary-foreground prose-hr:border-border prose-blockquote:border-accent prose-blockquote:text-muted-foreground prose-td:border-border prose-th:border-border prose-table:text-sm">
                    <ReactMarkdown>{response}</ReactMarkdown>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center gap-3 mt-4 text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-xs">Generating response...</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudyBuddyPage;
