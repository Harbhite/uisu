import React from 'react';
import { Heart } from 'lucide-react';

/**
 * Small credit watermark shown on quiz-related pages.
 */
const MadeByTag: React.FC = () => (
  <div className="flex justify-center py-6">
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-muted/40 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground select-none">
      Made by Habibi with
      <Heart className="w-3 h-3 text-red-500 fill-red-500" aria-label="love" />
    </span>
  </div>
);

export default MadeByTag;
