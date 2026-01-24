import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('subscribe-newsletter', {
        body: { email, source: 'mobile-section' }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to subscribe');
      }

      toast.success(response.data?.message || "Successfully subscribed!");
      setEmail("");
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      toast.error(error.message || "Failed to subscribe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-slate-50 px-4 pb-4 block lg:hidden">
      <div className="bg-nobel-cream text-ui-blue rounded-[2.5rem] p-8 shadow-lg border border-ui-blue/10">
        <div className="space-y-6">
          <div>
            <h3 className="font-serif text-3xl leading-tight mb-4 text-ui-blue">
              Subscribe and get the <span className="italic text-nobel-gold">latest history</span> delivered.
            </h3>
            <p className="text-ui-blue/70 text-sm">
              Get foundational documents, historical updates, and union news directly to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-full bg-white border-ui-blue/10 text-ui-blue placeholder:text-ui-blue/40 h-12 px-6 focus-visible:ring-ui-blue w-full"
            />
            <Button 
              type="submit"
              disabled={isLoading}
              className="rounded-full h-12 px-8 bg-ui-blue hover:bg-ui-blue/90 text-white font-bold tracking-wide transition-colors w-full disabled:opacity-70"
            >
              {isLoading ? "Subscribing..." : "Submit"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
