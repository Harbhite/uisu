import { Tutorial, Tutor } from '@/lib/tutorials-data';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, FileText, Mic, BookOpen, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TutorialCardProps {
  tutorial: Tutorial;
  tutor?: Tutor;
  className?: string;
}

const FormatIcon = ({ format }: { format: Tutorial['format'] }) => {
  switch (format) {
    case 'Video': return <PlayCircle size={14} />;
    case 'Audio': return <Mic size={14} />;
    case 'Text': return <FileText size={14} />;
    case 'Essay': return <BookOpen size={14} />;
    default: return <FileText size={14} />;
  }
};

const TutorialCard = ({ tutorial, tutor, className }: TutorialCardProps) => {
  return (
    <Link to={`/tutorials/${tutorial.id}`} className="block h-full">
      <Card className={cn("h-full hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden group rounded-none bg-white hover:border-nobel-gold/50", className)}>
        <div className="relative h-48 bg-slate-100 overflow-hidden">
           {/* Placeholder Gradient or Image */}
           <div className={cn(
             "absolute inset-0 bg-gradient-to-br transition-transform duration-700 group-hover:scale-105",
             tutorial.format === 'Video' ? "from-ui-blue to-slate-900" :
             tutorial.format === 'Audio' ? "from-purple-900 to-slate-900" :
             "from-slate-800 to-black"
           )} />

           <div className="absolute top-0 left-0 p-3 w-full flex justify-between items-start">
             <Badge variant="secondary" className="bg-black/50 hover:bg-black/70 text-white border border-white/10 backdrop-blur-md gap-1 rounded-none text-[10px] uppercase tracking-wider font-bold">
               <FormatIcon format={tutorial.format} />
               {tutorial.format}
             </Badge>

              <Badge variant="outline" className="text-white border-white/20 bg-black/20 backdrop-blur-sm rounded-none text-[10px] uppercase tracking-wider font-bold">
                {tutorial.level}
              </Badge>
           </div>
        </div>

        <CardHeader className="p-6 pb-2">
          <h3 className="font-serif text-xl font-bold text-ui-blue leading-tight line-clamp-2 group-hover:text-nobel-gold transition-colors">
            {tutorial.title}
          </h3>
          {tutor && (
            <div className="flex items-center gap-2 mt-3">
              <div className="w-6 h-6 bg-slate-200 border border-slate-100 overflow-hidden">
                <img src={tutor.avatar} alt={tutor.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{tutor.name}</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6 pt-2 pb-4">
          <p className="text-sm text-slate-500 line-clamp-2 font-light leading-relaxed">{tutorial.description}</p>
        </CardContent>

        <CardFooter className="p-6 pt-0 flex justify-between items-center text-xs text-slate-400 border-t border-slate-50 mt-auto">
          <div className="flex items-center gap-1 mt-4">
            <Star size={12} className="text-nobel-gold fill-current" />
            <span className="font-bold text-slate-700">{tutorial.rating}</span>
            <span className="mx-2 text-slate-300">|</span>
            <span>{tutorial.studentsCount} students</span>
          </div>
          <div className="mt-4 font-mono text-[10px] uppercase">
            {tutorial.modules.length} modules
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default TutorialCard;
