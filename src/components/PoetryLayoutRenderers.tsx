import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Feather } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Json } from '@/integrations/supabase/types';
import { SocialShare } from '@/components/SocialShare';
import { InkComments } from '@/components/InkComments';
import { PoetryLayout } from './PoetryLayoutSelector';
import { cn } from '@/lib/utils';

interface PoetryPiece {
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

interface PoetryLayoutProps {
  piece: PoetryPiece;
  renderContent: (content: Json) => React.ReactNode;
  readingTime: number;
  onImageClick?: (src: string, alt?: string, caption?: string) => void;
}

// Author Link component
const AuthorLink = ({ userId, authorName, className = '' }: { userId: string | null; authorName: string; className?: string }) => {
  if (!userId) return <span className={className}>{authorName}</span>;
  return (
    <Link to={`/profile/${userId}`} className={`hover:text-accent transition-colors ${className}`}>
      {authorName}
    </Link>
  );
};

// Helper to render stanza-based content with alignment
const renderStanzaContent = (content: Json, baseClassName?: string) => {
  if (!content || typeof content !== 'object') return null;
  
  const data = content as { blocks?: Array<{ type: string; data?: { text?: string; alignment?: string; emphasis?: string; spacing?: string; stanzas?: Array<{ text: string; alignment: string; emphasis?: string; spacing?: string }> } }> };
  
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
            baseClassName,
            alignment === 'left' && 'text-left',
            alignment === 'center' && 'text-center',
            alignment === 'right' && 'text-right',
            emphasis === 'bold' && 'font-bold',
            emphasis === 'italic' && 'italic',
            spacing === 'tight' && 'leading-tight mb-2',
            spacing === 'normal' && 'leading-relaxed mb-4',
            spacing === 'loose' && 'leading-loose mb-6'
          )}
          dangerouslySetInnerHTML={{ __html: block.data.text }}
        />
      );
    }
    return null;
  });
};

// Classic Layout - Centered elegant poetry
export const ClassicLayout: React.FC<PoetryLayoutProps> = ({ piece, renderContent, readingTime }) => (
  <article className="container mx-auto px-6 max-w-2xl">
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="bg-[#FAF9F6] dark:bg-card p-12 md:p-20 shadow-lg border border-border text-center relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-accent"></div>
      <Feather className="mx-auto text-accent mb-8" size={32} />
      <h1 className="text-4xl md:text-6xl font-serif italic text-primary mb-4">{piece.title}</h1>
      <div className="w-16 h-px bg-border mx-auto mb-6"></div>
      <p className="text-sm font-serif text-muted-foreground mb-4">By <AuthorLink userId={piece.user_id} authorName={piece.author_name} /></p>
      <div className="flex justify-center items-center gap-4 text-xs text-muted-foreground mb-12">
        <span><Clock size={12} className="inline mr-1" />{readingTime} min</span>
        {piece.view_count !== null && <span>{piece.view_count} views</span>}
      </div>
      <div className="prose prose-xl prose-p:font-serif prose-p:italic text-foreground/80 leading-loose text-center">
        {renderContent(piece.content)}
      </div>
      <div className="mt-12">
        <SocialShare title={piece.title} summary={piece.summary || ''} className="justify-center" />
      </div>
      {piece.tags && piece.tags.length > 0 && (
        <div className="mt-16 pt-8 border-t border-border flex justify-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {piece.tags.map(t => <span key={t}>#{t}</span>)}
        </div>
      )}
      <InkComments pieceId={piece.id} />
    </motion.div>
  </article>
);

