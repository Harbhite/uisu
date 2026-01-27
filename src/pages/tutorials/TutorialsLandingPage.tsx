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
      {/* Hero Section */}
      <section className="relative bg-ui-blue overflow-hidden p-8 md:p-16 text-white min-h-[400px] flex items-center border-l-4 border-nobel-gold">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-nobel-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 text-nobel-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-8 border border-white/10 backdrop-blur-sm">
            <Sparkles size={12} />
            <span>Aluta Intellectual Ecosystem</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-[1.1]">
            Master Your Studies <br/>with <span className="text-nobel-gold italic">The Union</span>
          </h1>
          <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl font-light">
            Access hundreds of tutorials from official sources and top students.
            From GSTs to practical skills, we preserve the tradition of academic excellence.
          </p>
          <div className="flex flex-wrap gap-6">
            <Link to="/tutorials/catalog">
              <Button className="bg-nobel-gold text-ui-blue hover:bg-white border-none font-bold rounded-none px-8 py-6 uppercase tracking-widest text-xs">
                Browse Catalog
              </Button>
            </Link>
            <Link to="/tutorials/upload">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 hover:text-white rounded-none px-8 py-6 uppercase tracking-widest text-xs hover:border-nobel-gold transition-colors">
                Become a Tutor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-serif font-bold text-ui-blue flex items-center gap-3">
            <BookOpen size={24} className="text-nobel-gold" />
            Explore Topics
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-slate-200 border border-slate-200">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/tutorials/catalog?category=${cat.id}`}
              className="group p-8 bg-white hover:bg-slate-50 transition-all text-center flex flex-col items-center justify-center gap-4 h-48"
            >
              <div className="w-16 h-16 bg-slate-50 group-hover:bg-ui-blue/5 transition-colors flex items-center justify-center border border-slate-100 group-hover:border-ui-blue/20">
                 <div className="text-ui-blue font-serif font-bold text-2xl group-hover:text-nobel-gold transition-colors">{cat.title[0]}</div>
              </div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 group-hover:text-ui-blue transition-colors">{cat.title}</h3>
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
            <TutorialCard key={tut.id} tutorial={tut} tutor={tutors.find(t => t.id === tut.tutorId)} />
          ))}
        </div>
      </section>

      {/* Official Tutors */}
      <section className="bg-slate-100 p-8 md:p-12 -mx-8 md:-mx-12 border-y border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-nobel-gold">Verified Knowledge</span>
            <h2 className="text-3xl font-serif font-bold text-ui-blue">Official Union Tutors</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
