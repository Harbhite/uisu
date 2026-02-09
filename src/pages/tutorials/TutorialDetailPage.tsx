import { useParams, Link } from 'react-router-dom';
import { useTutorial, useTutor } from '@/hooks/useTutorials';
import CoursePlayer from '@/components/tutorials/CoursePlayer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

const TutorialDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: tutorial, isLoading, error } = useTutorial(id || '');
  const { data: tutor } = useTutor(tutorial?.tutor_id || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  if (!tutorial || error) {
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

  return (
    <div className="space-y-6">
      <Link to="/tutorials/catalog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-purple-600 transition-colors">
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      <CoursePlayer tutorial={tutorial} tutorName={tutor?.name} />
    </div>
  );
};

export default TutorialDetailPage;
