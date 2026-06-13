import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Send, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resourceCategories } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('subscribe-newsletter', {
        body: { email, source: 'footer' }
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <footer className="px-0 pb-0 md:px-4 md:pb-4 bg-gradient-to-b from-slate-50 to-slate-100 pt-16 md:pt-20 no-print relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-nobel-gold/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-ui-blue/5 rounded-full blur-3xl -z-10" />

      <motion.div 
        className="bg-gradient-to-br from-ui-blue via-ui-dark to-ui-blue text-white rounded-2xl md:rounded-3xl p-8 md:p-16 shadow-premium-lg border border-ui-blue/20 relative overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-nobel-gold/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -z-10" />

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16 relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >

          {/* Brand Column */}
          <motion.div className="lg:col-span-3 space-y-6" variants={itemVariants}>
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/uisu-logo.png" alt="UISU Logo" className="h-10 w-auto object-contain brightness-0 invert group-hover:scale-110 transition-transform duration-300" />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-2xl tracking-tight text-white">UISU</span>
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-nobel-gold leading-none">SPACE</span>
              </div>
            </Link>
            <p className="text-sm text-slate-200 leading-relaxed max-w-xs font-light">
              Your digital space for the history, culture, and intellectual heritage of the University of Ibadan Students' Union. <span className="text-nobel-gold font-semibold">First and Best.</span>
            </p>
          </motion.div>

          {/* Links Columns */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              {
                title: "The Union",
                links: [
                  { label: "Governance", href: "/governance" },
                  { label: "Leadership", href: "/current-leaders" },
                  { label: "Past Leaders", href: "/past-leaders" },
                ]
              },
              {
                title: "Community",
                links: [
                  { label: "Communities", href: "/communities" },
                  { label: "Events", href: "/events" },
                  { label: "Campus Map", href: "/campus-map" },
                ]
              },
              {
                title: "Editorial",
                links: [
                  { label: "Inks Vault", href: "/inks-vault" },
                  { label: "Documents", href: "/documents" },
                  { label: "Announcements", href: "/announcements" },
                ]
              },
              {
                title: "Resources",
                links: [
                  ...resourceCategories.slice(0, 4).map(cat => ({ label: cat.title, href: cat.path })),
                  { label: "View All", href: "/resources" }
                ]
              }
            ].map((section, idx) => (
              <motion.div key={idx} className="space-y-4" variants={itemVariants}>
                <h4 className="font-bold text-xs uppercase tracking-widest text-nobel-gold font-display">
                  {section.title}
                </h4>
                <ul className="space-y-3 text-sm font-medium text-slate-100">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <Link 
                        to={link.href} 
                        className="group inline-flex items-center gap-1 hover:text-nobel-gold transition-colors duration-300"
                      >
                        {link.label}
                        <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Newsletter Column */}
          <motion.div className="hidden lg:block lg:col-span-3 space-y-6 lg:pl-8" variants={itemVariants}>
            <div>
              <h3 className="font-serif text-3xl md:text-4xl leading-tight mb-4 text-white font-semibold">
                Subscribe for <span className="italic text-nobel-gold">history</span>
              </h3>
              <p className="text-slate-200 text-sm font-light">
                Get foundational documents, historical updates, and union news directly to your inbox.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="flex gap-3 group">
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg bg-white/10 border-white/20 text-white placeholder:text-slate-400 h-12 px-6 focus-visible:ring-nobel-gold focus-visible:bg-white/20 focus-visible:border-nobel-gold transition-all"
              />
              <Button 
                type="submit"
                disabled={isLoading}
                variant="gold"
                size="default"
                className="rounded-lg h-12 px-6 flex-shrink-0"
              >
                {isLoading ? <Send size={16} className="animate-spin" /> : <Send size={16} />}
              </Button>
            </form>
          </motion.div>

        </motion.div>

        {/* Bottom Section */}
        <motion.div 
          className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >

          {/* Socials */}
          <div className="hidden md:flex gap-3">
            {[
              { Icon: Facebook, href: "https://facebook.com/UIStudentsUnion", label: "Facebook" },
              { Icon: Twitter, href: "https://twitter.com/uisu_archive", label: "Twitter" },
              { Icon: Instagram, href: "https://instagram.com/uisu_official", label: "Instagram" },
              { Icon: Linkedin, href: "https://linkedin.com/company/uisu", label: "LinkedIn" },
            ].map(({ Icon, href, label }, i) => (
              <motion.a 
                key={i} 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-11 h-11 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-slate-300 hover:text-nobel-gold hover:bg-nobel-gold/20 hover:border-nobel-gold transition-all duration-300 group"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                title={label}
              >
                <Icon size={18} className="group-hover:rotate-12 transition-transform" />
              </motion.a>
            ))}
          </div>

          {/* Legal / Copyright */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-xs text-slate-300 font-medium">
            <div className="flex gap-6 flex-wrap justify-center md:justify-start">
              {[
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms of Service", href: "/terms-of-service" },
                { label: "Site Map", href: "/sitemap" },
                { label: "Feedback", href: "/feedback" },
                { label: "Style Guide", href: "/style-guide" },
              ].map((link, i) => (
                <Link 
                  key={i}
                  to={link.href} 
                  className="hover:text-nobel-gold transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <span className="text-slate-400">&copy; {new Date().getFullYear()} UISU SPACE.</span>
          </div>

        </motion.div>
      </motion.div>
    </footer>
  );
};
