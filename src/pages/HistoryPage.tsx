import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ArrowRight, Globe, Map, BookOpen, UserCheck, Star } from "lucide-react";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

const HistoryPage = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Refs for sections
  const heroRef = useRef<HTMLDivElement>(null);
  const globalRef = useRef<HTMLDivElement>(null);
  const africaRef = useRef<HTMLDivElement>(null);
  const nigeriaRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);
  const uisuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animation
      gsap.fromTo(
        ".hero-text",
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, stagger: 0.2, ease: "power4.out" }
      );

      // Global Unionism - Parallax & Fade
      gsap.fromTo(
        ".global-content",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: globalRef.current,
            start: "top 80%",
            end: "bottom 20%",
            scrub: 1,
          },
        }
      );

      // African Context - Horizontal Scroll or Pin
      const africaTl = gsap.timeline({
        scrollTrigger: {
          trigger: africaRef.current,
          start: "top center",
          end: "bottom center",
          scrub: 1,
        },
      });
      africaTl.fromTo(".africa-map", { scale: 0.8, opacity: 0.5 }, { scale: 1, opacity: 1 });

      // Nigerian Vanguard - Staggered List
      gsap.from(".nigeria-item", {
        x: -50,
        opacity: 0,
        duration: 1,
        stagger: 0.3,
        scrollTrigger: {
          trigger: nigeriaRef.current,
          start: "top 70%",
        },
      });

      // UI Establishment - Reveal
      gsap.fromTo(
        ".ui-reveal",
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          duration: 1.5,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: uiRef.current,
            start: "top 60%",
          },
        }
      );

      // UISU Evolution - Timeline line drawing
      gsap.fromTo(
        ".timeline-line",
        { height: 0 },
        {
          height: "100%",
          scrollTrigger: {
            trigger: uisuRef.current,
            start: "top center",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );

    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="bg-slate-50 min-h-screen overflow-x-hidden font-sans text-slate-900 selection:bg-nobel-gold selection:text-white">
      <SEO
        title="History of Unionism"
        description="Tracing the roots of student activism from global origins to the University of Ibadan."
        image="/screenshots/history.png"
      />

      {/* Navbar with functional menu state */}
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} user={null} handleLogout={() => {}} />

      <main className="pt-20">

        {/* HERO SECTION */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-ui-blue text-white">
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ui-blue/90"></div>

          <div className="container mx-auto px-6 relative z-10 text-center">
             <div className="hero-text inline-block mb-4 px-4 py-1 border border-nobel-gold/50 text-nobel-gold text-xs font-bold uppercase tracking-[0.3em] rounded-full backdrop-blur-md">
                The Odyssey
             </div>
             <h1 className="hero-text font-serif text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-6">
                Voices of <br/> <span className="text-nobel-gold italic">Resistance</span>
             </h1>
             <p className="hero-text text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
                From the cobblestones of medieval Europe to the independence struggles of Africa. The history of the student movement is the history of freedom itself.
             </p>
             <div className="hero-text mt-12 animate-bounce">
                <ArrowRight className="rotate-90 mx-auto text-nobel-gold" size={32} />
             </div>
          </div>
        </section>

        {/* GLOBAL ROOTS */}
        <section ref={globalRef} className="py-32 bg-slate-100 relative">
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
             <div className="global-content">
                <Globe className="text-ui-blue mb-6 opacity-20" size={120} strokeWidth={1} />
                <h2 className="font-serif text-5xl text-ui-blue mb-6">Global <span className="italic text-slate-400">Origins</span></h2>
                <div className="w-20 h-1 bg-nobel-gold mb-8"></div>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  Student unionism dates back to the medieval universities of Bologna and Paris in the 12th century. Students organized into "nations" to protect their interests against townspeople and university authorities.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                  By the 20th century, the International Union of Students (IUS) emerged in Prague (1946), consolidating student power as a formidable political force globally, influencing decolonization and civil rights movements.
                </p>
             </div>
             <div className="global-content relative h-[500px] w-full bg-slate-200 rounded-none overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-700">
                {/* Placeholder visual */}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-300">
                   <BookOpen size={64} className="text-slate-400" />
                </div>
                <div className="absolute bottom-0 left-0 p-8 bg-gradient-to-t from-black/80 to-transparent w-full">
                   <p className="text-white font-bold uppercase tracking-widest text-sm">Bologna, 1088</p>
                </div>
             </div>
          </div>
        </section>

        {/* AFRICAN CONTEXT */}
        <section ref={africaRef} className="py-32 bg-ui-dark text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
             <Map className="w-full h-full text-white" strokeWidth={0.5} />
          </div>
          <div className="container mx-auto px-6 relative z-10">
             <div className="text-center mb-20">
                <h2 className="font-serif text-5xl md:text-6xl mb-6">The African <span className="text-nobel-gold italic">Awakening</span></h2>
                <p className="text-slate-400 max-w-2xl mx-auto">As the winds of change blew across the continent, students became the intellectual vanguard of the independence movements.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 africa-map">
                <div className="p-8 border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                   <h3 className="font-serif text-2xl text-nobel-gold mb-4">West African Students' Union (WASU)</h3>
                   <p className="text-sm text-slate-300 leading-relaxed">Founded in London in 1925 by Ladipo Solanke. WASU became a training ground for future African leaders, advocating for self-rule and racial dignity.</p>
                </div>
                <div className="p-8 border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                   <h3 className="font-serif text-2xl text-nobel-gold mb-4">Anti-Apartheid</h3>
                   <p className="text-sm text-slate-300 leading-relaxed">In South Africa, SASO (South African Students' Organisation) led by Steve Biko redefined the struggle with Black Consciousness in the late 1960s.</p>
                </div>
                <div className="p-8 border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                   <h3 className="font-serif text-2xl text-nobel-gold mb-4">Pan-Africanism</h3>
                   <p className="text-sm text-slate-300 leading-relaxed">Across the continent, student unions became the conscience of the nation, challenging military dictatorships and neocolonial policies.</p>
                </div>
             </div>
          </div>
        </section>

        {/* NIGERIAN VANGUARD */}
        <section ref={nigeriaRef} className="py-32 bg-slate-50">
           <div className="container mx-auto px-6">
              <h2 className="font-serif text-5xl text-ui-blue mb-16 border-l-4 border-nobel-gold pl-6">The Nigerian <br/>Vanguard</h2>

              <div className="space-y-12 max-w-4xl mx-auto">
                 <div className="nigeria-item flex gap-6 md:gap-12 items-start">
                    <div className="text-6xl font-bold text-slate-200">01</div>
                    <div>
                       <h3 className="text-2xl font-bold text-ui-blue mb-2">NUNS Formation (1956)</h3>
                       <p className="text-slate-600 leading-relaxed">The National Union of Nigerian Students (NUNS) was formed at the University College Ibadan. It was the umbrella body uniting all Nigerian students, with UI playing the pivotal role.</p>
                    </div>
                 </div>
                 <div className="nigeria-item flex gap-6 md:gap-12 items-start">
                    <div className="text-6xl font-bold text-slate-200">02</div>
                    <div>
                       <h3 className="text-2xl font-bold text-ui-blue mb-2">Anglo-Nigerian Defence Pact (1960)</h3>
                       <p className="text-slate-600 leading-relaxed">Students of the University College Ibadan stormed the parliament in Lagos to protest a pact that would have allowed British military bases in Nigeria. The pact was abrogated—a historic victory.</p>
                    </div>
                 </div>
                 <div className="nigeria-item flex gap-6 md:gap-12 items-start">
                    <div className="text-6xl font-bold text-slate-200">03</div>
                    <div>
                       <h3 className="text-2xl font-bold text-ui-blue mb-2">Ali Must Go (1978)</h3>
                       <p className="text-slate-600 leading-relaxed">A nationwide protest against tuition hikes led by Segun Okeowo. It remains the most defining moment in Nigerian student activism history, though it came at a great cost.</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* GENESIS OF UI */}
        <section ref={uiRef} className="py-32 bg-white overflow-hidden">
           <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="relative">
                 <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-nobel-gold/20 rounded-full blur-3xl"></div>
                 <h2 className="font-serif text-5xl md:text-6xl text-ui-blue mb-8 relative z-10">Genesis of the <br/><span className="italic text-slate-400">First & Best</span></h2>
                 <p className="text-lg text-slate-600 leading-relaxed mb-6 font-light">
                    It began with the <strong>Ashby Commission</strong> in 1948, set up to survey the needs for higher education in Nigeria.
                 </p>
                 <p className="text-lg text-slate-600 leading-relaxed font-light">
                    Recommended as a college of the University of London, the University College Ibadan (UCI) was established. It became a full-fledged independent university in 1962, setting the standard for academic excellence in the country.
                 </p>
              </div>
              <div className="ui-reveal relative h-[600px] w-full bg-ui-blue text-white p-12 flex flex-col justify-end">
                 <div className="absolute inset-0 bg-[url('/uisu-logo.png')] bg-no-repeat bg-center opacity-5 bg-contain grayscale"></div>
                 <div className="relative z-10 border-l-2 border-nobel-gold pl-6">
                    <span className="block text-6xl font-bold mb-2 text-nobel-gold">1948</span>
                    <span className="uppercase tracking-widest text-sm font-bold">Foundation Year</span>
                 </div>
              </div>
           </div>
        </section>

        {/* UISU EVOLUTION */}
        <section ref={uisuRef} className="py-32 bg-slate-50 relative">
           <div className="container mx-auto px-6">
              <div className="text-center mb-20">
                 <h2 className="font-serif text-5xl text-ui-blue">Evolution of <span className="text-nobel-gold">UISU</span></h2>
              </div>

              <div className="relative max-w-3xl mx-auto pl-8 border-l border-slate-200">
                 <div className="timeline-line absolute left-0 top-0 w-1 bg-nobel-gold origin-top"></div>

                 <div className="mb-16 relative">
                    <div className="absolute -left-[41px] w-5 h-5 bg-ui-blue rounded-full border-4 border-slate-50"></div>
                    <h3 className="text-2xl font-serif text-ui-blue mb-2">The Early Years</h3>
                    <p className="text-slate-600">The Union started as a platform for intellectual debate and welfare. Leadership was a badge of supreme honor and service.</p>
                 </div>

                 <div className="mb-16 relative">
                    <div className="absolute -left-[41px] w-5 h-5 bg-ui-blue rounded-full border-4 border-slate-50"></div>
                    <h3 className="text-2xl font-serif text-ui-blue mb-2">The Golden Era</h3>
                    <p className="text-slate-600">Through the 60s and 70s, the UI Students' Union was the de facto voice of the Nigerian youth. The "Aluta" spirit was forged in these fires.</p>
                 </div>

                 <div className="mb-16 relative">
                    <div className="absolute -left-[41px] w-5 h-5 bg-ui-blue rounded-full border-4 border-slate-50"></div>
                    <h3 className="text-2xl font-serif text-ui-blue mb-2">Modern Challenges</h3>
                    <p className="text-slate-600">Facing bans and reinstatements, the Union has evolved to embrace digital advocacy, entrepreneurship, and 21st-century welfare needs.</p>
                 </div>

                 <div className="relative">
                    <div className="absolute -left-[41px] w-5 h-5 bg-nobel-gold rounded-full border-4 border-slate-50 animate-pulse"></div>
                    <h3 className="text-2xl font-serif text-ui-blue mb-2">Today</h3>
                    <p className="text-slate-600">We stand as the keepers of the flame. Digitizing our history, empowering our students, and leading the charge for a better future.</p>
                 </div>
              </div>
           </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 bg-ui-blue text-white text-center">
            <div className="container mx-auto px-6">
               <Star className="mx-auto mb-6 text-nobel-gold" size={48} fill="currentColor" />
               <h2 className="font-serif text-4xl mb-8">Be Part of History</h2>
               <p className="text-slate-300 max-w-xl mx-auto mb-10">The story is still being written. Every Uite is a pen in the hand of history.</p>
               <motion.button
                 whileHover={{ scale: 1.05 }}
                 className="px-8 py-3 bg-nobel-gold text-ui-blue font-bold uppercase tracking-widest text-sm"
               >
                 Join the Movement
               </motion.button>
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default HistoryPage;
