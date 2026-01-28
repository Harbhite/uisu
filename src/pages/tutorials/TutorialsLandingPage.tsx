import { tutors, tutorials, categories } from '@/lib/tutorials-data';
import TutorialCard from '@/components/tutorials/TutorialCard';
import TutorCard from '@/components/tutorials/TutorCard';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const WavePattern = () => {
  return (
    <div className="flex flex-col gap-[6px] items-end justify-center h-full opacity-80">
      {Array.from({ length: 24 }).map((_, i) => {
        // Calculate width based on a sine wave or peak pattern
        // Center index is around 12
        const dist = Math.abs(i - 12);
        const widthPercent = Math.max(20, 100 - (dist * 7)); // Peak at center

        return (
          <motion.div
            key={i}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: `${widthPercent}%`, opacity: 1 }}
            transition={{ duration: 0.8, delay: i * 0.02, ease: "easeOut" }}
            className="h-[2px] bg-purple-200/40 rounded-full"
            style={{ width: `${widthPercent}%` }}
          />
        );
      })}
    </div>
  );
};

const TutorialsLandingPage = () => {
  const officialTutors = tutors.filter(t => t.tier === 'Official');
  const communityTutors = tutors.filter(t => t.tier === 'Community');
  const featuredTutorials = tutorials.slice(0, 3);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section - "Beyond the Canvas" Style */}
      <section className="relative overflow-hidden min-h-[480px] bg-[#6E5494] flex items-center shadow-2xl">
        <div className="container mx-auto px-8 md:px-16 flex flex-col md:flex-row items-center h-full relative z-10">

          {/* Left Content */}
          <div className="flex-1 text-white py-12 md:py-0 z-20">
             <div className="inline-block px-3 py-1 mb-6 text-xs font-mono text-purple-200 bg-black/20 backdrop-blur-sm rounded-sm">
               107 articles
             </div>

             <h1 className="text-5xl md:text-7xl font-sans font-medium mb-6 tracking-tight leading-[1.1]">
               Learn design
             </h1>

             <p className="text-purple-100 text-lg md:text-xl max-w-md leading-relaxed font-light mb-10">
               Starting your journey as a designer or looking to improve your skills? Our library of design tutorials cover everything from using shapes to creating websites.
             </p>

             <div className="flex gap-4">
               <Link to="/tutorials/catalog">
                 <Button className="bg-white text-[#6E5494] hover:bg-purple-50 font-bold px-8 py-6 rounded-none tracking-wide transition-all">
                    START LEARNING
                 </Button>
               </Link>
             </div>
          </div>

          {/* Right Content - Wave Graphic */}
          <div className="flex-1 h-[300px] w-full md:w-auto relative flex items-center justify-end px-8 md:px-0">
             <div className="w-full max-w-lg h-full relative">
                <WavePattern />

                {/* Overlay Gradient to fade out edges if needed */}
                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#6E5494] to-transparent pointer-events-none" />
                <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#6E5494] to-transparent pointer-events-none" />
             </div>
          </div>

        </div>

        {/* Subtle Background Texture */}
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
      </section>

      {/* Categories */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-8 border-b border-purple-200 pb-4">
          <h2 className="text-2xl font-serif font-bold text-[#2D1B4E] flex items-center gap-3">
            <BookOpen size={24} className="text-purple-500" />
            Explore Topics
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/tutorials/catalog?category=${cat.id}`}
              className="group p-8 bg-white border border-purple-100 hover:border-purple-400 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-center flex flex-col items-center justify-center gap-4 h-48 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="w-16 h-16 bg-purple-50 shadow-inner group-hover:bg-[#6E5494] transition-colors duration-500 flex items-center justify-center border border-purple-100 group-hover:border-[#6E5494] relative z-10 rounded-full group-hover:scale-110">
                 <div className="text-[#6E5494] font-serif font-bold text-2xl group-hover:text-white transition-colors">{cat.title[0]}</div>
              </div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 group-hover:text-[#6E5494] transition-colors relative z-10">{cat.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Tutorials */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold text-[#2D1B4E]">Featured Tutorials</h2>
          <Link to="/tutorials/catalog" className="text-xs font-bold uppercase tracking-widest text-[#6E5494] flex items-center gap-2 hover:text-purple-800 transition-colors group border-b border-purple-300 pb-1 hover:border-purple-800">
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
      <section className="bg-purple-50 p-8 md:p-12 -mx-8 md:-mx-12 border-y border-purple-100 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-500">Verified Knowledge</span>
            <h2 className="text-3xl font-serif font-bold text-[#2D1B4E]">Official Union Tutors</h2>
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
      <section className="px-4">
         <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold text-[#2D1B4E]">Top Community Tutors</h2>
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
