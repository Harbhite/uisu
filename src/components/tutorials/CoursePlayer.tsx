import { useState, useCallback } from 'react';
import { DBTutorial, DBModule } from '@/hooks/useTutorials';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { PlayCircle, FileText, Lock, ChevronRight, Mic, BookOpen, ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, StickyNote, Save, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import CustomMediaPlayer from './CustomMediaPlayer';
import TutorialReader from './TutorialReader';
import { useTutorialProgress, useMarkModuleComplete } from '@/hooks/useTutorialProgress';
import { useTutorialNote, useSaveNote } from '@/hooks/useTutorialNotes';
import { useAuth } from '@/contexts/AuthContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

interface CoursePlayerProps {
  tutorial: DBTutorial & { modules: DBModule[] };
  tutorName?: string;
}

const padIndex = (i: number) => String(i + 1).padStart(2, '0');

const CoursePlayer = ({ tutorial, tutorName = 'The Union Tutors' }: CoursePlayerProps) => {
  const [activeModuleId, setActiveModuleId] = useState<string | undefined>(tutorial.modules[0]?.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  const activeModule = tutorial.modules.find(m => m.id === activeModuleId);
  const { user } = useAuth();
  const { data: progressData = [] } = useTutorialProgress(tutorial.id);
  const markComplete = useMarkModuleComplete();
  const { data: noteData } = useTutorialNote(activeModuleId || '');
  const saveNote = useSaveNote();

  const completedModuleIds = new Set(progressData.map((p: any) => p.module_id));
  const isMedia = activeModule?.type === 'Video' || activeModule?.type === 'Audio';

  const getVideoSrc = (content: string | null): string => {
    if (!content) return '';
    if (content.includes('youtube.com/embed')) return content;
    if (content.startsWith('http')) return content;
    return '';
  };

  const isYouTube = (content: string | null): boolean => {
    return !!content && content.includes('youtube.com/embed');
  };

  const handleNextModule = () => {
    if (!activeModuleId) return;
    const currentIndex = tutorial.modules.findIndex(m => m.id === activeModuleId);
    // Mark current module as complete
    if (user) {
      markComplete.mutate({ tutorialId: tutorial.id, moduleId: activeModuleId });
    }
    if (currentIndex < tutorial.modules.length - 1) {
      setActiveModuleId(tutorial.modules[currentIndex + 1].id);
      setSidebarOpen(false);
      setNoteText('');
    } else {
      toast.success('🎉 You completed all modules!');
    }
  };

  const handleSelectModule = (module: DBModule) => {
    if (!module.is_locked) {
      setActiveModuleId(module.id);
      setSidebarOpen(false);
      setNoteText('');
    }
  };

  const handleSaveNote = () => {
    if (!activeModuleId || !user) return;
    saveNote.mutate({ moduleId: activeModuleId, tutorialId: tutorial.id, content: noteText });
    toast.success('Note saved');
  };

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

  const safeName = (title: string) => title.replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 60);

  const exportPdf = () => {
    if (!activeModule) return;
    const plain = stripHtml(activeModule.content || '');
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(activeModule.title, 20, 20);
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(plain, 170);
    doc.text(lines, 20, 35);
    doc.save(`${safeName(activeModule.title)}.pdf`);
  };

  const exportDocx = async () => {
    if (!activeModule) return;
    const plain = stripHtml(activeModule.content || '');
    const paragraphs = plain.split('\n').filter(Boolean).map(
      line => new Paragraph({ children: [new TextRun({ text: line, size: 22 })] })
    );
    const docFile = new Document({
      sections: [{
        children: [
          new Paragraph({ text: activeModule.title, heading: HeadingLevel.HEADING_1 }),
          ...paragraphs,
        ],
      }],
    });
    const blob = await Packer.toBlob(docFile);
    saveAs(blob, `${safeName(activeModule.title)}.docx`);
  };

  const exportTxt = () => {
    if (!activeModule) return;
    const plain = stripHtml(activeModule.content || '');
    const blob = new Blob([`${activeModule.title}\n\n${plain}`], { type: 'text/plain' });
    saveAs(blob, `${safeName(activeModule.title)}.txt`);
  };

  const completionPercent = tutorial.modules.length > 0
    ? Math.round((completedModuleIds.size / tutorial.modules.length) * 100)
    : 0;

  const renderModuleButton = (module: DBModule, index: number, isMobile = false) => (
    <button
      key={module.id}
      onClick={() => handleSelectModule(module)}
      className={cn(
        "w-full flex items-start gap-3 text-left text-sm transition-all border-b border-white/5",
        isMobile ? "p-4" : "p-5 gap-4 group relative overflow-hidden",
        module.is_locked && "opacity-50 cursor-not-allowed",
        activeModuleId === module.id
          ? (isMobile ? "bg-purple-900/40 text-white" : "bg-purple-900/40 text-white")
          : (isMobile ? "text-slate-400" : "hover:bg-white/5 text-slate-400")
      )}
    >
      {!isMobile && activeModuleId === module.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />}
      <div className={cn("mt-0.5 shrink-0", activeModuleId === module.id ? "text-purple-400" : "text-slate-500")}>
        {completedModuleIds.has(module.id) ? (
          <CheckCircle2 size={isMobile ? 16 : 18} className="text-green-400" />
        ) : module.type === 'Video' ? (
          <PlayCircle size={isMobile ? 16 : 18} />
        ) : module.type === 'Audio' ? (
          <Mic size={isMobile ? 16 : 18} />
        ) : (
          <FileText size={isMobile ? 16 : 18} />
        )}
      </div>
      <div className={cn("flex-1 min-w-0", !isMobile && "relative z-10")}>
        <div className={cn(
          "font-bold truncate",
          isMobile ? "text-sm" : "mb-1 font-serif text-base transition-colors",
          activeModuleId === module.id ? "text-purple-100" : "text-slate-400"
        )}>
          <span className={cn("text-slate-600 text-xs mr-1.5 font-normal opacity-50", !isMobile && "font-sans mr-2")}>{padIndex(index)}</span>
          {module.title}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold opacity-70">{module.duration}</div>
      </div>
      {module.is_locked && <Lock size={14} className="text-slate-600 mt-1" />}
    </button>
  );

  return (
    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-6rem)] bg-purple-50 border border-purple-100/50 shadow-2xl overflow-hidden relative">
      {/* Mobile Module Selector */}
      <div className="lg:hidden bg-[#1a0b2e] text-white">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full p-4 flex items-center justify-between border-b border-white/5"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] h-5 rounded-none border-purple-400 text-purple-400 uppercase tracking-wider font-bold bg-purple-400/10">{tutorial.level}</Badge>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{tutorial.modules.length} modules</span>
              {completionPercent > 0 && <span className="text-[10px] text-green-400 font-bold">{completionPercent}%</span>}
            </div>
            <h2 className="font-serif font-bold text-sm leading-tight text-left">{activeModule?.title || tutorial.title}</h2>
          </div>
          {sidebarOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {sidebarOpen && (
          <div className="max-h-64 overflow-y-auto">
            {tutorial.modules.map((module, index) => renderModuleButton(module, index, true))}
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-80 bg-[#1a0b2e] border-r border-white/5 flex-col h-full shrink-0 relative z-20">
        <div className="p-6 border-b border-white/5 bg-[#1a0b2e] sticky top-0 z-20 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-[10px] h-5 rounded-none border-purple-400 text-purple-400 uppercase tracking-wider font-bold bg-purple-400/10">{tutorial.level}</Badge>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{tutorial.modules.length} modules</span>
          </div>
          <h2 className="font-serif font-bold text-white text-lg leading-tight">{tutorial.title}</h2>
          {completionPercent > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-purple-300 mb-1">
                <span>Progress</span>
                <span>{completionPercent}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 transition-all" style={{ width: `${completionPercent}%` }} />
              </div>
            </div>
          )}
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {tutorial.modules.map((module, index) => renderModuleButton(module, index, false))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative z-10 min-h-[50vh] lg:min-h-0">
        {activeModule ? (
          <>
            {isMedia ? (
              <div className="flex-1 flex flex-col bg-black">
                <div className="flex-1 flex items-center justify-center bg-black relative aspect-video lg:aspect-auto">
                  {isYouTube(activeModule.content) ? (
                    <iframe
                      src={getVideoSrc(activeModule.content)}
                      title={activeModule.title}
                      className="w-full h-full absolute inset-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <CustomMediaPlayer
                      src={getVideoSrc(activeModule.content) || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                      type={activeModule.type.toLowerCase() as 'video' | 'audio'}
                      poster={tutorial.cover_image || undefined}
                      className={activeModule.type === 'Audio' ? "w-full max-w-2xl px-8" : "w-full h-full"}
                    />
                  )}
                </div>
                <div className="p-4 lg:p-6 border-t border-white/10 bg-[#1a0b2e] text-white flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-base lg:text-lg">{activeModule.title}</h3>
                    <p className="text-slate-400 text-sm">Now Playing</p>
                  </div>
                  <Button onClick={handleNextModule} className="bg-purple-600 hover:bg-purple-700 text-white rounded-none uppercase tracking-widest text-xs font-bold px-4 lg:px-8">
                    {tutorial.modules.findIndex(m => m.id === activeModuleId) === tutorial.modules.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto relative scroll-smooth bg-white" id="tutorial-reader-scroll">
                <TutorialReader
                  title={activeModule.title}
                  content={activeModule.content || ''}
                  author={tutorName}
                  readTime={activeModule.duration || '5 min read'}
                  updatedAt={tutorial.created_at || undefined}
                  scrollContainerId="tutorial-reader-scroll"
                />

                {/* Export buttons for text/essay */}
                <div className="flex justify-center gap-3 px-8 py-4">
                  <Button variant="outline" size="sm" onClick={exportTxt} className="rounded-none text-xs uppercase tracking-widest gap-2">
                    <Download size={12} /> TXT
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportPdf} className="rounded-none text-xs uppercase tracking-widest gap-2">
                    <Download size={12} /> PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportDocx} className="rounded-none text-xs uppercase tracking-widest gap-2">
                    <Download size={12} /> DOCX
                  </Button>
                </div>

                <div className="p-8 pb-16 flex justify-center">
                  <Button onClick={handleNextModule} className="bg-[#2D1B4E] hover:bg-purple-900 text-white rounded-none uppercase tracking-widest text-xs font-bold px-12 py-6 shadow-xl">
                    {tutorial.modules.findIndex(m => m.id === activeModuleId) === tutorial.modules.length - 1 ? 'Finish Course' : 'Complete & Continue'} <ChevronRight size={14} className="ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Notes Panel */}
            {user && (
              <Collapsible open={notesOpen} onOpenChange={setNotesOpen}>
                <CollapsibleTrigger asChild>
                  <button className="w-full p-3 bg-purple-50 border-t border-purple-100 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-purple-600 hover:bg-purple-100 transition-colors">
                    <span className="flex items-center gap-2"><StickyNote size={14} /> My Notes</span>
                    {notesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 bg-purple-50 border-t border-purple-100">
                    <Textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Take notes for this module..."
                      className="rounded-none bg-white border-purple-200 min-h-[100px] text-sm"
                    />
                    <Button onClick={handleSaveNote} size="sm" className="mt-2 rounded-none bg-purple-600 hover:bg-purple-700 text-xs uppercase tracking-widest gap-2" disabled={saveNote.isPending}>
                      <Save size={12} /> Save Note
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 bg-slate-50 min-h-[40vh]">
            <div className="text-center">
              <ArrowLeft size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-serif text-xl text-slate-400">
                {tutorial.modules.length === 0 ? 'No modules available yet' : 'Select a module to begin'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
