import { useState } from 'react';
import { Tutorial, Module } from '@/lib/tutorials-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, FileText, Lock, ChevronRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface CoursePlayerProps {
  tutorial: Tutorial;
}

const CoursePlayer = ({ tutorial }: CoursePlayerProps) => {
  const [activeModuleId, setActiveModuleId] = useState<string>(tutorial.modules[0]?.id);
  const activeModule = tutorial.modules.find(m => m.id === activeModuleId);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Sidebar - Module List */}
      <div className="w-full lg:w-80 bg-slate-50 border-r border-slate-200 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-800 text-sm line-clamp-2">{tutorial.title}</h2>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] h-5">{tutorial.level}</Badge>
            <span className="text-xs text-slate-500">{tutorial.modules.length} modules</span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {tutorial.modules.map((module, index) => (
              <button
                key={module.id}
                onClick={() => setActiveModuleId(module.id)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 text-left text-sm rounded-lg transition-colors border border-transparent",
                  activeModuleId === module.id
                    ? "bg-white border-slate-200 shadow-sm text-ui-blue"
                    : "hover:bg-slate-100 text-slate-600"
                )}
              >
                <div className="mt-0.5 shrink-0 text-slate-400">
                  {module.type === 'Video' ? <PlayCircle size={16} /> : <FileText size={16} />}
                </div>
                <div className="flex-1">
                  <div className="font-medium mb-1 line-clamp-2">{index + 1}. {module.title}</div>
                  <div className="text-xs text-slate-400">{module.duration}</div>
                </div>
                {module.isLocked && <Lock size={14} className="text-slate-300 mt-1" />}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
        {activeModule ? (
          <>
            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
              <div className="max-w-3xl mx-auto">
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <Badge className="mb-4 bg-slate-100 text-slate-600 hover:bg-slate-200 border-none">
                    {activeModule.type}
                  </Badge>
                  <h1 className="text-2xl lg:text-3xl font-serif text-ui-blue mb-4">
                    {activeModule.title}
                  </h1>
                </div>

                {/* Content Renderer */}
                <div className="prose prose-slate max-w-none">
                  {activeModule.type === 'Video' ? (
                    <div className="aspect-video bg-black rounded-xl flex items-center justify-center text-white">
                      <div className="text-center">
                        <PlayCircle size={64} className="mx-auto mb-4 opacity-80" />
                        <p>Video Player Placeholder</p>
                        <p className="text-sm opacity-50">{activeModule.content}</p>
                      </div>
                    </div>
                  ) : (
                     <div dangerouslySetInnerHTML={{ __html: activeModule.content }} />
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
               <Button variant="outline" size="sm" disabled>Previous</Button>
               <Button className="bg-ui-blue hover:bg-ui-dark text-white gap-2">
                 Mark Complete <ChevronRight size={16} />
               </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            Select a module to begin
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
