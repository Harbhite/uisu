import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, BrainCircuit, CreditCard, FileText, Sparkles, ArrowLeft, Wand2, Zap } from 'lucide-react';
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
    <div className="relative bg-primary text-primary-foreground overflow-hidden border-b-4 border-accent">
      {/* Editorial grid lines */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      {/* Diagonal accent slash */}
      <div className="absolute -top-32 -right-40 w-[28rem] h-[28rem] bg-accent/15 blur-3xl pointer-events-none rotate-12" />
      <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-accent/[0.08] blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 pt-24 pb-0 max-w-6xl relative">
        {/* Back link — minimal, top-left */}
        <button
          onClick={() => navigate('/resources')}
          aria-label="Back to resources"
          className="group flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-primary-foreground/50 hover:text-accent transition-colors mb-6"
        >
          <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
          <span>Resources</span>
        </button>

        {/* Eyebrow strip */}
        <div className="flex items-center gap-3 mb-4">
          <span className="h-px w-8 bg-accent" />
          <Zap size={11} className="text-accent" fill="currentColor" />
          <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-accent">
            {subtitle || 'AI-Powered Suite'}
          </span>
        </div>

        {/* Title row — editorial split layout */}
        <div className="grid grid-cols-12 gap-4 items-end mb-8">
          <div className="col-span-12 md:col-span-9 flex items-end gap-5">
            <div className="hidden md:flex flex-shrink-0 items-center justify-center w-16 h-16 bg-accent text-primary rounded-2xl shadow-lg shadow-accent/30 ring-1 ring-accent/40 -mb-1">
              <Icon size={26} strokeWidth={2.2} />
            </div>
            <h1 className="font-serif text-4xl md:text-6xl leading-[0.95] tracking-tight">
              {title}
              <span className="text-accent">.</span>
            </h1>
          </div>
          {rightContent && (
            <div className="col-span-12 md:col-span-3 flex md:justify-end">{rightContent}</div>
          )}
        </div>

        {/* Underline rule */}
        <div className="h-px bg-primary-foreground/10 mb-3" />

        {/* Tool tabs — newspaper section nav */}
        <div className="flex gap-0 overflow-x-auto -mx-1 px-1 scrollbar-thin">
          {tools.map((tool) => {
            const ToolIcon = tool.icon;
            const isActive = location.pathname === tool.path;
            return (
              <button
                key={tool.id}
                onClick={() => navigate(tool.path)}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all',
                  isActive
                    ? 'text-accent'
                    : 'text-primary-foreground/55 hover:text-primary-foreground'
                )}
              >
                <ToolIcon size={12} />
                <span>{tool.label}</span>
                {isActive && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 bg-accent" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AIToolsHeader;