// Split Left Layout - Image on left, text on right (Van Gogh style)
export const SplitLeftLayout: React.FC<PoetryLayoutProps> = ({ piece, renderContent, readingTime, onImageClick }) => (
  <article className="container mx-auto px-6 max-w-6xl">
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex flex-col md:flex-row min-h-[80vh] shadow-lg overflow-hidden"
    >
      {/* Image Side */}
      <div 
        className="md:w-1/2 h-64 md:h-auto relative group cursor-pointer"
        onClick={() => piece.cover_image && onImageClick?.(piece.cover_image, piece.title)}
      >
        {piece.cover_image ? (
          <img 
            src={piece.cover_image} 
            alt={piece.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center">
            <Feather size={64} className="text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>
      
      {/* Text Side */}
      <div className="md:w-1/2 bg-[#FAF9F6] dark:bg-card p-8 md:p-16 flex flex-col justify-center">
        <h1 className="text-3xl md:text-5xl font-serif text-foreground mb-8 uppercase tracking-wide">{piece.title}</h1>
        
        <div className="prose prose-lg prose-p:font-serif text-foreground/80 leading-loose mb-8">
          {renderContent(piece.content)}
        </div>
        
        <div className="w-12 h-px bg-border mb-4" />
        <p className="font-serif italic text-muted-foreground">
          <AuthorLink userId={piece.user_id} authorName={piece.author_name} />
        </p>
        
        <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
          <span><Clock size={12} className="inline mr-1" />{readingTime} min</span>
          {piece.view_count !== null && <span>{piece.view_count} views</span>}
        </div>
        
        <div className="mt-6">
          <SocialShare title={piece.title} summary={piece.summary || ''} />
        </div>
        
        <InkComments pieceId={piece.id} />
      </div>
    </motion.div>
  </article>
);

// Split Right Layout - Text on left, image on right
export const SplitRightLayout: React.FC<PoetryLayoutProps> = ({ piece, renderContent, readingTime, onImageClick }) => (
  <article className="container mx-auto px-6 max-w-6xl">
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex flex-col-reverse md:flex-row min-h-[80vh] shadow-lg overflow-hidden"
    >
      {/* Text Side */}
      <div className="md:w-1/2 bg-[#FAF9F6] dark:bg-card p-8 md:p-16 flex flex-col justify-center">
        <div className="prose prose-lg prose-p:font-serif text-foreground/80 leading-loose mb-8">
          {renderContent(piece.content)}
        </div>
        
        <p className="font-serif text-lg text-foreground">
          — <AuthorLink userId={piece.user_id} authorName={piece.author_name} />
        </p>
        
        <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
          <span><Clock size={12} className="inline mr-1" />{readingTime} min</span>
          {piece.view_count !== null && <span>{piece.view_count} views</span>}
        </div>
        
        <div className="mt-6">
          <SocialShare title={piece.title} summary={piece.summary || ''} />
        </div>
        
        <InkComments pieceId={piece.id} />
      </div>
      
      {/* Image Side */}
      <div 
        className="md:w-1/2 h-64 md:h-auto relative group cursor-pointer"
        onClick={() => piece.cover_image && onImageClick?.(piece.cover_image, piece.title)}
      >
        {piece.cover_image ? (
          <img 
            src={piece.cover_image} 
            alt={piece.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600 flex items-center justify-center">
            <Feather size={64} className="text-white/30" />
          </div>
        )}
      </div>
    </motion.div>
  </article>
);

// Scattered Layout - Magazine-style editorial
export const ScatteredLayout: React.FC<PoetryLayoutProps> = ({ piece, renderContent, readingTime }) => (
  <article className="container mx-auto px-6 max-w-5xl">
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="bg-[#E8E4DE] dark:bg-card min-h-[80vh] p-8 md:p-16 relative overflow-hidden"
    >
      {/* Title - Top right, large */}
      <div className="text-right mb-16">
        <h1 className="text-5xl md:text-7xl font-serif italic text-foreground leading-none">
          {piece.title.split(' ').map((word, i) => (
            <span key={i} className={i % 2 === 1 ? 'font-normal italic' : 'font-bold not-italic'}>
              {word}{' '}
            </span>
          ))}
        </h1>
      </div>
      
      {/* Content - Scattered blocks */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-6 md:col-start-1">
          <div className="prose prose-lg prose-p:font-serif text-foreground/80 leading-loose">
            {renderContent(piece.content)}
          </div>
        </div>
      </div>
      
      {/* Author - Bottom */}
      <div className="mt-16 pt-8 border-t border-border/50">
        <p className="text-3xl md:text-5xl font-serif uppercase tracking-wider text-foreground">
          <AuthorLink userId={piece.user_id} authorName={piece.author_name} />
        </p>
      </div>
      
      <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
        <span><Clock size={12} className="inline mr-1" />{readingTime} min</span>
        {piece.view_count !== null && <span>{piece.view_count} views</span>}
      </div>
      
      <div className="mt-6">
        <SocialShare title={piece.title} summary={piece.summary || ''} />
      </div>
      
      <InkComments pieceId={piece.id} />
    </motion.div>
  </article>
);

// Full Bleed Layout - Background image with text overlay
export const FullBleedLayout: React.FC<PoetryLayoutProps> = ({ piece, renderContent, readingTime, onImageClick }) => (
  <article className="relative min-h-screen -mt-32 pt-32">
    {/* Background Image */}
    <div 
      className="absolute inset-0 cursor-pointer"
      onClick={() => piece.cover_image && onImageClick?.(piece.cover_image, piece.title)}
    >
      {piece.cover_image ? (
        <img 
          src={piece.cover_image} 
          alt={piece.title} 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
    </div>
    
    {/* Content Overlay */}
    <div className="relative z-10 container mx-auto px-6 py-32 max-w-3xl min-h-screen flex flex-col justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-white"
      >
        <div className="prose prose-lg prose-p:font-serif prose-p:text-white/90 prose-headings:text-white leading-loose mb-12">
          {renderContent(piece.content)}
        </div>
        
        <p className="text-2xl md:text-3xl font-serif text-white/80">
          — <AuthorLink userId={piece.user_id} authorName={piece.author_name} className="text-white/80 hover:text-white" />
        </p>
        
        <div className="mt-8 flex items-center gap-4 text-xs text-white/60">
          <span><Clock size={12} className="inline mr-1" />{readingTime} min</span>
          {piece.view_count !== null && <span>{piece.view_count} views</span>}
        </div>
        
        <div className="mt-6">
          <SocialShare title={piece.title} summary={piece.summary || ''} />
        </div>
      </motion.div>
    </div>
    
    <div className="relative z-10 container mx-auto px-6 max-w-3xl pb-16">
      <InkComments pieceId={piece.id} />
    </div>
  </article>
);

// Solid Dark Layout - Deep blue with typewriter text
export const SolidDarkLayout: React.FC<PoetryLayoutProps> = ({ piece, renderContent, readingTime }) => (
  <article className="container mx-auto px-6 max-w-3xl">
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="bg-[#1a365d] min-h-[80vh] p-12 md:p-20"
    >
      <h1 className="text-3xl md:text-4xl font-mono text-blue-100/80 mb-12 lowercase">{piece.title}:</h1>
      
      <div className="prose prose-lg prose-p:font-mono prose-p:text-blue-100/70 prose-headings:text-blue-100 leading-loose tracking-wide">
        {renderContent(piece.content)}
      </div>
      
      <div className="mt-16 pt-8 border-t border-blue-100/20">
        <p className="font-mono text-blue-100/50 lowercase">
          — <AuthorLink userId={piece.user_id} authorName={piece.author_name} className="text-blue-100/50 hover:text-blue-100" />
        </p>
      </div>
      
      <div className="mt-8 flex items-center gap-4 text-xs text-blue-100/40">
        <span><Clock size={12} className="inline mr-1" />{readingTime} min</span>
        {piece.view_count !== null && <span>{piece.view_count} views</span>}
      </div>
      
      <div className="mt-6">
        <SocialShare title={piece.title} summary={piece.summary || ''} />
      </div>
      
      <InkComments pieceId={piece.id} />
    </motion.div>
  </article>
);

// Notecard Layout - Colored background with centered card
export const NotecardLayout: React.FC<PoetryLayoutProps> = ({ piece, renderContent, readingTime }) => (
  <article className="container mx-auto px-6 max-w-4xl">
    <div className="bg-[#1a365d] min-h-[80vh] flex items-center justify-center p-8 md:p-16">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#FFFEF0] dark:bg-card max-w-xl w-full p-10 md:p-16 shadow-2xl"
      >
        <h1 className="text-xl font-mono uppercase tracking-widest text-foreground/80 mb-6">{piece.title}:</h1>
        
        <div className="prose prose-lg prose-p:font-mono prose-p:uppercase prose-p:tracking-wide text-foreground/70 leading-loose">
          {renderContent(piece.content)}
        </div>
        
        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="font-mono text-sm text-muted-foreground">
            — <AuthorLink userId={piece.user_id} authorName={piece.author_name} />
          </p>
        </div>
        
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span><Clock size={12} className="inline mr-1" />{readingTime} min</span>
        </div>
        
        <div className="mt-6">
          <SocialShare title={piece.title} summary={piece.summary || ''} />
        </div>
      </motion.div>
    </div>
    <InkComments pieceId={piece.id} />
  </article>
);

// Minimal Layout - Clean with vertical separator
export const MinimalLayout: React.FC<PoetryLayoutProps> = ({ piece, renderContent, readingTime }) => (
  <article className="container mx-auto px-6 max-w-2xl">
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="bg-[#F5F5F5] dark:bg-card min-h-[80vh] p-12 md:p-20 flex flex-col items-center justify-center text-center"
    >
      {/* Small label */}
      <span className="text-xs uppercase tracking-[0.5em] text-muted-foreground mb-8">The</span>
      
      {/* Title */}
      <h1 className="text-4xl md:text-6xl font-serif uppercase tracking-wide text-foreground mb-8">{piece.title}</h1>
      
      {/* Vertical line */}
      <div className="w-px h-24 bg-border mb-8" />
      
      {/* Content */}
      <div className="prose prose-lg prose-p:font-serif text-foreground/80 leading-loose text-center max-w-lg">
        {renderContent(piece.content)}
      </div>
      
      <div className="mt-12 pt-8 border-t border-border w-full max-w-sm">
        <p className="font-serif italic text-muted-foreground">
          <AuthorLink userId={piece.user_id} authorName={piece.author_name} />
        </p>
      </div>
      
      <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
        <span><Clock size={12} className="inline mr-1" />{readingTime} min</span>
        {piece.view_count !== null && <span>{piece.view_count} views</span>}
      </div>
      
      <div className="mt-6">
        <SocialShare title={piece.title} summary={piece.summary || ''} className="justify-center" />
      </div>
      
      <InkComments pieceId={piece.id} />
    </motion.div>
  </article>
);

// Main renderer that selects the right layout
export const PoetryLayoutRenderer: React.FC<PoetryLayoutProps> = (props) => {
  const layout = (props.piece.poetry_layout as PoetryLayout) || 'classic';
  
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
    case 'classic':
    default:
      return <ClassicLayout {...props} />;
  }
};
