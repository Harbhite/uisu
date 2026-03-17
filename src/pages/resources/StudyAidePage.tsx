import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Sparkles, RefreshCcw, Trash2, ImageIcon, FileIcon,
  Download, FileDown, ChevronDown, Key, BookOpen, ListTree, Network,
  Copy, Check, ChevronRight,
} from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import AIToolsHeader from '@/components/resources/AIToolsHeader';

type AideMode = 'keypoints' | 'summary' | 'outline' | 'concepts';

interface ModeConfig {
  id: AideMode;
  label: string;
  description: string;
  icon: React.ElementType;
}

const modes: ModeConfig[] = [
  { id: 'keypoints', label: 'Key Points', description: 'Extract prioritized key points from your material', icon: Key },
  { id: 'summary', label: 'Summary Brief', description: 'Comprehensive summary with core concepts & takeaways', icon: BookOpen },
  { id: 'outline', label: 'Study Outline', description: 'Hierarchical outline with definitions & review questions', icon: ListTree },
  { id: 'concepts', label: 'Concept Map', description: 'Glossary, relationships table & memory aids', icon: Network },
];

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    if (file.type.startsWith('image/')) reader.readAsDataURL(file);
    else reader.readAsText(file);
  });
};

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
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<'input' | 'generating' | 'result'>('input');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Persist mode choice
  useEffect(() => {
    const saved = localStorage.getItem('study-aide-mode');
    if (saved && modes.some(m => m.id === saved)) setMode(saved as AideMode);
  }, []);
  useEffect(() => { localStorage.setItem('study-aide-mode', mode); }, [mode]);

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
      let material = inputText;
      if (selectedFile) {
        const fileContent = await readFileAsText(selectedFile);
        material = material ? `${material}\n\n--- Uploaded File: ${selectedFile.name} ---\n${fileContent}` : fileContent;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/study-aide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ mode, topic: inputText.trim().substring(0, 200), material }),
      });

      if (!response.ok) {
        if (response.status === 429) { toast.error('Rate limit reached. Please wait a moment.'); setPhase('input'); return; }
        if (response.status === 402) { toast.error('AI credits exhausted. Please try later.'); setPhase('input'); return; }
        throw new Error('Generation failed');
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

      setPhase('result');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate. Please try again.');
      setPhase('input');
    }
  }, [inputText, selectedFile, mode]);

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

  const currentMode = modes.find(m => m.id === mode)!;
  const ModeIcon = currentMode.icon;

  // Simple markdown renderer
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-serif font-bold text-foreground mt-6 mb-3">{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-serif font-semibold text-foreground mt-5 mb-2">{line.slice(4)}</h3>;
      if (line.startsWith('#### ')) return <h4 key={i} className="text-base font-serif font-semibold text-foreground mt-4 mb-1.5">{line.slice(5)}</h4>;
      // Horizontal rule
      if (/^---+$/.test(line.trim())) return <hr key={i} className="my-4 border-border" />;
      // Table header separator
      if (/^\|[\s-|]+\|$/.test(line.trim())) return null;
      // Table rows
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const cells = line.split('|').filter(Boolean).map(c => c.trim());
        return (
          <div key={i} className="grid gap-2 py-1.5 border-b border-border/50 text-sm" style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
            {cells.map((cell, j) => <span key={j} className="px-2" dangerouslySetInnerHTML={{ __html: formatInline(cell) }} />)}
          </div>
        );
      }
      // Bullet
      if (line.trim().startsWith('- ')) return <li key={i} className="ml-5 text-sm text-foreground/90 leading-relaxed list-disc" dangerouslySetInnerHTML={{ __html: formatInline(line.trim().slice(2)) }} />;
      // Numbered
      const numMatch = line.trim().match(/^(\d+)\.\s(.*)$/);
      if (numMatch) return <li key={i} className="ml-5 text-sm text-foreground/90 leading-relaxed list-decimal" dangerouslySetInnerHTML={{ __html: formatInline(numMatch[2]) }} />;
      // Empty
      if (!line.trim()) return <div key={i} className="h-2" />;
      // Paragraph
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
        ogImage="/og/og-home.png"
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
                            <button
                              key={m.id}
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
                          );
                        })}
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
                <div className="h-[60vh] flex flex-col items-center justify-center text-center px-6">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="mb-8 text-accent">
                    <RefreshCcw size={64} strokeWidth={1} />
                  </motion.div>
                  <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4">Generating {currentMode.label}</h2>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em]">Analyzing your material...</p>
                  <div className="w-48 h-1 bg-muted mt-10 overflow-hidden relative rounded-full">
                    <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="absolute inset-0 w-1/2 bg-primary" />
                  </div>
                </div>

                {/* Live preview while streaming */}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default StudyAidePage;
