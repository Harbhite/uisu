import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trash2, MessageSquare, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

interface FeedbackItem {
  id: string;
  message: string;
  category: string;
  created_at: string;
}

export const AdminFeedback = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("anonymous_feedback" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setFeedback(data as any);
    setLoading(false);
  };

  const deleteFeedback = async (id: string) => {
    const { error } = await supabase
      .from("anonymous_feedback" as any)
      .delete()
      .eq("id", id);

    if (!error) {
      setFeedback((prev) => prev.filter((f) => f.id !== id));
      toast.success("Feedback deleted");
    }
  };

  const filtered = categoryFilter === "all"
    ? feedback
    : feedback.filter((f) => f.category === categoryFilter);

  const categories = ["all", ...new Set(feedback.map((f) => f.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{filtered.length} submissions</p>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <Filter size={14} className="mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare size={32} className="mx-auto mb-4 opacity-30" />
          <p className="font-serif italic">No anonymous feedback yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="bg-card border border-border p-5 flex gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-0.5 bg-muted text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {item.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(item.created_at), "MMM d, yyyy · h:mm a")}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line">{item.message}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteFeedback(item.id)}
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
