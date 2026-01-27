import { Tutorial, Tutor } from '@/lib/tutorials-data';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, FileText, Mic, BookOpen, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TutorialCardProps {
  tutorial: Tutorial;
  tutor?: Tutor;
  className?: string;
}

const FormatIcon = ({ format }: { format: Tutorial['format'] }) => {
  switch (format) {
    case 'Video': return <PlayCircle size={16} />;
    case 'Audio': return <Mic size={16} />;
    case 'Text': return <FileText size={16} />;
    case 'Essay': return <BookOpen size={16} />;
    default: return <FileText size={16} />;
  }
};

const TutorialCard = ({ tutorial, tutor, className }: TutorialCardProps) => {
  return (
    <Link to={`/tutorials/${tutorial.id}`} className="block h-full">
      <Card className={cn("h-full hover:shadow-lg transition-all duration-300 border-slate-100 overflow-hidden group rounded-xl", className)}>
        <div className="relative h-40 bg-slate-100 overflow-hidden">
           {/* Placeholder Gradient or Image */}
           <div className={cn(
             "absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-105",
             tutorial.format === 'Video' ? "from-red-900/80 to-slate-900" :
             tutorial.format === 'Audio' ? "from-purple-900/80 to-slate-900" :
             "from-ui-blue/80 to-slate-900"
           )} />

           <div className="absolute top-3 left-3">
             <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm gap-1">
               <FormatIcon format={tutorial.format} />
               {tutorial.format}
             </Badge>
           </div>

           <div className="absolute bottom-3 right-3">
              <Badge variant="outline" className="text-white border-white/20 bg-black/20 backdrop-blur-sm">
                {tutorial.level}
              </Badge>
           </div>
        </div>

        <CardHeader className="p-5 pb-2">
          <h3 className="font-serif text-xl font-bold text-ui-blue leading-tight line-clamp-2 group-hover:text-nobel-gold transition-colors">
            {tutorial.title}
          </h3>
          {tutor && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden">
                <img src={tutor.avatar} alt={tutor.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs text-slate-500 font-medium">{tutor.name}</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-5 pt-2 pb-4">
          <p className="text-sm text-slate-500 line-clamp-2">{tutorial.description}</p>
        </CardContent>

        <CardFooter className="p-5 pt-0 flex justify-between items-center text-xs text-slate-400 border-t border-slate-50 mt-auto">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-nobel-gold fill-current" />
            <span>{tutorial.rating}</span>
            <span className="mx-1">•</span>
            <span>{tutorial.studentsCount} students</span>
          </div>
          <div>
            {tutorial.modules.length} modules
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default TutorialCard;
