import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, BrainCircuit, CreditCard, Sparkles, ArrowLeft } from 'lucide-react';
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
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 pt-24 pb-3 max-w-6xl">
        {/* Top row: back button + title + right content */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/resources')}
              className="p-2 border border-primary-foreground/20 hover:border-accent transition-colors rounded-sm"
            >
              <ArrowLeft size={14} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={12} className="text-accent" fill="currentColor" />
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-primary-foreground/50">
                  {subtitle || 'AI-Powered'}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-serif font-bold">{title}</h1>
            </div>
          </div>
          {rightContent}
        </div>

        {/* Quick nav tabs */}
        <div className="flex gap-1 border-t border-primary-foreground/10 pt-3">
          {tools.map((tool) => {
            const ToolIcon = tool.icon;
            const isActive = location.pathname === tool.path;
            return (
              <button
                key={tool.id}
                onClick={() => navigate(tool.path)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-t-sm',
                  isActive
                    ? 'bg-background text-foreground'
                    : 'text-primary-foreground/50 hover:text-primary-foreground/80 hover:bg-primary-foreground/5'
                )}
              >
                <ToolIcon size={13} />
                <span className="hidden sm:inline">{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AIToolsHeader;
