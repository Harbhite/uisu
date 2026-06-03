import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, ExternalLink, Sparkles, BookOpen, CalendarDays, Layers, Swords, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import MermaidDiagram from "@/components/resources/MermaidDiagram";
import AsciiDiagramViewer from "@/components/resources/AsciiDiagramViewer";

interface SharedSession {
  id: string;
  mode: string;
  topic: string | null;
  response: string;
  created_at: string;
  view_count: number;
}

const MODE_META: Record<string, { label: string; icon: typeof BookOpen }> = {
  explainer: { label: "Explainer", icon: BookOpen },
  planner: { label: "Planner", icon: CalendarDays },
  synthesizer: { label: "Synthesizer", icon: Layers },
  debater: { label: "Debater", icon: Swords },
};

const SharedStudyOutputPage = () => {
  const { token } = useParams<{ token: string }>();
  const [session, setSession] = useState<SharedSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data, error: e } = await supabase
        .from("study_sessions" as any)
        .select("id, mode, topic, response, created_at, view_count")
        .eq("share_token", token)
        .eq("is_shared", true)
        .maybeSingle();
      if (e || !data) {
        setError("This shared output isn't available or has been unshared.");
      } else {
        setSession(data as any);
        // Bump view counter via SECURITY DEFINER RPC (works for anon).
        supabase.rpc("bump_shared_session_view" as any, { _token: token }).then(() => {});
      }
      setLoading(false);
    })();
  }, [token]);

  const meta = session ? MODE_META[session.mode] || MODE_META.explainer : MODE_META.explainer;
  const ModeIcon = meta.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-serif font-bold text-foreground mb-2">Not available</h1>
        <p className="text-muted-foreground mb-6 text-sm max-w-md">{error}</p>
        <Link to="/resources/study-buddy" className="text-accent underline text-sm">
          Create your own with StudyBuddy →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${session.topic || meta.label} · Shared StudyBuddy Output`}
        description={`A shared ${meta.label} output from UISU SPACE StudyBuddy AI.`}
      />

      {/* Minimal viewer hero */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto max-w-4xl px-4 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground">
            <Sparkles size={16} className="text-accent" />
            <span className="font-serif font-bold">UISU StudyBuddy</span>
          </Link>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Eye size={11} /> {session.view_count} views</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{new Date(session.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Read-only banner */}
        <div className="mb-6 p-3 border border-accent/30 bg-accent/5 rounded-sm flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            <span className="font-bold uppercase tracking-widest text-accent">Shared view</span> · This is a read-only snapshot.
          </p>
          <Link
            to="/resources/study-buddy"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent hover:underline"
          >
            Try StudyBuddy yourself <ExternalLink size={11} />
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <ModeIcon size={14} className="text-accent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              {meta.label} Output
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary">
            {session.topic || `${meta.label} session`}
          </h1>
        </div>

        {/* Content (re-uses StudyBuddy rendering rules) */}
        <article className="bg-card border border-border rounded-sm p-6 md:p-10 studybuddy-output">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary mt-8 mb-4 pb-3 border-b-2 border-accent/30 first:mt-0">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mt-8 mb-3 flex items-center gap-3"><span className="w-1 h-6 bg-accent rounded-full inline-block flex-shrink-0" />{children}</h2>,
              h3: ({ children }) => <h3 className="text-lg font-serif font-semibold text-primary mt-6 mb-2 pl-4 border-l-2 border-accent/40">{children}</h3>,
              p: ({ children }) => <p className="text-sm md:text-[15px] leading-[1.8] text-foreground/80 mb-4">{children}</p>,
              ul: ({ children }) => <ul className="my-4 space-y-2 list-disc pl-6 text-foreground/80">{children}</ul>,
              ol: ({ children }) => <ol className="my-4 space-y-2 list-decimal pl-6 text-foreground/80">{children}</ol>,
              li: ({ children }) => <li className="text-sm md:text-[15px] leading-[1.8]">{children}</li>,
              blockquote: ({ children }) => <blockquote className="my-6 border-l-4 border-accent bg-accent/5 px-5 py-4 italic text-foreground/70">{children}</blockquote>,
              table: ({ children }) => <div className="my-6 overflow-x-auto border border-border rounded-sm"><table className="w-full text-sm">{children}</table></div>,
              thead: ({ children }) => <thead className="bg-primary text-primary-foreground">{children}</thead>,
              th: ({ children }) => <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest">{children}</th>,
              td: ({ children }) => <td className="px-4 py-3 text-sm text-foreground/80 border-b border-border/50">{children}</td>,
              code: ({ className, children }) => {
                const isBlock = className?.includes("language-");
                const lang = className?.replace("language-", "") || "";
                const text = String(children).replace(/\n$/, "");
                const mermaidKeywords = /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|mindmap|timeline|journey)/m;
                if (isBlock && (["mermaid", "mmd"].includes(lang.toLowerCase()) || mermaidKeywords.test(text.trim()))) {
                  return <MermaidDiagram content={text} label={lang || "Diagram"} />;
                }
                if (isBlock && /[┌┐└┘├┤┬┴┼│─]{4,}/.test(text)) {
                  return <AsciiDiagramViewer content={text} label={lang || "Diagram"} />;
                }
                if (isBlock) {
                  return <pre className="my-4 p-4 bg-primary/95 text-primary-foreground/90 text-xs font-mono overflow-x-auto rounded-sm"><code>{children}</code></pre>;
                }
                return <code className="px-1.5 py-0.5 bg-muted text-xs font-mono rounded-sm">{children}</code>;
              },
              pre: ({ children }) => <>{children}</>,
            }}
          >
            {session.response}
          </ReactMarkdown>
        </article>

        {/* Footer CTA */}
        <div className="mt-8 text-center py-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">Want to study like this?</p>
          <Link
            to="/resources/study-buddy"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <Sparkles size={14} /> Open StudyBuddy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SharedStudyOutputPage;
