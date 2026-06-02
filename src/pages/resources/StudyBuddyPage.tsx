import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BookOpen, CalendarDays, Layers, Swords,
  Send, Loader2, Sparkles, ImageIcon, RefreshCcw, Copy, Check,
  Upload, FileIcon, Trash2, Table2, Code2, Download,
  ChevronDown, ChevronUp, Eye, EyeOff, History, FileText, FileDown, Share2, Link2
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import AIToolsHeader from '@/components/resources/AIToolsHeader';
import AsciiDiagramViewer from '@/components/resources/AsciiDiagramViewer';
import MermaidDiagram from '@/components/resources/MermaidDiagram';
import { StudySessionHistory } from '@/components/StudySessionHistory';
import { toast } from 'sonner';
import { readFileContent, DepthLevel } from '@/lib/file-utils';
import { cacheOutput } from '@/lib/ai-cache';
import GenerationProgress from '@/components/resources/GenerationProgress';

type Mode = 'explainer' | 'planner' | 'synthesizer' | 'debater';

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
    id: 'debater',
    label: 'Debater',
    icon: Swords,
    description: 'Presents arguments for and against a position to sharpen critical thinking',
    placeholder: 'Enter a topic to debate... e.g. "Should AI replace doctors?" or "Is capitalism sustainable?"',
    color: 'bg-amber-800',
  },
];

// readFileContent imported from @/lib/file-utils

