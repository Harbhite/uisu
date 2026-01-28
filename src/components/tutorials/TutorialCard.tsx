import { Tutorial, Tutor } from '@/lib/tutorials-data';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Mic, FileText, BookOpen, Clock, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface TutorialCardProps {
  tutorial: Tutorial;
  tutor?: Tutor; // Make it optional to prevent crashes if not found, though logic depends on it
  className?: string;
}

const formatIcon = {
  Video: PlayCircle,
  Audio: Mic,
  Text: FileText,
  Essay: BookOpen,
};

const TutorialCard = ({ tutorial, tutor, className }: TutorialCardProps) => {
  const Icon = formatIcon[tutorial.format];

  // Fallback for tutor name if undefined (though it should be passed)
  const tutorName = tutor?.name || "Unknown Tutor";

  return (
    <Link to={`/tutorials/${tutorial.id}`}>
      <Card className={cn(
        "group h-full flex flex-col rounded-none transition-all duration-500 overflow-hidden",
        "bg-white backdrop-blur-md border border-purple-100 hover:border-purple-400 shadow-sm hover:shadow-2xl hover:-translate-y-1",
        className
      )}>
        {/* Thumbnail Section with Overlay */}
        <div className="relative aspect-video overflow-hidden bg-[#2D1B4E]">
          {/* Placeholder for real image or fallback */}
          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
             <img
               src={tutorial.coverImage}
               alt={tutorial.title}
               className="w-full h-full object-cover opacity-80 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
               onError={(e) => { e.currentTarget.style.display = 'none'; }}
             />
             <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <Icon size={48} opacity={0.2} />
             </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-[#2D1B4E] via-transparent to-transparent opacity-90" />

          <Badge className="absolute top-4 left-4 bg-[#6E5494] text-white border border-white/10 rounded-none uppercase tracking-widest text-[10px] font-bold px-3 py-1.5 shadow-lg">
            <Icon size={12} className="mr-2 text-white" />
            {tutorial.format}
          </Badge>

          <Badge className="absolute top-4 right-4 bg-transparent text-white border border-white/30 rounded-none uppercase tracking-widest text-[10px] font-bold px-2 py-1 backdrop-blur-md">
            {tutorial.level}
          </Badge>

          {/* Conical Gradient Play Button Overlay on Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
             <div className="w-16 h-16 rounded-full bg-[conic-gradient(from_90deg_at_50%_50%,_var(--tw-gradient-stops))] from-purple-500 via-white to-purple-500 p-[1px] animate-spin-slow">
                <div className="w-full h-full bg-[#2D1B4E] rounded-full flex items-center justify-center">
                   <Icon size={32} className="text-white fill-current" />
                </div>
             </div>
          </div>
        </div>

        <CardHeader className="p-6 pb-2 space-y-2 flex-1 relative">
           {/* Decorative Top Border Gradient */}
           <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

           <div className="flex items-center gap-2 text-purple-600 text-xs font-bold tracking-widest uppercase mb-1">
              <span className="w-2 h-2 bg-purple-600 rounded-full inline-block" />
              {tutorName}
           </div>
           <h3 className="font-serif text-xl font-bold text-[#2D1B4E] leading-tight group-hover:text-purple-600 transition-colors line-clamp-2">
             {tutorial.title}
           </h3>
           <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed font-light mt-2">
             {tutorial.description}
           </p>
        </CardHeader>

        <CardFooter className="p-6 pt-4 border-t border-purple-100/50 flex items-center justify-between text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 hover:text-[#6E5494] transition-colors">
              <Clock size={14} className="text-purple-500" />
              {/* Calculate duration roughly or from modules if needed, or use mock */}
              {tutorial.modules.length * 10} mins
            </span>
            <span className="flex items-center gap-1.5 hover:text-[#6E5494] transition-colors">
               <BarChart size={14} className="text-purple-500" />
               {tutorial.studentsCount}
            </span>
          </div>
          <div className="font-mono text-[10px] uppercase text-slate-300 group-hover:text-[#6E5494] transition-colors">
            {tutorial.modules.length} modules
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default TutorialCard;
