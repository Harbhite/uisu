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
    <div className="relative bg-primary text-primary-foreground overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      
      {/* Decorative floating shapes with rounded corners */}
      <div className="absolute -top-40 -right-32 w-80 h-80 bg-accent/10 blur-3xl pointer-events-none rounded-full animate-float" />
      <div className="absolute -bottom-48 -left-24 w-96 h-96 bg-accent/[0.06] blur-3xl pointer-events-none rounded-full" style={{ animationDelay: '1s' }} />
      
      {/* Accent accent shape - top right corner */}
      <div className="absolute top-12 right-12 w-32 h-32 border-2 border-accent/15 rounded-3xl pointer-events-none rotate-12 opacity-40" />
      <div className="absolute top-20 right-20 w-24 h-24 border border-accent/10 rounded-2xl pointer-events-none -rotate-6 opacity-30" />

      <div className="container mx-auto px-4 pt-24 pb-0 max-w-6xl relative">
        {/* Back link — minimal, top-left with rounded hover state */}
        <button
          onClick={() => navigate('/resources')}
          aria-label="Back to resources"
          className="group flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-primary-foreground/50 hover:text-accent transition-all mb-6 px-3 py-2 rounded-lg hover:bg-accent/10"
        >
          <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
          <span>Resources</span>
        </button>

        {/* Eyebrow strip with refined styling */}
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px w-8 bg-accent" />
          <div className="p-1.5 rounded-full bg-accent/15">
            <Zap size={10} className="text-accent" fill="currentColor" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-accent">
            {subtitle || 'AI-Powered Suite'}
          </span>
        </div>

        {/* Title row — editorial split layout with enhanced spacing */}
        <div className="grid grid-cols-12 gap-4 items-end mb-10">
          <div className="col-span-12 md:col-span-9 flex items-end gap-6">
            {/* Icon box with rounded corners and decorative border */}
            <div className="hidden md:flex flex-shrink-0 items-center justify-center w-20 h-20 bg-accent text-primary rounded-2xl shadow-lg shadow-accent/40 ring-2 ring-accent/50 -mb-1 relative overflow-hidden group">
              {/* Subtle animated background pattern */}
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                style={{
                  backgroundImage: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                  backgroundSize: '200% 200%',
                }}
              />
              <Icon size={28} strokeWidth={2} className="relative z-10" />
            </div>
            
            {/* Title with refined typography */}
            <div className="flex-1">
              <h1 className="font-serif text-4xl md:text-6xl leading-[0.95] tracking-tight">
                {title}
                <span className="text-accent">.</span>
              </h1>
            </div>
          </div>
          
          {rightContent && (
            <div className="col-span-12 md:col-span-3 flex md:justify-end">{rightContent}</div>
          )}
        </div>

        {/* Decorative underline with gradient effect */}
        <div className="relative h-px mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground/10 via-accent/20 to-primary-foreground/10" />
        </div>

        {/* Tool tabs — newspaper section nav with rounded styling */}
        <div className="flex gap-1 overflow-x-auto -mx-1 px-1 scrollbar-thin pb-2">
          {tools.map((tool, index) => {
            const ToolIcon = tool.icon;
            const isActive = location.pathname === tool.path;
            return (
              <button
                key={tool.id}
                onClick={() => navigate(tool.path)}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all rounded-lg',
                  isActive
                    ? 'text-accent bg-accent/15 shadow-md shadow-accent/20'
                    : 'text-primary-foreground/55 hover:text-primary-foreground hover:bg-primary-foreground/5'
                )}
              >
                <ToolIcon size={12} />
                <span>{tool.label}</span>
                {isActive && (
                  <span className="absolute inset-x-1 -bottom-px h-0.5 bg-gradient-to-r from-accent/0 via-accent to-accent/0 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom decorative accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0" />
    </div>
  );
};

export default AIToolsHeader;
