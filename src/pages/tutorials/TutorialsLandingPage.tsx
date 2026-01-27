import { tutors, tutorials, categories } from '@/lib/tutorials-data';
import TutorialCard from '@/components/tutorials/TutorialCard';
import TutorCard from '@/components/tutorials/TutorCard';
import { ArrowRight, Star, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const TutorialsLandingPage = () => {
  const officialTutors = tutors.filter(t => t.tier === 'Official');
  const communityTutors = tutors.filter(t => t.tier === 'Community');
  const featuredTutorials = tutorials.slice(0, 3);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative rounded-2xl bg-ui-blue overflow-hidden p-8 md:p-12 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-nobel-gold/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-white/20">
            <Sparkles size={12} className="text-nobel-gold" />
            <span>New Learning Ecosystem</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
            Master Your Studies with <br/><span className="text-nobel-gold italic">The Union</span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            Access hundreds of tutorials from official sources and top students.
            From GSTs to practical skills, we have you covered.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/tutorials/catalog">
              <Button className="bg-nobel-gold text-ui-blue hover:bg-white border-none font-bold">
                Browse Catalog
              </Button>
            </Link>
            <Link to="/tutorials/upload">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white">
                Become a Tutor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Star size={18} className="text-nobel-gold fill-current" />
            Explore Topics
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/tutorials/catalog?category=${cat.id}`}
              className="group p-6 bg-white border border-slate-200 rounded-xl hover:border-nobel-gold hover:shadow-md transition-all text-center"
            >
              <div className="w-12 h-12 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                {/* Icons would need a map or be part of data properly, using placeholder for now if string */}
                 <div className="text-ui-blue font-bold text-xl">{cat.title[0]}</div>
              </div>
              <h3 className="font-bold text-sm text-slate-700 group-hover:text-ui-blue">{cat.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Tutorials */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Featured Tutorials</h2>
          <Link to="/tutorials/catalog" className="text-xs font-bold uppercase tracking-widest text-ui-blue flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredTutorials.map((tut) => (
            <TutorialCard key={tut.id} tutorial={tut} tutor={tutors.find(t => t.id === tut.tutorId)} />
          ))}
        </div>
      </section>

      {/* Official Tutors */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Official Union Tutors</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {officialTutors.map((tutor) => (
            <div key={tutor.id} className="h-48">
              <TutorCard tutor={tutor} />
            </div>
          ))}
        </div>
      </section>

      {/* Community Tutors */}
      <section>
         <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Top Community Tutors</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {communityTutors.map((tutor) => (
            <div key={tutor.id} className="h-48">
              <TutorCard tutor={tutor} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TutorialsLandingPage;
