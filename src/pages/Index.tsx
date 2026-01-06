import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Users, BookOpen, Award, Star, ArrowRight, MapPin, ChevronDown, Quote, Megaphone, Mail, Check, ShieldCheck, Fingerprint } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { TimelineDiagram, StructureDiagram, PopulationChart } from "@/components/Diagrams";
import { TriviaSection } from "@/components/Trivia";
import { CampusMap } from "@/components/CampusMap";
import { TowerScene } from "@/components/QuantumScene";
import { AnnouncementsBanner } from "@/components/AnnouncementsBanner";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { executives } from "@/lib/data";
import { LeaderCard } from "@/components/LeaderCard";
import { SEO } from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
import { Menu } from "@/components/Menu";
import { Footer } from "@/components/Footer";
import { NewsletterSection } from "@/components/NewsletterSection";

// --- SUB-COMPONENTS ---

const Marquee = () => (
  <div className="bg-nobel-gold text-ui-blue py-2 overflow-hidden relative z-50 cursor-default">
    <div className="animate-marquee whitespace-nowrap flex gap-8 items-center font-bold text-xs tracking-[0.2em] uppercase">
      <span>First and Best</span> <Star size={10} fill="currentColor" />
      <span>The Greatest Uites</span> <Star size={10} fill="currentColor" />
      <span>Father of Intellectual Unionism</span> <Star size={10} fill="currentColor" />
      <span>Est. 1948</span> <Star size={10} fill="currentColor" />
      <span>Aluta Continua</span> <Star size={10} fill="currentColor" />
      <span>Victoria Ascerta</span> <Star size={10} fill="currentColor" />
      <span>First and Best</span> <Star size={10} fill="currentColor" />
      <span>The Greatest Uites</span> <Star size={10} fill="currentColor" />
      <span>Father of Intellectual Unionism</span> <Star size={10} fill="currentColor" />
      <span>Est. 1948</span> <Star size={10} fill="currentColor" />
      <span>Aluta Continua</span> <Star size={10} fill="currentColor" />
      <span>Victoria Ascerta</span> <Star size={10} fill="currentColor" />
    </div>
  </div>
);

interface ParallaxCardProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  progress: any;
  index: number;
}

const ParallaxCard = ({ title, subtitle, icon: Icon, color, href, progress, index }: ParallaxCardProps) => {
  const x = useTransform(progress, [0, 1], [index * 50, index * -50]);
  
  return (
    <motion.div 
      style={{ x }}
      whileHover={{ y: -10, scale: 1.02 }}
      className={`relative w-72 h-96 ${color} flex-shrink-0 cursor-pointer shadow-2xl border border-white/10 overflow-hidden group transition-all duration-500 snap-center rounded-none`}
    >
      <Link to={href} className="absolute inset-0 p-8 flex flex-col justify-between z-10 text-white">
        <div className="flex justify-between items-start">
          <div className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-none">
            <Icon size={28} />
          </div>
          <div className="w-10 h-10 flex items-center justify-center border border-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
            <ArrowRight size={18} />
          </div>
        </div>
        
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60 mb-3">{subtitle}</p>
          <h3 className="font-serif text-3xl leading-none tracking-tight">{title}</h3>
          <div className="w-0 group-hover:w-12 h-1 bg-nobel-gold mt-4 transition-all duration-500"></div>
        </div>
      </Link>
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-black/20 rounded-full blur-3xl group-hover:bg-nobel-gold/10 transition-colors duration-700"></div>
    </motion.div>
  );
};

