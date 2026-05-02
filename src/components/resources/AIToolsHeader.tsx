import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, BrainCircuit, CreditCard, FileText, Sparkles, ArrowLeft, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AITool {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
}

const tools: AITool[] = [
  { id: 'studybuddy', label: 'StudyBuddy', path: '/resources/study-buddy', icon: Brain },
  { id: 'quiz', label: 'AI Quiz', path: '/resources/ai-quiz', icon: BrainCircuit },
  { id: 'flashcards', label: 'Flashcards', path: '/resources/flashcards', icon: CreditCard },
  { id: 'studyaide', label: 'Study Aide', path: '/resources/study-aide', icon: FileText },
  { id: 'essay', label: 'Essay Check', path: '/resources/essay-check', icon: Wand2 },
];

interface AIToolsHeaderProps {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  /** Extra content to render on the right side of the header */
  rightContent?: React.ReactNode;
}

const AIToolsHeader: React.FC<AIToolsHeaderProps> = ({ title, subtitle, icon: Icon, rightContent }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="relative bg-primary text-primary-foreground overflow-hidden">
      {/* Decorative background layers */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(circle_at_15%_20%,#fff_1px,transparent_1px)] bg-[size:22px_22px]" />
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 pt-24 pb-5 max-w-6xl relative">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4 min-w-0">
            <button
              onClick={() => navigate('/resources')}
              aria-label="Back to resources"
              className="mt-1 p-2.5 rounded-2xl border border-primary-foreground/20 hover:border-accent hover:bg-primary-foreground/5 transition-all"
            >
              <ArrowLeft size={14} />
            </button>

            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 mb-3">
                <Sparkles size={11} className="text-accent" fill="currentColor" />
                <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-accent">
                  {subtitle || 'AI-Powered'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex p-3 rounded-2xl bg-accent text-primary shadow-lg shadow-accent/20 ring-1 ring-accent/40">
                  <Icon size={20} />
                </div>
                <h1 className="font-serif text-3xl md:text-5xl leading-[1] tracking-tight">
                  {title}
                </h1>
              </div>
            </div>
          </div>

          {rightContent && <div className="flex-shrink-0">{rightContent}</div>}
        </div>

        {/* Quick nav tabs — pill style */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
          {tools.map((tool) => {
            const ToolIcon = tool.icon;
            const isActive = location.pathname === tool.path;
            return (
              <button
                key={tool.id}
                onClick={() => navigate(tool.path)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full whitespace-nowrap transition-all border',
                  isActive
                    ? 'bg-accent text-primary border-accent shadow-md shadow-accent/20'
                    : 'text-primary-foreground/70 border-primary-foreground/15 hover:text-accent hover:border-accent/40 hover:bg-primary-foreground/5'
                )}
              >
                <ToolIcon size={12} />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Soft fade into page */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
    </div>
  );
};

export default AIToolsHeader;
