import { useParams, Link } from 'react-router-dom';
import { tutorials } from '@/lib/tutorials-data';
import CoursePlayer from '@/components/tutorials/CoursePlayer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TutorialDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const tutorial = tutorials.find(t => t.id === id);

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

  return (
    <div className="space-y-6">
      <Link to="/tutorials/catalog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-ui-blue transition-colors">
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      <CoursePlayer tutorial={tutorial} />
    </div>
  );
};

export default TutorialDetailPage;
