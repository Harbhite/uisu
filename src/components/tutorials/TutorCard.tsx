import { DBTutor } from '@/hooks/useTutorials';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Users, BookOpen, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface TutorCardProps {
  tutor: DBTutor;
  className?: string;
}

const TutorCard = ({ tutor, className }: TutorCardProps) => {
  return (
    <Link to={`/tutorials/tutor/${tutor.id}`}>
      <Card className={cn(
        "group h-full rounded-none transition-all duration-300 cursor-pointer overflow-hidden",
        "bg-white backdrop-blur-md border border-purple-100 hover:border-purple-400 shadow-sm hover:shadow-xl",
        className
      )}>
        <CardHeader className="flex flex-row items-start gap-4 p-6 relative">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-200 to-transparent group-hover:via-purple-500 transition-all duration-500" />

          <div className="relative w-16 h-16 flex-shrink-0">
             <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,_var(--tw-gradient-stops))] from-purple-500/0 via-purple-500/50 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-spin-slow rounded-none" />
             <div className="absolute inset-[1px] bg-white p-0.5 overflow-hidden border border-purple-100 group-hover:border-transparent transition-colors">
               <img src={tutor.avatar || '/placeholder.svg'} alt={tutor.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
             </div>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-serif font-bold text-lg text-[#2D1B4E] truncate group-hover:text-purple-600 transition-colors">{tutor.name}</h3>
              {tutor.tier === 'Official' && <Badge className="bg-[#6E5494] hover:bg-[#5a437a] text-white text-[9px] h-5 px-1.5 rounded-none font-bold tracking-wider shadow-sm">OFFICIAL</Badge>}
              {tutor.tier === 'Verified' && <CheckCircle2 size={16} className="text-purple-500" />}
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-light">{tutor.bio}</p>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <div className="flex items-center justify-between bg-purple-50/50 backdrop-blur-sm p-4 border border-purple-100/50 text-xs text-slate-500 group-hover:bg-purple-50 transition-colors">
             <div className="text-center group-hover:transform group-hover:scale-105 transition-transform">
               <div className="font-bold text-slate-700 mb-1 flex items-center justify-center gap-1 font-mono">
                 <BookOpen size={12} className="text-purple-500" /> {tutor.courses_count || 0}
               </div>
               <span className="uppercase tracking-wider text-[9px] opacity-70">Courses</span>
             </div>
             <div className="w-px h-8 bg-purple-200/50" />
             <div className="text-center group-hover:transform group-hover:scale-105 transition-transform delay-75">
               <div className="font-bold text-slate-700 mb-1 flex items-center justify-center gap-1 font-mono">
                 <Users size={12} className="text-purple-500" /> {tutor.students_count || 0}
               </div>
               <span className="uppercase tracking-wider text-[9px] opacity-70">Students</span>
             </div>
             <div className="w-px h-8 bg-purple-200/50" />
             <div className="text-center group-hover:transform group-hover:scale-105 transition-transform delay-150">
               <div className="font-bold text-slate-700 mb-1 flex items-center justify-center gap-1 font-mono">
                 <Star size={12} className="text-purple-500 fill-current" /> {tutor.rating?.toFixed(1) || '—'}
               </div>
               <span className="uppercase tracking-wider text-[9px] opacity-70">Rating</span>
             </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TutorCard;
