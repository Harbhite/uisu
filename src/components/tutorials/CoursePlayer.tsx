import { useState } from 'react';
import { Tutorial, Module } from '@/lib/tutorials-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, FileText, Lock, ChevronRight, CheckCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface CoursePlayerProps {
  tutorial: Tutorial;
}

const CoursePlayer = ({ tutorial }: CoursePlayerProps) => {
  const [activeModuleId, setActiveModuleId] = useState<string>(tutorial.modules[0]?.id);
  const activeModule = tutorial.modules.find(m => m.id === activeModuleId);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-10rem)] bg-white border border-slate-200 shadow-sm overflow-hidden">
      {/* Sidebar - Module List */}
      <div className="w-full lg:w-96 bg-slate-50 border-r border-slate-200 flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-3">
             <Badge variant="outline" className="text-[10px] h-5 rounded-none border-nobel-gold text-nobel-gold uppercase tracking-wider font-bold">{tutorial.level}</Badge>
             <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{tutorial.modules.length} modules</span>
          </div>
          <h2 className="font-serif font-bold text-ui-blue text-xl leading-tight">{tutorial.title}</h2>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {tutorial.modules.map((module, index) => (
              <button
                key={module.id}
                onClick={() => setActiveModuleId(module.id)}
                className={cn(
                  "w-full flex items-start gap-4 p-5 text-left text-sm transition-all border-b border-slate-100 group relative",
                  activeModuleId === module.id
                    ? "bg-white text-ui-blue"
                    : "hover:bg-slate-100/50 text-slate-600"
                )}
              >
                {activeModuleId === module.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-nobel-gold" />
                )}

                <div className={cn("mt-0.5 shrink-0 transition-colors", activeModuleId === module.id ? "text-nobel-gold" : "text-slate-300 group-hover:text-slate-400")}>
                  {module.type === 'Video' ? <PlayCircle size={18} /> : <FileText size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn("font-bold mb-1 truncate font-serif text-base", activeModuleId === module.id ? "text-ui-blue" : "text-slate-700")}>
                    <span className="text-slate-400 font-sans text-xs mr-2 font-normal">0{index + 1}</span>
                    {module.title}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{module.duration}</div>
                </div>
                {module.isLocked && <Lock size={14} className="text-slate-300 mt-1" />}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden relative">
        {activeModule ? (
          <>
            <div className="flex-1 overflow-y-auto p-8 lg:p-12">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8 pb-8 border-b border-slate-100">
                  <Badge className="mb-6 bg-slate-100 text-slate-600 hover:bg-slate-200 border-none rounded-none text-[10px] uppercase tracking-widest font-bold px-3 py-1">
                    {activeModule.type}
                  </Badge>
                  <h1 className="text-3xl lg:text-4xl font-serif font-bold text-ui-blue mb-2 leading-tight">
                    {activeModule.title}
                  </h1>
                </div>

                {/* Content Renderer */}
                <div className="prose prose-slate prose-lg max-w-none prose-headings:font-serif prose-headings:text-ui-blue prose-a:text-nobel-gold">
                  {activeModule.type === 'Video' ? (
                    <div className="aspect-video bg-black flex items-center justify-center text-white relative group cursor-pointer overflow-hidden border border-slate-900">
                      <div className="absolute inset-0 bg-gradient-to-tr from-ui-blue/20 to-transparent pointer-events-none"></div>
                      <div className="text-center z-10">
                        <div className="w-20 h-20 rounded-full border-2 border-white/30 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:border-nobel-gold group-hover:text-nobel-gold transition-all duration-300 bg-black/20 backdrop-blur-sm">
                           <PlayCircle size={40} className="ml-1" />
                        </div>
                        <p className="font-serif text-xl tracking-wide">Start Lesson</p>
                        <p className="text-sm opacity-50 font-mono mt-2">{activeModule.content}</p>
                      </div>
                    </div>
                  ) : (
                     <div dangerouslySetInnerHTML={{ __html: activeModule.content }} />
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
               <Button variant="outline" size="sm" className="rounded-none border-slate-200 text-slate-500 hover:text-ui-blue hover:border-ui-blue uppercase tracking-widest text-xs font-bold px-6" disabled>Previous</Button>
               <Button className="bg-ui-blue hover:bg-ui-dark text-white gap-3 rounded-none uppercase tracking-widest text-xs font-bold px-8 py-6">
                 Mark Complete <ChevronRight size={14} />
               </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 bg-slate-50">
             <div className="text-center">
               <ArrowLeft size={48} className="mx-auto mb-4 opacity-20" />
               <p className="font-serif text-xl text-slate-400">Select a module to begin</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
