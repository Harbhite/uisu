import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  BookOpen, Loader2, Sparkles, Upload, X, Link2, FileDown, Printer, Volume2, VolumeX,
  Send, Trash2, History, Baby, MessageCircle, Scale,
} from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import AIToolsHeader from '@/components/resources/AIToolsHeader';
import { readFileContent } from '@/lib/file-utils';
import {
  WikiData, WikiHistoryItem, ChatMessage, CognitiveLevel,
  generateWiki, chatWithWiki, getEli5, addToHistory, loadHistory, removeFromHistory,
  encodeWiki, decodeWiki, downloadMarkdown,
} from '@/lib/tinywiki';

const LEVELS: CognitiveLevel[] = ['Basic', 'Standard', 'Advanced'];
const ACCEPT = '.pdf,.txt,.md,.csv,.json,.html';

const TinyWikiPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<CognitiveLevel>('Standard');
  const [files, setFiles] = useState<{ name: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [wiki, setWiki] = useState<WikiData | null>(null);
  const [history, setHistory] = useState<WikiHistoryItem[]>([]);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [eli5, setEli5] = useState<Record<string, string>>({});
  const [eli5Busy, setEli5Busy] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const chatEnd = useRef<HTMLDivElement>(null);

  // Library + shared-link loading
  useEffect(() => {
    setHistory(loadHistory());
    const shared = params.get('share');
    if (shared) {
      const w = decodeWiki(shared);
      if (w) setWiki(w);
      else toast.error('That shared link is invalid or corrupted.');
    }
    return () => window.speechSynthesis?.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat]);

  const glossaryMap = useMemo(() => {
    const m = new Map<string, string>();
    wiki?.glossary?.forEach((g) => m.set(g.term.toLowerCase(), g.definition));
    return m;
  }, [wiki]);

  const openWiki = (w: WikiData) => {
    window.speechSynthesis?.cancel();
    setSpeakingIdx(null);
    setWiki(w);
    setChat([]);
    setEli5({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFiles = async (list: FileList | null) => {
    if (!list) return;
    try {
      const read = await Promise.all(Array.from(list).map(async (f) => {
        const { text, isImage } = await readFileContent(f);
        return isImage ? null : { name: f.name, text };
      }));
      const ok = read.filter(Boolean) as { name: string; text: string }[];
      if (ok.length < list.length) toast.info('Images are not supported here. Use PDF or text files.');
      setFiles((prev) => [...prev, ...ok]);
    } catch {
      toast.error('Could not read that file.');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const generate = async () => {
    if (!topic.trim() && files.length === 0) {
      toast.error('Enter a topic or upload a file first.');
      return;
    }
    setLoading(true);
    try {
      const material = files.map((f) => `--- ${f.name} ---\n${f.text}`).join('\n\n');
      const { wiki: w, truncated } = await generateWiki(topic.trim(), material, level);
      if (truncated) toast.info('Your material was long, so some of it was left out.');
      setHistory(addToHistory(w));
      openWiki(w);
      if (params.get('share')) setParams({}, { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to generate wiki.');
    } finally {
      setLoading(false);
    }
  };

  const share = async () => {
    if (!wiki) return;
    const url = `${window.location.origin}/resources/tinywiki?share=${encodeWiki(wiki)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Share link copied.');
    } catch {
      toast.error('Could not copy the link.');
    }
  };

  const readAloud = (idx: number) => {
    const synth = window.speechSynthesis;
    if (!synth || !wiki) return toast.error('Read aloud is not supported in this browser.');
    if (speakingIdx === idx) { synth.cancel(); setSpeakingIdx(null); return; }
    synth.cancel();
    const s = wiki.sections[idx];
    const text = `${s.heading}. ${s.content.replace(/[#*_`>\[\]]/g, '')}`;
    const u = new SpeechSynthesisUtterance(text);
    u.onend = () => setSpeakingIdx(null);
    u.onerror = () => setSpeakingIdx(null);
    setSpeakingIdx(idx);
    synth.speak(u);
  };

  const sendChat = async () => {
    const msg = chatInput.trim();
    if (!msg || !wiki || chatBusy) return;
    const next: ChatMessage[] = [...chat, { role: 'user', content: msg }];
    setChat(next);
    setChatInput('');
    setChatBusy(true);
    try {
      const { text } = await chatWithWiki(next, wiki);
      setChat([...next, { role: 'assistant', content: text }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Chat failed.');
    } finally {
      setChatBusy(false);
    }
  };

  const explain = async (term: string, definition: string) => {
    if (eli5[term]) { setEli5(({ [term]: _, ...rest }) => rest); return; }
    setEli5Busy(term);
    try {
      const { text } = await getEli5(term, definition);
      setEli5((p) => ({ ...p, [term]: text }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not explain that term.');
    } finally {
      setEli5Busy(null);
    }
  };

  const mdComponents = {
    strong: ({ children }: { children?: React.ReactNode }) => {
      const key = String(React.Children.toArray(children).join('')).toLowerCase();
      const def = glossaryMap.get(key);
      return def
        ? <strong title={def} className="cursor-help underline decoration-dotted decoration-accent underline-offset-4">{children}</strong>
        : <strong>{children}</strong>;
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="TinyWiki - AI Wiki Generator" description="Turn any topic or study material into a structured, easy-to-read wiki with a glossary and an AI study assistant." />
      <AIToolsHeader title="TinyWiki" subtitle="Wiki Generator" icon={BookOpen} />

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Input */}
        <section className="print:hidden border border-border rounded-2xl p-5 bg-card space-y-4">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && generate()}
            placeholder="Enter a topic, or paste a YouTube link…"
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-lg border border-border overflow-hidden text-xs font-semibold">
              {LEVELS.map((l) => (
                <button key={l} onClick={() => setLevel(l)}
                  className={`px-3 py-2 ${level === l ? 'bg-accent text-primary' : 'hover:bg-muted'}`}>{l}</button>
              ))}
            </div>
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 text-xs font-semibold border border-border rounded-lg px-3 py-2 hover:bg-muted">
              <Upload size={14} /> Add files
            </button>
            <input ref={fileRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => handleFiles(e.target.files)} />
            <button onClick={generate} disabled={loading}
              className="ml-auto flex items-center gap-2 bg-accent text-primary font-bold text-sm rounded-xl px-5 py-2.5 disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? 'Generating…' : 'Generate wiki'}
            </button>
          </div>
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <span key={i} className="flex items-center gap-1 text-xs bg-muted rounded-full pl-3 pr-1 py-1">
                  {f.name}
                  <button onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`}
                    className="p-1 hover:text-destructive"><X size={12} /></button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Library */}
        {history.length > 0 && (
          <section className="print:hidden">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              <History size={14} /> Your library
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {history.map((h) => (
                <div key={h.id} className="group flex items-start justify-between gap-2 border border-border rounded-xl p-3 bg-card">
                  <button onClick={() => openWiki(h.wiki)} className="text-left min-w-0">
                    <p className="font-serif text-lg leading-tight truncate">{h.wiki.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleDateString()} · {h.wiki.readingTimeMinutes} min</p>
                  </button>
                  <button onClick={() => setHistory(removeFromHistory(h.id))} aria-label="Delete"
                    className="p-1 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Wiki viewer */}
        {wiki && (
          <article className="space-y-8">
            <header className="space-y-3">
              <h1 className="font-serif text-4xl md:text-5xl tracking-tight">{wiki.title}</h1>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {wiki.difficulty && <>{wiki.difficulty} · </>}{wiki.readingTimeMinutes} min read
              </p>
              <div className="flex flex-wrap gap-2 print:hidden">
                <button onClick={share} className="flex items-center gap-2 text-xs font-semibold border border-border rounded-lg px-3 py-2 hover:bg-muted"><Link2 size={14} /> Share</button>
                <button onClick={() => downloadMarkdown(wiki)} className="flex items-center gap-2 text-xs font-semibold border border-border rounded-lg px-3 py-2 hover:bg-muted"><FileDown size={14} /> Markdown</button>
                <button onClick={() => window.print()} className="flex items-center gap-2 text-xs font-semibold border border-border rounded-lg px-3 py-2 hover:bg-muted"><Printer size={14} /> Print / PDF</button>
              </div>
              <p className="text-lg leading-relaxed text-foreground/90">{wiki.summary}</p>
            </header>

            <nav className="print:hidden border border-border rounded-xl p-4 bg-card">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Contents</p>
              <ol className="space-y-1 text-sm">
                {wiki.sections.map((s, i) => (
                  <li key={i}><a href={`#tw-section-${i}`} className="hover:text-accent">{String(i + 1).padStart(2, '0')}. {s.heading}</a></li>
                ))}
              </ol>
            </nav>

            {wiki.sections.map((s, i) => (
              <section key={i} id={`tw-section-${i}`} className="space-y-4 scroll-mt-24">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-serif text-2xl md:text-3xl">{String(i + 1).padStart(2, '0')}. {s.heading}</h2>
                  <button onClick={() => readAloud(i)} aria-label={speakingIdx === i ? 'Stop reading' : 'Read aloud'}
                    className="print:hidden p-2 rounded-lg border border-border hover:bg-muted shrink-0">
                    {speakingIdx === i ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                </div>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <ReactMarkdown components={mdComponents}>{s.content}</ReactMarkdown>
                </div>
                {s.keyPoints?.length > 0 && (
                  <div className="border-l-4 border-accent bg-muted/50 rounded-r-xl p-4">
                    <p className="text-xs font-bold uppercase tracking-widest mb-2">Key points</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">{s.keyPoints.map((p, j) => <li key={j}>{p}</li>)}</ul>
                  </div>
                )}
                {!!s.criticalPerspectives?.length && (
                  <div className="border border-border rounded-xl p-4">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2"><Scale size={14} /> Critical perspectives</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">{s.criticalPerspectives.map((p, j) => <li key={j}>{p}</li>)}</ul>
                  </div>
                )}
                {s.citations?.length > 0 && (
                  <p className="text-xs text-muted-foreground">Sources: {s.citations.join(' · ')}</p>
                )}
              </section>
            ))}

            {!!wiki.glossary?.length && (
              <section className="space-y-3">
                <h2 className="font-serif text-2xl md:text-3xl">Glossary</h2>
                <dl className="grid sm:grid-cols-2 gap-3">
                  {[...wiki.glossary].sort((a, b) => a.term.localeCompare(b.term)).map((g) => (
                    <div key={g.term} className="border border-border rounded-xl p-3 bg-card">
                      <dt className="flex items-center justify-between gap-2 font-bold">
                        {g.term}
                        <button onClick={() => explain(g.term, g.definition)} disabled={eli5Busy === g.term}
                          aria-label={`Explain ${g.term} simply`} className="print:hidden p-1 text-muted-foreground hover:text-accent">
                          {eli5Busy === g.term ? <Loader2 size={14} className="animate-spin" /> : <Baby size={14} />}
                        </button>
                      </dt>
                      <dd className="text-sm text-foreground/80">{g.definition}</dd>
                      {eli5[g.term] && <dd className="mt-2 text-sm italic text-accent">{eli5[g.term]}</dd>}
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {wiki.relatedTopics?.length > 0 && (
              <section className="print:hidden space-y-3">
                <h2 className="font-serif text-2xl">Related topics</h2>
                <div className="flex flex-wrap gap-2">
                  {wiki.relatedTopics.map((t) => (
                    <button key={t} onClick={() => { setTopic(t); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="text-sm border border-border rounded-full px-3 py-1.5 hover:bg-accent hover:text-primary">{t}</button>
                  ))}
                </div>
              </section>
            )}

            {/* Study assistant */}
            <section className="print:hidden border border-border rounded-2xl bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border text-sm font-bold">
                <MessageCircle size={16} /> Ask about this wiki
              </div>
              <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                {chat.length === 0 && <p className="text-sm text-muted-foreground">Ask a question, request a summary, or clarify a point.</p>}
                {chat.map((m, i) => (
                  <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex'}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${m.role === 'user' ? 'bg-accent text-primary' : 'bg-muted'}`}>
                      {m.role === 'user' ? m.content : <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{m.content}</ReactMarkdown></div>}
                    </div>
                  </div>
                ))}
                {chatBusy && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
                <div ref={chatEnd} />
              </div>
              <div className="flex gap-2 p-3 border-t border-border">
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChat()} placeholder="Ask something…"
                  className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                <button onClick={sendChat} disabled={chatBusy || !chatInput.trim()} aria-label="Send"
                  className="bg-accent text-primary rounded-xl px-3 disabled:opacity-50"><Send size={16} /></button>
              </div>
            </section>
          </article>
        )}
      </div>
    </div>
  );
};

export default TinyWikiPage;
