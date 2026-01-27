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
      <Card className={cn("hover:border-nobel-gold transition-colors duration-300 cursor-pointer h-full", className)}>
        <CardHeader className="flex flex-row items-start gap-4 p-5">
          <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden border-2 border-slate-100 flex-shrink-0">
            <img src={tutor.avatar} alt={tutor.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-ui-blue truncate">{tutor.name}</h3>
              {tutor.tier === 'Official' && <Badge className="bg-nobel-gold hover:bg-nobel-gold text-white text-[10px] h-5 px-1.5">OFFICIAL</Badge>}
              {tutor.tier === 'Verified' && <CheckCircle2 size={16} className="text-ui-blue" />}
            </div>
            <p className="text-xs text-slate-500 line-clamp-2">{tutor.bio}</p>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg text-xs text-slate-500">
             <div className="text-center">
               <div className="font-bold text-slate-700 mb-0.5 flex items-center justify-center gap-1">
                 <BookOpen size={12} /> {tutor.metrics.courses}
               </div>
               <span>Courses</span>
             </div>
             <div className="w-px h-6 bg-slate-200" />
             <div className="text-center">
               <div className="font-bold text-slate-700 mb-0.5 flex items-center justify-center gap-1">
                 <Users size={12} /> {tutor.metrics.students}
               </div>
               <span>Students</span>
             </div>
             <div className="w-px h-6 bg-slate-200" />
             <div className="text-center">
               <div className="font-bold text-slate-700 mb-0.5 flex items-center justify-center gap-1">
                 <Star size={12} className="text-nobel-gold fill-current" /> {tutor.metrics.rating}
               </div>
               <span>Rating</span>
             </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TutorCard;
