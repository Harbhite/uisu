import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen, Loader2, Sparkles, UploadCloud, X, Link2, FileDown, Printer, Volume2, VolumeX,
  Send, Trash2, Clock, Baby, MessageCircle, Scale, ChevronDown, Check, Search, Minus, Plus,
  ChevronsDownUp, ChevronsUpDown, Layers, Gauge, Hash, ArrowRight, Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import AIToolsHeader from '@/components/resources/AIToolsHeader';
import { readFileContent } from '@/lib/file-utils';
import { cn } from '@/lib/utils';
import {
  WikiData, WikiHistoryItem, ChatMessage, CognitiveLevel,
  generateWiki, chatWithWiki, getEli5, addToHistory, loadHistory, removeFromHistory,
  encodeWiki, decodeWiki, downloadMarkdown,
} from '@/lib/tinywiki';
import { printWiki } from '@/lib/tinywikiPrint';

const LEVELS: { id: CognitiveLevel; hint: string }[] = [
  { id: 'Basic', hint: 'Plain & simple' },
  { id: 'Standard', hint: 'University level' },
  { id: 'Advanced', hint: 'Technical depth' },
];
const IDEAS = ['Doctrine of precedent', 'Separation of powers', 'Photosynthesis', 'Inflation', 'Rule of law', 'Machine learning'];
const STEPS = ['Reading your topic', 'Outlining the sections', 'Writing clear explanations', 'Building your glossary', 'Final polish'];
const PROSE = ['prose-base', 'prose-lg', 'prose-xl'];
const QUICK_ASKS = ['Summarise this in 3 bullets', 'Quiz me with 3 questions', 'What are the main counter-arguments?'];

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));

const TinyWikiPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<CognitiveLevel>('Standard');
  const [files, setFiles] = useState<{ name: string; text: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [wiki, setWiki] = useState<WikiData | null>(null);
  const [history, setHistory] = useState<WikiHistoryItem[]>([]);

  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fontScale, setFontScale] = useState(0);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [gQuery, setGQuery] = useState('');
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [eli5, setEli5] = useState<Record<string, string>>({});
  const [eli5Busy, setEli5Busy] = useState<string | null>(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);

  /* ── lifecycle ───────────────────────────────────────────── */
  useEffect(() => {
    setHistory(loadHistory());
    const shared = params.get('share');
    if (shared) {
      const w = decodeWiki(shared);
      if (w) setWiki(w); else toast.error('That shared link is invalid or corrupted.');
    }
    return () => window.speechSynthesis?.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat, chatBusy]);

  useEffect(() => {
    if (!loading) return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 2600);
    return () => clearInterval(t);
  }, [loading]);

  // reading progress
  useEffect(() => {
    if (!wiki) return;
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setProgress(clamp(-r.top / Math.max(1, r.height - window.innerHeight * 0.6)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [wiki]);

  // scroll-spy
  useEffect(() => {
    if (!wiki) return;
    const els = wiki.sections.map((_, i) => document.getElementById(`tw-s-${i}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActive(Number(vis[0].target.id.split('-')[2]));
    }, { rootMargin: '-15% 0px -65% 0px' });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [wiki, collapsed]);

  // close term popover on outside click / Esc
  useEffect(() => {
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return;
      if (e instanceof MouseEvent && (e.target as HTMLElement).closest('[data-tw-term]')) return;
      setActiveTerm(null);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
  }, []);

  /* ── actions ─────────────────────────────────────────────── */
  const openWiki = (w: WikiData) => {
    window.speechSynthesis?.cancel();
    setSpeakingIdx(null); setWiki(w); setChat([]); setEli5({}); setChecked(new Set());
    setCollapsed(new Set()); setActive(0); setGQuery(''); setChatOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFiles = async (list: FileList | File[] | null) => {
    if (!list || !list.length) return;
    const arr = Array.from(list);
    try {
      const read = await Promise.all(arr.map(async (f) => {
        const { text, isImage } = await readFileContent(f);
        return isImage ? null : { name: f.name, text };
      }));
      const ok = read.filter(Boolean) as { name: string; text: string }[];
      if (ok.length < arr.length) toast.info('Images are not supported here. Use PDF or text files.');
      setFiles((p) => [...p, ...ok]);
    } catch { toast.error('Could not read that file.'); }
    if (fileRef.current) fileRef.current.value = '';
  };

  const generate = async (override?: string) => {
    const t = (override ?? topic).trim();
    if (!t && files.length === 0) { toast.error('Enter a topic or add a file first.'); return; }
    if (override) setTopic(override);
    setLoading(true);
    try {
      const material = files.map((f) => `--- ${f.name} ---\n${f.text}`).join('\n\n');
      const { wiki: w, truncated } = await generateWiki(t, material, level);
      if (truncated) toast.info('Your material was long, so some of it was left out.');
      setHistory(addToHistory(w));
      openWiki(w);
      if (params.get('share')) setParams({}, { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to generate wiki.');
    } finally { setLoading(false); }
  };

  const share = async () => {
    if (!wiki) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/resources/tinywiki?share=${encodeWiki(wiki)}`);
      toast.success('Share link copied');
    } catch { toast.error('Could not copy the link.'); }
  };

  const goTo = (i: number) => {
    setCollapsed((c) => { const n = new Set(c); n.delete(i); return n; });
    setTimeout(() => document.getElementById(`tw-s-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  const toggleSection = (i: number) =>
    setCollapsed((c) => { const n = new Set(c); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const readAloud = (i: number) => {
    const synth = window.speechSynthesis;
    if (!synth || !wiki) return toast.error('Read aloud is not supported in this browser.');
    if (speakingIdx === i) { synth.cancel(); setSpeakingIdx(null); return; }
    synth.cancel();
    const s = wiki.sections[i];
    const u = new SpeechSynthesisUtterance(`${s.heading}. ${s.content.replace(/[#*_`>\[\]]/g, '')}`);
    u.onend = () => setSpeakingIdx(null);
    u.onerror = () => setSpeakingIdx(null);
    setSpeakingIdx(i);
    synth.speak(u);
  };

  const toggleCheck = (key: string) =>
    setChecked((c) => { const n = new Set(c); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const sendChat = async (text?: string) => {
    const msg = (text ?? chatInput).trim();
    if (!msg || !wiki || chatBusy) return;
    const next: ChatMessage[] = [...chat, { role: 'user', content: msg }];
    setChat(next); setChatInput(''); setChatBusy(true);
    try {
      const { text: reply } = await chatWithWiki(next, wiki);
      setChat([...next, { role: 'assistant', content: reply }]);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Chat failed.'); }
    finally { setChatBusy(false); }
  };

  const explain = useCallback(async (term: string, definition: string) => {
    if (eli5[term]) return;
    setEli5Busy(term);
    try {
      const { text } = await getEli5(term, definition);
      setEli5((p) => ({ ...p, [term]: text }));
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not explain that term.'); }
    finally { setEli5Busy(null); }
  }, [eli5]);

  /* ── derived ─────────────────────────────────────────────── */
  const glossaryMap = useMemo(() => {
    const m = new Map<string, { term: string; definition: string }>();
    wiki?.glossary?.forEach((g) => m.set(g.term.toLowerCase(), g));
    return m;
  }, [wiki]);

  const totalPoints = wiki?.sections.reduce((n, s) => n + (s.keyPoints?.length || 0), 0) || 0;
  const filteredGlossary = useMemo(() => {
    const q = gQuery.trim().toLowerCase();
    return [...(wiki?.glossary || [])]
      .filter((g) => !q || g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q))
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [wiki, gQuery]);

  const mdComponents = useMemo(() => ({
    strong: ({ children }: { children?: React.ReactNode }) => {
      const key = String(React.Children.toArray(children).join('')).toLowerCase().trim();
      const g = glossaryMap.get(key);
      if (!g) return <strong>{children}</strong>;
      const open = activeTerm === key;
      return (
        <span className="relative inline" data-tw-term>
          <button type="button" onClick={() => setActiveTerm(open ? null : key)}
            className={cn('font-bold rounded-sm px-0.5 -mx-0.5 border-b-2 border-dotted border-accent transition-colors',
              open ? 'bg-accent/25 text-primary dark:text-accent' : 'text-primary dark:text-accent hover:bg-accent/15')}>
            {children}
          </button>
          <AnimatePresence>
            {open && (
              <motion.span initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }} role="tooltip"
                className="absolute z-30 left-1/2 -translate-x-1/2 top-full mt-2 w-72 max-w-[80vw] rounded-xl border border-accent/30 bg-popover text-popover-foreground shadow-premium-lg p-3 text-sm font-normal not-italic leading-relaxed text-left">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-accent mb-1">{g.term}</span>
                <span className="block">{g.definition}</span>
                {eli5[g.term] ? (
                  <span className="block mt-2 pt-2 border-t border-border italic text-muted-foreground">
                    <Baby size={12} className="inline mr-1 -mt-0.5" />{eli5[g.term]}
                  </span>
                ) : (
                  <span onClick={() => explain(g.term, g.definition)}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent cursor-pointer hover:underline">
                    {eli5Busy === g.term ? <Loader2 size={12} className="animate-spin" /> : <Baby size={12} />} Explain like I'm 5
                  </span>
                )}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      );
    },
  }), [glossaryMap, activeTerm, eli5, eli5Busy, explain]);

  const ToolBtn = ({ onClick, icon: I, label }: { onClick: () => void; icon: React.ElementType; label: string }) => (
    <button onClick={onClick}
      className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:border-accent hover:text-accent hover:-translate-y-0.5 transition-all shadow-sm">
      <I size={14} className="group-hover:scale-110 transition-transform" /> {label}
    </button>
  );

  /* ── render ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background">
      <SEO title="TinyWiki - AI Wiki Generator" description="Turn any topic or study material into a structured, easy-to-read wiki with a glossary and an AI study assistant." />
      <AIToolsHeader title="TinyWiki" subtitle="Wiki Generator" icon={BookOpen} />

      {wiki && (
        <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent">
          <motion.div className="h-full bg-gradient-to-r from-primary via-accent to-accent" style={{ width: `${progress * 100}%` }} />
        </div>
      )}

      <div className="container mx-auto px-4 max-w-6xl py-8 md:py-12">
        {/* ── Composer ─────────────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          className={cn('relative overflow-hidden rounded-3xl border bg-card shadow-premium transition-all',
            dragging ? 'border-accent ring-4 ring-accent/20 scale-[1.01]' : 'border-border')}>
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative p-5 md:p-8 space-y-5">
            {!wiki && (
              <div className="space-y-1">
                <h2 className="font-serif text-3xl md:text-4xl tracking-tight text-primary dark:text-foreground">What do you want to understand?</h2>
                <p className="text-sm text-muted-foreground">Type a topic, paste a YouTube link, or drop your notes. Get a clear, structured wiki in seconds.</p>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15 transition-all">
              <Search size={18} className="text-muted-foreground shrink-0" />
              <input value={topic} onChange={(e) => setTopic(e.target.value)} disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && !loading && generate()}
                placeholder="e.g. Doctrine of precedent in Nigerian law"
                className="w-full bg-transparent py-4 text-base outline-none placeholder:text-muted-foreground/60" />
              {topic && <button onClick={() => setTopic('')} aria-label="Clear" className="p-1 text-muted-foreground hover:text-foreground"><X size={16} /></button>}
            </div>

            {!wiki && !loading && (
              <div className="flex flex-wrap gap-2">
                {IDEAS.map((t) => (
                  <button key={t} onClick={() => generate(t)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-accent hover:bg-accent/10 hover:text-foreground transition-all">
                    {t}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {/* animated level selector */}
              <div className="relative flex rounded-xl bg-muted p-1" role="tablist" aria-label="Reading level">
                {LEVELS.map((l) => (
                  <button key={l.id} role="tab" aria-selected={level === l.id} onClick={() => setLevel(l.id)} title={l.hint}
                    className={cn('relative z-10 rounded-lg px-4 py-2 text-xs font-bold transition-colors', level === l.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
                    {level === l.id && (
                      <motion.span layoutId="tw-level" className="absolute inset-0 -z-10 rounded-lg bg-accent shadow" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                    )}
                    {l.id}
                  </button>
                ))}
              </div>

              <button onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:border-accent hover:text-accent transition-all">
                <UploadCloud size={15} /> {dragging ? 'Drop to add' : 'Add files'}
              </button>
              <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.csv,.json,.html" multiple hidden onChange={(e) => handleFiles(e.target.files)} />

              <button onClick={() => generate()} disabled={loading}
                className="group ml-auto inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 transition-all">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-accent group-hover:rotate-12 transition-transform" />}
                {loading ? 'Generating…' : wiki ? 'Generate another' : 'Generate wiki'}
              </button>
            </div>

            <AnimatePresence>
              {files.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-2">
                  {files.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/30 pl-3 pr-1 py-1 text-xs font-medium">
                      <FileDown size={12} className="text-accent" />{f.name}
                      <button onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`} className="rounded-full p-1 hover:bg-destructive/15 hover:text-destructive"><X size={12} /></button>
                    </span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* loading */}
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="relative border-t border-border bg-muted/30 px-5 md:px-8 py-6 space-y-4 overflow-hidden">
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {STEPS.map((s, i) => (
                    <span key={s} className={cn('inline-flex items-center gap-1.5 text-xs font-semibold transition-colors', i < step ? 'text-accent' : i === step ? 'text-foreground' : 'text-muted-foreground/40')}>
                      {i < step ? <Check size={12} /> : i === step ? <Loader2 size={12} className="animate-spin" /> : <span className="h-3 w-3 rounded-full border border-current" />}
                      {s}
                    </span>
                  ))}
                </div>
                <div className="space-y-2.5">
                  {[92, 100, 78, 60].map((w, i) => (
                    <div key={i} className="relative h-3 overflow-hidden rounded-full bg-muted" style={{ width: `${w}%` }}>
                      <motion.div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-accent/30 to-transparent"
                        animate={{ x: ['-100%', '400%'] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ── Library ──────────────────────────────────────── */}
        {history.length > 0 && !loading && (
          <section className="mt-8">
            <h3 className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground"><Layers size={13} /> Your library</h3>
            <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
              {history.map((h, i) => (
                <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className={cn('group relative w-60 shrink-0 rounded-2xl border bg-card p-4 transition-all hover:-translate-y-1 hover:shadow-premium',
                    wiki?.title === h.wiki.title ? 'border-accent' : 'border-border hover:border-accent/50')}>
                  <button onClick={() => openWiki(h.wiki)} className="block w-full text-left">
                    <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-accent"><BookOpen size={15} /></span>
                    <p className="line-clamp-2 font-serif text-lg leading-snug">{h.wiki.title}</p>
                    <p className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Clock size={11} />{h.wiki.readingTimeMinutes} min · {new Date(h.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                  <button onClick={() => setHistory(removeFromHistory(h.id))} aria-label="Delete"
                    className="absolute right-2 top-2 rounded-full p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus:opacity-100">
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ── Reader ───────────────────────────────────────── */}
        {wiki && (
          <div className="mt-10 grid gap-10 lg:grid-cols-[230px_minmax(0,1fr)]">
            {/* sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-6 space-y-5">
                <nav aria-label="Contents">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Contents</p>
                  <ol className="relative space-y-0.5 border-l border-border">
                    {wiki.sections.map((s, i) => (
                      <li key={i}>
                        <button onClick={() => goTo(i)}
                          className={cn('relative -ml-px block w-full border-l-2 py-1.5 pl-4 pr-2 text-left text-[13px] leading-snug transition-all',
                            active === i ? 'border-accent font-semibold text-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground')}>
                          <span className="mr-1.5 text-[10px] font-bold text-accent">{String(i + 1).padStart(2, '0')}</span>{s.heading}
                        </button>
                      </li>
                    ))}
                  </ol>
                </nav>

                <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                    <span>Reading</span><span>{Math.round(progress * 100)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted"><motion.div className="h-full rounded-full bg-accent" animate={{ width: `${progress * 100}%` }} /></div>
                  {totalPoints > 0 && (
                    <>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                        <span>Key points reviewed</span><span>{checked.size}/{totalPoints}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted"><motion.div className="h-full rounded-full bg-primary" animate={{ width: `${(checked.size / totalPoints) * 100}%` }} /></div>
                    </>
                  )}
                </div>
              </div>
            </aside>

            <article ref={articleRef} className="min-w-0 space-y-8">
              {/* hero */}
              <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} key={wiki.title} className="space-y-5">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                  {wiki.difficulty && <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-primary-foreground"><Gauge size={11} className="text-accent" />{wiki.difficulty}</span>}
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-muted-foreground"><Clock size={11} />{wiki.readingTimeMinutes} min read</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-muted-foreground"><Hash size={11} />{wiki.sections.length} sections</span>
                  {!!wiki.glossary?.length && <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-muted-foreground"><BookOpen size={11} />{wiki.glossary.length} terms</span>}
                </div>
                <h2 className="font-serif text-4xl leading-[1.1] tracking-tight text-primary dark:text-foreground md:text-6xl text-balance">{wiki.title}</h2>
                <p className="border-l-4 border-accent bg-accent/[0.06] py-4 pl-5 pr-4 text-lg leading-relaxed rounded-r-2xl text-foreground/90">{wiki.summary}</p>

                <div className="flex flex-wrap items-center gap-2">
                  <ToolBtn onClick={share} icon={Link2} label="Share" />
                  <ToolBtn onClick={() => downloadMarkdown(wiki)} icon={FileDown} label="Markdown" />
                  <ToolBtn onClick={() => printWiki(wiki)} icon={Printer} label="Print / PDF" />
                  <div className="ml-auto flex items-center gap-1 rounded-full border border-border bg-card p-1">
                    <button onClick={() => setFontScale((f) => Math.max(0, f - 1))} disabled={fontScale === 0} aria-label="Smaller text" className="rounded-full p-1.5 hover:bg-muted disabled:opacity-30"><Minus size={13} /></button>
                    <span className="px-1 text-[11px] font-bold text-muted-foreground">Aa</span>
                    <button onClick={() => setFontScale((f) => Math.min(2, f + 1))} disabled={fontScale === 2} aria-label="Larger text" className="rounded-full p-1.5 hover:bg-muted disabled:opacity-30"><Plus size={13} /></button>
                    <span className="mx-1 h-4 w-px bg-border" />
                    <button onClick={() => setCollapsed(collapsed.size ? new Set() : new Set(wiki.sections.map((_, i) => i)))}
                      aria-label={collapsed.size ? 'Expand all' : 'Collapse all'} className="rounded-full p-1.5 hover:bg-muted">
                      {collapsed.size ? <ChevronsUpDown size={14} /> : <ChevronsDownUp size={14} />}
                    </button>
                  </div>
                </div>
              </motion.header>

              {/* mobile contents */}
              <div className="no-scrollbar sticky top-2 z-20 -mx-4 flex gap-2 overflow-x-auto px-4 py-2 backdrop-blur lg:hidden">
                {wiki.sections.map((s, i) => (
                  <button key={i} onClick={() => goTo(i)}
                    className={cn('shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all', active === i ? 'border-accent bg-accent text-primary' : 'border-border bg-card text-muted-foreground')}>
                    {i + 1}. {s.heading.length > 22 ? s.heading.slice(0, 22) + '…' : s.heading}
                  </button>
                ))}
              </div>

              {/* sections */}
              {wiki.sections.map((s, i) => {
                const isOpen = !collapsed.has(i);
                const done = s.keyPoints?.filter((_, j) => checked.has(`${i}-${j}`)).length || 0;
                return (
                  <motion.section key={i} id={`tw-s-${i}`} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
                    className={cn('scroll-mt-6 overflow-hidden rounded-3xl border bg-card transition-shadow', active === i ? 'border-accent/50 shadow-premium' : 'border-border')}>
                    <div className="flex items-center gap-3 p-5 md:p-6">
                      <button onClick={() => toggleSection(i)} aria-expanded={isOpen} className="flex min-w-0 flex-1 items-center gap-4 text-left">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary font-serif text-sm font-bold text-accent">{String(i + 1).padStart(2, '0')}</span>
                        <span className="min-w-0">
                          <span className="block font-serif text-2xl leading-tight md:text-3xl">{s.heading}</span>
                          {!!s.keyPoints?.length && <span className="mt-0.5 block text-[11px] font-semibold text-muted-foreground">{done}/{s.keyPoints.length} key points reviewed</span>}
                        </span>
                      </button>
                      <button onClick={() => readAloud(i)} aria-label={speakingIdx === i ? 'Stop reading' : 'Read aloud'}
                        className={cn('rounded-full border p-2.5 transition-all', speakingIdx === i ? 'border-accent bg-accent text-primary animate-pulse' : 'border-border text-muted-foreground hover:border-accent hover:text-accent')}>
                        {speakingIdx === i ? <VolumeX size={15} /> : <Volume2 size={15} />}
                      </button>
                      <button onClick={() => toggleSection(i)} aria-label={isOpen ? 'Collapse' : 'Expand'} className="rounded-full p-2.5 text-muted-foreground hover:bg-muted">
                        <ChevronDown size={18} className={cn('transition-transform duration-300', isOpen && 'rotate-180')} />
                      </button>
                    </div>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                          <div className="space-y-6 px-5 pb-6 md:px-6">
                            <div className={cn('prose prose-neutral dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-accent', PROSE[fontScale])}>
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{s.content}</ReactMarkdown>
                            </div>

                            {!!s.keyPoints?.length && (
                              <div className="rounded-2xl bg-primary/[0.04] dark:bg-primary/20 p-4 md:p-5">
                                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-primary dark:text-accent">Key points · tap to mark as reviewed</p>
                                <ul className="space-y-2">
                                  {s.keyPoints.map((p, j) => {
                                    const on = checked.has(`${i}-${j}`);
                                    return (
                                      <li key={j}>
                                        <button onClick={() => toggleCheck(`${i}-${j}`)}
                                          className={cn('flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition-all', on ? 'border-accent/50 bg-accent/10' : 'border-transparent bg-card hover:border-accent/40')}>
                                          <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all', on ? 'border-accent bg-accent text-primary scale-110' : 'border-muted-foreground/40')}>
                                            {on && <Check size={12} strokeWidth={3} />}
                                          </span>
                                          <span className={cn('transition-colors', on && 'text-muted-foreground')}>{p}</span>
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}

                            {!!s.criticalPerspectives?.length && (
                              <div className="rounded-2xl border border-border p-4 md:p-5">
                                <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground"><Scale size={13} /> Critical perspectives</p>
                                <ul className="space-y-2 text-sm">
                                  {s.criticalPerspectives.map((p, j) => (
                                    <li key={j} className="flex gap-3"><ArrowRight size={14} className="mt-1 shrink-0 text-accent" />{p}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {!!s.citations?.length && <p className="text-xs italic text-muted-foreground">Sources: {s.citations.join(' · ')}</p>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.section>
                );
              })}

              {/* glossary */}
              {!!wiki.glossary?.length && (
                <section className="space-y-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <h3 className="font-serif text-3xl">Glossary</h3>
                    <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 focus-within:border-accent">
                      <Search size={14} className="text-muted-foreground" />
                      <input value={gQuery} onChange={(e) => setGQuery(e.target.value)} placeholder="Filter terms…" className="w-40 bg-transparent py-2 text-sm outline-none" />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <AnimatePresence mode="popLayout">
                      {filteredGlossary.map((g) => (
                        <motion.div layout key={g.term} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                          className="group rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-premium">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-serif text-lg font-bold text-primary dark:text-accent">{g.term}</p>
                            <button onClick={() => explain(g.term, g.definition)} disabled={eli5Busy === g.term || !!eli5[g.term]} aria-label={`Explain ${g.term} simply`}
                              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent/15 hover:text-accent disabled:opacity-40">
                              {eli5Busy === g.term ? <Loader2 size={14} className="animate-spin" /> : <Baby size={14} />}
                            </button>
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-foreground/80">{g.definition}</p>
                          {eli5[g.term] && <p className="mt-3 rounded-lg bg-accent/10 p-2.5 text-sm italic text-foreground/80"><Baby size={12} className="mr-1 inline -mt-0.5 text-accent" />{eli5[g.term]}</p>}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  {filteredGlossary.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No terms match "{gQuery}".</p>}
                </section>
              )}

              {/* related */}
              {!!wiki.relatedTopics?.length && (
                <section className="space-y-3">
                  <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground"><Wand2 size={13} /> Keep exploring</h3>
                  <div className="flex flex-wrap gap-2">
                    {wiki.relatedTopics.map((t) => (
                      <button key={t} onClick={() => generate(t)} disabled={loading}
                        className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-all hover:border-accent hover:bg-accent hover:text-primary hover:-translate-y-0.5 disabled:opacity-50">
                        {t}<ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </article>
          </div>
        )}
      </div>

      {/* ── Study assistant (floating) ───────────────────────── */}
      {wiki && (
        <>
          <AnimatePresence>
            {!chatOpen && (
              <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                onClick={() => setChatOpen(true)} aria-label="Ask about this wiki"
                className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-premium-lg ring-1 ring-accent/40">
                <MessageCircle size={18} className="text-accent" /> Ask
                {chat.length > 0 && <span className="h-2 w-2 rounded-full bg-accent" />}
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {chatOpen && (
              <motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                className="fixed bottom-4 right-4 z-50 flex h-[min(620px,80vh)] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-accent/30 bg-card shadow-premium-lg">
                <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary"><MessageCircle size={15} /></span>
                    <div className="min-w-0"><p className="text-sm font-bold leading-none">Study assistant</p><p className="mt-1 truncate text-[11px] opacity-60">{wiki.title}</p></div>
                  </div>
                  <button onClick={() => setChatOpen(false)} aria-label="Close" className="rounded-full p-1.5 hover:bg-white/10"><X size={16} /></button>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {chat.length === 0 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Ask anything about this wiki, or try:</p>
                      {QUICK_ASKS.map((q) => (
                        <button key={q} onClick={() => sendChat(q)} className="block w-full rounded-xl border border-border px-3.5 py-2.5 text-left text-sm transition-all hover:border-accent hover:bg-accent/10">{q}</button>
                      ))}
                    </div>
                  )}
                  {chat.map((m, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={m.role === 'user' ? 'flex justify-end' : 'flex'}>
                      <div className={cn('max-w-[88%] rounded-2xl px-4 py-2.5 text-sm', m.role === 'user' ? 'rounded-br-md bg-accent text-primary' : 'rounded-bl-md bg-muted')}>
                        {m.role === 'user' ? m.content : <div className="prose prose-sm max-w-none dark:prose-invert"><ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown></div>}
                      </div>
                    </motion.div>
                  ))}
                  {chatBusy && (
                    <div className="flex gap-1 px-2 py-1">
                      {[0, 1, 2].map((d) => <motion.span key={d} className="h-2 w-2 rounded-full bg-accent" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: d * 0.15 }} />)}
                    </div>
                  )}
                  <div ref={chatEnd} />
                </div>

                <div className="flex gap-2 border-t border-border p-3">
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                    placeholder="Ask something…" className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" />
                  <button onClick={() => sendChat()} disabled={chatBusy || !chatInput.trim()} aria-label="Send"
                    className="rounded-xl bg-primary px-3.5 text-accent transition-all hover:-translate-y-0.5 disabled:opacity-40"><Send size={16} /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default TinyWikiPage;
