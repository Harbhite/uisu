import { useState, useRef, useEffect } from 'react';
import { Tutorial, Module } from '@/lib/tutorials-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, FileText, Lock, ChevronRight, Mic, BookOpen, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import CustomMediaPlayer from './CustomMediaPlayer';
import TutorialReader from './TutorialReader';

interface CoursePlayerProps {
  tutorial: Tutorial;
}

const CoursePlayer = ({ tutorial }: CoursePlayerProps) => {
  const [activeModuleId, setActiveModuleId] = useState<string>(tutorial.modules[0]?.id);
  const activeModule = tutorial.modules.find(m => m.id === activeModuleId);

  // Mock content for reader if module content is short/missing
  const getFullContent = (mod: Module) => {
    if (mod.content.length > 100) return mod.content;
    return `
      <p>This is a comprehensive tutorial module covering <strong>${mod.title}</strong>.</p>
      <h3>Introduction</h3>
      <p>In this session, we will explore the fundamental concepts necessary for mastering this topic. Please pay close attention to the details provided.</p>
      <h3>Key Concepts</h3>
      <ul>
        <li>Concept A: Understanding the basics.</li>
        <li>Concept B: Advanced application.</li>
        <li>Concept C: Real-world examples.</li>
      </ul>
      <p>Ensure you have reviewed the previous modules before proceeding.</p>
      <blockquote>"Learning is a treasure that will follow its owner everywhere."</blockquote>
      <p>${mod.content}</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    `;
  };

  const isMedia = activeModule?.type === 'Video' || activeModule?.type === 'Audio';

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] bg-purple-50 border border-purple-100/50 shadow-2xl overflow-hidden relative">
       {/* Sidebar - Module List */}
       <div className="w-full lg:w-80 bg-[#1a0b2e] border-r border-white/5 flex flex-col h-full shrink-0 relative z-20">
        <div className="p-6 border-b border-white/5 bg-[#1a0b2e] sticky top-0 z-20 text-white">
          <div className="flex items-center gap-2 mb-3">
             <Badge variant="outline" className="text-[10px] h-5 rounded-none border-purple-400 text-purple-400 uppercase tracking-wider font-bold bg-purple-400/10">{tutorial.level}</Badge>
             <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{tutorial.modules.length} modules</span>
          </div>
          <h2 className="font-serif font-bold text-white text-lg leading-tight">{tutorial.title}</h2>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {tutorial.modules.map((module, index) => (
              <button
                key={module.id}
                onClick={() => setActiveModuleId(module.id)}
                className={cn(
                  "w-full flex items-start gap-4 p-5 text-left text-sm transition-all border-b border-white/5 group relative overflow-hidden",
                  activeModuleId === module.id
                    ? "bg-purple-900/40 text-white"
                    : "hover:bg-white/5 text-slate-400"
                )}
              >
                {activeModuleId === module.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />
                )}

                <div className={cn("mt-0.5 shrink-0 transition-colors", activeModuleId === module.id ? "text-purple-400" : "text-slate-500 group-hover:text-slate-300")}>
                  {module.type === 'Video' ? <PlayCircle size={18} /> :
                   module.type === 'Audio' ? <Mic size={18} /> : <FileText size={18} />}
                </div>
                <div className="flex-1 min-w-0 relative z-10">
                  <div className={cn("font-bold mb-1 truncate font-serif text-base transition-colors", activeModuleId === module.id ? "text-purple-100" : "text-slate-400")}>
                    <span className="text-slate-600 font-sans text-xs mr-2 font-normal opacity-50">0{index + 1}</span>
                    {module.title}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold opacity-70">{module.duration}</div>
                </div>
                {module.isLocked && <Lock size={14} className="text-slate-600 mt-1" />}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative z-10">
        {activeModule ? (
          <>
            {isMedia ? (
              // Media Layout
              <div className="flex-1 flex flex-col bg-black">
                 <div className="flex-1 flex items-center justify-center bg-black relative">
                   <CustomMediaPlayer
                     src={activeModule.content.includes('http') ? activeModule.content : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} // Fallback for mock data
                     type={activeModule.type.toLowerCase() as 'video' | 'audio'}
                     poster={tutorial.coverImage}
                     className={activeModule.type === 'Audio' ? "w-full max-w-2xl px-8" : "w-full h-full"}
                   />
                 </div>

                 <div className="p-6 border-t border-white/10 bg-[#1a0b2e] text-white flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">{activeModule.title}</h3>
                      <p className="text-slate-400 text-sm">Now Playing</p>
                    </div>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-none uppercase tracking-widest text-xs font-bold px-8">
                       Next Module <ChevronRight size={14} className="ml-2" />
                    </Button>
                 </div>
              </div>
            ) : (
              // Reader Layout
              <div className="flex-1 overflow-y-auto relative scroll-smooth bg-white">
                 <TutorialReader
                   title={activeModule.title}
                   content={getFullContent(activeModule)}
                   author="The Union Tutors"
                   readTime={activeModule.duration}
                 />

                 <div className="p-8 pb-16 flex justify-center">
                    <Button className="bg-[#2D1B4E] hover:bg-purple-900 text-white rounded-none uppercase tracking-widest text-xs font-bold px-12 py-6 shadow-xl">
                       Complete & Continue <ChevronRight size={14} className="ml-2" />
                    </Button>
                 </div>
              </div>
            )}
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
