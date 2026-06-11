import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, BrainCircuit, CreditCard, FileText, ArrowLeft, Wand2, Zap } from 'lucide-react';
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
    <div className="relative bg-primary text-primary-foreground overflow-hidden border-b border-accent/20">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Smaller decorative floating shapes */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-24 -left-12 w-48 h-48 bg-accent/[0.05] blur-2xl pointer-events-none rounded-full" />

      <div className="container mx-auto px-4 pt-16 pb-0 max-w-6xl relative">
        {/* Compact layout: Back link and Eyebrow in one row */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/resources')}
            className="group flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-primary-foreground/40 hover:text-accent transition-all"
          >
            <ArrowLeft size={10} className="transition-transform group-hover:-translate-x-1" />
            <span>Resources</span>
          </button>
          
          <div className="flex items-center gap-2">
            <Zap size={10} className="text-accent" fill="currentColor" />
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-accent/80">
              {subtitle || 'AI-Powered'}
            </span>
          </div>
        </div>

        {/* Title row — More compact */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-accent text-primary rounded-xl shadow-md shadow-accent/20 ring-1 ring-accent/30 overflow-hidden group">
              <Icon size={20} strokeWidth={2.5} className="relative z-10" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl tracking-tight">
              {title}<span className="text-accent">.</span>
            </h1>
          </div>
          
          {rightContent && (
            <div className="flex items-center">{rightContent}</div>
          )}
        </div>

        {/* Tool tabs — Slimmer design */}
        <div className="flex gap-1 overflow-x-auto -mx-1 px-1 no-scrollbar">
          {tools.map((tool) => {
            const ToolIcon = tool.icon;
            const isActive = location.pathname === tool.path;
            return (
              <button
                key={tool.id}
                onClick={() => navigate(tool.path)}
                className={cn(
                  'relative flex items-center gap-2 px-3 py-2.5 text-[9px] font-bold uppercase tracking-[0.15em] whitespace-nowrap transition-all rounded-t-lg',
                  isActive
                    ? 'text-accent bg-accent/10 border-b-2 border-accent'
                    : 'text-primary-foreground/40 hover:text-primary-foreground hover:bg-primary-foreground/5'
                )}
              >
                <ToolIcon size={11} />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AIToolsHeader;