// Collapsible wrapper for diagram blocks
const CollapsibleDiagram: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="my-6 border border-accent/30 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-accent/10 hover:bg-accent/15 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? <Eye size={13} className="text-accent" /> : <EyeOff size={13} className="text-muted-foreground" />}
          <span className="text-[9px] font-bold uppercase tracking-widest text-accent">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            {open ? 'Hide' : 'Show'}
          </span>
          {open ? <ChevronUp size={13} className="text-muted-foreground" /> : <ChevronDown size={13} className="text-muted-foreground" />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Reusable Export Dropdown — renders the live DOM (with diagrams + tables) into images for PDF/DOCX
const ExportDropdown: React.FC<{
  content: string;
  filenameBase: string;
  title: string;
  getNode?: () => HTMLElement | null;
}> = ({ content, filenameBase, title, getNode }) => {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const plainText = content.replace(/[#*`_~>]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  const exportTxt = () => {
    const blob = new Blob([plainText], { type: 'text/plain' });
    saveAs(blob, `${filenameBase}.txt`);
    toast.success('Downloaded as TXT');
    setOpen(false);
  };

  // Capture the live DOM as a single canvas, then paginate it into a PDF.
  // This preserves rendered diagrams (mermaid SVG), tables, headings, etc.
  const exportPdf = async () => {
    setExporting(true);
    setOpen(false);
    try {
      const node = getNode?.();
      const { jsPDF } = await import('jspdf');
      if (!node) {
        // Fallback: plain text
        const doc = new jsPDF();
        doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.text(title, 20, 20);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
        const lines = doc.splitTextToSize(plainText, 170);
        let y = 32;
        for (const line of lines) {
          if (y > 280) { doc.addPage(); y = 20; }
          doc.text(line, 20, y); y += 5;
        }
        doc.save(`${filenameBase}.pdf`);
      } else {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(node, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          logging: false,
          windowWidth: node.scrollWidth,
        });
        const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const imgW = pageW;
        const imgH = (canvas.height * imgW) / canvas.width;
        let heightLeft = imgH;
        let position = 0;
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
        heightLeft -= pageH;
        while (heightLeft > 0) {
          position = heightLeft - imgH;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
          heightLeft -= pageH;
        }
        pdf.save(`${filenameBase}.pdf`);
      }
      toast.success('Downloaded as PDF');
    } catch (e) {
      console.error(e);
      toast.error('PDF export failed');
    } finally {
      setExporting(false);
    }
  };

  // DOCX export: render the live DOM into a PNG and embed it. Preserves diagrams + tables visually.
  const exportDocx = async () => {
    setExporting(true);
    setOpen(false);
    try {
      const node = getNode?.();
      if (!node) {
        const paragraphs = plainText.split('\n').filter(Boolean).map(
          line => new Paragraph({ children: [new TextRun({ text: line, size: 22 })] })
        );
        const docFile = new Document({
          sections: [{ children: [new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }), ...paragraphs] }],
        });
        const blob = await Packer.toBlob(docFile);
        saveAs(blob, `${filenameBase}.docx`);
      } else {
        const html2canvas = (await import('html2canvas')).default;
        const { ImageRun } = await import('docx');
        const canvas = await html2canvas(node, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          logging: false,
          windowWidth: node.scrollWidth,
        });
        const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png'));
        const arrayBuf = await blob.arrayBuffer();
        // Scale image to fit ~600px (A4 page printable width-ish in DOCX layout units)
        const targetW = 600;
        const targetH = Math.round((canvas.height * targetW) / canvas.width);
        const docFile = new Document({
          sections: [{
            children: [
              new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
              new Paragraph({
                children: [
                  new ImageRun({
                    data: new Uint8Array(arrayBuf),
                    transformation: { width: targetW, height: targetH },
                  } as any),
                ],
              }),
            ],
          }],
        });
        const docBlob = await Packer.toBlob(docFile);
        saveAs(docBlob, `${filenameBase}.docx`);
      }
      toast.success('Downloaded as DOCX');
    } catch (e) {
      console.error(e);
      toast.error('DOCX export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={exporting}
        className="p-2 border border-border hover:border-accent text-muted-foreground hover:text-accent transition-all rounded-sm flex items-center gap-1 disabled:opacity-60"
        title="Export"
      >
        {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
        <ChevronDown size={10} />
      </button>
      {open && !exporting && (
        <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[140px] py-1">
          <button onClick={exportTxt} className="w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent hover:bg-muted/50 flex items-center gap-2">
            <FileText size={12} /> TXT
          </button>
          <button onClick={exportPdf} className="w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent hover:bg-muted/50 flex items-center gap-2">
            <FileDown size={12} /> PDF
          </button>
          <button onClick={exportDocx} className="w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent hover:bg-muted/50 flex items-center gap-2">
            <FileIcon size={12} /> DOCX
          </button>
        </div>
      )}
    </div>
  );
};

const StudyBuddyPage = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<Mode>(() => {
    try { return (JSON.parse(localStorage.getItem('studybuddy_state') || '{}').activeMode as Mode) || 'explainer'; } catch { return 'explainer'; }
  });
  const [topic, setTopic] = useState(() => {
    try { return JSON.parse(localStorage.getItem('studybuddy_state') || '{}').topic || ''; } catch { return ''; }
  });
  const [material, setMaterial] = useState(() => {
    try { return JSON.parse(localStorage.getItem('studybuddy_state') || '{}').material || ''; } catch { return ''; }
  });
  const [response, setResponse] = useState(() => {
    try { return JSON.parse(localStorage.getItem('studybuddy_state') || '{}').response || ''; } catch { return ''; }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  const responseContentRef = useRef<HTMLDivElement>(null);
  const [depth, setDepth] = useState<DepthLevel>(() => {
    try { return (localStorage.getItem('studybuddy_depth') as DepthLevel) || 'intermediate'; } catch { return 'intermediate'; }
  });
  // Conversation memory: stores {role, content} pairs
  const [chatHistory, setChatHistory] = useState<Array<{role: string; content: string}>>([]);
  // Last saved session id (for share link)
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const currentMode = modes.find(m => m.id === activeMode)!;

  // Persist state to localStorage
  React.useEffect(() => {
    const state = { activeMode, topic, material, response };
    localStorage.setItem('studybuddy_state', JSON.stringify(state));
  }, [activeMode, topic, material, response]);
  React.useEffect(() => { localStorage.setItem('studybuddy_depth', depth); }, [depth]);

  const STUDY_BUDDY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/study-buddy`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large. Max 10MB.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = useCallback(async () => {
    if (!topic.trim() && !material.trim() && !selectedFile) {
      toast.error('Please enter a topic, paste material, or upload a file');
      return;
    }

    setIsLoading(true);
    setResponse('');
    setGeneratedImage(null);

    try {
      let fileContent = '';
      let imageDataUrl = '';
      if (selectedFile) {
        const { text, isImage } = await readFileContent(selectedFile);
        if (isImage) {
          imageDataUrl = text; // base64 data URL for vision
        } else {
          fileContent = text;
        }
      }

      const bodyPayload: Record<string, any> = {
        mode: activeMode,
        topic: topic.trim(),
        material: material.trim() + (fileContent ? `\n\n--- UPLOADED FILE (${selectedFile?.name}) ---\n${fileContent}` : ''),
        depth,
        chatHistory,
        ...(imageDataUrl ? { imageData: imageDataUrl } : {}),
      };

      const resp = await fetch(STUDY_BUDDY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(bodyPayload),
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
      if (!resp.ok) {
        const payload = await resp.json().catch(() => null);
        throw new Error(payload?.error || 'Failed to start stream');
      }
      if (!resp.body) throw new Error('Failed to start stream');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullText = '';
      let lastUpdate = 0;

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
              const now = Date.now();
              if (now - lastUpdate > 100) {
                setResponse(fullText);
                lastUpdate = now;
              }
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      setResponse(fullText);

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
      // Save session to database
      if (fullText) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: inserted } = await supabase.from('study_sessions' as any).insert({
            user_id: user.id,
            mode: activeMode,
            topic: topic.trim() || null,
            material_preview: material.trim().substring(0, 200) || null,
            response: fullText,
          }).select('id').single();
          if (inserted && (inserted as any).id) {
            setLastSessionId((inserted as any).id);
            setShareUrl(null);
          }
        }
      }
      // Update chat history for conversation memory
      if (fullText) {
        setChatHistory(prev => [
          ...prev,
          { role: 'user', content: topic.trim() + (material.trim() ? `\n${material.trim().substring(0, 500)}` : '') },
          { role: 'assistant', content: fullText.substring(0, 5000) },
        ]);
        // Cache for offline access
        cacheOutput({
          tool: 'study-buddy',
          topic: topic.trim() || 'Untitled',
          result: fullText,
          mode: activeMode,
          depth,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [activeMode, topic, material, selectedFile, STUDY_BUDDY_URL, depth, chatHistory]);

  const handleGenerateImage = useCallback(async () => {
    if (!topic.trim() && !material.trim() && !selectedFile) {
      toast.error('Enter a topic first to generate a visual');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const resp = await fetch(STUDY_BUDDY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
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
  }, [topic, material, selectedFile, activeMode, STUDY_BUDDY_URL]);

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!response || !lastSessionId) {
      toast.error('Generate an output first to share it');
      return;
    }
    setSharing(true);
    try {
      // Generate token client-side, persist + flip flag
      const token = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID().replace(/-/g, '')
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      const { error } = await supabase
        .from('study_sessions' as any)
        .update({ share_token: token, is_shared: true, shared_at: new Date().toISOString() })
        .eq('id', lastSessionId);
      if (error) throw error;
      const url = `${window.location.origin}/study/shared/${token}`;
      setShareUrl(url);
      try { await navigator.clipboard.writeText(url); toast.success('Share link copied to clipboard'); }
      catch { toast.success('Share link ready'); }
    } catch (e: any) {
      toast.error('Could not create share link', { description: e?.message });
    } finally {
      setSharing(false);
    }
  };

  const handleLoadSession = (session: any) => {
    setActiveMode(session.mode);
    setTopic(session.topic || '');
    setMaterial('');
    setResponse(session.response);
    setGeneratedImage(null);
    toast.success('Session loaded');
  };

  const handleReset = () => {
    setResponse('');
    setTopic('');
    setMaterial('');
    setGeneratedImage(null);
    setSelectedFile(null);
    setChatHistory([]);
    localStorage.removeItem('studybuddy_state');
  };

  // Cross-tool pipeline
  const sendToFlashcards = () => {
    localStorage.setItem('flashcard_state', JSON.stringify({ topic: topic.trim().substring(0, 200), material: response, cards: [] }));
    navigate('/resources/flashcards');
    toast.success('Material sent to Flashcard Generator');
  };
  const sendToQuiz = () => {
    localStorage.setItem('aiquiz_state', JSON.stringify({ inputText: response, rigidity: 'Standard', questionCount: 25 }));
    navigate('/resources/ai-quiz');
    toast.success('Material sent to AI Quiz');
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="StudyBuddy AI - Smart Study Tool"
        description="AI-powered study companion that explains, plans, summarizes, and creates flashcards across all fields of knowledge."
      />

      <AIToolsHeader title="StudyBuddy" icon={Sparkles} />

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
                  className={`p-4 md:p-5 border text-left transition-all group rounded-lg ${
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
            <div className="bg-card border border-border p-5 md:p-6 rounded-lg">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Topic or Question
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={currentMode.placeholder}
                className="w-full bg-muted/50 border border-border p-3 md:p-4 text-sm outline-none focus:border-accent transition-colors rounded-lg"
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSubmit()}
              />

              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 mt-5">
                Additional Material <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <textarea
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="Paste lecture notes, textbook excerpts, or any study material..."
                className="w-full bg-muted/50 border border-border p-3 md:p-4 text-sm outline-none focus:border-accent transition-colors resize-none h-32 md:h-40 rounded-lg"
              />

              {/* File Upload */}
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.docx,.doc,.txt,.xlsx,.xls,.pptx,.ppt,.md" />

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

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent hover:border-accent transition-all rounded-lg"
                >
                  <Upload size={14} /> Attach File
                </button>
                <StudySessionHistory onLoadSession={handleLoadSession} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className={`${currentMode.color} text-white p-5 md:p-6 border-l-4 border-accent rounded-lg`}>
              <div className="flex items-center gap-2 mb-4">
                <currentMode.icon size={18} className="text-accent" />
                <h3 className="font-serif text-lg italic">{currentMode.label} Mode</h3>
              </div>
              <p className="text-xs text-white/60 leading-relaxed mb-6">{currentMode.description}</p>
              <div className="text-[9px] font-bold uppercase tracking-widest text-white/30">Ready for input</div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || (!topic.trim() && !material.trim() && !selectedFile)}
              className="w-full py-5 bg-accent text-accent-foreground font-bold uppercase tracking-[0.2em] text-xs border border-accent hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 rounded-lg"
            >
              {isLoading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <><Send size={16} /> Generate</>}
            </button>

            <button
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || (!topic.trim() && !material.trim() && !selectedFile)}
              className="w-full py-4 border border-border text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] hover:border-accent hover:text-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 rounded-lg"
            >
              {isGeneratingImage ? <><Loader2 size={14} className="animate-spin" /> Generating Visual...</> : <><ImageIcon size={14} /> Generate Visual</>}
            </button>
          </div>
        </div>

        {/* Response Area — Redesigned */}
        <AnimatePresence>
          {(response || generatedImage || isLoading) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              ref={responseRef}
              className="mt-2"
            >
              {/* Response Header Bar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-1 bg-accent rounded-full" />
                  <div className="flex items-center gap-2">
                    <currentMode.icon size={14} className="text-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                      {currentMode.label} Output
                    </span>
                  </div>
              {isLoading && (
                    <GenerationProgress
                      isGenerating={isLoading}
                      partialContent={response}
                      label={`${currentMode.label} generating`}
                    />
                  )}
                </div>
              <div className="flex gap-1.5">
                  {response && (
                    <>
                       <ExportDropdown
                        content={response}
                        filenameBase={(topic || `studybuddy-${currentMode.label.toLowerCase()}`).replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 60)}
                        title={`StudyBuddy — ${currentMode.label}`}
                      />
                      <button
                        onClick={handleCopy}
                        className="p-2 border border-border hover:border-accent text-muted-foreground hover:text-accent transition-all rounded-sm"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleReset}
                    className="p-2 border border-border hover:border-destructive text-muted-foreground hover:text-destructive transition-all rounded-sm"
                    title="Clear output"
                  >
                    <RefreshCcw size={13} />
                  </button>
                </div>
              </div>

              {/* Generated Image */}
              {generatedImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 bg-card border border-border overflow-hidden rounded-sm"
                >
                  <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                    <ImageIcon size={12} className="text-accent" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Generated Visual</span>
                  </div>
                  <div className="p-6 flex justify-center bg-muted/10">
                    <img src={generatedImage} alt="AI-generated educational visual" className="max-w-full max-h-[500px] object-contain rounded-sm shadow-lg" />
                  </div>
                </motion.div>
              )}

              {/* Text Response — Rich Rendering */}
              {response && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card border border-border overflow-hidden rounded-sm"
                >
                  {/* Content Body */}
                  <div className="p-6 md:p-10 lg:p-12">
                    <div className="studybuddy-output max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary mt-8 mb-4 pb-3 border-b-2 border-accent/30 first:mt-0">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mt-8 mb-3 flex items-center gap-3">
                              <span className="w-1 h-6 bg-accent rounded-full inline-block flex-shrink-0" />
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-lg font-serif font-semibold text-primary mt-6 mb-2 pl-4 border-l-2 border-accent/40">
                              {children}
                            </h3>
                          ),
                          h4: ({ children }) => (
                            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mt-6 mb-2">
                              {children}
                            </h4>
                          ),
                          p: ({ children }) => (
                            <p className="text-sm md:text-[15px] leading-[1.8] text-foreground/80 mb-4">
                              {children}
                            </p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold text-foreground">{children}</strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic text-foreground/70 font-serif">{children}</em>
                          ),
                          ul: ({ children }) => (
                            <ul className="my-4 space-y-2 pl-0">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="my-4 space-y-2 pl-0 counter-reset-item list-none">
                              {children}
                            </ol>
                          ),
                          li: ({ children, ...props }) => {
                            const isOrdered = (props as any).ordered;
                            return (
                              <li className="flex gap-3 text-sm md:text-[15px] leading-[1.8] text-foreground/80">
                                <span className="flex-shrink-0 mt-[0.35em]">
                                  {isOrdered ? (
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent/15 text-accent text-[10px] font-bold">
                                      {(props as any).index != null ? (props as any).index + 1 : '•'}
                                    </span>
                                  ) : (
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mt-0.5" />
                                  )}
                                </span>
                                <span className="flex-1">{children}</span>
                              </li>
                            );
                          },
                          blockquote: ({ children }) => (
                            <blockquote className="my-6 border-l-4 border-accent bg-accent/5 px-5 py-4 rounded-r-sm">
                              <div className="text-sm italic text-foreground/70 font-serif leading-relaxed [&>p]:mb-0">
                                {children}
                              </div>
                            </blockquote>
                          ),
                          code: ({ className, children, ...props }) => {
                            const isBlock = className?.includes('language-');
                            const language = className?.replace('language-', '') || '';
                            const text = String(children).replace(/\n$/, '');

                            // Detect Mermaid diagrams: explicit language or auto-detect syntax
                            const mermaidLangs = ['mermaid', 'mmd'];
                            const mermaidKeywords = /^(graph\s+(TD|TB|LR|RL|BT)|flowchart\s+(TD|TB|LR|RL|BT)|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitgraph|mindmap|timeline|journey|quadrantChart|sankey|xychart|block-beta)/m;
                            const isMermaid = mermaidLangs.includes(language.toLowerCase()) ||
                              (isBlock && mermaidKeywords.test(text.trim()));

                            if (isMermaid) {
                              return (
                                <CollapsibleDiagram label={language || 'Flowchart'}>
                                  <MermaidDiagram content={text} label={language || 'Flowchart'} />
                                </CollapsibleDiagram>
                              );
                            }

                            // Detect ASCII diagrams: language hints or content with box-drawing chars
                            const diagramLangs = ['ascii', 'diagram', 'art', 'box', 'tree'];
                            const isDiagram = diagramLangs.includes(language.toLowerCase()) ||
                              (isBlock && /[┌┐└┘├┤┬┴┼│─╔╗╚╝║═]{4,}/.test(text) && text.split('\n').length > 3);

                            if (isDiagram) {
                              return (
                                <CollapsibleDiagram label={language || 'ASCII Diagram'}>
                                  <AsciiDiagramViewer content={text} label={language || 'Diagram'} />
                                </CollapsibleDiagram>
                              );
                            }

                            if (isBlock) {
                              return (
                                <div className="my-6 border border-border rounded-sm overflow-hidden">
                                  <div className="flex items-center justify-between px-4 py-2 bg-primary border-b border-border">
                                    <div className="flex items-center gap-2">
                                      <Code2 size={12} className="text-accent" />
                                      <span className="text-[9px] font-bold uppercase tracking-widest text-primary-foreground/50">
                                        {language || 'Code'}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(text);
                                        toast.success('Code copied');
                                      }}
                                      className="text-primary-foreground/40 hover:text-accent transition-colors"
                                    >
                                      <Copy size={12} />
                                    </button>
                                  </div>
                                  <pre className="p-4 bg-primary/95 overflow-x-auto">
                                    <code className="text-xs md:text-sm font-mono text-primary-foreground/90 leading-relaxed">
                                      {children}
                                    </code>
                                  </pre>
                                </div>
                              );
                            }
                            return (
                              <code className="px-1.5 py-0.5 bg-muted text-foreground text-xs font-mono rounded-sm border border-border/50">
                                {children}
                              </code>
                            );
                          },
                          pre: ({ children }) => <>{children}</>,
                          table: ({ children }) => (
                            <div className="my-6 border border-border rounded-sm overflow-hidden">
                              <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b border-border">
                                <Table2 size={12} className="text-accent" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Table</span>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  {children}
                                </table>
                              </div>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-primary text-primary-foreground">
                              {children}
                            </thead>
                          ),
                          th: ({ children }) => (
                            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest border-b border-primary-foreground/10">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="px-4 py-3 text-sm text-foreground/80 border-b border-border/50 leading-relaxed">
                              {children}
                            </td>
                          ),
                          tr: ({ children, ...props }) => (
                            <tr className="hover:bg-muted/30 transition-colors even:bg-muted/10">
                              {children}
                            </tr>
                          ),
                          hr: () => (
                            <div className="my-8 flex items-center gap-4">
                              <div className="flex-1 h-px bg-border" />
                              <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                              <div className="flex-1 h-px bg-border" />
                            </div>
                          ),
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80 underline underline-offset-2 transition-colors">
                              {children}
                            </a>
                          ),
                          img: ({ src, alt }) => (
                            <figure className="my-6">
                              <img src={src} alt={alt || ''} className="max-w-full rounded-sm border border-border shadow-sm" />
                              {alt && <figcaption className="mt-2 text-[10px] text-muted-foreground text-center italic">{alt}</figcaption>}
                            </figure>
                          ),
                        }}
                      >
                        {response}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Cross-tool Pipeline */}
                  {response && !isLoading && (
                    <div className="px-6 md:px-10 py-4 border-t border-border bg-muted/10">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                        <Sparkles size={10} className="text-accent" /> Send to Another Tool
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={sendToFlashcards} className="flex items-center gap-1.5 px-3 py-2 border border-border text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent hover:border-accent transition-all rounded-md">
                          Flashcards
                        </button>
                        <button onClick={sendToQuiz} className="flex items-center gap-1.5 px-3 py-2 border border-border text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent hover:border-accent transition-all rounded-md">
                          AI Quiz
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Footer Stats */}
                  <div className="px-6 md:px-10 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-[9px] font-mono text-muted-foreground/50">
                        {response.split(/\s+/).length} words
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground/50">
                        {response.length} chars
                      </span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                      StudyBuddy AI · {currentMode.label}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Loading skeleton */}
              {isLoading && !response && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-card border border-border rounded-sm p-8 md:p-12"
                >
                  <div className="space-y-4 animate-pulse">
                    <div className="h-6 bg-muted rounded-sm w-2/3" />
                    <div className="h-4 bg-muted rounded-sm w-full" />
                    <div className="h-4 bg-muted rounded-sm w-5/6" />
                    <div className="h-4 bg-muted rounded-sm w-4/5" />
                    <div className="h-20 bg-muted rounded-sm w-full mt-6" />
                    <div className="h-4 bg-muted rounded-sm w-3/4" />
                    <div className="h-4 bg-muted rounded-sm w-full" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudyBuddyPage;
