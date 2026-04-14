import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Sparkles, RefreshCcw, Trash2, ImageIcon, FileIcon,
  Download, FileDown, ChevronDown, Key, BookOpen, ListTree, Network,
  Copy, Check, ChevronRight, BrainCircuit, CreditCard, GraduationCap,
} from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import AIToolsHeader from '@/components/resources/AIToolsHeader';
import { readFileContent, DepthLevel, DEPTH_LABELS, DEPTH_DESCRIPTIONS } from '@/lib/file-utils';
import { cacheOutput } from '@/lib/ai-cache';
import GenerationProgress from '@/components/resources/GenerationProgress';

type AideMode = 'keypoints' | 'summary' | 'outline' | 'concepts' | 'quickpoints';

interface ModeConfig {
  id: AideMode;
  label: string;
  description: string;
  icon: React.ElementType;
  hasCount?: boolean;
}

const QUICK_POINT_COUNTS = [15, 25, 50, 75, 100] as const;

const modes: ModeConfig[] = [
  { id: 'keypoints', label: 'Key Points', description: 'Extract prioritized key points from your material', icon: Key },
  { id: 'quickpoints', label: 'Quick Points', description: 'Brief, concise numbered key points — choose how many', icon: ListTree, hasCount: true },
  { id: 'summary', label: 'Summary Brief', description: 'Comprehensive summary with core concepts & takeaways', icon: BookOpen },
  { id: 'outline', label: 'Study Outline', description: 'Hierarchical outline with definitions & review questions', icon: ListTree },
  { id: 'concepts', label: 'Concept Map', description: 'Glossary, relationships table & memory aids', icon: Network },
];