const ContactForm = () => {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setTimeout(() => {
      setFormState('success');
      setTimeout(() => setFormState('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="w-full max-w-lg bg-white/5 backdrop-blur-sm p-8 md:p-10 rounded-none border border-white/10 shadow-2xl relative overflow-hidden group">
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-nobel-gold/20 rounded-full blur-3xl group-hover:bg-nobel-gold/30 transition-colors duration-1000"></div>
      <h3 className="font-serif text-3xl mb-2 text-white relative z-10">Get in Touch</h3>
      <p className="text-slate-400 text-sm mb-8 relative z-10">Have questions about the archive or history to share?</p>
      
      {formState === 'success' ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-64 flex flex-col items-center justify-center text-center bg-white/5 rounded-none border border-white/5"
        >
          <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
            <Check size={32} />
          </div>
          <p className="text-white font-bold text-lg">Message Sent Successfully!</p>
          <p className="text-slate-400 text-sm mt-2">The Secretariat will respond shortly.</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Name</label>
              <Input id="name" required type="text" className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-nobel-gold focus:bg-white/10 transition-all" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
              <Input id="email" required type="email" className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-nobel-gold focus:bg-white/10 transition-all" placeholder="uites@edu.ng" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Message</label>
            <Textarea id="message" required rows={4} className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-nobel-gold focus:bg-white/10 transition-all resize-none" placeholder="Type your message here..." />
          </div>
          <button type="submit" disabled={formState === 'submitting'} className="w-full bg-nobel-gold text-ui-blue font-bold uppercase tracking-widest py-4 rounded-none hover:bg-white hover:shadow-lg hover:shadow-white/10 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 border border-nobel-gold">
            {formState === 'submitting' ? 'Sending...' : 'Send Message'} 
          </button>
        </form>
      )}
    </div>
  );
};

const RevealHeader = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, ease: "easeOut" }} className={className}>
    {children}
  </motion.h2>
);

