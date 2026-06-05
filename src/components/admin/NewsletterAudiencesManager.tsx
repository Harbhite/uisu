import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, X, Users, Mail, Upload, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

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
  const [members, setMembers] = useState<{ id: string; email: string; first_name: string | null; full_name: string | null }[]>([]);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [emailsText, setEmailsText] = useState("");
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      .select("id, email, first_name, full_name")
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

  // Insert a normalized list of {email, first_name, full_name} rows
  const upsertRows = async (
    rows: { email: string; first_name?: string | null; full_name?: string | null }[]
  ): Promise<{ inserted: number; error?: string }> => {
    if (!activeId) return { inserted: 0, error: "No audience selected" };
    const seen = new Set<string>();
    const cleaned = rows
      .map((r) => ({
        email: (r.email || "").trim().toLowerCase(),
        first_name: r.first_name ? String(r.first_name).trim().slice(0, 80) || null : null,
        full_name: r.full_name ? String(r.full_name).trim().slice(0, 160) || null : null,
      }))
      .filter((r) => emailRegex.test(r.email) && !seen.has(r.email) && seen.add(r.email));
    if (cleaned.length === 0) return { inserted: 0, error: "No valid emails" };
    const payload = cleaned.map((r) => ({ audience_id: activeId, ...r }));
    const { error } = await supabase
      .from("newsletter_audience_members" as any)
      .upsert(payload, { onConflict: "audience_id,email", ignoreDuplicates: false });
    if (error) return { inserted: 0, error: error.message };
    return { inserted: cleaned.length };
  };

  const addEmails = async () => {
    if (!activeId) return;
    // Allow lines like "alice@example.com, Alice" or "alice@example.com | Alice Smith"
    const rows = emailsText
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .flatMap((line) => {
        // If line contains delimiter, treat as "email, name"
        if (/[,;|\t]/.test(line)) {
          const parts = line.split(/[,;|\t]/).map((p) => p.trim());
          const email = parts.find((p) => emailRegex.test(p)) || "";
          const name = parts.find((p) => p && p !== email) || "";
          return [{ email, full_name: name || null, first_name: name ? name.split(/\s+/)[0] : null }];
        }
        // Otherwise split on spaces — assume pure emails
        return line
          .split(/[\s]+/)
          .filter((e) => emailRegex.test(e))
          .map((email) => ({ email, full_name: null, first_name: null }));
      });
    setAdding(true);
    const { inserted, error } = await upsertRows(rows);
    setAdding(false);
    if (error) {
      toast({ title: "Failed to add", description: error, variant: "destructive" });
      return;
    }
    setEmailsText("");
    toast({ title: `Added ${inserted} recipient(s)` });
    await fetchMembers(activeId);
    await fetchRows();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeId) return;
    setImporting(true);
    try {
      const name = file.name.toLowerCase();
      let records: any[] = [];
      if (name.endsWith(".csv") || file.type === "text/csv") {
        const text = await file.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        records = (parsed.data || []) as any[];
        // If no headers detected, retry without header
        if (!records.length || (records[0] && Object.keys(records[0]).length === 1 && !records[0].email && !records[0].Email)) {
          const noHdr = Papa.parse(text, { header: false, skipEmptyLines: true });
          records = (noHdr.data || []).map((row: any) => ({ email: row[0], full_name: row[1] }));
        }
      } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        records = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as any[];
        if (!records.length) {
          const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as any[];
          records = aoa.map((row: any[]) => ({ email: row[0], full_name: row[1] }));
        }
      } else {
        toast({ title: "Unsupported file", description: "Upload a .csv, .xlsx, or .xls file.", variant: "destructive" });
        return;
      }

      // Normalize column names (case-insensitive lookup)
      const pick = (row: any, keys: string[]) => {
        const lower: Record<string, any> = {};
        for (const k of Object.keys(row)) lower[k.toLowerCase().trim()] = row[k];
        for (const k of keys) if (lower[k] != null && String(lower[k]).trim()) return String(lower[k]).trim();
        return null;
      };
      const normalized = records.map((row: any) => {
        const email = pick(row, ["email", "e-mail", "mail", "email address", "address"]) || "";
        const full = pick(row, ["full_name", "fullname", "name", "full name"]);
        const first = pick(row, ["first_name", "firstname", "first name", "first"]);
        const last = pick(row, ["last_name", "lastname", "last name", "surname"]);
        return {
          email,
          first_name: first || (full ? full.split(/\s+/)[0] : null),
          full_name: full || (first ? `${first}${last ? " " + last : ""}` : null),
        };
      });
      const { inserted, error } = await upsertRows(normalized);
      if (error) {
        toast({ title: "Import failed", description: error, variant: "destructive" });
      } else {
        toast({
          title: "Import complete",
          description: `${inserted} of ${normalized.length} row(s) imported. Duplicates updated, invalid emails skipped.`,
        });
        await fetchMembers(activeId);
        await fetchRows();
      }
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message || "Could not parse file", variant: "destructive" });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Add recipients
                    </label>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        onChange={handleFileImport}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importing}
                        className="flex items-center gap-2 px-3 py-1.5 border border-nobel-gold text-nobel-gold text-[11px] font-bold uppercase tracking-widest rounded hover:bg-nobel-gold hover:text-foreground transition disabled:opacity-50"
                      >
                        {importing ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileSpreadsheet size={12} />}
                        {importing ? "Importing…" : "Import CSV / XLSX"}
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Paste emails (and optional names) below — one per line, or as <code>email, Full Name</code>. Or import a CSV/XLSX file with columns like <code>email</code>, <code>first_name</code>, <code>full_name</code>.
                  </p>
                  <textarea
                    value={emailsText}
                    onChange={(e) => setEmailsText(e.target.value)}
                    placeholder={"alice@example.com, Alice Johnson\nbob@example.com\ncarol@example.com | Carol Smith"}
                    rows={4}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded focus:border-nobel-gold focus:outline-none font-mono"
                  />
                  <button
                    onClick={addEmails}
                    disabled={adding || !emailsText.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-nobel-gold hover:text-foreground transition disabled:opacity-50"
                  >
                    {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus size={12} />}
                    Add Recipients
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
                        <div className="min-w-0">
                          <p className="text-sm text-foreground truncate">{m.email}</p>
                          {(m.first_name || m.full_name) && (
                            <p className="text-[11px] text-muted-foreground truncate">
                              {m.full_name || m.first_name}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeMember(m.id)}
                          className="p-1 text-destructive hover:bg-destructive/10 rounded shrink-0 ml-2"
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
