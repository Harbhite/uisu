import { Tutor } from '@/lib/tutorials-data';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Users, BookOpen, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface TutorCardProps {
  tutor: Tutor;
  className?: string;
}

const TutorCard = ({ tutor, className }: TutorCardProps) => {
  return (
    <Link to={`/tutorials/tutor/${tutor.id}`}>
      <Card className={cn("hover:border-nobel-gold transition-colors duration-300 cursor-pointer h-full rounded-none group bg-white border-slate-200", className)}>
        <CardHeader className="flex flex-row items-start gap-4 p-6">
          <div className="w-16 h-16 bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden">
            <img src={tutor.avatar} alt={tutor.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-serif font-bold text-lg text-ui-blue truncate group-hover:text-nobel-gold transition-colors">{tutor.name}</h3>
              {tutor.tier === 'Official' && <Badge className="bg-nobel-gold hover:bg-nobel-gold text-ui-blue text-[9px] h-5 px-1.5 rounded-none font-bold tracking-wider">OFFICIAL</Badge>}
              {tutor.tier === 'Verified' && <CheckCircle2 size={16} className="text-ui-blue" />}
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-light">{tutor.bio}</p>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="flex items-center justify-between bg-slate-50 p-4 border border-slate-100 text-xs text-slate-500">
             <div className="text-center">
               <div className="font-bold text-slate-700 mb-1 flex items-center justify-center gap-1 font-mono">
                 <BookOpen size={12} /> {tutor.metrics.courses}
               </div>
               <span className="uppercase tracking-wider text-[9px]">Courses</span>
             </div>
             <div className="w-px h-8 bg-slate-200" />
             <div className="text-center">
               <div className="font-bold text-slate-700 mb-1 flex items-center justify-center gap-1 font-mono">
                 <Users size={12} /> {tutor.metrics.students}
               </div>
               <span className="uppercase tracking-wider text-[9px]">Students</span>
             </div>
             <div className="w-px h-8 bg-slate-200" />
             <div className="text-center">
               <div className="font-bold text-slate-700 mb-1 flex items-center justify-center gap-1 font-mono">
                 <Star size={12} className="text-nobel-gold fill-current" /> {tutor.metrics.rating}
               </div>
               <span className="uppercase tracking-wider text-[9px]">Rating</span>
             </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TutorCard;
