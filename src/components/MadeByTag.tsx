import React from 'react';
import { Heart } from 'lucide-react';

/**
 * Small credit watermark shown on quiz-related pages.
 */
const MadeByTag: React.FC<{ placement?: 'footer' | 'header' | 'inline' }> = ({ placement = 'footer' }) => {
  const tag = (
    <button
      type="button"
      aria-label="Made by Habibi with love"
      title="Made by Habibi with love"
      className={`inline-flex items-center gap-1.5 rounded-full font-bold tracking-wide select-none cursor-default ${
        placement === 'inline'
          ? 'ml-2 px-2 py-0.5 border border-primary-foreground/20 bg-primary-foreground/10 text-[8px] text-primary-foreground/80 align-middle'
          : `px-3 py-1.5 border text-[10px] ${placement === 'header' ? 'border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground/80' : 'border-border bg-muted/40 text-muted-foreground/80'}`
      }`}
    >
      Made by Habibi with love
      <Heart className="w-3 h-3 text-red-500 fill-red-500" aria-hidden="true" />
    </button>
  );

  if (placement === 'inline') return tag;
  return <div className={placement === 'header' ? 'flex justify-end pt-2' : 'flex justify-center py-4'}>{tag}</div>;
};

export default MadeByTag;
