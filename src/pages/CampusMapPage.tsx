import { motion, useInView } from "framer-motion";
import { ArrowLeft, Star, MapPin, Building2, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { CampusMap, halls } from "@/components/CampusMap";
import { SEO } from "@/components/SEO";
import { useRef } from "react";

const CampusMapPage = () => {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });
  
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true, margin: "-50px" });

  const maleHalls = halls.filter(h => h.type === 'male').length;
  const femaleHalls = halls.filter(h => h.type === 'female').length;
  const mixedHalls = halls.filter(h => h.type === 'mixed').length;

  const stats = [
    { label: "Total Halls", value: halls.length, icon: Building2 },
    { label: "Male Halls", value: maleHalls, icon: Users },
    { label: "Female Halls", value: femaleHalls, icon: Users },
    { label: "Mixed Halls", value: mixedHalls, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO
        title="Campus Map | UI Halls of Residence & Locations"
        description="Interactive map of University of Ibadan campus. Navigate 12+ halls of residence (Kuti, Tedder, Queen's), academic buildings, and landmarks. Find your way around Nigeria's premier university."
        image="/og/pages-screenshot/campus-map.png"
        url="/campus-map"
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              to="/" 
              className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-nobel-gold transition-colors"
            >
              <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
                <ArrowLeft size={14} />
              </div>
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <div className="flex items-center gap-3">
              <img src="/uisu-logo.png" alt="UISU Logo" className="h-8 w-8 object-contain" />
              <span className="font-serif text-lg font-bold text-ui-blue">UISU SPACE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-12 px-6 lg:px-12 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(#003366 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: 30 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Star size={16} className="text-nobel-gold" fill="currentColor" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Explore Campus</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif text-ui-blue leading-tight mb-6">
              The <span className="italic text-slate-400">Republics</span>
            </h1>
            
            <p className="text-slate-500 max-w-2xl text-lg leading-relaxed mb-10">
              Navigate through the historic halls of residence at the University of Ibadan. 
              Each "republic" has its own unique culture, traditions, and legacy that have shaped generations of Uites.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            ref={statsRef}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-slate-50 border border-slate-200 p-4 md:p-6"
                >
                  <Icon size={20} className="text-nobel-gold mb-3" />
                  <p className="text-3xl md:text-4xl font-serif text-ui-blue mb-1">{stat.value}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 px-6 lg:px-12 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-0.5 bg-nobel-gold"></div>
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Interactive Map</h2>
          </div>
          
          <CampusMap />
        </div>
      </section>

      {/* Hall Legend */}
      <section className="py-16 px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-0.5 bg-nobel-gold"></div>
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Hall Directory</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {halls.map((hall, index) => (
              <motion.div
                key={hall.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group bg-white border border-slate-200 p-5 hover:border-slate-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                    style={{ borderColor: hall.color, backgroundColor: `${hall.color}15` }}
                  >
                    <MapPin size={18} style={{ color: hall.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p 
                      className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1"
                      style={{ color: hall.color }}
                    >
                      {hall.alias}
                    </p>
                    <h3 className="font-serif text-lg text-ui-blue leading-tight mb-1 group-hover:text-nobel-gold transition-colors">
                      {hall.name}
                    </h3>
                    <p className="text-xs text-slate-400 italic">"{hall.motto}"</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 lg:px-12 bg-ui-blue text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Sparkles size={32} className="text-nobel-gold mx-auto mb-6" />
          <h2 className="font-serif text-3xl md:text-4xl mb-4">
            Discover the <span className="italic text-nobel-gold">Spirit</span> of Each Hall
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Every hall has a unique culture, anthem, and legacy. Click on any pin on the map above to explore the rich history and notable alumni of each republic.
          </p>
          <Link
            to="/governance"
            className="inline-flex items-center gap-3 bg-nobel-gold text-ui-blue font-bold uppercase tracking-widest px-8 py-4 hover:bg-white transition-colors"
          >
            <span>View Governance</span>
            <ArrowLeft size={16} className="rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CampusMapPage;