const Index = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start end", "end start"]
  });

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

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const navLinks = [
    { name: "Governance", href: "/governance" },
    { name: "Leaders", href: "/current-leaders" },
    { name: "Past Leaders", href: "/past-leaders" },
    { name: "Documents", href: "/documents" },
    { name: "Inks Vault", href: "/inks-vault" },
    { name: "Campus Map", href: "/campus-map" },
    { name: "Communities", href: "/communities" },
    { name: "Events", href: "/events" },
    { name: "Announcements", href: "/announcements" },
    { name: "Resources", href: "/resources" },
  ];

  const parallaxCards = [
    { title: "Our Leaders", subtitle: "Current Executive", icon: Users, color: "bg-ui-blue", href: "/current-leaders" },
    { title: "Inks Vault", subtitle: "Creative Archive", icon: BookOpen, color: "bg-zinc-900", href: "/inks-vault" },
    { title: "Announcements", subtitle: "News & Events", icon: Megaphone, color: "bg-red-900", href: "/announcements" },
    { title: "Union History", subtitle: "1948 - Present", icon: Award, color: "bg-slate-800", href: "/past-leaders" },
    { title: "Communities", subtitle: "Clubs & Societies", icon: Users, color: "bg-emerald-800", href: "/communities" },
    { title: "The Republics", subtitle: "Halls of Residence", icon: MapPin, color: "bg-ui-dark", href: "/campus-map" },
  ];

  const giants = [
    { name: "Wole Soyinka", quote: "The man dies in all who keep silent in the face of tyranny.", role: "Sigmate & Nobel Laureate" },
    { name: "Segun Okeowo", quote: "Education is a right, not a privilege for the few.", role: "1978 Union President" },
    { name: "Kunle Adepeju", quote: "His sacrifice fueled the fire of student consciousness forever.", role: "Union Martyr" }
  ];

  const stats = [
    { label: "Founded", val: "1948" },
    { label: "Documents", val: "12,000+" },
    { label: "Presidents", val: "76+" },
    { label: "Students", val: "35k" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-nobel-gold selection:text-white overflow-x-hidden">
      <SEO
        title="UISU Archive"
        description="The official digital archive and management platform for the University of Ibadan Students' Union (UISU). Preserving legacy, celebrating leadership."
        image="/screenshots/index.png"
      />
      
      {/* Marquee Banner */}
      <Marquee />
      
      {/* Announcements Banner */}
      <AnnouncementsBanner />
      
      {/* Notification Prompt */}
      <NotificationPrompt />
      
      {/* Floating Navbar */}
      <Navbar
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        user={user}
        handleLogout={handleLogout}
      />

      {/* Full Menu Dropdown */}
      <Menu
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        navLinks={navLinks}
      />

      {/* Hero Section */}
      <header className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none noise-overlay mix-blend-multiply"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-6">
            <motion.h1 initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="text-7xl md:text-9xl font-bold tracking-tighter text-ui-blue">UNION</motion.h1>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="text-6xl md:text-8xl text-nobel-gold"><Star size={80} fill="currentColor" /></motion.div>
            <motion.h1 initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="text-7xl md:text-9xl font-serif italic text-ui-blue">Legacy</motion.h1>
          </div>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto mb-16 leading-relaxed">
            Platform packed with <span className="bg-slate-100 px-2 rounded-none text-ui-blue font-medium">History</span> & <span className="bg-slate-100 px-2 rounded-none text-ui-blue font-medium">Intellectualism</span>. Preserving the Aluta spirit since 1948.
          </motion.p>
          
          {/* Horizontal Card Scroller with Parallax */}
          <div ref={scrollRef} className="w-full relative mt-12 md:mt-24">
            <div className="flex overflow-x-auto gap-8 pb-12 px-6 no-scrollbar snap-x snap-mandatory">
              <div className="flex-shrink-0 w-[10vw] hidden md:block"></div>
              {parallaxCards.map((card, index) => (
                <ParallaxCard 
                  key={card.title}
                  index={index} 
                  progress={scrollYProgress} 
                  title={card.title} 
                  subtitle={card.subtitle} 
                  icon={card.icon} 
                  color={card.color} 
                  href={card.href} 
                />
              ))}
              <div className="flex-shrink-0 w-[10vw] hidden md:block"></div>
            </div>
            {/* Scroll Indicator */}
            <div className="flex justify-center gap-4 mt-8 items-center">
              <div className="w-24 h-1 bg-ui-blue/5 rounded-none overflow-hidden relative border border-slate-100">
                <motion.div 
                  style={{ scaleX: scrollYProgress }} 
                  className="absolute inset-0 bg-nobel-gold origin-left"
                />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-300">Archive Navigation</span>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1, y: [0, 10, 0] }} 
            transition={{ delay: 2, y: { duration: 1.5, repeat: Infinity } }} 
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 flex flex-col items-center gap-2 cursor-pointer" 
            onClick={scrollToSection('introduction')}
          >
            <span className="text-[10px] uppercase tracking-widest font-bold">Scroll</span>
            <ChevronDown size={20} />
          </motion.div>
        </div>
      </header>

      <main>
        {/* Introduction Section */}
        <section id="introduction" className="py-24 bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-nobel-gold/10 rounded-none blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-start relative z-10">
            <div className="md:col-span-5">
              <div className="inline-block mb-3 px-3 py-1 bg-ui-blue/10 text-ui-blue text-xs font-bold tracking-widest uppercase rounded-none border border-ui-blue/10">About Us</div>
              <RevealHeader className="font-serif text-5xl md:text-6xl mb-6 leading-tight text-ui-blue">The Father of <br/><span className="italic text-nobel-gold">Intellectual Unionism.</span></RevealHeader>
              <p className="text-lg text-slate-500 font-medium">First and Best.</p>
            </div>
            <div className="md:col-span-7 text-xl text-slate-800 leading-relaxed space-y-6 font-light">
              <p>Founded in 1948, the University of Ibadan Students' Union is the <strong>oldest and most prestigious</strong> student body in Nigeria.</p>
              <p>From the anti-colonial struggles to the fight for democracy, Uites have always stood on the side of the people. This archive serves to document that rich history, structure, and culture.</p>
              <div className="pt-4">
                <Link to="/governance" className="group flex items-center gap-2 text-ui-blue font-bold uppercase tracking-widest text-sm">
                  Start Exploring <ArrowRight className="group-hover:translate-x-2 transition-transform"/>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Giants of Aluta Section */}
        <section className="py-24 bg-white border-y border-slate-100 overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-4 block">Alumni Legacy</span>
              <RevealHeader className="font-serif text-5xl text-ui-blue">Giants of <span className="italic text-slate-300">Aluta</span></RevealHeader>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              {giants.map((giant, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 border-l-2 border-nobel-gold bg-slate-50 flex flex-col justify-between h-full group"
                >
                  <div>
                    <Quote className="text-nobel-gold/20 mb-6 group-hover:text-nobel-gold transition-colors duration-500" size={40} />
                    <p className="text-lg font-serif italic text-ui-blue leading-relaxed mb-8">"{giant.quote}"</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-widest text-ui-blue">{giant.name}</h4>
                    <p className="text-xs text-slate-400 uppercase tracking-tighter mt-1">{giant.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section id="history" className="py-24 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-2xl">
                <RevealHeader className="font-serif text-5xl text-ui-blue mb-6">Historical Path</RevealHeader>
                <p className="text-lg text-slate-600 leading-relaxed font-light">The history of the Union is written in the ink of intellectualism and the sweat of struggle. Trace the defining moments.</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => navigate('/past-leaders')} 
                className="shrink-0 px-8 py-3 bg-ui-blue text-white rounded-none text-xs font-bold uppercase tracking-widest border border-ui-blue shadow-lg"
              >
                Archives List
              </motion.button>
            </div>
            <TimelineDiagram />
          </div>
        </section>

        {/* Union Symbols Section */}
        <section className="py-24 bg-ui-blue text-white relative overflow-hidden">
          <div className="absolute inset-0 noise-overlay opacity-5 mix-blend-overlay"></div>
          <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 relative z-10">
            <div>
              <span className="text-nobel-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Union Lore</span>
              <RevealHeader className="font-serif text-5xl mb-8">The Union <span className="italic text-slate-400">Symbols</span></RevealHeader>
              <div className="space-y-12">
                <div className="flex gap-6">
                  <div className="w-12 h-12 flex-shrink-0 bg-white/10 flex items-center justify-center border border-white/10"><Award className="text-nobel-gold" /></div>
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-sm mb-2">The Shield</h4>
                    <p className="text-slate-400 text-sm font-light leading-relaxed">Representing the defense of student rights and the preservation of welfare since the 1948 charter.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 flex-shrink-0 bg-white/10 flex items-center justify-center border border-white/10"><ShieldCheck className="text-nobel-gold" /></div>
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-sm mb-2">The Motto</h4>
                    <p className="text-slate-400 text-sm font-light leading-relaxed">"Intellectualism and Welfare" — our guiding light in every negotiation and movement.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 flex-shrink-0 bg-white/10 flex items-center justify-center border border-white/10"><Star className="text-nobel-gold" /></div>
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-sm mb-2">The First & Best</h4>
                    <p className="text-slate-400 text-sm font-light leading-relaxed">A standard of excellence that permeates every faculty, hall, and student endeavor.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-12 relative overflow-hidden backdrop-blur-sm group">
              <div className="absolute -top-12 -right-12 text-white opacity-5 rotate-12 group-hover:rotate-45 transition-transform duration-1000"><Star size={300} fill="currentColor" /></div>
              <h3 className="font-serif text-2xl text-nobel-gold mb-8 uppercase tracking-widest border-b border-white/10 pb-4">Union Anthem</h3>
              <div className="font-serif text-lg text-slate-300 italic space-y-6 leading-relaxed">
                <p>The First and the Best in the land,<br/>Forever we'll stand hand in hand,<br/>With truth and with knowledge we'll lead,<br/>Meeting every student's need.</p>
                <p>Aluta! Continua!<br/>Our struggle is not in vain,<br/>Victoria! Ascerta!<br/>The Union shall rise again.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Governance Structure Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 w-full"><StructureDiagram /></div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-ui-blue text-white text-[10px] font-bold tracking-widest uppercase rounded-none mb-6">GOVERNANCE</div>
                <RevealHeader className="font-serif text-5xl mb-6 text-ui-blue">Power Structure</RevealHeader>
                <p className="text-xl text-slate-500 mb-6 leading-relaxed font-light italic">Checks, balances, and constitutional integrity.</p>
                <p className="text-lg text-slate-400 leading-relaxed mb-8 font-light">The <strong>CEC</strong> executes, the <strong>SRC</strong> legislates, and the <strong>Judiciary</strong> interprets. A model republic within the ivory tower.</p>
                <Link to="/governance" className="flex items-center gap-2 text-nobel-gold font-bold uppercase tracking-wider text-xs hover:text-ui-blue transition-colors group">
                  Read Legal Framework <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Halls of Residence Section */}
        <section id="halls" className="py-24 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <RevealHeader className="font-serif text-5xl mb-4 text-ui-blue uppercase tracking-tighter">The Nations</RevealHeader>
              <p className="text-xs text-slate-400 uppercase tracking-[0.5em] font-bold">Halls of Residence</p>
            </div>
            <div className="max-w-6xl mx-auto"><CampusMap /></div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-32 bg-white relative overflow-hidden border-t border-slate-100">
          <div className="container mx-auto px-6 text-center max-w-4xl">
            <div className="w-16 h-1 bg-nobel-gold mx-auto mb-12"></div>
            <RevealHeader className="text-5xl md:text-6xl font-serif text-ui-blue leading-tight mb-12">Digitizing the <span className="italic text-slate-300">Intellectual Vanguard</span> for the Next Generation.</RevealHeader>
            <p className="text-xl text-slate-500 font-light leading-relaxed mb-16">The UISU Archive is not just a repository of dates; it is a live blueprint of how the "First and Best" navigated the currents of history. We preserve the legacy so that the future can build on a solid foundation of consciousness.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="group">
                  <div className="text-3xl font-serif text-ui-blue group-hover:text-nobel-gold transition-colors">{stat.val}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <Fingerprint className="absolute bottom-[-10%] right-[-5%] text-slate-50 size-96 rotate-12" />
        </section>

        {/* Population Chart Section */}
        <section className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto"><PopulationChart /></div>
          </div>
        </section>

        {/* Trivia Section */}
        <TriviaSection />

        {/* Campus Culture Section */}
        <section className="py-24 bg-white border-t border-slate-200">
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-5 relative min-h-[400px] bg-slate-50 rounded-none overflow-hidden shadow-sm border border-slate-200 group">
              <TowerScene />
              <div className="absolute inset-0 bg-ui-blue/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-none border border-slate-200 text-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Iconic Architecture</span>
                <p className="font-serif text-lg text-ui-blue">The Tower of Ibadan</p>
              </div>
            </div>
            <div className="md:col-span-7 flex flex-col justify-center">
              <RevealHeader className="font-serif text-5xl mb-8 text-ui-blue">Campus Culture</RevealHeader>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed font-light">Life as a Uite is unique. From the gyration at the SUB to the quiet study sessions at Kenneth Dike Library. The halls are nations with their own rich traditions.</p>
              <div className="p-8 bg-slate-50 border-l-4 border-nobel-gold rounded-none shadow-inner">
                <p className="font-serif italic text-2xl text-ui-blue mb-4 leading-relaxed">"The greatest weapon against tyranny is the sharp mind of the intellectual."</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">System Command Vanguard</p>
              </div>
            </div>
          </div>
        </section>

        {/* Executives Preview Section */}
        <section className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <Star className="text-nobel-gold w-6 h-6" fill="currentColor" />
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400">Leadership</span>
                </div>
                <RevealHeader className="font-serif text-5xl text-ui-blue">Meet The <span className="italic text-slate-300">Executives</span></RevealHeader>
              </div>
              <Link to="/current-leaders" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ui-blue hover:text-nobel-gold transition-colors">
                View All Leaders <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {executives.map((leader, index) => (
                <LeaderCard key={index} leader={leader} />
              ))}
            </div>
          </div>
        </section>

        <NewsletterSection />
        <Footer />
      </main>
    </div>
  );
};

export default Index;
