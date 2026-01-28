import { tutors, tutorials, categories } from '@/lib/tutorials-data';
import TutorialCard from '@/components/tutorials/TutorialCard';
import TutorCard from '@/components/tutorials/TutorCard';
import { ArrowRight, Star, Sparkles, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const TutorialsLandingPage = () => {
  const officialTutors = tutors.filter(t => t.tier === 'Official');
  const communityTutors = tutors.filter(t => t.tier === 'Community');
  const featuredTutorials = tutorials.slice(0, 3);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section with Glassmorphism and Conical Gradient */}
      <section className="relative overflow-hidden p-8 md:p-16 text-white min-h-[500px] flex items-center border-l-4 border-nobel-gold shadow-2xl">
        {/* Background Image / Noise */}
        <div className="absolute inset-0 bg-ui-blue z-0">
           <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay"></div>
           {/* Conical Gradient Ambient Light */}
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-nobel-gold/20 via-ui-blue/0 to-transparent blur-3xl opacity-60 pointer-events-none" />
        </div>

        {/* Glass Overlay */}
        <div className="absolute inset-0 bg-ui-blue/60 backdrop-blur-[2px] z-0" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 text-nobel-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-8 border border-white/20 backdrop-blur-md shadow-lg hover:bg-white/20 transition-colors cursor-default">
            <Sparkles size={12} className="animate-pulse" />
            <span>Aluta Intellectual Ecosystem</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-[1.1] drop-shadow-lg">
            Master Your Studies <br/>with <span className="text-transparent bg-clip-text bg-gradient-to-r from-nobel-gold to-white italic">The Union</span>
          </h1>

          <p className="text-xl text-slate-100 mb-10 leading-relaxed max-w-2xl font-light drop-shadow-md">
            Access hundreds of tutorials from official sources and top students.
            From GSTs to practical skills, we preserve the tradition of academic excellence.
          </p>

          <div className="flex flex-wrap gap-6">
            <Link to="/tutorials/catalog">
              <div className="p-[1px] bg-gradient-to-r from-nobel-gold via-white to-nobel-gold group">
                <Button className="bg-ui-dark text-white hover:bg-ui-blue border-none font-bold rounded-none px-8 py-6 uppercase tracking-widest text-xs h-full w-full transition-all relative overflow-hidden">
                   <span className="relative z-10">Browse Catalog</span>
                   {/* Hover Shine */}
                   <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                </Button>
              </div>
            </Link>
            <Link to="/tutorials/upload">
              <Button variant="outline" className="border-white/30 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-none px-8 py-6 uppercase tracking-widest text-xs hover:border-nobel-gold transition-colors">
                Become a Tutor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-8 border-b border-slate-200/60 pb-4">
          <h2 className="text-2xl font-serif font-bold text-ui-blue flex items-center gap-3">
            <BookOpen size={24} className="text-nobel-gold" />
            Explore Topics
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/tutorials/catalog?category=${cat.id}`}
              className="group p-8 bg-white/60 backdrop-blur-sm border border-white/40 hover:border-nobel-gold/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-center flex flex-col items-center justify-center gap-4 h-48 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="w-16 h-16 bg-white shadow-inner group-hover:bg-ui-blue transition-colors duration-500 flex items-center justify-center border border-slate-100 group-hover:border-ui-blue relative z-10 rounded-full group-hover:scale-110">
                 <div className="text-ui-blue font-serif font-bold text-2xl group-hover:text-nobel-gold transition-colors">{cat.title[0]}</div>
              </div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 group-hover:text-ui-blue transition-colors relative z-10">{cat.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Tutorials */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold text-ui-blue">Featured Tutorials</h2>
          <Link to="/tutorials/catalog" className="text-xs font-bold uppercase tracking-widest text-ui-blue flex items-center gap-2 hover:text-nobel-gold transition-colors group border-b border-ui-blue pb-1 hover:border-nobel-gold">
            View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredTutorials.map((tut) => (
             <div key={tut.id} className="transform hover:z-10 transition-transform">
                <TutorialCard tutorial={tut} tutor={tutors.find(t => t.id === tut.tutorId)} />
             </div>
          ))}
        </div>
      </section>

      {/* Official Tutors */}
      <section className="bg-slate-100/50 backdrop-blur-sm p-8 md:p-12 -mx-8 md:-mx-12 border-y border-white/20 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-nobel-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-nobel-gold">Verified Knowledge</span>
            <h2 className="text-3xl font-serif font-bold text-ui-blue">Official Union Tutors</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {officialTutors.map((tutor) => (
            <div key={tutor.id} className="h-56">
              <TutorCard tutor={tutor} />
            </div>
          ))}
        </div>
      </section>

      {/* Community Tutors */}
      <section>
         <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold text-ui-blue">Top Community Tutors</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {communityTutors.map((tutor) => (
            <div key={tutor.id} className="h-56">
              <TutorCard tutor={tutor} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TutorialsLandingPage;
