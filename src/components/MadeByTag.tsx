import React from 'react';
import { Heart } from 'lucide-react';

/**
 * Small credit watermark shown on quiz-related pages.
 */
const MadeByTag: React.FC<{ placement?: 'footer' | 'header' }> = ({ placement = 'footer' }) => (
  <div className={placement === 'header' ? 'flex justify-end pt-2' : 'flex justify-center py-4'}>
    <button
      type="button"
      aria-label="Made by Habibi with love"
      title="Made by Habibi with love"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-wide select-none cursor-default ${placement === 'header' ? 'border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground/80' : 'border-border bg-muted/40 text-muted-foreground/80'}`}
    >
      Made by Habibi with love
      <Heart className="w-3 h-3 text-red-500 fill-red-500" aria-hidden="true" />
    </button>
  </div>
);

export default MadeByTag;
