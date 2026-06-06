import { useEffect, useState } from "react";
import { Loader2, History as HistoryIcon, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SendLogRow {
  id: string;
  campaign_id: string | null;
  sender_name: string | null;
  audience_id: string | null;
  audience_label: string | null;
  audience_mode: string | null;
  recipients_count: number;
  success_count: number;
  failed_count: number;
  status: string;
  errors: Array<{ email: string; error: string }>;
  meta: Record<string, any>;
  created_at: string;
}

interface Props {
  campaignId: string;
  subject: string;
  onClose: () => void;
}

export const CampaignSendHistory = ({ campaignId, subject, onClose }: Props) => {
  const [rows, setRows] = useState<SendLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("newsletter_send_log" as any)
        .select("*")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false });
      if (!cancelled) {
        if (!error) setRows((data as unknown as SendLogRow[]) || []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      partial: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return map[status] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-background border border-border w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <HistoryIcon size={16} className="text-nobel-gold" />
              <h2 className="text-base font-bold text-foreground truncate">Send History</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">{subject}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="inline animate-spin" />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No send history recorded for this campaign yet.
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((r) => (
                <div key={r.id} className="border border-border p-4 rounded">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${statusBadge(r.status)}`}>
                      {r.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Sender Name</p>
                      <p className="text-foreground font-medium truncate">{r.sender_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Audience</p>
                      <p className="text-foreground font-medium truncate">{r.audience_label || "—"}</p>
                      <p className="text-[10px] text-muted-foreground">{r.audience_mode || "all"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Recipients</p>
                      <p className="text-foreground font-medium">{r.recipients_count}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Success / Failed</p>
                      <p className="text-foreground font-medium">
                        <span className="text-green-600 dark:text-green-400">{r.success_count}</span>
                        {" / "}
                        <span className={r.failed_count > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}>
                          {r.failed_count}
                        </span>
                      </p>
                    </div>
                  </div>
                  {r.meta?.from && (
                    <p className="text-[11px] text-muted-foreground mt-2 font-mono break-all">
                      From: {r.meta.from}
                    </p>
                  )}
                  {Array.isArray(r.errors) && r.errors.length > 0 && (
                    <details className="mt-3 border-t border-border pt-2">
                      <summary className="text-[11px] text-red-600 dark:text-red-400 cursor-pointer flex items-center gap-1">
                        <AlertTriangle size={12} />
                        {r.errors.length} per-recipient error{r.errors.length > 1 ? "s" : ""} (click to expand)
                      </summary>
                      <ul className="mt-2 space-y-1 max-h-48 overflow-auto">
                        {r.errors.map((e, i) => (
                          <li key={i} className="text-[11px] font-mono text-muted-foreground">
                            <span className="text-foreground">{e.email}</span>: {e.error}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                  {(!r.errors || r.errors.length === 0) && r.status === "completed" && (
                    <p className="text-[11px] text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                      <CheckCircle2 size={12} /> All recipients delivered successfully.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
