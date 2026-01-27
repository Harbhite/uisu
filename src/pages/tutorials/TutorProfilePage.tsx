import { useParams, Link } from 'react-router-dom';
import { tutors, tutorials } from '@/lib/tutorials-data';
import TutorialCard from '@/components/tutorials/TutorialCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, Users, BookOpen, Star } from 'lucide-react';

const TutorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const tutor = tutors.find(t => t.id === id);
  const tutorTutorials = tutorials.filter(t => t.tutorId === id);

  if (!tutor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Tutor Not Found</h2>
        <Link to="/tutorials">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link to="/tutorials" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-ui-blue transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* Profile Header */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="w-32 h-32 rounded-full bg-slate-100 overflow-hidden border-4 border-slate-50 shadow-inner shrink-0">
          <img src={tutor.avatar} alt={tutor.name} className="w-full h-full object-cover" />
        </div>

        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-4">
             <h1 className="text-3xl font-serif font-bold text-ui-blue">{tutor.name}</h1>
             <div className="flex gap-2 mt-1">
                {tutor.tier === 'Official' && <Badge className="bg-nobel-gold hover:bg-nobel-gold">OFFICIAL</Badge>}
                {tutor.tier === 'Verified' && <Badge variant="secondary" className="gap-1"><CheckCircle2 size={14} /> Verified</Badge>}
             </div>
          </div>

          <p className="text-lg text-slate-600 mb-6 max-w-2xl">{tutor.bio}</p>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
               <BookOpen size={18} className="text-ui-blue" />
               <span className="font-bold">{tutor.metrics.courses}</span> <span className="text-slate-500">Courses</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
               <Users size={18} className="text-ui-blue" />
               <span className="font-bold">{tutor.metrics.students}</span> <span className="text-slate-500">Students</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
               <Star size={18} className="text-nobel-gold fill-current" />
               <span className="font-bold">{tutor.metrics.rating}</span> <span className="text-slate-500">Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorials List */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6">Courses by {tutor.name}</h2>
        {tutorTutorials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorTutorials.map((tut) => (
              <TutorialCard key={tut.id} tutorial={tut} tutor={tutor} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
            No courses uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorProfilePage;
