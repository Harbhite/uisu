import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTutorial, useEnrollmentStatus, useMarkComplete, useProgress } from '@/hooks/useTutorials';
import { fileStorage } from '@/lib/local-storage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, CheckCircle, PlayCircle, FileText, Lock, Menu, Loader2, Play } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const TutorialDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [userId, setUserId] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  // Data Fetching
  const { data: tutorial, isLoading: loadingTutorial } = useTutorial(id || '');
  const { data: isEnrolled } = useEnrollmentStatus(id || '', userId || undefined);
  const { data: completedModules = [] } = useProgress(id || '', userId || undefined);
  const markComplete = useMarkComplete();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);

  // Set initial active module
  useEffect(() => {
    if (tutorial?.modules?.length && !activeModule) {
      setActiveModule(tutorial.modules[0].id);
    }
  }, [tutorial, activeModule]);

  // Resolve media URL (IndexedDB or External)
  useEffect(() => {
    const loadMedia = async () => {
      if (!activeModule || !tutorial) return;
      const module = tutorial.modules.find(m => m.id === activeModule);
      if (module && module.content) {
        try {
          const url = await fileStorage.getFileUrl(module.content);
          setMediaUrl(url || module.content); // Fallback to raw string if not in IDB
        } catch (e) {
          console.error("Failed to load media", e);
          setMediaUrl(module.content);
        }
      }
    };
    loadMedia();
  }, [activeModule, tutorial]);

  if (loadingTutorial) {
    return <div className="flex justify-center items-center min-h-screen bg-slate-950"><Loader2 className="animate-spin text-purple-500" /></div>;
  }

  if (!tutorial) {
    return <div className="p-8 text-center">Tutorial not found</div>;
  }

  const currentModule = tutorial.modules.find(m => m.id === activeModule);

  // Group modules by section
  const sections: Record<string, typeof tutorial.modules> = {};
  tutorial.modules.forEach(m => {
    const section = m.section_title || 'General';
    if (!sections[section]) sections[section] = [];
    sections[section].push(m);
  });

  const handleModuleSelect = (moduleId: string) => {
    setActiveModule(moduleId);
  };

  const handleMarkComplete = () => {
    if (userId && activeModule) {
      markComplete.mutate({ moduleId: activeModule, tutorialId: tutorial.id, userId });
    }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-100 overflow-hidden font-sans">
      <SEO title={`${tutorial.title} | Learning`} />

      {/* Sidebar Navigation */}
      <div className="w-80 flex-shrink-0 border-r border-slate-800 bg-[#0f172a] flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <Link to="/tutorials/catalog" className="text-xs text-slate-400 hover:text-purple-400 flex items-center gap-2 mb-4 transition-colors">
            <ArrowLeft size={12} /> Back to Catalog
          </Link>
          <h1 className="font-bold text-lg leading-tight text-white">{tutorial.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${(completedModules.length / tutorial.modules.length) * 100}%` }}
                />
            </div>
            <span className="text-[10px] text-slate-400">{Math.round((completedModules.length / tutorial.modules.length) * 100)}% Complete</span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <Accordion type="multiple" defaultValue={Object.keys(sections)} className="w-full">
            {Object.entries(sections).map(([sectionTitle, modules], idx) => (
              <AccordionItem value={sectionTitle} key={idx} className="border-b border-slate-800">
                <AccordionTrigger className="px-4 py-3 text-sm font-semibold hover:no-underline hover:bg-slate-900/50 data-[state=open]:text-purple-400">
                  {sectionTitle}
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-0">
                  {modules.map((module) => {
                    const isCompleted = completedModules.includes(module.id);
                    const isActive = activeModule === module.id;
                    const isLocked = !isEnrolled && idx > 0; // Simple locking logic

                    return (
                      <button
                        key={module.id}
                        disabled={isLocked}
                        onClick={() => handleModuleSelect(module.id)}
                        className={cn(
                          "w-full text-left px-4 py-3 flex items-start gap-3 border-l-2 transition-colors",
                          isActive ? "bg-purple-500/10 border-purple-500" : "border-transparent hover:bg-slate-800/50",
                          isLocked && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="mt-0.5">
                          {isCompleted ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : module.type === 'Video' ? (
                            <PlayCircle size={16} className={isActive ? "text-purple-400" : "text-slate-500"} />
                          ) : (
                            <FileText size={16} className={isActive ? "text-purple-400" : "text-slate-500"} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm leading-snug", isActive ? "text-white" : "text-slate-400")}>
                            {module.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-600 flex items-center gap-1">
                                {module.type === 'Video' ? <Play size={8} /> : <FileText size={8} />}
                                {module.duration || '5 mins'}
                            </span>
                          </div>
                        </div>
                        {isLocked && <Lock size={14} className="text-slate-600" />}
                      </button>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-slate-950">
        <div className="flex-1 overflow-y-auto">
            {currentModule ? (
                <div className="max-w-4xl mx-auto p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">{currentModule.title}</h2>
                        <Button
                            onClick={handleMarkComplete}
                            disabled={completedModules.includes(currentModule.id)}
                            variant={completedModules.includes(currentModule.id) ? "secondary" : "default"}
                            className={cn("rounded-none", !completedModules.includes(currentModule.id) && "bg-green-600 hover:bg-green-700")}
                        >
                            {completedModules.includes(currentModule.id) ? "Completed" : "Mark as Complete"}
                        </Button>
                    </div>

                    <div className="bg-black aspect-video rounded-lg overflow-hidden shadow-2xl border border-slate-800 relative">
                        {currentModule.type === 'Video' && mediaUrl ? (
                            <video
                                src={mediaUrl}
                                controls
                                className="w-full h-full"
                                controlsList="nodownload"
                                onEnded={handleMarkComplete}
                            />
                        ) : currentModule.type === 'Audio' && mediaUrl ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900">
                                <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mb-8 animate-pulse">
                                    <PlayCircle size={64} className="text-purple-500" />
                                </div>
                                <audio src={mediaUrl} controls className="w-full max-w-md" />
                            </div>
                        ) : (
                            <div className="w-full h-full bg-white text-slate-900 p-12 overflow-y-auto">
                                <div className="prose prose-lg max-w-none">
                                    {/* Handle text content or PDF */}
                                    {currentModule.type === 'Text' || currentModule.type === 'Essay' ? (
                                        <div dangerouslySetInnerHTML={{ __html: currentModule.content || '' }} />
                                    ) : (
                                        <p>Content format not supported.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded">
                            <h3 className="font-bold text-purple-400 text-sm uppercase tracking-widest mb-2">About this lesson</h3>
                            <p className="text-slate-400">
                                This module is part of the {currentModule.section_title} section.
                                Complete all modules to earn your certificate.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                    Select a module to begin
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TutorialDetailPage;
