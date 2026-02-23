import React from 'react';
import { motion } from 'framer-motion';
import { Eye, X, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';
import { PoetryLayout } from './PoetryLayoutSelector';
import { PoetryStanza } from './PoetryEditor';
import { Json } from '@/integrations/supabase/types';
import {
  ClassicLayout,
  SplitLeftLayout,
  SplitRightLayout,
  ScatteredLayout,
  FullBleedLayout,
  SolidDarkLayout,
  NotecardLayout,
  MinimalLayout
} from './PoetryLayoutRenderers';

interface PreviewPiece {
  id: string;
  title: string;
  author_name: string;
  user_id: string | null;
  created_at: string;
  summary: string | null;
  content: Json;
  tags: string[] | null;
  view_count: number | null;
  cover_image: string | null;
  poetry_layout?: PoetryLayout | null;
}

interface PoetryReaderPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  authorName: string;
  summary: string;
  stanzas: PoetryStanza[];
  layout: PoetryLayout;
  coverImage: string | null;
  tags: string[];
}

// Convert stanzas to EditorJS-like content format
const stanzasToContent = (stanzas: PoetryStanza[]): Json => {
  return {
    time: Date.now(),
    blocks: stanzas.map(stanza => ({
      type: 'paragraph',
      data: {
        text: stanza.text.replace(/\n/g, '<br>'),
        alignment: stanza.alignment,
        emphasis: stanza.emphasis,
        spacing: stanza.spacing
      }
    })),
    version: '2.28.0'
  };
};

// Simple content renderer for preview
const renderPreviewContent = (content: Json): React.ReactNode => {
  if (!content || typeof content !== 'object') return null;
  
  const data = content as { blocks?: Array<{ type: string; data?: { text?: string; alignment?: string; emphasis?: string; spacing?: string } }> };
  
  if (!Array.isArray(data.blocks)) return null;
  
  return data.blocks.map((block, index) => {
    if (block.type === 'paragraph' && block.data?.text) {
      const alignment = block.data.alignment || 'center';
      const emphasis = block.data.emphasis || 'normal';
      const spacing = block.data.spacing || 'normal';
      
      return (
        <p 
          key={index}
          className={cn(
            "whitespace-pre-wrap",
            alignment === 'left' && 'text-left',
            alignment === 'center' && 'text-center',
            alignment === 'right' && 'text-right',
            emphasis === 'bold' && 'font-bold',
            emphasis === 'italic' && 'italic',
            spacing === 'tight' && 'leading-tight mb-2',
            spacing === 'normal' && 'leading-relaxed mb-4',
            spacing === 'loose' && 'leading-loose mb-6'
          )}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.data.text) }}
        />
      );
    }
    return null;
  });
};

export const PoetryReaderPreview: React.FC<PoetryReaderPreviewProps> = ({
  isOpen,
  onClose,
  title,
  authorName,
  summary,
  stanzas,
  layout,
  coverImage,
  tags
}) => {
  const [viewMode, setViewMode] = React.useState<'desktop' | 'mobile'>('desktop');

  if (!isOpen) return null;

  // Create a mock piece for the layout renderer
  const previewPiece: PreviewPiece = {
    id: 'preview',
    title: title || 'Untitled',
    author_name: authorName || 'Anonymous',
    user_id: null,
    created_at: new Date().toISOString(),
    summary: summary || null,
    content: stanzasToContent(stanzas),
    tags: tags.length > 0 ? tags : null,
    view_count: 0,
    cover_image: coverImage,
    poetry_layout: layout
  };

  const readingTime = Math.max(1, Math.ceil(stanzas.reduce((acc, s) => acc + s.text.split(/\s+/).length, 0) / 200));

  // Get the right layout component
  const getLayoutComponent = () => {
    const props = {
      piece: previewPiece,
      renderContent: renderPreviewContent,
      readingTime
    };

    switch (layout) {
      case 'split-left':
        return <SplitLeftLayout {...props} />;
      case 'split-right':
        return <SplitRightLayout {...props} />;
      case 'scattered':
        return <ScatteredLayout {...props} />;
      case 'fullbleed':
        return <FullBleedLayout {...props} />;
      case 'solid-dark':
        return <SolidDarkLayout {...props} />;
      case 'notecard':
        return <NotecardLayout {...props} />;
      case 'minimal':
        return <MinimalLayout {...props} />;
      default:
        return <ClassicLayout {...props} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 text-white hover:bg-white/10"
      >
        <X size={24} />
      </Button>

      {/* View mode toggle */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full p-1">
        <Button
          variant={viewMode === 'desktop' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('desktop')}
          className="rounded-full text-white"
        >
          <Monitor size={14} className="mr-2" />
          Desktop
        </Button>
        <Button
          variant={viewMode === 'mobile' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('mobile')}
          className="rounded-full text-white"
        >
          <Smartphone size={14} className="mr-2" />
          Mobile
        </Button>
      </div>

      {/* Preview container */}
      <div 
        className={cn(
          "bg-background overflow-y-auto max-h-[85vh] transition-all duration-300",
          viewMode === 'desktop' 
            ? "w-full max-w-6xl mx-4 rounded-xl" 
            : "w-[390px] rounded-[2rem] border-4 border-white/20"
        )}
      >
        {/* Header badge */}
        <div className="sticky top-0 z-10 bg-accent/90 backdrop-blur-sm px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium text-primary">
          <Eye size={14} />
          Preview Mode - {layout.charAt(0).toUpperCase() + layout.slice(1).replace('-', ' ')} Layout
        </div>

        {/* Render the selected layout */}
        <div className="pt-8 pb-16">
          {getLayoutComponent()}
        </div>
      </div>
    </motion.div>
  );
};

export default PoetryReaderPreview;
