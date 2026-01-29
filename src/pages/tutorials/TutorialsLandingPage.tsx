import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { tutors as staticTutors, tutorials as staticTutorials, categories } from '@/lib/tutorials-data';
import TutorialCard from '@/components/tutorials/TutorialCard';
import TutorCard from '@/components/tutorials/TutorCard';
import MyLearningDashboard from '@/components/tutorials/MyLearningDashboard';
import TutorApplicationForm from '@/components/tutorials/TutorApplicationForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, BookOpen, GraduationCap, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';

const WavePattern = () => {
  return (
    <div className="flex flex-col gap-[6px] items-end justify-center h-full opacity-80">
      {Array.from({ length: 24 }).map((_, i) => {
        const dist = Math.abs(i - 12);
        const widthPercent = Math.max(20, 100 - (dist * 7));

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
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('discover');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Fetch tutors from database
  const { data: dbTutors } = useQuery({
    queryKey: ['tutors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .order('rating', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch featured tutorials from database
  const { data: dbTutorials } = useQuery({
    queryKey: ['featured-tutorials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tutorials')
        .select(`
          *,
          tutors (*),
          tutorial_modules (id, title, type, duration, sort_order)
        `)
        .eq('is_published', true)
        .eq('is_approved', true)
        .order('students_count', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  // Format tutors
  const allTutors = [
    ...(dbTutors || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      tier: t.tier as 'Official' | 'Verified' | 'Community',
      bio: t.bio || '',
      avatar: t.avatar || '/placeholder.svg',
      metrics: {
        courses: t.courses_count || 0,
        students: t.students_count || 0,
        rating: Number(t.rating) || 0,
      },
    })),
  ];

  // Use DB tutors if available, else static
  const tutorsToShow = allTutors.length > 0 ? allTutors : staticTutors;
  const officialTutors = tutorsToShow.filter(t => t.tier === 'Official');
  const communityTutors = tutorsToShow.filter(t => t.tier === 'Community');

  // Format featured tutorials
  const featuredTutorials = (dbTutorials || []).length > 0 
    ? (dbTutorials || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        tutorId: t.tutor_id,
        format: t.format as 'Video' | 'Audio' | 'Text' | 'Essay',
        level: t.level as 'Beginner' | 'Intermediate' | 'Advanced',
        coverImage: t.cover_image || '/placeholder.svg',
        tags: t.tags || [],
        rating: Number(t.rating) || 0,
        studentsCount: t.students_count || 0,
        createdAt: t.created_at || '',
        modules: (t.tutorial_modules || []).map((m: any) => ({
          id: m.id,
          title: m.title,
          type: m.type,
          content: '',
          duration: m.duration || '',
        })),
        tutor: t.tutors ? {
          id: t.tutors.id,
          name: t.tutors.name,
          tier: t.tutors.tier,
          bio: t.tutors.bio || '',
          avatar: t.tutors.avatar || '/placeholder.svg',
          metrics: {
            courses: t.tutors.courses_count || 0,
            students: t.tutors.students_count || 0,
            rating: Number(t.tutors.rating) || 0,
          },
        } : null,
      }))
    : staticTutorials.slice(0, 3).map(t => ({
        ...t,
        tutor: staticTutors.find(tu => tu.id === t.tutorId) || null,
      }));

  return (
    <div className="space-y-8 pb-12">
      <SEO
        title="Tutorials | UISU SPACE"
        description="Learn and grow with tutorials created by verified tutors and fellow students. From academic excellence to practical skills at the University of Ibadan."
        image="/og/pages-screenshot/tutorials.png"
        url="/tutorials"
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[480px] bg-[#6E5494] flex items-center shadow-2xl -mx-8 -mt-8">
        <div className="container mx-auto px-8 md:px-16 flex flex-col md:flex-row items-center h-full relative z-10">
          <div className="flex-1 text-white py-12 md:py-0 z-20">
            <div className="inline-block px-3 py-1 mb-6 text-xs font-mono text-purple-200 bg-black/20 backdrop-blur-sm rounded-sm">
              {(dbTutorials || staticTutorials).length}+ tutorials
            </div>

            <h1 className="text-5xl md:text-7xl font-sans font-medium mb-6 tracking-tight leading-[1.1]">
              Learn & Grow
            </h1>

            <p className="text-purple-100 text-lg md:text-xl max-w-md leading-relaxed font-light mb-10">
              From academic excellence to practical skills, explore tutorials created by verified tutors and your fellow students.
            </p>

            <div className="flex gap-4">
              <Link to="/tutorials/catalog">
                <Button className="bg-white text-[#6E5494] hover:bg-purple-50 font-bold px-8 py-6 rounded-none tracking-wide transition-all">
                  START LEARNING
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex-1 h-[300px] w-full md:w-auto relative flex items-center justify-end px-8 md:px-0">
            <div className="w-full max-w-lg h-full relative">
              <WavePattern />
              <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#6E5494] to-transparent pointer-events-none" />
              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#6E5494] to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
      </section>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full md:w-auto bg-white/60 backdrop-blur-md border border-purple-100 p-1 rounded-none">
          <TabsTrigger 
            value="discover" 
            className="rounded-none data-[state=active]:bg-[#2D1B4E] data-[state=active]:text-white px-6 py-3 text-xs uppercase tracking-widest font-bold"
          >
            <BookOpen size={14} className="mr-2" />
            Discover
          </TabsTrigger>
          {userId && (
            <TabsTrigger 
              value="my-learning" 
              className="rounded-none data-[state=active]:bg-[#2D1B4E] data-[state=active]:text-white px-6 py-3 text-xs uppercase tracking-widest font-bold"
            >
              <GraduationCap size={14} className="mr-2" />
              My Learning
            </TabsTrigger>
          )}
          <TabsTrigger 
            value="become-tutor" 
            className="rounded-none data-[state=active]:bg-[#2D1B4E] data-[state=active]:text-white px-6 py-3 text-xs uppercase tracking-widest font-bold"
          >
            <UserPlus size={14} className="mr-2" />
            Become a Tutor
          </TabsTrigger>
        </TabsList>

        {/* Discover Tab */}
        <TabsContent value="discover" className="mt-8 space-y-16">
          {/* Categories */}
          <section>
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
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-serif font-bold text-[#2D1B4E]">Featured Tutorials</h2>
              <Link to="/tutorials/catalog" className="text-xs font-bold uppercase tracking-widest text-[#6E5494] flex items-center gap-2 hover:text-purple-800 transition-colors group border-b border-purple-300 pb-1 hover:border-purple-800">
                View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredTutorials.map((tut) => (
                <div key={tut.id} className="transform hover:z-10 transition-transform">
                  <TutorialCard tutorial={tut} tutor={tut.tutor || undefined} />
                </div>
              ))}
            </div>
          </section>

          {/* Official Tutors */}
          <section className="bg-purple-50 p-8 md:p-12 -mx-8 border-y border-purple-100 relative overflow-hidden">
            <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-500">Verified Knowledge</span>
                <h2 className="text-3xl font-serif font-bold text-[#2D1B4E]">Official Union Tutors</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {officialTutors.slice(0, 3).map((tutor) => (
                <div key={tutor.id} className="h-56">
                  <TutorCard tutor={tutor} />
                </div>
              ))}
            </div>
          </section>

          {/* Community Tutors */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-serif font-bold text-[#2D1B4E]">Top Community Tutors</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {communityTutors.slice(0, 3).map((tutor) => (
                <div key={tutor.id} className="h-56">
                  <TutorCard tutor={tutor} />
                </div>
              ))}
            </div>
          </section>
        </TabsContent>

        {/* My Learning Tab */}
        {userId && (
          <TabsContent value="my-learning" className="mt-8">
            <MyLearningDashboard />
          </TabsContent>
        )}

        {/* Become a Tutor Tab */}
        <TabsContent value="become-tutor" className="mt-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold text-[#2D1B4E] mb-4">Share Your Knowledge</h2>
              <p className="text-slate-500">
                Are you passionate about teaching? Apply to become a verified tutor and help fellow students succeed.
              </p>
            </div>
            <TutorApplicationForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TutorialsLandingPage;
