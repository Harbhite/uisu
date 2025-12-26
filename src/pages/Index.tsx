import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, Users, Building2, BookOpen, Award, Star, ArrowRight, MapPin, Calendar, FileText, ChevronDown, LogIn, LogOut, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { TimelineDiagram } from "@/components/Diagrams";
import { TriviaSection } from "@/components/Trivia";
import { CampusMap } from "@/components/CampusMap";
import { HeroScene } from "@/components/QuantumScene";
import { AnnouncementsBanner } from "@/components/AnnouncementsBanner";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const navLinks = [
    { name: "Governance", href: "/governance" },
    { name: "Past Leaders", href: "/past-leaders" },
    { name: "Documents", href: "/documents" },
    { name: "Campus Map", href: "/campus-map" },
    { name: "Communities", href: "/communities" },
    { name: "Events", href: "/events" },
    { name: "Announcements", href: "/announcements" },
  ];

  const stats = [
    { icon: Users, label: "Students", value: "15,000+" },
    { icon: Building2, label: "Halls", value: "12" },
    { icon: BookOpen, label: "Programs", value: "50+" },
    { icon: Award, label: "Years", value: "40+" },
  ];

  const quickLinks = [
    { 
      title: "Governance", 
      subtitle: "Structure & Leadership",
      desc: "Explore the constitutional framework and leadership hierarchy of the union.", 
      href: "/governance", 
      icon: Building2,
      color: "bg-ui-blue"
    },
    { 
      title: "Past Leaders", 
      subtitle: "Hall of Fame",
      desc: "Celebrate the presidents and executives who shaped our history.", 
      href: "/past-leaders", 
      icon: Award,
      color: "bg-nobel-gold"
    },
    { 
      title: "Documents", 
      subtitle: "Archive Repository",
      desc: "Access constitutions, manifestos, speeches, and historical records.", 
      href: "/documents", 
      icon: FileText,
      color: "bg-ui-blue"
    },
    { 
      title: "Communities", 
      subtitle: "Clubs & Societies",
      desc: "Discover the vibrant student organizations on campus.", 
      href: "/communities", 
      icon: Users,
      color: "bg-nobel-gold"
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Announcements Banner */}
      <AnnouncementsBanner />
      
      {/* Notification Prompt */}
      <NotificationPrompt />
      
      {/* Floating Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/80 backdrop-blur-xl shadow-lg border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3">
              <img src="/uisu-logo.png" alt="UISU Logo" className="h-10 w-10 object-contain" />
              <span className="font-serif text-xl text-ui-blue">UISU Archive</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground hover:text-nobel-gold transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/admin"
                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-nobel-gold transition-colors border border-border rounded-full hover:border-nobel-gold"
                  >
                    Admin
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-nobel-gold transition-colors border border-border rounded-full hover:border-nobel-gold"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 px-4 py-2 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-nobel-gold hover:text-foreground transition-all"
                >
                  <LogIn size={14} />
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-ui-blue"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border"
          >
            <div className="px-6 py-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground hover:text-nobel-gold hover:bg-muted rounded-lg transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-nobel-gold hover:bg-muted rounded-lg transition-colors"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-nobel-gold hover:text-foreground transition-all text-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <HeroScene />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background z-10" />
        
        <div className="relative z-20 container mx-auto px-6 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <Star className="text-nobel-gold w-6 h-6" fill="currentColor" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">Digital Archive</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-ui-blue leading-[0.9] mb-8">
              The <br/> <span className="italic text-muted-foreground">Union</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mb-12 leading-relaxed">
              Preserving the legacy and celebrating the journey of the Students Union. Decades of leadership, activism, and student empowerment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/governance"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-ui-blue text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold hover:text-foreground transition-all shadow-lg"
              >
                Explore Archive
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/documents"
                className="inline-flex items-center gap-3 px-8 py-4 border border-border text-foreground rounded-full text-xs font-bold uppercase tracking-widest hover:border-nobel-gold hover:text-nobel-gold transition-all"
              >
                Browse Documents
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
          >
            <ChevronDown className="w-8 h-8 text-muted-foreground animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-card border border-border text-nobel-gold mb-4">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-4xl md:text-5xl font-serif text-ui-blue mb-2">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="flex items-center gap-4 mb-4">
              <Star className="text-nobel-gold w-6 h-6" fill="currentColor" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">Chronicle</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-serif text-ui-blue leading-[0.9] mb-6">
              Historical <br/> <span className="italic text-muted-foreground">Timeline</span>
            </h2>
            <p className="text-xl text-muted-foreground font-light max-w-2xl">
              Key moments that shaped the union's legacy across decades of student activism and leadership.
            </p>
          </motion.div>
          <TimelineDiagram />
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-32 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="flex items-center gap-4 mb-4">
              <Star className="text-nobel-gold w-6 h-6" fill="currentColor" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">Navigation</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-serif text-ui-blue leading-[0.9]">
              Explore <br/> <span className="italic text-muted-foreground">The Archive</span>
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickLinks.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.href}
                  className="group block bg-card p-8 md:p-10 border border-border hover:border-nobel-gold hover:shadow-xl transition-all duration-500 relative overflow-hidden"
                >
                  {/* Selection Bar */}
                  <div className="absolute left-0 top-0 h-full w-1 bg-muted group-hover:bg-nobel-gold transition-colors duration-300"></div>
                  
                  <div className="flex items-start gap-6">
                    <div className={`w-14 h-14 rounded-full ${item.color} text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-nobel-gold mb-2">{item.subtitle}</div>
                      <h3 className="font-serif text-2xl md:text-3xl text-ui-blue mb-3 group-hover:text-nobel-gold transition-colors">{item.title}</h3>
                      <p className="text-muted-foreground font-light leading-relaxed">{item.desc}</p>
                    </div>
                    
                    <ArrowRight className="text-muted-foreground group-hover:text-nobel-gold group-hover:translate-x-2 transition-all shrink-0 mt-2" size={20} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Map Section */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="flex items-center gap-4 mb-4">
              <Star className="text-nobel-gold w-6 h-6" fill="currentColor" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">Residence</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-serif text-ui-blue leading-[0.9] mb-6">
              Campus <br/> <span className="italic text-muted-foreground">Halls</span>
            </h2>
            <p className="text-xl text-muted-foreground font-light max-w-2xl">
              Explore the halls of residence that form the backbone of student life.
            </p>
          </motion.div>
          <CampusMap />
        </div>
      </section>

      {/* Trivia Section */}
      <section className="py-32 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="flex items-center gap-4 mb-4">
              <Star className="text-nobel-gold w-6 h-6" fill="currentColor" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">Interactive</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-serif text-ui-blue leading-[0.9] mb-6">
              Test Your <br/> <span className="italic text-muted-foreground">Knowledge</span>
            </h2>
            <p className="text-xl text-muted-foreground font-light max-w-2xl">
              How well do you know the union's history? Take our trivia challenge.
            </p>
          </motion.div>
          <TriviaSection />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src="/uisu-logo.png" alt="UISU Logo" className="h-12 w-12 object-contain" />
                <span className="font-serif text-2xl text-ui-blue">UISU Archive</span>
              </div>
              <p className="text-muted-foreground font-light leading-relaxed max-w-md mb-6">
                Preserving the rich history and legacy of the Students Union for future generations. A digital repository of our collective memory.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-nobel-gold" />
                <span>Campus, University</span>
                <span className="text-border">•</span>
                <Calendar className="w-4 h-4 text-nobel-gold" />
                <span>Est. 1948</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-foreground hover:text-nobel-gold transition-colors font-light">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Archive</h3>
              <ul className="space-y-3 text-foreground font-light">
                <li>Constitutions</li>
                <li>Manifestos</li>
                <li>Speeches</li>
                <li>Reports</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} UISU Archive. All rights reserved.</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Crafted with purpose</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;