import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, X, Save, Eye } from "lucide-react";
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

export const NewsletterTemplatesManager = ({ open, onClose, onChanged }: Props) => {
  const [templates, setTemplates] = useState<NewsletterTemplateRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Partial<NewsletterTemplateRow> | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
      toast.success(editing.id ? "Template updated" : "Template created");
      setEditing(null);
      await load();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template? This cannot be undone.")) return;
    const { error } = await supabase.from("newsletter_templates" as any).delete().eq("id", id);
    if (error) toast.error("Delete failed", { description: error.message });
    else {
      toast.success("Template deleted");
      await load();
    }
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
              Build reusable HTML layouts. Use tokens <code className="text-nobel-gold">{"{{content}}"}</code>, <code className="text-nobel-gold">{"{{subject}}"}</code>, <code className="text-nobel-gold">{"{{email}}"}</code>, <code className="text-nobel-gold">{"{{unsubscribe_url}}"}</code>.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-5">
          {!editing && (
            <>
              <button
                onClick={() => setEditing({ name: "", description: "", html_shell: DEFAULT_SHELL, is_active: true })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-nobel-gold text-foreground text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold/90"
              >
                <Plus size={14} /> New Template
              </button>

              {loading ? (
                <div className="text-center py-12 text-muted-foreground"><Loader2 className="inline animate-spin" /></div>
              ) : templates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No custom templates yet. Create your first one above.</div>
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
                <button onClick={() => setEditing(null)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">HTML Shell</label>
                <textarea
                  value={editing.html_shell || ""}
                  onChange={(e) => setEditing({ ...editing, html_shell: e.target.value })}
                  rows={18}
                  spellCheck={false}
                  className="w-full px-3 py-2 bg-background border border-border focus:border-nobel-gold focus:outline-none text-xs font-mono"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Required token: <code className="text-nobel-gold">{"{{content}}"}</code>. Optional: <code className="text-nobel-gold">{"{{subject}}"}</code>, <code className="text-nobel-gold">{"{{email}}"}</code>, <code className="text-nobel-gold">{"{{unsubscribe_url}}"}</code>.
                </p>
              </div>

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
              </div>
            </div>
          )}
        </div>

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
      </div>
    </div>
  );
};
