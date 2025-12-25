import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, ChevronDown, Users, Building2, BookOpen, Calendar, MapPin, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { AnnouncementsPage } from "@/components/Announcements";
import { TimelineDiagram, StructureDiagram, PopulationChart } from "@/components/Diagrams";
import { TriviaSection } from "@/components/Trivia";
import { CampusMap } from "@/components/CampusMap";
import { HeroScene } from "@/components/QuantumScene";

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Governance", href: "/governance" },
    { name: "Past Leaders", href: "/past-leaders" },
    { name: "Documents", href: "/documents" },
    { name: "Campus Map", href: "/campus-map" },
    { name: "Communities", href: "/communities" },
  ];

  const stats = [
    { icon: Users, label: "Students", value: "15,000+" },
    { icon: Building2, label: "Halls", value: "12" },
    { icon: BookOpen, label: "Programs", value: "50+" },
    { icon: Award, label: "Years", value: "40+" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Floating Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/80 backdrop-blur-xl shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img src="/uisu-logo.png" alt="UISU Logo" className="h-10 w-10 object-contain" />
              <span className="font-display text-xl font-bold text-primary">UISU Archive</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-primary"
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
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <HeroScene />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background z-10" />
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              UISU Archive
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Preserving the legacy and celebrating the journey of the Uganda Islamic Students Union
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/governance"
                className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
              >
                Explore Governance
              </Link>
              <Link
                to="/documents"
                className="px-8 py-3 border border-border text-foreground rounded-full font-medium hover:bg-muted transition-colors"
              >
                Browse Documents
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <ChevronDown className="w-8 h-8 text-muted-foreground animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <div className="bg-primary/10 py-4 overflow-hidden">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex gap-8 whitespace-nowrap"
        >
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-8">
              <span className="text-primary font-medium">📚 Document Archive Updated</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-primary font-medium">🏛️ New Governance Records</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-primary font-medium">👥 Community Highlights</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-primary font-medium">🗺️ Campus Map Available</span>
              <span className="text-muted-foreground">•</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our History
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Key moments in the journey of the union
            </p>
          </motion.div>
          <TimelineDiagram />
        </div>
      </section>

      {/* Campus Map Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Campus Halls
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore the halls of residence
            </p>
          </motion.div>
          <CampusMap />
        </div>
      </section>

      {/* Trivia Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Test Your Knowledge
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              How well do you know the union's history?
            </p>
          </motion.div>
          <TriviaSection />
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Explore More
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Governance", desc: "Learn about our leadership structure", href: "/governance", icon: Building2 },
              { title: "Past Leaders", desc: "Hall of Fame of union presidents", href: "/past-leaders", icon: Award },
              { title: "Communities", desc: "Student clubs and societies", href: "/communities", icon: Users },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.href}
                  className="block p-6 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all group"
                >
                  <item.icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/50 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/uisu-logo.png" alt="UISU Logo" className="h-10 w-10 object-contain" />
                <span className="font-display text-xl font-bold text-primary">UISU Archive</span>
              </div>
              <p className="text-muted-foreground max-w-md">
                Preserving the rich history and legacy of the Students Union for future generations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Info</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Campus, University</span>
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Est. 1948</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground text-sm">
            <p>© {new Date().getFullYear()} UISU Archive. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
