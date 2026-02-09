import { useParams, Link } from 'react-router-dom';
import { useTutor, useTutorTutorials, useTutors } from '@/hooks/useTutorials';
import TutorialCard from '@/components/tutorials/TutorialCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, Users, BookOpen, Star, Loader2 } from 'lucide-react';

const TutorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: tutor, isLoading } = useTutor(id || '');
  const { data: tutorTutorials = [] } = useTutorTutorials(id || '');
  const { data: tutors = [] } = useTutors();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 font-serif">Tutor Not Found</h2>
        <Link to="/tutorials">
          <Button className="rounded-none bg-[#6E5494] uppercase tracking-widest text-xs font-bold">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <Link to="/tutorials" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-purple-600 transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </Link>

      {/* Profile Header */}
      <div className="bg-white p-12 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rotate-45 translate-x-32 -translate-y-32"></div>

        <div className="w-40 h-40 bg-slate-100 border-4 border-white shadow-lg shrink-0 relative z-10">
          <img src={tutor.avatar || '/placeholder.svg'} alt={tutor.name} className="w-full h-full object-cover" />
        </div>

        <div className="text-center md:text-left flex-1 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-6">
             <h1 className="text-4xl font-serif font-bold text-[#2D1B4E]">{tutor.name}</h1>
             <div className="flex gap-3 mt-2">
                {tutor.tier === 'Official' && <Badge className="bg-[#6E5494] hover:bg-[#6E5494] rounded-none text-[10px] uppercase tracking-wider px-2 py-1">OFFICIAL</Badge>}
                {tutor.tier === 'Verified' && <Badge variant="secondary" className="gap-1 rounded-none text-[10px] uppercase tracking-wider px-2 py-1 border border-slate-200"><CheckCircle2 size={12} /> Verified</Badge>}
             </div>
          </div>

          <p className="text-xl text-slate-600 mb-8 max-w-2xl font-light leading-relaxed">{tutor.bio}</p>

          <div className="flex flex-wrap justify-center md:justify-start gap-px bg-slate-200 border border-slate-200">
            <div className="flex flex-col items-center justify-center w-32 py-4 bg-slate-50">
               <BookOpen size={20} className="text-[#6E5494] mb-2" />
               <span className="font-serif font-bold text-xl text-[#2D1B4E]">{tutor.courses_count || 0}</span>
               <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Courses</span>
            </div>
            <div className="flex flex-col items-center justify-center w-32 py-4 bg-slate-50">
               <Users size={20} className="text-[#6E5494] mb-2" />
               <span className="font-serif font-bold text-xl text-[#2D1B4E]">{tutor.students_count || 0}</span>
               <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Students</span>
            </div>
            <div className="flex flex-col items-center justify-center w-32 py-4 bg-slate-50">
               <Star size={20} className="text-yellow-500 fill-current mb-2" />
               <span className="font-serif font-bold text-xl text-[#2D1B4E]">{tutor.rating?.toFixed(1) || '—'}</span>
               <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorials List */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-[#2D1B4E] mb-8 border-b border-slate-200 pb-4">Courses by {tutor.name}</h2>
        {tutorTutorials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tutorTutorials.map((tut) => (
              <TutorialCard key={tut.id} tutorial={tut} tutor={tutor} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 text-slate-400 font-light">
            No courses uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorProfilePage;
