import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resourceCategories } from "@/lib/data";

export const Footer = () => {
  return (
    <footer className="px-0 pb-0 md:px-4 md:pb-4 bg-slate-50 pt-10 no-print">
      <div className="bg-ui-blue text-white rounded-none md:rounded-[2.5rem] p-8 md:p-16 shadow-lg border border-ui-blue/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-3 space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <img src="/uisu-logo.png" alt="UISU Logo" className="h-10 w-auto object-contain brightness-0 invert" />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl tracking-tight text-white">UISU</span>
                <span className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-400 leading-none">Archive</span>
              </div>
            </Link>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xs">
              Preserving the history, culture, and intellectual heritage of the University of Ibadan Students' Union. First and Best.
            </p>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-widest text-nobel-gold">The Union</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-200">
                <li><Link to="/governance" className="hover:text-white transition-colors">Governance</Link></li>
                <li><Link to="/current-leaders" className="hover:text-white transition-colors">Leadership</Link></li>
                <li><Link to="/past-leaders" className="hover:text-white transition-colors">Past Leaders</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-widest text-nobel-gold">Community</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-200">
                <li><Link to="/communities" className="hover:text-white transition-colors">Communities</Link></li>
                <li><Link to="/events" className="hover:text-white transition-colors">Events</Link></li>
                <li><Link to="/campus-map" className="hover:text-white transition-colors">Campus Map</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-widest text-nobel-gold">Editorial</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-200">
                <li><Link to="/inks-vault" className="hover:text-white transition-colors">Inks Vault</Link></li>
                <li><Link to="/documents" className="hover:text-white transition-colors">Documents</Link></li>
                <li><Link to="/announcements" className="hover:text-white transition-colors">Announcements</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-widest text-nobel-gold">Resources</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-200">
                {resourceCategories.slice(0, 5).map((category) => (
                  <li key={category.id}><Link to={category.path} className="hover:text-white transition-colors">{category.title}</Link></li>
                ))}
                <li><Link to="/resources" className="text-nobel-gold hover:text-white transition-colors italic">View All</Link></li>
              </ul>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="hidden lg:block lg:col-span-3 space-y-6 lg:pl-8">
            <div>
                <h3 className="font-serif text-3xl md:text-4xl leading-tight mb-4 text-white">
                    Subscribe and get the <span className="italic text-nobel-gold">latest history</span> delivered.
                </h3>
                <p className="text-slate-300 text-sm">
                    Get foundational documents, historical updates, and union news directly to your inbox.
                </p>
            </div>

            <div className="flex gap-2">
                <Input
                    type="email"
                    placeholder="Email Address"
                    className="rounded-full bg-white/10 border-white/10 text-white placeholder:text-slate-400 h-12 px-6 focus-visible:ring-nobel-gold"
                />
                <Button className="rounded-full h-12 px-8 bg-nobel-gold hover:bg-white hover:text-ui-blue text-ui-blue font-bold tracking-wide transition-colors">
                    Submit
                </Button>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">

            {/* Socials */}
            <div className="hidden md:flex gap-4">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                    <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 hover:border-nobel-gold transition-all">
                        <Icon size={18} />
                    </a>
                ))}
            </div>

            {/* Legal / Copyright */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-xs text-slate-400 font-medium">
                <div className="flex gap-6">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                </div>
                <span>&copy; {new Date().getFullYear()} UISU Archive.</span>
            </div>

        </div>
      </div>
    </footer>
  );
};
