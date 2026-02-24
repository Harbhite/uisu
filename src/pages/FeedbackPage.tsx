import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, MessageSquare, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const categories = [
  { value: "general", label: "General Suggestion" },
  { value: "academic", label: "Academic Affairs" },
  { value: "welfare", label: "Student Welfare" },
  { value: "facilities", label: "Facilities & Infrastructure" },
  { value: "events", label: "Events & Activities" },
  { value: "website", label: "Website / Platform" },
];

const FeedbackPage = () => {
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("anonymous_feedback" as any)
        .insert({ message: message.trim(), category });

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
    <div className="min-h-screen bg-background pt-32 pb-20">
      <SEO
        title="Anonymous Feedback | UISU SPACE"
        description="Share your suggestions and feedback anonymously with the Students' Union. No sign-in required."
      />
      <div className="container mx-auto px-6 max-w-2xl">
        <Breadcrumbs />
        <Link
          to="/"
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors mb-12"
        >
          <div className="p-2 border border-border group-hover:border-accent transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Back to Home</span>
        </Link>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="text-accent" size={20} />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent">Your Voice Matters</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-foreground leading-[0.9] mb-4">
            Anonymous <span className="italic text-muted-foreground">Feedback</span>
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Share your suggestions, ideas, or concerns with the Students' Union. 
            No sign-in required — your feedback is completely anonymous.
          </p>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border p-12 text-center"
          >
            <CheckCircle2 size={48} className="text-accent mx-auto mb-6" />
            <h2 className="font-serif text-2xl mb-3">Feedback Received</h2>
            <p className="text-muted-foreground mb-8">
              Thank you for taking the time to share your thoughts. Your feedback helps us improve.
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline">
              Submit Another
            </Button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-card border border-border p-8"
          >
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Category
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Your Feedback
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What would you like to share with the union? Suggestions, ideas, concerns..."
                  rows={6}
                  maxLength={2000}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {message.length}/2000
                </p>
              </div>

              <div className="bg-muted/50 p-4 border border-border text-xs text-muted-foreground">
                <strong>🔒 Privacy:</strong> This form does not collect your name, email, or any identifying information. 
                Your submission is completely anonymous.
              </div>

              <Button
                type="submit"
                disabled={submitting || !message.trim()}
                className="w-full gap-2"
              >
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
