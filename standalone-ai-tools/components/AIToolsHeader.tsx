import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIToolsHeaderProps {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  rightContent?: React.ReactNode;
}

const AIToolsHeader: React.FC<AIToolsHeaderProps> = ({ title, subtitle, icon: Icon, rightContent }) => {
  return (
    <div className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 pt-8 pb-4 max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-amber-500/10 rounded-lg">
              <Icon size={20} className="text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={12} className="text-amber-500" fill="currentColor" />
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/50">
                  {subtitle || 'AI-Powered'}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
            </div>
          </div>
          {rightContent}
        </div>
      </div>
    </div>
  );
};

export default AIToolsHeader;
