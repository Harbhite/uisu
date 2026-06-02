import { useEffect, useRef, useState } from "react";
import {
  Plus, Pencil, Trash2, Loader2, X, Save, Eye, Sparkles, History as HistoryIcon,
  RotateCcw, AlertTriangle, CheckCircle2, Wand2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NewsletterTemplateRow {
  id: string;
  name: string;
  description: string | null;
  html_shell: string;
  thumbnail_color: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TemplateVersion {
  id: string;
  template_id: string;
  name: string;
  description: string | null;
  html_shell: string;
  is_active: boolean;
  version_number: number;
  edited_by: string | null;
  created_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onChanged?: (templates: NewsletterTemplateRow[]) => void;
}

const DEFAULT_SHELL = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>{{subject}}</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f3ee;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;max-width:600px;">
        <tr><td style="padding:32px 40px;border-bottom:1px solid #e5e1d8;">
          <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#003366;font-weight:bold;">UISU Newsletter</p>
          <h1 style="margin:8px 0 0 0;font-size:28px;color:#003366;line-height:1.2;">{{subject}}</h1>
        </td></tr>
        <tr><td style="padding:32px 40px;color:#1a1a1a;font-size:16px;line-height:1.7;">
          {{content}}
        </td></tr>
        <tr><td style="padding:24px 40px;background:#003366;color:#fff;font-size:12px;text-align:center;">
          Sent to {{email}} · <a href="{{unsubscribe_url}}" style="color:#C5A059;">Unsubscribe</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const KNOWN_TOKENS = ["{{content}}", "{{subject}}", "{{email}}", "{{unsubscribe_url}}"] as const;
const REQUIRED_TOKENS = ["{{content}}"] as const;

function validateShell(shell: string) {
  const findings: { token: string; present: boolean; required: boolean }[] = KNOWN_TOKENS.map((t) => ({
    token: t,
    present: shell.includes(t),
    required: REQUIRED_TOKENS.includes(t as any),
  }));
  // Detect unknown tokens
  const allTokens = Array.from(shell.matchAll(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi)).map((m) => `{{${m[1]}}}`);
  const unknown = Array.from(new Set(allTokens.filter((t) => !KNOWN_TOKENS.includes(t.toLowerCase() as any))));
  const hasScript = /<script/i.test(shell);
  const hasDoctype = /^<!DOCTYPE/i.test(shell.trim());
  return { findings, unknown, hasScript, hasDoctype };
}

export const NewsletterTemplatesManager = ({ open, onClose, onChanged }: Props) => {
  const [templates, setTemplates] = useState<NewsletterTemplateRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Partial<NewsletterTemplateRow> | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // AI
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);

  // Version history
  const [historyFor, setHistoryFor] = useState<NewsletterTemplateRow | null>(null);
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("newsletter_templates" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load templates", { description: error.message });
    } else {
      const rows = (data || []) as unknown as NewsletterTemplateRow[];
      setTemplates(rows);
      onChanged?.(rows);
    }
    setLoading(false);
  };

  useEffect(() => { if (open) load(); }, [open]); // eslint-disable-line

  if (!open) return null;

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name?.trim() || !editing.html_shell?.trim()) {
      toast.error("Name and HTML shell are required");
      return;
    }
    if (!editing.html_shell.includes("{{content}}")) {
      toast.error("HTML shell must include the {{content}} token");
      return;
    }
    setSaving(true);
    const payload = {
      name: editing.name.trim(),
      description: editing.description?.trim() || null,
      html_shell: editing.html_shell,
      thumbnail_color: editing.thumbnail_color?.trim() || null,
      is_active: editing.is_active ?? true,
    };
    const { error } = editing.id
      ? await supabase.from("newsletter_templates" as any).update(payload).eq("id", editing.id)
      : await supabase.from("newsletter_templates" as any).insert(payload);
    if (error) {
      toast.error("Save failed", { description: error.message });
    } else {
      toast.success(editing.id ? "Template updated — previous version archived" : "Template created");
      setEditing(null);
      await load();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template and all its version history? This cannot be undone.")) return;
    const { error } = await supabase.from("newsletter_templates" as any).delete().eq("id", id);
    if (error) toast.error("Delete failed", { description: error.message });
    else { toast.success("Template deleted"); await load(); }
  };

  const renderPreview = (shell: string) => {
    const sample = "<p>This is sample newsletter content. Your real content will appear here when you compose a newsletter.</p>";
    const html = shell
      .replace(/\{\{\s*content\s*\}\}/g, sample)
      .replace(/\{\{\s*subject\s*\}\}/g, "Sample Newsletter Subject")
      .replace(/\{\{\s*email\s*\}\}/g, "reader@example.com")
      .replace(/\{\{\s*unsubscribe_url\s*\}\}/g, "#unsubscribe");
    setPreviewHtml(html);
  };

  const insertTokenAtCursor = (token: string) => {
    if (!editing) return;
    const ta = textareaRef.current;
    const current = editing.html_shell || "";
    if (!ta) {
      setEditing({ ...editing, html_shell: current + token });
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const next = current.slice(0, start) + token + current.slice(end);
    setEditing({ ...editing, html_shell: next });
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + token.length;
    });
  };

  const callAI = async (existingHtml?: string) => {
    if (!aiPrompt.trim()) {
      toast.error("Describe what you want the AI to build or change");
      return;
    }
    setAiBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-template-ai", {
        body: { prompt: aiPrompt.trim(), existingHtml: existingHtml || undefined },
      });
      if (error) throw error;
      if (!data?.html) throw new Error("Empty AI response");
      // Open in editor (new template or apply to currently editing)
      if (editing) {
        setEditing({ ...editing, html_shell: data.html });
        toast.success(existingHtml ? "Template updated by AI" : "AI generated new HTML — review & save");
      } else {
        setEditing({
          name: aiPrompt.trim().substring(0, 60),
          description: `AI-generated: ${aiPrompt.trim().substring(0, 120)}`,
          html_shell: data.html,
          is_active: true,
        });
        toast.success("AI generated a template — review & save");
      }
      if (Array.isArray(data.issues) && data.issues.length) {
        toast.warning(`AI noted ${data.issues.length} issue${data.issues.length > 1 ? "s" : ""}`, {
          description: data.issues.join(" "),
        });
      }
      setAiPrompt("");
    } catch (e: any) {
      toast.error("AI request failed", { description: e?.message || "Try again or simplify your prompt" });
    } finally {
      setAiBusy(false);
    }
  };

  const openHistory = async (template: NewsletterTemplateRow) => {
    setHistoryFor(template);
    setVersionsLoading(true);
    const { data, error } = await supabase
      .from("newsletter_template_versions" as any)
      .select("*")
      .eq("template_id", template.id)
      .order("version_number", { ascending: false });
    if (error) toast.error("Failed to load history", { description: error.message });
    else setVersions((data || []) as unknown as TemplateVersion[]);
    setVersionsLoading(false);
  };

  const rollbackToVersion = async (v: TemplateVersion) => {
    if (!historyFor) return;
    if (!confirm(`Roll back "${historyFor.name}" to version #${v.version_number}? The current version will be saved to history.`)) return;
    const { error } = await supabase
      .from("newsletter_templates" as any)
      .update({
        name: v.name,
        description: v.description,
        html_shell: v.html_shell,
        is_active: v.is_active,
      })
      .eq("id", historyFor.id);
    if (error) toast.error("Rollback failed", { description: error.message });
    else {
      toast.success(`Rolled back to v${v.version_number}`);
      setHistoryFor(null);
      await load();
    }
  };

  const validation = editing ? validateShell(editing.html_shell || "") : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-background border border-border w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">Custom Newsletter Templates</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Build reusable HTML layouts with AI assist, token validation, and full version history.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-5">
          {!editing && (
            <>
              {/* AI Assistant for new templates */}
              <div className="border border-accent/30 bg-accent/5 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-accent" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-accent">AI Template Builder</h3>
                </div>
                <p className="text-[11px] text-muted-foreground mb-3">
                  Describe the newsletter you want. AI generates an email-safe HTML shell with required tokens.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder='e.g. "Minimal dark-mode digest with gold accents, hero image, 3-column footer"'
                    className="flex-1 px-3 py-2 bg-background border border-border focus:border-accent focus:outline-none text-sm"
                    disabled={aiBusy}
                    onKeyDown={(e) => e.key === "Enter" && !aiBusy && callAI()}
                  />
                  <button
                    onClick={() => callAI()}
                    disabled={aiBusy || !aiPrompt.trim()}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
                  >
                    {aiBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 size={13} />}
                    Generate
                  </button>
                </div>
              </div>

              <button
                onClick={() => setEditing({ name: "", description: "", html_shell: DEFAULT_SHELL, is_active: true })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-nobel-gold text-foreground text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold/90"
              >
                <Plus size={14} /> Blank Template
              </button>

              {loading ? (
                <div className="text-center py-12 text-muted-foreground"><Loader2 className="inline animate-spin" /></div>
              ) : templates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No custom templates yet.</div>
              ) : (
                <div className="grid gap-3">
                  {templates.map((t) => (
                    <div key={t.id} className="border border-border p-4 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground">{t.name}</h3>
                          {!t.is_active && <span className="text-[10px] uppercase tracking-widest text-muted-foreground border border-border px-1.5 py-0.5">Hidden</span>}
                        </div>
                        {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
                        <p className="text-[10px] text-muted-foreground mt-2">Updated {new Date(t.updated_at).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => renderPreview(t.html_shell)} title="Preview" className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground"><Eye size={14} /></button>
                        <button onClick={() => openHistory(t)} title="Version history" className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground"><HistoryIcon size={14} /></button>
                        <button onClick={() => setEditing(t)} title="Edit" className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(t.id)} title="Delete" className="p-2 hover:bg-muted text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {editing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{editing.id ? "Edit Template" : "New Template"}</h3>
                <button onClick={() => setEditing(null)} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Name</label>
                  <input
                    value={editing.name || ""}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border focus:border-nobel-gold focus:outline-none text-sm"
                    placeholder="e.g. Quarterly Recap"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Description</label>
                  <input
                    value={editing.description || ""}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border focus:border-nobel-gold focus:outline-none text-sm"
                    placeholder="Short summary shown in template picker"
                  />
                </div>
              </div>

              {/* AI edit panel */}
              <div className="border border-accent/30 bg-accent/5 p-3 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={13} className="text-accent" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-accent">AI Edit</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder='e.g. "Change the header background to gold and add a CTA button"'
                    className="flex-1 px-3 py-2 bg-background border border-border focus:border-accent focus:outline-none text-xs"
                    disabled={aiBusy}
                    onKeyDown={(e) => e.key === "Enter" && !aiBusy && callAI(editing.html_shell)}
                  />
                  <button
                    onClick={() => callAI(editing.html_shell)}
                    disabled={aiBusy || !aiPrompt.trim()}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
                  >
                    {aiBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 size={12} />} Apply
                  </button>
                </div>
              </div>

              {/* Token insertion toolbar */}
              <div className="flex flex-wrap items-center gap-2 p-2 border border-border bg-muted/20 rounded">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-1">Insert Token:</span>
                {KNOWN_TOKENS.map((tok) => (
                  <button
                    key={tok}
                    type="button"
                    onClick={() => insertTokenAtCursor(tok)}
                    className="px-2 py-1 text-[10px] font-mono bg-background border border-border hover:border-accent hover:text-accent rounded"
                  >
                    {tok}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">HTML Shell</label>
                <textarea
                  ref={textareaRef}
                  value={editing.html_shell || ""}
                  onChange={(e) => setEditing({ ...editing, html_shell: e.target.value })}
                  rows={16}
                  spellCheck={false}
                  className="w-full px-3 py-2 bg-background border border-border focus:border-nobel-gold focus:outline-none text-xs font-mono"
                />
              </div>

              {/* Validation panel */}
              {validation && (
                <div className="border border-border p-3 rounded space-y-2 bg-muted/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Token Validation</p>
                  <div className="flex flex-wrap gap-2">
                    {validation.findings.map((f) => (
                      <span
                        key={f.token}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono rounded border ${
                          f.present
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : f.required
                            ? "border-destructive/50 bg-destructive/10 text-destructive"
                            : "border-border bg-background text-muted-foreground"
                        }`}
                      >
                        {f.present ? <CheckCircle2 size={11} /> : f.required ? <AlertTriangle size={11} /> : <X size={11} />}
                        {f.token}
                        {f.required && !f.present && " · required"}
                        {!f.required && !f.present && " · optional"}
                      </span>
                    ))}
                  </div>
                  {validation.unknown.length > 0 && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertTriangle size={11} /> Unknown tokens (won't be replaced): {validation.unknown.join(", ")}
                    </p>
                  )}
                  {validation.hasScript && (
                    <p className="text-[10px] text-destructive flex items-center gap-1">
                      <AlertTriangle size={11} /> Contains &lt;script&gt; — most email clients will strip or block this.
                    </p>
                  )}
                  {!validation.hasDoctype && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertTriangle size={11} /> Missing &lt;!DOCTYPE html&gt; — recommended for email rendering.
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={editing.is_active ?? true}
                    onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                  />
                  Active (show in template picker)
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-nobel-gold text-foreground text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold/90 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save size={14} />} Save
                </button>
                <button
                  onClick={() => editing.html_shell && renderPreview(editing.html_shell)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-border text-xs font-bold uppercase tracking-widest hover:bg-muted"
                >
                  <Eye size={14} /> Preview
                </button>
                {editing.id && (
                  <button
                    onClick={() => openHistory(editing as NewsletterTemplateRow)}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-border text-xs font-bold uppercase tracking-widest hover:bg-muted"
                  >
                    <HistoryIcon size={14} /> History
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Preview modal */}
        {previewHtml && (
          <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4" onClick={() => setPreviewHtml(null)}>
            <div className="bg-white w-full max-w-3xl h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-3 border-b">
                <p className="text-sm font-bold">Template Preview</p>
                <button onClick={() => setPreviewHtml(null)} className="p-1 hover:bg-muted"><X size={16} /></button>
              </div>
              <iframe srcDoc={previewHtml} className="flex-1 w-full" title="Template preview" sandbox="" />
            </div>
          </div>
        )}

        {/* History modal */}
        {historyFor && (
          <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4" onClick={() => setHistoryFor(null)}>
            <div className="bg-background border border-border w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <p className="text-sm font-bold text-foreground">Version history</p>
                  <p className="text-[11px] text-muted-foreground">{historyFor.name}</p>
                </div>
                <button onClick={() => setHistoryFor(null)} className="p-1 hover:bg-muted"><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-2">
                {versionsLoading ? (
                  <div className="text-center py-8 text-muted-foreground"><Loader2 className="inline animate-spin" /></div>
                ) : versions.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-8">
                    No previous versions yet. Edits to this template will be archived here automatically.
                  </p>
                ) : (
                  versions.map((v) => (
                    <div key={v.id} className="border border-border p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground">
                          v{v.version_number} · {v.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Archived {new Date(v.created_at).toLocaleString()} · {v.html_shell.length} chars
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => renderPreview(v.html_shell)}
                          title="Preview version"
                          className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => rollbackToVersion(v)}
                          title="Roll back to this version"
                          className="p-2 hover:bg-muted text-muted-foreground hover:text-accent"
                        >
                          <RotateCcw size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
