import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PoetryLayout = 
  | 'classic'           // Default centered text
  | 'split-left'        // Image left, text right (Van Gogh style)
  | 'split-right'       // Image right, text left
  | 'scattered'         // Editorial scattered text blocks
  | 'fullbleed'         // Full-bleed background with text overlay
  | 'solid-dark'        // Solid dark background with typewriter text
  | 'notecard'          // Solid background with centered notecard
  | 'minimal';          // Minimal with vertical line separator

interface PoetryLayoutSelectorProps {
  value: PoetryLayout;
  onChange: (layout: PoetryLayout) => void;
}

interface LayoutOption {
  id: PoetryLayout;
  name: string;
  description: string;
  preview: React.ReactNode;
}

const layouts: LayoutOption[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Centered text with elegant typography',
    preview: (
      <div className="w-full h-full bg-[#FAF9F6] flex items-center justify-center p-2">
        <div className="text-center space-y-1">
          <div className="h-1.5 w-10 bg-slate-300 mx-auto" />
          <div className="h-1 w-8 bg-slate-200 mx-auto" />
          <div className="h-1 w-12 bg-slate-200 mx-auto" />
          <div className="h-1 w-6 bg-slate-200 mx-auto" />
        </div>
      </div>
    )
  },
  {
    id: 'split-left',
    name: 'Image Left',
    description: 'Artwork on left, poem on right',
    preview: (
      <div className="w-full h-full flex">
        <div className="w-1/2 h-full bg-gradient-to-br from-blue-400 to-blue-600" />
        <div className="w-1/2 h-full bg-[#FAF9F6] flex items-center justify-center p-1">
          <div className="space-y-0.5">
            <div className="h-1 w-6 bg-slate-300" />
            <div className="h-0.5 w-8 bg-slate-200" />
            <div className="h-0.5 w-5 bg-slate-200" />
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'split-right',
    name: 'Image Right',
    description: 'Poem on left, artwork on right',
    preview: (
      <div className="w-full h-full flex">
        <div className="w-1/2 h-full bg-[#FAF9F6] flex items-center justify-center p-1">
          <div className="space-y-0.5">
            <div className="h-1 w-6 bg-slate-300" />
            <div className="h-0.5 w-8 bg-slate-200" />
            <div className="h-0.5 w-5 bg-slate-200" />
          </div>
        </div>
        <div className="w-1/2 h-full bg-gradient-to-br from-teal-400 to-teal-600" />
      </div>
    )
  },
  {
    id: 'scattered',
    name: 'Scattered',
    description: 'Magazine-style editorial layout',
    preview: (
      <div className="w-full h-full bg-[#E8E4DE] p-2 relative">
        <div className="absolute top-1 right-1 text-[4px] font-serif italic">Title</div>
        <div className="absolute top-4 left-1 space-y-0.5">
          <div className="h-0.5 w-6 bg-slate-400" />
          <div className="h-0.5 w-4 bg-slate-400" />
        </div>
        <div className="absolute bottom-2 right-2 space-y-0.5">
          <div className="h-0.5 w-5 bg-slate-400" />
          <div className="h-0.5 w-7 bg-slate-400" />
        </div>
      </div>
    )
  },
  {
    id: 'fullbleed',
    name: 'Full Bleed',
    description: 'Background image with text overlay',
    preview: (
      <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative space-y-0.5 text-center">
          <div className="h-0.5 w-8 bg-white/80 mx-auto" />
          <div className="h-0.5 w-6 bg-white/60 mx-auto" />
          <div className="h-0.5 w-10 bg-white/60 mx-auto" />
        </div>
      </div>
    )
  },
  {
    id: 'solid-dark',
    name: 'Solid Dark',
    description: 'Deep blue with typewriter text',
    preview: (
      <div className="w-full h-full bg-[#1a365d] flex items-center justify-center p-2">
        <div className="space-y-1">
          <div className="h-0.5 w-10 bg-white/60" />
          <div className="h-0.5 w-8 bg-white/40" />
          <div className="h-0.5 w-12 bg-white/40" />
          <div className="h-0.5 w-6 bg-white/40" />
        </div>
      </div>
    )
  },
  {
    id: 'notecard',
    name: 'Notecard',
    description: 'Colored background with centered card',
    preview: (
      <div className="w-full h-full bg-[#1a365d] flex items-center justify-center p-2">
        <div className="bg-[#FFFEF0] w-10 h-8 flex items-center justify-center">
          <div className="space-y-0.5">
            <div className="h-0.5 w-6 bg-slate-400" />
            <div className="h-0.5 w-4 bg-slate-300" />
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean design with vertical separator',
    preview: (
      <div className="w-full h-full bg-[#F5F5F5] flex flex-col items-center justify-center p-2">
        <div className="h-1 w-8 bg-slate-300 mb-1" />
        <div className="h-4 w-px bg-slate-400 my-1" />
        <div className="space-y-0.5">
          <div className="h-0.5 w-10 bg-slate-300 mx-auto" />
          <div className="h-0.5 w-8 bg-slate-200 mx-auto" />
        </div>
      </div>
    )
  }
];

export const PoetryLayoutSelector: React.FC<PoetryLayoutSelectorProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Choose how your poem will be displayed to readers
      </p>
      <div className="grid grid-cols-4 gap-3">
        {layouts.map((layout) => (
          <motion.button
            key={layout.id}
            type="button"
            onClick={() => onChange(layout.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative group focus:outline-none",
              "border-2 transition-colors overflow-hidden",
              value === layout.id 
                ? "border-accent ring-2 ring-accent/20" 
                : "border-border hover:border-accent/50"
            )}
          >
            {/* Preview */}
            <div className="aspect-[3/4] overflow-hidden">
              {layout.preview}
            </div>
            
            {/* Label */}
            <div className="p-2 bg-card border-t border-border">
              <p className="text-xs font-medium text-foreground truncate">{layout.name}</p>
            </div>
            
            {/* Selected indicator */}
            {value === layout.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 w-5 h-5 bg-accent flex items-center justify-center"
              >
                <Check size={12} className="text-primary" />
              </motion.div>
            )}
            
            {/* Hover tooltip */}
            <div className="absolute inset-x-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-popover text-popover-foreground text-xs p-2 shadow-lg border border-border mx-2">
                {layout.description}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default PoetryLayoutSelector;
