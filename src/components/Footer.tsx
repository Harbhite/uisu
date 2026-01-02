import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="px-4 pb-4 bg-slate-50 pt-10">
      <div className="bg-[#F9F8F4] text-ui-blue rounded-[2.5rem] p-8 md:p-16 shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-3 space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <img src="/uisu-logo.png" alt="UISU Logo" className="h-10 w-auto object-contain" />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl tracking-tight">UISU</span>
                <span className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-400 leading-none">Archive</span>
              </div>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Preserving the history, culture, and intellectual heritage of the University of Ibadan Students' Union. First and Best.
            </p>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">The Union</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-700">
                <li><Link to="/governance" className="hover:text-nobel-gold transition-colors">Governance</Link></li>
                <li><Link to="/current-leaders" className="hover:text-nobel-gold transition-colors">Leadership</Link></li>
                <li><Link to="/past-leaders" className="hover:text-nobel-gold transition-colors">Past Leaders</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">Community</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-700">
                <li><Link to="/communities" className="hover:text-nobel-gold transition-colors">Communities</Link></li>
                <li><Link to="/events" className="hover:text-nobel-gold transition-colors">Events</Link></li>
                <li><Link to="/campus-map" className="hover:text-nobel-gold transition-colors">Campus Map</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">Editorial</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-700">
                <li><Link to="/inks-vault" className="hover:text-nobel-gold transition-colors">Inks Vault</Link></li>
                <li><Link to="/documents" className="hover:text-nobel-gold transition-colors">Documents</Link></li>
                <li><Link to="/announcements" className="hover:text-nobel-gold transition-colors">Announcements</Link></li>
              </ul>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-4 space-y-6 lg:pl-8">
            <div>
                <h3 className="font-serif text-3xl md:text-4xl leading-tight mb-4 text-ui-blue">
                    Subscribe and get the <span className="italic text-nobel-gold">latest history</span> delivered.
                </h3>
                <p className="text-slate-500 text-sm">
                    Get foundational documents, historical updates, and union news directly to your inbox.
                </p>
            </div>

            <div className="flex gap-2">
                <Input
                    type="email"
                    placeholder="Email Address"
                    className="rounded-full bg-white border-slate-200 h-12 px-6 focus-visible:ring-nobel-gold"
                />
                <Button className="rounded-full h-12 px-8 bg-ui-blue hover:bg-ui-dark text-white font-bold tracking-wide">
                    Submit
                </Button>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">

            {/* Socials */}
            <div className="flex gap-4">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                    <a key={i} href="#" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-ui-blue hover:border-ui-blue transition-all">
                        <Icon size={18} />
                    </a>
                ))}
            </div>

            {/* Legal / Copyright */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-xs text-slate-400 font-medium">
                <div className="flex gap-6">
                    <a href="#" className="hover:text-ui-blue transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-ui-blue transition-colors">Terms of Service</a>
                </div>
                <span>&copy; {new Date().getFullYear()} UISU Archive.</span>
            </div>

        </div>
      </div>
    </footer>
  );
};
