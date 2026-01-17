import { useEffect, useRef, useState } from "react";
import anime from "animejs";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ArrowDown, Globe, Flame, Shield, Landmark, Mic, Star } from "lucide-react";

const SplitText = ({ text, className }: { text: string; className?: string }) => {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((char, index) => (
        <span key={index} className="char inline-block whitespace-pre" style={{ opacity: 0 }}>
          {char}
        </span>
      ))}
    </span>
  );
};

const HistoryPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize refs array
  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  useEffect(() => {
    // 1. Hero Text Stagger
    if (heroRef.current) {
      anime.timeline({
        easing: 'easeOutExpo'
      })
      .add({
        targets: heroRef.current.querySelectorAll('.hero-title .char'),
        translateY: ["1.1em", 0],
        translateZ: 0,
        opacity: [0, 1],
        duration: 750,
        delay: (el, i) => 50 * i
      })
      .add({
        targets: heroRef.current.querySelectorAll('.hero-subtitle'),
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        offset: '-=400'
      })
      .add({
        targets: heroRef.current.querySelector('.scroll-indicator'),
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: 800,
        offset: '-=400'
      });
    }

    // 2. Continuous Floating Background Elements
    anime({
      targets: '.floating-shape',
      translateY: () => anime.random(-20, 20),
      translateX: () => anime.random(-20, 20),
      rotate: () => anime.random(-10, 10),
      duration: () => anime.random(2000, 4000),
      easing: 'easeInOutQuad',
      direction: 'alternate',
      loop: true
    });

    // 3. Scroll-Linked Timeline Path
    if (pathRef.current) {
      // Set initial dash offset
      const pathLength = anime.setDashoffset(pathRef.current);
      pathRef.current.setAttribute('stroke-dashoffset', pathLength.toString());

      const scrollAnim = anime({
        targets: pathRef.current,
        strokeDashoffset: [pathLength, 0],
        easing: 'linear',
        autoplay: false,
        duration: 1000 // Normalized duration
      });

      const handleScroll = () => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPos = window.scrollY;
        // Calculate progress (0 to 1)
        const progress = Math.min(Math.max(scrollPos / docHeight, 0), 1);
        scrollAnim.seek(scrollAnim.duration * progress);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Intersection Observer for Section Animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const index = Number(target.dataset.index);

          // Animate Content Entrance
          anime({
            targets: target.querySelectorAll('.section-content > *'),
            translateY: [50, 0],
            opacity: [0, 1],
            delay: anime.stagger(100),
            duration: 800,
            easing: 'easeOutCubic'
          });

          // Specific Element Animations based on section
          if (target.dataset.section === "global") {
             anime({
               targets: target.querySelectorAll('.globe-icon'),
               rotate: '1turn',
               duration: 20000,
               loop: true,
               easing: 'linear'
             });
          }

          if (target.dataset.section === "africa") {
             anime({
                targets: target.querySelectorAll('.map-node'),
                scale: [0, 1],
                opacity: [0, 1],
                delay: anime.stagger(200),
                duration: 600,
                easing: 'easeOutBack'
             });
          }

          observer.unobserve(target);
        }
      });
    }, { threshold: 0.3 });

    sectionsRef.current.forEach(section => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-ui-dark min-h-screen text-slate-100 font-sans selection:bg-nobel-gold selection:text-ui-blue overflow-x-hidden">
      <SEO
        title="History of Unionism"
        description="A journey through time: The evolution of student activism."
        image="/screenshots/history.png"
      />

      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} user={null} handleLogout={() => {}} />

      {/* Fixed Background Noise */}
      <div className="fixed inset-0 bg-[url('/noise.svg')] opacity-10 pointer-events-none z-0 mix-blend-overlay"></div>

      {/* SVG Timeline Path Layer */}
      <div className="fixed inset-0 pointer-events-none z-0" ref={timelineContainerRef}>
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 4500">
           <path
             ref={pathRef}
             d="M 50 0 C 50 200, 20 400, 20 600 S 80 800, 80 1200 S 50 1600, 50 2000 S 20 2400, 20 2800 S 80 3200, 80 3600 S 50 4000, 50 4500"
             fill="none"
             stroke="#C5A059"
             strokeWidth="2"
             vectorEffect="non-scaling-stroke"
             className="opacity-30"
           />
        </svg>
      </div>

      <main className="relative z-10 pt-20">

        {/* HERO */}
        <section ref={addToRefs} data-index="0" className="min-h-screen flex flex-col justify-center items-center text-center px-6 relative overflow-hidden">
          <div ref={heroRef} className="relative z-10">
            <div className="mb-6 inline-block px-4 py-1 border border-nobel-gold/30 rounded-full text-nobel-gold text-xs tracking-[0.4em] uppercase hero-subtitle">
              The Chronicle
            </div>
            <h1 className="hero-title text-5xl md:text-7xl lg:text-9xl font-serif font-bold mb-8 overflow-hidden">
              <SplitText text="Legacy of" className="block" />
              <SplitText text="Resistance" className="text-nobel-gold block italic" />
            </h1>
            <p className="hero-subtitle text-slate-400 max-w-xl mx-auto text-lg leading-relaxed mb-12">
              From medieval guilds to the vanguard of African independence. Witness the evolution of the student voice.
            </p>
            <div className="scroll-indicator animate-bounce">
              <ArrowDown className="text-nobel-gold mx-auto" size={32} />
            </div>
          </div>

          {/* Floating Shapes */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-ui-blue/30 rounded-full blur-3xl floating-shape"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-nobel-gold/10 rounded-full blur-3xl floating-shape" style={{ animationDelay: '1s' }}></div>
        </section>

        {/* 1. GLOBAL ORIGINS */}
        <section ref={addToRefs} data-index="1" data-section="global" className="min-h-screen flex items-center py-20 relative">
           <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center section-content">
              <div className="order-2 lg:order-1 relative">
                 <div className="absolute inset-0 bg-ui-blue/50 rounded-full blur-[100px]"></div>
                 <Globe size={300} strokeWidth={0.5} className="globe-icon text-slate-600 opacity-20 relative z-10 mx-auto lg:mx-0" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                       <h3 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent opacity-10">1088</h3>
                    </div>
                 </div>
              </div>
              <div className="order-1 lg:order-2 text-left">
                 <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6">The Global <span className="text-nobel-gold">Spark</span></h2>
                 <p className="text-xl text-slate-300 mb-6 leading-relaxed">
                   It began in Bologna. Students united not for leisure, but for survival. They formed "nations" to negotiate with townspeople and professors.
                 </p>
                 <div className="pl-6 border-l-2 border-nobel-gold space-y-4">
                    <p className="text-slate-400 italic">"The university was not created by the pope or emperor, but by the students themselves."</p>
                    <p className="text-sm text-nobel-gold uppercase tracking-widest">— Medieval Chronicles</p>
                 </div>
              </div>
           </div>
        </section>

        {/* 2. AFRICAN AWAKENING */}
        <section ref={addToRefs} data-index="2" data-section="africa" className="min-h-screen flex items-center py-20 relative bg-black/20 backdrop-blur-sm">
           <div className="container mx-auto px-6 section-content">
              <div className="text-center mb-16">
                 <Flame className="mx-auto text-nobel-gold mb-6" size={64} />
                 <h2 className="text-4xl md:text-6xl font-serif font-bold mb-4">The African <span className="italic text-slate-500">Fire</span></h2>
                 <p className="text-slate-400 max-w-2xl mx-auto">The fight for education became the fight for liberation.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="map-node bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
                    <h3 className="text-2xl font-serif text-nobel-gold mb-2">1925</h3>
                    <h4 className="font-bold text-white mb-4">WASU, London</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">Ladipo Solanke founds the West African Students' Union. It becomes the "training college" for West Africa's future leaders.</p>
                 </div>
                 <div className="map-node bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors transform md:translate-y-12">
                    <h3 className="text-2xl font-serif text-nobel-gold mb-2">1956</h3>
                    <h4 className="font-bold text-white mb-4">NUNS, Nigeria</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">The National Union of Nigerian Students is born at University College Ibadan. The student voice finds a home.</p>
                 </div>
                 <div className="map-node bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
                    <h3 className="text-2xl font-serif text-nobel-gold mb-2">1976</h3>
                    <h4 className="font-bold text-white mb-4">Soweto, SA</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">20,000 students march against the Afrikaans decree. Their courage changes the course of Apartheid forever.</p>
                 </div>
              </div>
           </div>
        </section>

        {/* 3. NIGERIAN VANGUARD */}
        <section ref={addToRefs} data-index="3" data-section="nigeria" className="min-h-screen flex items-center py-20 relative">
           <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center section-content">
              <div>
                 <h2 className="text-4xl md:text-6xl font-serif font-bold mb-10">Guardians of the <br/><span className="text-nobel-gold">Republic</span></h2>

                 <div className="space-y-8">
                    <div className="flex gap-6 group">
                       <div className="flex-shrink-0 w-12 h-12 bg-ui-blue border border-nobel-gold rounded-full flex items-center justify-center text-nobel-gold font-bold group-hover:bg-nobel-gold group-hover:text-ui-blue transition-colors">
                          <Shield size={20} />
                       </div>
                       <div>
                          <h3 className="text-2xl font-bold mb-2">1960: The Defence Pact</h3>
                          <p className="text-slate-400 leading-relaxed">
                             When the government sought to sign a defence pact with Britain, UI students stormed the parliament. They argued it compromised sovereignty. The pact was killed.
                          </p>
                       </div>
                    </div>

                    <div className="flex gap-6 group">
                       <div className="flex-shrink-0 w-12 h-12 bg-ui-blue border border-nobel-gold rounded-full flex items-center justify-center text-nobel-gold font-bold group-hover:bg-nobel-gold group-hover:text-ui-blue transition-colors">
                          <Mic size={20} />
                       </div>
                       <div>
                          <h3 className="text-2xl font-bold mb-2">1978: Ali Must Go</h3>
                          <p className="text-slate-400 leading-relaxed">
                             The mother of all protests. Segun Okeowo led Nigerian students against tuition hikes. It defined the "Aluta" spirit for generations to come.
                          </p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="relative h-[600px] flex items-center justify-center">
                 {/* Visual Cards Stack */}
                 <div className="absolute w-64 h-80 bg-slate-700 rounded-xl transform -rotate-12 translate-x-[-40px] opacity-50 border border-slate-600"></div>
                 <div className="absolute w-64 h-80 bg-slate-600 rounded-xl transform rotate-6 translate-x-[40px] opacity-70 border border-slate-500"></div>
                 <div className="absolute w-72 h-96 bg-gradient-to-br from-nobel-gold to-yellow-600 rounded-xl transform rotate-0 shadow-2xl flex flex-col items-center justify-center text-ui-blue p-6 text-center">
                    <Star size={48} className="mb-4 text-white" fill="currentColor" />
                    <h3 className="text-3xl font-serif font-bold mb-2">Aluta Continua</h3>
                    <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Victoria Ascerta</p>
                 </div>
              </div>
           </div>
        </section>

        {/* 4. GENESIS OF UI & UISU */}
        <section ref={addToRefs} data-index="4" data-section="ui" className="min-h-screen flex items-center py-20 relative bg-ui-blue">
           <div className="absolute inset-0 bg-[url('/uisu-logo.png')] bg-no-repeat bg-fixed bg-center opacity-5 grayscale mix-blend-overlay"></div>
           <div className="container mx-auto px-6 section-content text-center relative z-10">
              <Landmark size={80} className="mx-auto text-nobel-gold mb-8" />
              <h2 className="text-5xl md:text-7xl font-serif font-bold mb-8">The First & <span className="text-nobel-gold italic">The Best</span></h2>
              <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                 <div className="bg-ui-dark/50 backdrop-blur-md p-10 border-t-4 border-nobel-gold">
                    <h3 className="text-2xl font-bold mb-4 text-white">1948: The Beginning</h3>
                    <p className="text-slate-300 leading-relaxed">
                       Established following the Ashby Commission, the University College Ibadan became the cradle of Nigeria's intelligentsia.
                    </p>
                 </div>
                 <div className="bg-ui-dark/50 backdrop-blur-md p-10 border-t-4 border-nobel-gold">
                    <h3 className="text-2xl font-bold mb-4 text-white">The Union</h3>
                    <p className="text-slate-300 leading-relaxed">
                       The Students' Union was established to champion the welfare of students. It has since become a training ground for national leadership.
                    </p>
                 </div>
              </div>

              <div className="mt-20">
                 <p className="text-2xl font-serif italic text-nobel-cream">"The greatest honour is to serve."</p>
              </div>
           </div>
        </section>

        {/* Footer Link Area */}
        <section className="py-20 bg-ui-dark text-center">
           <p className="text-slate-500 mb-4">The history continues with you.</p>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default HistoryPage;
