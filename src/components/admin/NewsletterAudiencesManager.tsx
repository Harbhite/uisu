import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, X, Users, Mail } from "lucide-react";

export interface NewsletterAudienceRow {
  id: string;
  name: string;
  description: string | null;
  type: "all" | "manual" | "filter";
  member_count: number;
  created_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onChanged?: (audiences: NewsletterAudienceRow[]) => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const NewsletterAudiencesManager = ({ open, onClose, onChanged }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<NewsletterAudienceRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [members, setMembers] = useState<{ id: string; email: string }[]>([]);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [emailsText, setEmailsText] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("newsletter_audiences" as any)
      .select("id, name, description, type, member_count, created_at")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast({ title: "Failed to load audiences", description: error.message, variant: "destructive" });
      return;
    }
    const list = ((data || []) as unknown) as NewsletterAudienceRow[];
    setRows(list);
    onChanged?.(list);
    if (!activeId && list.length > 0) setActiveId(list[0].id);
  }, [toast, onChanged, activeId]);

  const fetchMembers = useCallback(async (audienceId: string) => {
    const { data, error } = await supabase
      .from("newsletter_audience_members" as any)
      .select("id, email")
      .eq("audience_id", audienceId)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load members", description: error.message, variant: "destructive" });
      return;
    }
    setMembers(((data || []) as unknown) as any);
  }, [toast]);

  useEffect(() => {
    if (open) fetchRows();
  }, [open, fetchRows]);

  useEffect(() => {
    if (activeId) fetchMembers(activeId);
    else setMembers([]);
  }, [activeId, fetchMembers]);

  const createAudience = async () => {
    if (!newName.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    const { data, error } = await supabase
      .from("newsletter_audiences" as any)
      .insert({ name: newName.trim(), description: newDesc.trim() || null, type: "manual" })
      .select()
      .single();
    if (error) {
      toast({ title: "Failed to create", description: error.message, variant: "destructive" });
      return;
    }
    setNewName("");
    setNewDesc("");
    toast({ title: "Audience created" });
    await fetchRows();
    setActiveId((data as any).id);
  };

  const deleteAudience = async (id: string) => {
    if (!confirm("Delete this audience and all its members?")) return;
    const { error } = await supabase.from("newsletter_audiences" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Deleted" });
    if (activeId === id) setActiveId(null);
    await fetchRows();
  };

  const addEmails = async () => {
    if (!activeId) return;
    const parsed = Array.from(
      new Set(
        emailsText
          .split(/[\s,;\n]+/)
          .map((e) => e.trim().toLowerCase())
          .filter((e) => emailRegex.test(e))
      )
    );
    if (parsed.length === 0) {
      toast({ title: "No valid emails found", variant: "destructive" });
      return;
    }
    setAdding(true);
    const payload = parsed.map((email) => ({ audience_id: activeId, email }));
    const { error } = await supabase
      .from("newsletter_audience_members" as any)
      .upsert(payload, { onConflict: "audience_id,email", ignoreDuplicates: true });
    setAdding(false);
    if (error) {
      toast({ title: "Failed to add", description: error.message, variant: "destructive" });
      return;
    }
    setEmailsText("");
    toast({ title: `Added ${parsed.length} email(s)` });
    await fetchMembers(activeId);
    await fetchRows();
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase.from("newsletter_audience_members" as any).delete().eq("id", memberId);
    if (error) {
      toast({ title: "Remove failed", description: error.message, variant: "destructive" });
      return;
    }
    if (activeId) await fetchMembers(activeId);
    await fetchRows();
  };

  if (!open) return null;

  const active = rows.find((r) => r.id === activeId) || null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-nobel-gold" />
            <h3 className="font-serif text-xl text-foreground">Newsletter Audiences</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X size={18} /></button>
        </div>

        <div className="grid md:grid-cols-[280px_1fr] flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="border-r border-border overflow-y-auto p-4 space-y-3">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Audience name (e.g. Alumni 2020)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded focus:border-nobel-gold focus:outline-none"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded focus:border-nobel-gold focus:outline-none"
              />
              <button
                onClick={createAudience}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-nobel-gold hover:text-foreground transition"
              >
                <Plus size={14} /> Create Audience
              </button>
            </div>

            <div className="pt-3 border-t border-border space-y-1">
              {loading && <Loader2 className="w-4 h-4 animate-spin mx-auto my-3 text-muted-foreground" />}
              {!loading && rows.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">No audiences yet</p>
              )}
              {rows.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setActiveId(r.id)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    activeId === r.id ? "border-nobel-gold bg-nobel-gold/10" : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{r.member_count} recipient(s)</p>
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div className="overflow-y-auto p-5 space-y-4">
            {!active && (
              <div className="text-center py-16 text-muted-foreground text-sm">
                Select an audience or create one to start adding emails.
              </div>
            )}
            {active && (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-serif text-lg text-foreground">{active.name}</h4>
                    {active.description && <p className="text-sm text-muted-foreground mt-1">{active.description}</p>}
                    <p className="text-xs text-muted-foreground mt-2">
                      <Mail className="inline w-3 h-3 mr-1" /> {active.member_count} recipient(s)
                    </p>
                  </div>
                  <button
                    onClick={() => deleteAudience(active.id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                    title="Delete audience"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Add emails (comma, space or newline separated)
                  </label>
                  <textarea
                    value={emailsText}
                    onChange={(e) => setEmailsText(e.target.value)}
                    placeholder="alice@example.com, bob@example.com&#10;carol@example.com"
                    rows={4}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded focus:border-nobel-gold focus:outline-none font-mono"
                  />
                  <button
                    onClick={addEmails}
                    disabled={adding || !emailsText.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-nobel-gold hover:text-foreground transition disabled:opacity-50"
                  >
                    {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus size={12} />}
                    Add Emails
                  </button>
                </div>

                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="px-3 py-2 bg-muted/50 text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border">
                    Recipients ({members.length})
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-border">
                    {members.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-6">No recipients yet</p>
                    )}
                    {members.map((m) => (
                      <div key={m.id} className="flex items-center justify-between px-3 py-2 hover:bg-muted/30">
                        <span className="text-sm text-foreground">{m.email}</span>
                        <button
                          onClick={() => removeMember(m.id)}
                          className="p-1 text-destructive hover:bg-destructive/10 rounded"
                          title="Remove"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