// ─── Export Dropdown ─────────────────────────────────────────────
const ExportDropdown: React.FC<{ content: string; topic: string }> = ({ content, topic }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const safeName = (topic || 'study-aide').replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 60) || 'study-aide';

  const stripMd = (text: string) => text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\|/g, ' ')
    .replace(/---+/g, '---')
    .replace(/\n{3,}/g, '\n\n');

  const exportTxt = () => {
    const blob = new Blob([`Study Aide — ${topic || 'Material'}\n${'='.repeat(40)}\n\n${stripMd(content)}`], { type: 'text/plain' });
    saveAs(blob, `${safeName}.txt`);
    toast.success('Downloaded as TXT');
    setOpen(false);
  };

  const exportPdf = async () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(topic || 'Study Aide', 20, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(stripMd(content), 170);
    let y = 35;
    for (const line of lines) {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(line, 20, y);
      y += 5;
    }
    doc.save(`${safeName}.pdf`);
    toast.success('Downloaded as PDF');
    setOpen(false);
  };

  const exportDocx = async () => {
    const paragraphs = stripMd(content).split('\n').filter(Boolean).map(line =>
      new Paragraph({
        children: [new TextRun({ text: line, size: 22 })],
        spacing: { after: 120 },
      })
    );
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: topic || 'Study Aide', heading: HeadingLevel.HEADING_1, spacing: { after: 300 } }),
          ...paragraphs,
        ],
      }],
    });
    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `${safeName}.docx`);
    toast.success('Downloaded as DOCX');
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-accent/90 transition-colors rounded-lg"
      >
        <Download size={13} /> Export <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-0 mt-2 w-44 bg-card border border-border shadow-xl z-50 overflow-hidden rounded-lg"
          >
            <button onClick={exportTxt} className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-colors text-foreground">
              <FileText size={13} /> Plain Text
            </button>
            <button onClick={exportPdf} className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-colors text-foreground">
              <FileDown size={13} /> PDF
            </button>
            <button onClick={exportDocx} className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-colors text-foreground">
              <FileText size={13} /> DOCX
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────
const StudyAidePage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AideMode>('keypoints');
  const [quickPointCount, setQuickPointCount] = useState<number>(25);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<'input' | 'generating' | 'result'>('input');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const [depth, setDepth] = useState<DepthLevel>(() => {
    try { return (localStorage.getItem('study-aide-depth') as DepthLevel) || 'intermediate'; } catch { return 'intermediate'; }
  });

  // Persist mode & depth
  useEffect(() => {
    const saved = localStorage.getItem('study-aide-mode');
    if (saved && modes.some(m => m.id === saved)) setMode(saved as AideMode);
  }, []);
  useEffect(() => { localStorage.setItem('study-aide-mode', mode); }, [mode]);
  useEffect(() => { localStorage.setItem('study-aide-depth', depth); }, [depth]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB'); return; }
      setSelectedFile(file);
    }
  };

  const removeFile = () => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const generate = useCallback(async () => {
    if (!inputText.trim() && !selectedFile) { toast.error('Provide a topic or upload material'); return; }

    setPhase('generating');
    setResult('');

    try {
      let materialText = inputText;
      let imageDataUrl = '';
      if (selectedFile) {
        const { text: fileContent, isImage } = await readFileContent(selectedFile);
        if (isImage) {
          imageDataUrl = fileContent; // base64 data URL for vision
          materialText = materialText ? `${materialText}\n\n--- Uploaded Image: ${selectedFile.name} ---\n[Image data attached for analysis]` : `[Image: ${selectedFile.name}]`;
        } else {
          materialText = materialText ? `${materialText}\n\n--- Uploaded File: ${selectedFile.name} ---\n${fileContent}` : fileContent;
        }
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/study-aide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          mode: mode === 'quickpoints' ? 'quickpoints' : mode,
          topic: inputText.trim().substring(0, 200),
          material: materialText,
          pointCount: mode === 'quickpoints' ? quickPointCount : undefined,
          depth,
          ...(imageDataUrl ? { imageData: imageDataUrl } : {}),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        if (response.status === 429) { toast.error('Rate limit reached. Please wait a moment.'); setPhase('input'); return; }
        if (response.status === 402) { toast.error('AI credits exhausted. Please try later.'); setPhase('input'); return; }
        throw new Error(payload?.error || 'Generation failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setResult(fullText);
            }
          } catch { /* partial */ }
        }
      }

      // flush remaining
      if (buffer.trim()) {
        for (let raw of buffer.split('\n')) {
          if (!raw || !raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) { fullText += content; setResult(fullText); }
          } catch { /* ignore */ }
        }
      }

      if (!fullText.trim()) {
        toast.error('No content received from AI. Please try again.');
        setPhase('input');
        return;
      }
      // Cache for offline access
      cacheOutput({
        tool: 'study-aide',
        topic: inputText.trim().substring(0, 200) || 'Untitled',
        result: fullText,
        mode,
        depth,
      });
      setPhase('result');
    } catch (err: any) {
      console.error('Study Aide error:', err?.message || err);
      toast.error(err?.message === 'No stream' ? 'Connection failed. Please try again.' : 'Failed to generate. Please try again.');
      setPhase('input');
    }
  }, [inputText, selectedFile, mode, quickPointCount, depth]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setPhase('input');
    setResult('');
  };

  // Cross-tool pipeline
  const sendToFlashcards = () => {
    localStorage.setItem('flashcard_state', JSON.stringify({ topic: inputText.trim().substring(0, 200), material: result, cards: [] }));
    navigate('/resources/flashcards');
    toast.success('Material sent to Flashcard Generator');
  };

  const sendToQuiz = () => {
    localStorage.setItem('aiquiz_state', JSON.stringify({ inputText: result, rigidity: 'Standard', questionCount: 25 }));
    navigate('/resources/ai-quiz');
    toast.success('Material sent to AI Quiz');
  };

  const sendToStudyBuddy = () => {
    localStorage.setItem('studybuddy_state', JSON.stringify({ activeMode: 'explainer', topic: inputText.trim().substring(0, 200), material: result, response: '' }));
    navigate('/resources/study-buddy');
    toast.success('Material sent to StudyBuddy');
  };

  const currentMode = modes.find(m => m.id === mode)!;
  const ModeIcon = currentMode.icon;

  // Simple markdown renderer
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-serif font-bold text-foreground mt-6 mb-3">{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-serif font-semibold text-foreground mt-5 mb-2">{line.slice(4)}</h3>;
      if (line.startsWith('#### ')) return <h4 key={i} className="text-base font-serif font-semibold text-foreground mt-4 mb-1.5">{line.slice(5)}</h4>;
      if (/^---+$/.test(line.trim())) return <hr key={i} className="my-4 border-border" />;
      if (/^\|[\s-|]+\|$/.test(line.trim())) return null;
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const cells = line.split('|').filter(Boolean).map(c => c.trim());
        return (
          <div key={i} className="grid gap-2 py-1.5 border-b border-border/50 text-sm" style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
            {cells.map((cell, j) => <span key={j} className="px-2" dangerouslySetInnerHTML={{ __html: formatInline(cell) }} />)}
          </div>
        );
      }
      if (line.trim().startsWith('- ')) return <li key={i} className="ml-5 text-sm text-foreground/90 leading-relaxed list-disc" dangerouslySetInnerHTML={{ __html: formatInline(line.trim().slice(2)) }} />;
      const numMatch = line.trim().match(/^(\d+)\.\s(.*)$/);
      if (numMatch) return <li key={i} className="ml-5 text-sm text-foreground/90 leading-relaxed list-decimal" dangerouslySetInnerHTML={{ __html: formatInline(numMatch[2]) }} />;
      if (!line.trim()) return <div key={i} className="h-2" />;
      return <p key={i} className="text-sm text-foreground/90 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />;
    });
  };

  const formatInline = (text: string) => {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-muted text-xs rounded font-mono">$1</code>');
  };

  return (
    <>
      <SEO
        title="AI Study Aide — UISU SPACE"
        description="Generate key points, summaries, outlines, and concept maps from your study materials using AI."
        url="https://uisu.lovable.app/resources/study-aide"
        image="/og/og-home.png"
      />
      <div className="min-h-screen bg-background">
        <AIToolsHeader title="Study Aide" subtitle="AI-Powered Study Generation" icon={FileText} />

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <AnimatePresence mode="wait">
            {phase === 'input' && (
              <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-5xl mx-auto">
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.docx,.doc,.txt,.xlsx,.xls,.pptx,.ppt" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Input */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="bg-card border border-border p-5 md:p-7 rounded-lg">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Material Input</label>
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Paste lecture notes, textbook excerpts, or type a topic..."
                        className="w-full h-48 md:h-56 bg-muted/30 p-4 border border-border outline-none font-serif text-sm md:text-base focus:border-accent transition-all resize-none rounded-lg"
                      />

                      <AnimatePresence>
                        {selectedFile && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 p-4 bg-primary text-primary-foreground flex items-center justify-between border-l-4 border-accent rounded-lg"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              {selectedFile.type.startsWith('image/') ? <ImageIcon size={16} className="text-accent" /> : <FileIcon size={16} className="text-accent" />}
                              <div className="overflow-hidden">
                                <div className="text-[9px] font-bold uppercase tracking-widest">Attached Material</div>
                                <div className="text-[10px] font-mono truncate max-w-[200px] md:max-w-none">{selectedFile.name}</div>
                              </div>
                            </div>
                            <button onClick={removeFile} className="p-2 hover:bg-destructive transition-colors text-primary-foreground/50 hover:text-primary-foreground rounded-full">
                              <Trash2 size={14} />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="mt-4">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-3 border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent hover:border-accent transition-all rounded-lg"
                        >
                          <Upload size={14} /> Attach File
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Mode selection */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="bg-primary text-primary-foreground p-5 md:p-6 border-l-4 border-accent rounded-lg">
                      <div className="flex items-center gap-3 mb-5">
                        <Sparkles size={16} className="text-accent" />
                        <h3 className="font-serif text-lg italic">Generation Mode</h3>
                      </div>
                      <div className="space-y-2">
                        {modes.map((m) => {
                          const Icon = m.icon;
                          return (
                            <React.Fragment key={m.id}>
                            <button
                              onClick={() => setMode(m.id)}
                              className={`w-full text-left p-3.5 border transition-all rounded-lg ${
                                mode === m.id
                                  ? 'bg-accent text-accent-foreground border-accent'
                                  : 'border-primary-foreground/10 hover:bg-primary-foreground/5'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 mb-1">
                                <Icon size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{m.label}</span>
                              </div>
                              <p className={`text-[9px] leading-relaxed ${mode === m.id ? 'text-accent-foreground/70' : 'text-primary-foreground/40'}`}>
                                {m.description}
                              </p>
                            </button>
                            {m.id === 'quickpoints' && mode === 'quickpoints' && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 p-3 bg-primary-foreground/5 rounded-lg border border-primary-foreground/10"
                              >
                                <p className="text-[9px] font-bold uppercase tracking-widest text-primary-foreground/50 mb-2">Number of points</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {QUICK_POINT_COUNTS.map(c => (
                                    <button
                                      key={c}
                                      onClick={() => setQuickPointCount(c)}
                                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                                        quickPointCount === c
                                          ? 'bg-accent text-accent-foreground'
                                          : 'bg-primary-foreground/10 text-primary-foreground/60 hover:bg-primary-foreground/20'
                                      }`}
                                    >
                                      {c}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Depth Control */}
                    <div className="mt-5 pt-4 border-t border-primary-foreground/10">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-primary-foreground/50 mb-2 flex items-center gap-1.5">
                        <GraduationCap size={12} /> Depth Level
                      </p>
                      <div className="flex gap-1.5">
                        {(['beginner', 'intermediate', 'advanced'] as DepthLevel[]).map(d => (
                          <button
                            key={d}
                            onClick={() => setDepth(d)}
                            className={`flex-1 px-2 py-2 text-[9px] font-bold uppercase tracking-widest rounded-md transition-all ${
                              depth === d ? 'bg-accent text-accent-foreground' : 'bg-primary-foreground/10 text-primary-foreground/50 hover:bg-primary-foreground/20'
                            }`}
                          >
                            {DEPTH_LABELS[d]}
                          </button>
                        ))}
                      </div>
                      <p className="text-[8px] text-primary-foreground/30 mt-1.5">{DEPTH_DESCRIPTIONS[depth]}</p>
                    </div>
                    </div>

                    <button
                      onClick={generate}
                      disabled={!inputText.trim() && !selectedFile}
                      className="w-full py-5 md:py-6 bg-accent text-accent-foreground font-bold uppercase tracking-[0.2em] text-xs border border-accent hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg rounded-lg"
                    >
                      Generate {currentMode.label} <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'generating' && (
              <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto">
                <div className="h-[40vh] flex flex-col items-center justify-center text-center px-6">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="mb-8 text-accent">
                    <RefreshCcw size={64} strokeWidth={1} />
                  </motion.div>
                  <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4">Generating {currentMode.label}</h2>
                  <GenerationProgress isGenerating={phase === 'generating'} partialContent={result} label={`Generating ${currentMode.label}`} />
                </div>

                {result && (
                  <div className="mt-4 bg-card border border-border p-6 rounded-lg">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                      <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 bg-accent rounded-full" />
                      Streaming...
                    </div>
                    <div className="prose-sm max-w-none">{renderMarkdown(result)}</div>
                  </div>
                )}
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <ModeIcon size={18} className="text-accent" />
                    <div>
                      <h2 className="font-serif text-lg font-bold text-foreground">{currentMode.label}</h2>
                      <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{inputText.trim().substring(0, 80) || 'Generated Material'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-4 py-2.5 border border-border text-[10px] font-bold uppercase tracking-widest hover:border-accent hover:text-accent transition-colors rounded-lg"
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy'}
                    </button>
                    <ExportDropdown content={result} topic={inputText.trim().substring(0, 80)} />
                    <button
                      onClick={reset}
                      className="flex items-center gap-2 px-4 py-2.5 border border-border text-[10px] font-bold uppercase tracking-widest hover:border-accent hover:text-accent transition-colors rounded-lg"
                    >
                      <RefreshCcw size={13} /> New
                    </button>
                  </div>
                </div>

                {/* Result content */}
                <div ref={resultRef} className="bg-card border border-border p-6 md:p-8 rounded-lg">
                  <div className="max-w-none">{renderMarkdown(result)}</div>
                </div>

                {/* Cross-tool Pipeline */}
                <div className="mt-6 bg-muted/50 border border-border rounded-lg p-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                    <Sparkles size={12} className="text-accent" /> Send to Another Tool
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={sendToFlashcards} className="flex items-center gap-2 px-4 py-2.5 border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent hover:border-accent transition-all rounded-lg">
                      <CreditCard size={13} /> Flashcards
                    </button>
                    <button onClick={sendToQuiz} className="flex items-center gap-2 px-4 py-2.5 border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent hover:border-accent transition-all rounded-lg">
                      <BrainCircuit size={13} /> AI Quiz
                    </button>
                    <button onClick={sendToStudyBuddy} className="flex items-center gap-2 px-4 py-2.5 border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent hover:border-accent transition-all rounded-lg">
                      <BookOpen size={13} /> StudyBuddy
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default StudyAidePage;
