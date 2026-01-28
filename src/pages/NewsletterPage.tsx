import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Check, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";

const NewsletterPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('subscribe-newsletter', {
        body: { email, source: 'newsletter-page' }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to subscribe');
      }

      setIsSubscribed(true);
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
    <div className="min-h-screen bg-nobel-cream flex flex-col">
      <SEO
        title="Subscribe to the Archive Newsletter"
        description="Get foundational documents, historical updates, and union news delivered directly to your inbox."
      />

      {/* Header */}
      <header className="px-6 md:px-12 pt-8 md:pt-12">
        <div className="flex items-center gap-2 text-ui-blue">
          <Sparkles size={14} />
          <span className="text-xs font-bold uppercase tracking-widest">Newsletter</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row px-6 md:px-12 lg:px-20 py-12 lg:py-20 gap-12 lg:gap-20">
        {/* Left Side - Text */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex flex-col justify-center"
        >
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] text-ui-blue mb-6 lg:mb-8">
            From the halls of history to the pulse of now.{" "}
            <span className="italic text-nobel-gold">The Union speaks.</span>
          </h1>
          
          <p className="text-ui-blue/70 text-base md:text-lg mb-8 lg:mb-12 max-w-xl">
            Sign up below to receive foundational documents, historical updates, and union news delivered directly to your inbox.
          </p>

          {/* Form */}
          {isSubscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-ui-blue/5 border border-ui-blue/20 rounded-2xl p-6 md:p-8 max-w-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="text-green-600" size={20} />
                </div>
                <h3 className="text-lg font-bold text-ui-blue">You're in!</h3>
              </div>
              <p className="text-ui-blue/70 text-sm">
                Check your inbox for a welcome message. You're now part of the Archive.
              </p>
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-ui-blue hover:text-nobel-gold transition-colors"
              >
                Explore the Archive <ArrowRight size={14} />
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="max-w-xl">
              {/* Mobile: Stacked layout */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-0">
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 rounded-full sm:rounded-r-none bg-ui-blue/5 border-ui-blue/20 text-ui-blue placeholder:text-ui-blue/40 h-14 px-6 focus-visible:ring-ui-blue text-base"
                />
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="rounded-full sm:rounded-l-none h-14 px-8 bg-ui-blue hover:bg-ui-blue/90 text-white font-bold tracking-wide transition-colors disabled:opacity-70 whitespace-nowrap"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Subscribing...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
              <p className="text-xs text-ui-blue/50 mt-4">
                No spam, ever. Unsubscribe anytime.
              </p>
            </form>
          )}
        </motion.div>

        {/* Right Side - Decorative Visual */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:flex flex-1 items-center justify-center"
        >
          <div className="relative">
            {/* Decorative circle with logo */}
            <div className="w-64 h-64 xl:w-80 xl:h-80 rounded-full bg-gradient-to-br from-ui-blue via-ui-blue/80 to-nobel-gold/60 flex items-center justify-center shadow-2xl">
              <img 
                src="/uisu-logo.png" 
                alt="UISU Logo" 
                className="w-32 h-32 xl:w-40 xl:h-40 object-contain opacity-90 filter brightness-0 invert"
              />
            </div>
            
            {/* Decorative rings */}
            <div className="absolute inset-0 -m-4 rounded-full border-2 border-ui-blue/20 animate-pulse" />
            <div className="absolute inset-0 -m-8 rounded-full border border-ui-blue/10" />
            <div className="absolute inset-0 -m-12 rounded-full border border-ui-blue/5" />
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-ui-blue/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ui-blue/50">
          <Link to="/" className="hover:text-ui-blue transition-colors">
            ← Back to The Archive
          </Link>
          <span>© {new Date().getFullYear()} University of Ibadan Students' Union</span>
        </div>
      </footer>
    </div>
  );
};

export default NewsletterPage;
