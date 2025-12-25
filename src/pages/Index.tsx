import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X, Megaphone, BookOpen, Users, Scale, MapPin, FileText, LogIn, LogOut, Moon, Sun, Building2, Award, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [clubsCount, setClubsCount] = useState(0);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -50]);
  const cardsY = useTransform(scrollY, [0, 500], [0, 30]);

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
    // Fetch clubs count from database
    const fetchClubsCount = async () => {
      const { count } = await supabase
        .from('clubs')
        .select('*', { count: 'exact', head: true });
      setClubsCount(count || 0);
    };
    fetchClubsCount();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const marqueeTexts = [
    "FIRST AND BEST",
    "THE GREATEST UITES", 
    "FATHER OF INTELLECTUAL UNIONISM",
    "EST. 1948",
    "ALUTA CONTINUA",
    "VICTORIA ASCERTA",
    "UNION OF SCHOLARS",
    "LEGACY OF EXCELLENCE"
  ];

  const navLinks = [
    { name: "Governance", href: "/governance" },
    { name: "Past Leaders", href: "/past-leaders" },
    { name: "Documents", href: "/documents" },
    { name: "Campus Map", href: "/campus-map" },
    { name: "Communities", href: "/communities" },
    { name: "Events", href: "/events" },
  ];

  const featureCards = [
    { 
      title: "Announcements", 
      subtitle: "NEWS & EVENTS",
      href: "/events", 
      icon: Megaphone,
      bgColor: "bg-[#8B2635]"
    },
    { 
      title: "Union History", 
      subtitle: "1948 - PRESENT",
      href: "/past-leaders", 
      icon: BookOpen,
      bgColor: "bg-ui-blue"
    },
    { 
      title: "Communities", 
      subtitle: "CLUBS & SOCIETIES",
      href: "/communities", 
      icon: Users,
      bgColor: "bg-[#1A6B52]"
    },
    { 
      title: "Governance", 
      subtitle: "STRUCTURE & LAW",
      href: "/governance", 
      icon: Scale,
      bgColor: "bg-nobel-gold"
    },
    { 
      title: "The Republics", 
      subtitle: "HALLS OF RESIDENCE",
      href: "/campus-map", 
      icon: MapPin,
      bgColor: "bg-[#2D7D8F]"
    },
    { 
      title: "The Library", 
      subtitle: "CONSTITUTIONS & BILLS",
      href: "/documents", 
      icon: FileText,
      bgColor: "bg-[#1E2D3D]"
    },
  ];

  const stats = [
    { icon: Users, label: "Active Clubs", value: clubsCount || 40, suffix: "+" },
    { icon: Calendar, label: "Years of Legacy", value: 77, suffix: "" },
    { icon: Building2, label: "Halls of Residence", value: 12, suffix: "" },
    { icon: Award, label: "Student Population", value: 15, suffix: "K+" },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#1a1a2e]' : 'bg-[#F5F0E8]'}`}>
      {/* Marquee Banner */}
      <div className="bg-nobel-gold text-white py-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-16">
          {[...marqueeTexts, ...marqueeTexts].map((text, index) => (
            <span key={index} className="text-xs font-bold tracking-[0.2em] uppercase">
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className={`py-4 px-6 transition-colors duration-500 ${isDarkMode ? 'bg-[#1a1a2e]' : 'bg-[#F5F0E8]'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between relative">
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
              isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-[#E8E2D8] text-foreground hover:bg-nobel-gold/20'
            }`}
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            <span className="text-sm font-medium tracking-wide">MENU</span>
          </button>

          {/* Center Logo */}
          <Link to="/" className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2 group">
            <motion.img 
              src="/uisu-logo.png" 
              alt="UISU Logo" 
              className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110"
              whileHover={{ rotate: 5 }}
            />
            <span className={`font-serif text-2xl font-semibold tracking-wide transition-colors ${isDarkMode ? 'text-white' : 'text-ui-blue'}`}>
              UISU
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                isDarkMode ? 'bg-white/10 text-yellow-400 hover:bg-white/20' : 'bg-[#E8E2D8] text-ui-blue hover:bg-nobel-gold/20'
              }`}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isDarkMode ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </motion.div>
            </button>

            <Link 
              to="/events"
              className={`hidden sm:flex items-center gap-2 transition-colors ${
                isDarkMode ? 'text-white/70 hover:text-nobel-gold' : 'text-muted-foreground hover:text-ui-blue'
              }`}
            >
              <Megaphone size={16} />
              <span className="text-sm font-medium">NEWS</span>
            </Link>
            
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin"
                  className="px-4 py-2 bg-ui-blue text-white text-sm font-medium rounded-full hover:bg-nobel-gold transition-all duration-300 hover:scale-105"
                >
                  ADMIN
                </Link>
                <button
                  onClick={handleLogout}
                  className={`p-2 transition-all duration-300 hover:scale-110 ${isDarkMode ? 'text-white/70 hover:text-nobel-gold' : 'text-muted-foreground hover:text-ui-blue'}`}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-5 py-2 bg-ui-blue text-white text-sm font-medium rounded-full hover:bg-nobel-gold transition-all duration-300 hover:scale-105"
              >
                ENTER
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`absolute top-24 left-4 right-4 z-50 rounded-2xl shadow-2xl border p-6 ${
            isDarkMode ? 'bg-[#252538] border-white/10' : 'bg-white border-border'
          }`}
        >
          <div className="grid grid-cols-2 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isDarkMode ? 'text-white hover:text-nobel-gold hover:bg-white/10' : 'text-foreground hover:text-nobel-gold hover:bg-muted'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ y: heroY }}
          >
            {/* Main Title */}
            <h1 className="flex items-center justify-center gap-4 md:gap-6 mb-8 flex-wrap">
              <motion.span 
                className={`text-5xl sm:text-6xl md:text-8xl lg:text-[120px] font-serif font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-ui-blue'}`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                UNION
              </motion.span>
              <motion.span 
                className="text-4xl md:text-6xl lg:text-7xl text-nobel-gold"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                ★
              </motion.span>
              <motion.span 
                className={`text-5xl sm:text-6xl md:text-8xl lg:text-[120px] font-serif italic font-normal transition-colors ${isDarkMode ? 'text-white/80' : 'text-ui-blue'}`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Legacy
              </motion.span>
            </h1>

            {/* Subtitle */}
            <p className={`text-lg md:text-xl font-light transition-colors ${isDarkMode ? 'text-white/60' : 'text-muted-foreground'}`}>
              Platform packed with{" "}
              <span className={`inline-block px-3 py-1 rounded-lg font-medium transition-all duration-300 hover:scale-105 cursor-default ${
                isDarkMode ? 'bg-white/10 text-white' : 'bg-ui-blue/10 text-ui-blue'
              }`}>
                History
              </span>
              {" "}&{" "}
              <span className={`inline-block px-3 py-1 rounded-lg font-medium transition-all duration-300 hover:scale-105 cursor-default ${
                isDarkMode ? 'bg-white/10 text-white' : 'bg-ui-blue/10 text-ui-blue'
              }`}>
                Intellectual Life
              </span>
              .
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="px-6 pb-16">
        <motion.div className="max-w-5xl mx-auto" style={{ y: cardsY }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featureCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ 
                  y: -8,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
              >
                <Link
                  to={card.href}
                  className={`group relative block ${card.bgColor} rounded-2xl p-6 pt-8 pb-10 h-[200px] overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500`}
                >
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
                  </div>

                  {/* Icon */}
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-auto relative z-10"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <card.icon className="w-6 h-6 text-white" />
                  </motion.div>

                  {/* Content at bottom */}
                  <div className="absolute bottom-6 left-6 right-6 z-10">
                    <p className="text-xs font-bold tracking-[0.15em] uppercase text-white/70 mb-2 group-hover:text-white/90 transition-colors">
                      {card.subtitle}
                    </p>
                    <h3 className="text-2xl md:text-3xl font-serif text-white group-hover:translate-x-1 transition-transform duration-300">
                      {card.title}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className={`py-16 px-6 transition-colors duration-500 ${isDarkMode ? 'bg-white/5' : 'bg-white/50'}`}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center group cursor-default"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 transition-all duration-300 group-hover:scale-110 ${
                  isDarkMode ? 'bg-white/10 text-nobel-gold' : 'bg-nobel-gold/10 text-nobel-gold'
                }`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className={`text-4xl md:text-5xl font-serif mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-ui-blue'}`}>
                  {stat.value}{stat.suffix}
                </div>
                <div className={`text-xs font-bold uppercase tracking-[0.15em] transition-colors ${isDarkMode ? 'text-white/50' : 'text-muted-foreground'}`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 border-t transition-colors duration-500 ${
        isDarkMode ? 'bg-[#151525] border-white/10' : 'bg-[#E8E2D8] border-border/50'
      }`}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3 group">
              <motion.img 
                src="/uisu-logo.png" 
                alt="UISU Logo" 
                className="h-10 w-10 object-contain"
                whileHover={{ rotate: 10 }}
              />
              <span className={`font-serif text-xl transition-colors ${isDarkMode ? 'text-white' : 'text-ui-blue'}`}>
                UISU Archive
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {navLinks.slice(0, 4).map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`transition-all duration-300 hover:scale-105 ${
                    isDarkMode ? 'text-white/60 hover:text-nobel-gold' : 'text-muted-foreground hover:text-nobel-gold'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <p className={`text-sm transition-colors ${isDarkMode ? 'text-white/40' : 'text-muted-foreground'}`}>
              © {new Date().getFullYear()} UISU Archive
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
