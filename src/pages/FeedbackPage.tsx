import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, MessageSquare, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";

const categories = [
  { value: "general", label: "General Suggestion" },
  { value: "academic", label: "Academic Affairs" },
  { value: "welfare", label: "Student Welfare" },
  { value: "facilities", label: "Facilities & Infrastructure" },
  { value: "events", label: "Events & Activities" },
  { value: "website", label: "Website / Platform" },
];

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) { toast.error("Please enter your feedback"); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("anonymous_feedback" as any).insert({ message: message.trim(), category });
      if (error) throw error;
      setSubmitted(true);
      setMessage("");
      toast.success("Thank you for your feedback!");
    } catch (err: any) {
      toast.error("Failed to submit feedback. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Anonymous Feedback | UISU SPACE" description="Share your suggestions and feedback anonymously with the Students' Union." />

      {/* Hero Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 pt-24 pb-8 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate(-1)} className="p-2.5 rounded-full border border-primary-foreground/20 hover:bg-primary-foreground/10 transition-colors">
              <ArrowLeft size={16} />
            </button>
            <div className="flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-primary-foreground/50">Your Voice Matters</p>
              <h1 className="text-2xl md:text-3xl font-serif font-bold">Anonymous Feedback</h1>
            </div>
          </div>
          <p className="text-primary-foreground/60 text-sm max-w-lg">
            Share your suggestions, ideas, or concerns with the Students' Union. No sign-in required — completely anonymous.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <h2 className="font-serif text-2xl mb-3">Feedback Received</h2>
            <p className="text-muted-foreground mb-8">Thank you for taking the time to share your thoughts. Your feedback helps us improve.</p>
            <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-full">Submit Another</Button>
          </motion.div>
        ) : (
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Your Feedback</label>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What would you like to share with the union? Suggestions, ideas, concerns..." rows={6} maxLength={2000} className="resize-none rounded-xl" />
                <p className="text-xs text-muted-foreground mt-1 text-right">{message.length}/2000</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-2xl text-xs text-muted-foreground">
                <strong>🔒 Privacy:</strong> This form does not collect your name, email, or any identifying information. Your submission is completely anonymous.
              </div>
              <Button type="submit" disabled={submitting || !message.trim()} className="w-full gap-2 rounded-full h-12">
                {submitting ? "Submitting..." : <><Send size={16} /> Submit Feedback</>}
              </Button>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
