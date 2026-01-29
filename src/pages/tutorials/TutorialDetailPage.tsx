import { useParams, Link } from 'react-router-dom';
import { useTutorial } from '@/hooks/useTutorials';
import CoursePlayer from '@/components/tutorials/CoursePlayer';
import EnrollButton from '@/components/tutorials/EnrollButton';
import BookmarkButton from '@/components/tutorials/BookmarkButton';
import ProgressTracker from '@/components/tutorials/ProgressTracker';
import ReviewSection from '@/components/tutorials/ReviewSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Users, Clock, Loader2 } from 'lucide-react';
import { tutorials as staticTutorials, tutors as staticTutors } from '@/lib/tutorials-data';
import { SEO } from '@/components/SEO';

const TutorialDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch tutorial using hook
  const { data: dbTutorial, isLoading: tutorialLoading } = useTutorial(id || '');

  // Fallback to static data for old string IDs (or if offline DB empty but ID matches static)
  const staticTutorial = staticTutorials.find(t => t.id === id);
  const staticTutor = staticTutorial ? staticTutors.find(t => t.id === staticTutorial.tutorId) : null;

  // Convert DB tutorial to display format
  const tutorial = dbTutorial ? {
    id: dbTutorial.id,
    title: dbTutorial.title,
    description: dbTutorial.description || '',
    tutorId: dbTutorial.tutor_id,
    format: dbTutorial.format as 'Video' | 'Audio' | 'Text' | 'Essay',
    level: dbTutorial.level as 'Beginner' | 'Intermediate' | 'Advanced',
    coverImage: dbTutorial.cover_image || '/placeholder.svg',
    tags: dbTutorial.tags || [],
    rating: Number(dbTutorial.rating) || 0,
    studentsCount: dbTutorial.students_count || 0,
    createdAt: (dbTutorial as any).created_at || '',
    modules: (dbTutorial.modules || []).map((m: any) => ({
      id: m.id,
      title: m.title,
      type: m.type as 'Video' | 'Audio' | 'Text' | 'Essay',
      content: m.content || '',
      duration: m.duration || '',
      isLocked: m.is_locked || false,
    })).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)),
  } : staticTutorial;

  const tutor = dbTutorial?.tutor ? {
    id: dbTutorial.tutor.id,
    name: dbTutorial.tutor.name,
    tier: dbTutorial.tutor.tier,
    bio: dbTutorial.tutor.bio || '',
    avatar: dbTutorial.tutor.avatar || '/placeholder.svg',
    metrics: {
      courses: dbTutorial.tutor.courses_count || 0,
      students: dbTutorial.tutor.students_count || 0,
      rating: Number(dbTutorial.tutor.rating) || 0,
    },
  } : staticTutor;

  if (tutorialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Tutorial Not Found</h2>
        <p className="text-slate-500 mb-6">The tutorial you are looking for does not exist or has been removed.</p>
        <Link to="/tutorials/catalog">
          <Button>Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  const isDbTutorial = id?.includes('-') || !!dbTutorial;

  return (
    <div className="space-y-8">
      <SEO
        title={`${tutorial.title} | UISU Tutorials`}
        description={tutorial.description || `Learn ${tutorial.title} with our ${tutorial.format.toLowerCase()} tutorial.`}
        image={tutorial.coverImage !== '/placeholder.svg' ? tutorial.coverImage : '/og/pages-screenshot/tutorials.png'}
        url={`/tutorials/${id}`}
      />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link to="/tutorials/catalog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-purple-600 transition-colors">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>

        <div className="flex items-center gap-3">
          {isDbTutorial && (
            <>
              <BookmarkButton tutorialId={tutorial.id} />
              <EnrollButton tutorialId={tutorial.id} />
            </>
          )}
        </div>
      </div>

      {/* Tutorial Info Banner */}
      <div className="bg-white border border-purple-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-purple-100 text-purple-700 rounded-none text-[10px] uppercase tracking-widest font-bold">
                {tutorial.format}
              </Badge>
              <Badge variant="outline" className="rounded-none text-[10px] uppercase tracking-widest">
                {tutorial.level}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#2D1B4E] mb-2">
              {tutorial.title}
            </h1>
            <p className="text-slate-500 mb-4">{tutorial.description}</p>
            
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                {tutorial.rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-purple-500" />
                {tutorial.studentsCount.toLocaleString()} students
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-purple-500" />
                {tutorial.modules.length} modules
              </span>
            </div>
          </div>

          {tutor && (
            <div className="flex items-center gap-4 p-4 bg-purple-50 border border-purple-100">
              <img 
                src={tutor.avatar} 
                alt={tutor.name}
                className="w-12 h-12 object-cover bg-purple-200"
              />
              <div>
                <p className="text-xs text-purple-500 uppercase tracking-widest font-bold mb-1">
                  Instructor
                </p>
                <p className="font-bold text-[#2D1B4E]">{tutor.name}</p>
                <Badge variant="outline" className="mt-1 text-[8px] uppercase">
                  {tutor.tier}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Tracker (only for DB tutorials) */}
      {isDbTutorial && (
        <ProgressTracker 
          tutorialId={tutorial.id}
        />
      )}

      {/* Course Player */}
      <CoursePlayer tutorial={tutorial} />

      {/* Reviews Section (only for DB tutorials) */}
      {isDbTutorial && (
        <div className="bg-white border border-purple-100 p-6">
          <ReviewSection tutorialId={tutorial.id} />
        </div>
      )}
    </div>
  );
};

export default TutorialDetailPage;
