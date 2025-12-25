import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, Megaphone, BookOpen, Users, Scale, MapPin, FileText, LogIn, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
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
      <header className="bg-[#F5F0E8] py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-[#E8E2D8] rounded-full text-foreground hover:bg-nobel-gold/20 transition-colors"
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            <span className="text-sm font-medium tracking-wide">MENU</span>
          </button>

          {/* Center Logo */}
          <Link to="/" className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
            <img src="/uisu-logo.png" alt="UISU Logo" className="h-12 w-12 object-contain" />
            <span className="font-serif text-2xl text-ui-blue font-semibold tracking-wide">UISU</span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link 
              to="/events"
              className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-ui-blue transition-colors"
            >
              <Megaphone size={16} />
              <span className="text-sm font-medium">NEWS</span>
            </Link>
            
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin"
                  className="px-4 py-2 bg-ui-blue text-white text-sm font-medium rounded-full hover:bg-nobel-gold transition-colors"
                >
                  ADMIN
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-muted-foreground hover:text-ui-blue transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-5 py-2 bg-ui-blue text-white text-sm font-medium rounded-full hover:bg-nobel-gold transition-colors"
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
          className="absolute top-24 left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-border p-6"
        >
          <div className="grid grid-cols-2 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium text-foreground hover:text-nobel-gold hover:bg-muted rounded-lg transition-colors"
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
          >
            {/* Main Title */}
            <h1 className="flex items-center justify-center gap-4 md:gap-6 mb-8">
              <span className="text-6xl md:text-8xl lg:text-[120px] font-serif text-ui-blue font-bold tracking-tight">
                UNION
              </span>
              <span className="text-4xl md:text-6xl lg:text-7xl text-nobel-gold">★</span>
              <span className="text-6xl md:text-8xl lg:text-[120px] font-serif text-ui-blue italic font-normal">
                Legacy
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground font-light">
              Platform packed with{" "}
              <span className="inline-block px-3 py-1 bg-ui-blue/10 text-ui-blue rounded-lg font-medium">
                History
              </span>
              {" "}&{" "}
              <span className="inline-block px-3 py-1 bg-ui-blue/10 text-ui-blue rounded-lg font-medium">
                Intellectual Life
              </span>
              .
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featureCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Link
                  to={card.href}
                  className={`group relative block ${card.bgColor} rounded-2xl p-6 pt-8 pb-10 h-[200px] overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-xl`}
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-auto">
                    <card.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content at bottom */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-xs font-bold tracking-[0.15em] uppercase text-white/70 mb-2">
                      {card.subtitle}
                    </p>
                    <h3 className="text-2xl md:text-3xl font-serif text-white">
                      {card.title}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#E8E2D8] border-t border-border/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/uisu-logo.png" alt="UISU Logo" className="h-10 w-10 object-contain" />
              <span className="font-serif text-xl text-ui-blue">UISU Archive</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {navLinks.slice(0, 4).map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-muted-foreground hover:text-nobel-gold transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} UISU Archive
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
