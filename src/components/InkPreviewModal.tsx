import React from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Eye, Feather, FileText, Mic, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OutputData } from '@editorjs/editorjs';
import { calculateWordCount, calculateReadingTime } from '@/hooks/useAutosave';

interface InkPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    type: string;
    title: string;
    author_name: string;
    author_role: string;
    summary: string;
    tags: string;
    cover_image: string | null;
  };
  content: OutputData;
}

const renderContent = (content: OutputData) => {
  const blocks = content.blocks || [];

  return blocks.map((block, index) => {
    const data = block.data as Record<string, unknown>;

    switch (block.type) {
      case 'header': {
        const HeaderTag = `h${data.level || 2}` as keyof JSX.IntrinsicElements;
        return <HeaderTag key={index} className="font-serif text-foreground mb-4">{String(data.text || '')}</HeaderTag>;
      }
      
      case 'paragraph':
        return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: String(data.text || '') }} />;
      
      case 'list': {
        const ListTag = data.style === 'ordered' ? 'ol' : 'ul';
        const items = Array.isArray(data.items) ? data.items : [];
        return (
          <ListTag key={index} className={`mb-4 ml-6 ${data.style === 'ordered' ? 'list-decimal' : 'list-disc'}`}>
            {items.map((item: unknown, i: number) => (
              <li key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: String(item) }} />
            ))}
          </ListTag>
        );
      }
      
      case 'quote':
        return (
          <blockquote key={index} className="border-l-4 border-accent pl-6 my-6 italic text-muted-foreground">
            <p dangerouslySetInnerHTML={{ __html: String(data.text || '') }} />
            {data.caption && (
              <cite className="text-sm text-muted-foreground mt-2 block">— {String(data.caption)}</cite>
            )}
          </blockquote>
        );

      case 'delimiter':
        return <hr key={index} className="my-8 border-border" />;

      case 'code':
        return (
          <pre key={index} className="bg-muted p-4 mb-4 overflow-x-auto border border-border rounded-lg">
            <code className="text-sm text-foreground">{String(data.code || '')}</code>
          </pre>
        );

      default:
        return null;
    }
  });
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Poetry': return <Feather size={16} />;
    case 'Report': return <FileText size={16} />;
    case 'Interview': return <Mic size={16} />;
    case 'Opinion': return <Quote size={16} />;
    default: return <Eye size={16} />;
  }
};

export const InkPreviewModal: React.FC<InkPreviewModalProps> = ({
  isOpen,
  onClose,
  formData,
  content
}) => {
  if (!isOpen) return null;

  const wordCount = calculateWordCount(content);
  const readingTime = calculateReadingTime(wordCount);
  const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto"
    >
      {/* Close Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={onClose}
          className="rounded-full bg-card border-border shadow-lg"
        >
          <X size={20} />
        </Button>
      </div>

      {/* Preview Content */}
      <div className="min-h-screen pt-20 pb-16">
        <article className="container mx-auto px-6 max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-card p-8 md:p-12 border border-border rounded-xl shadow-sm"
          >
            {/* Cover Image */}
            {formData.cover_image && (
              <div className="relative aspect-[16/9] mb-8 -mx-8 -mt-8 md:-mx-12 md:-mt-12 overflow-hidden rounded-t-xl">
                <img 
                  src={formData.cover_image} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
              </div>
            )}

            {/* Type Badge */}
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1.5 bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-2">
                {getTypeIcon(formData.type)}
                {formData.type}
              </span>
              {formData.author_role && (
                <>
                  <span className="text-border">|</span>
                  <span className="text-xs font-medium text-muted-foreground">{formData.author_role}</span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
              {formData.title || 'Untitled'}
            </h1>

            {/* Summary */}
            {formData.summary && (
              <p className="text-lg text-muted-foreground italic mb-6 pb-6 border-b border-border">
                {formData.summary}
              </p>
            )}

            {/* Author Info */}
            <div className="flex items-center justify-between border-y border-border py-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 flex items-center justify-center text-accent font-bold rounded-full">
                  {formData.author_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{formData.author_name || 'Anonymous'}</p>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    {new Date().toLocaleDateString()}
                    <span>•</span>
                    <Clock size={12} className="inline" /> {readingTime} min read
                    <span>•</span>
                    {wordCount} words
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg prose-slate dark:prose-invert max-w-none font-serif leading-relaxed">
              {content.blocks && content.blocks.length > 0 ? (
                renderContent(content)
              ) : (
                <p className="text-muted-foreground italic">No content yet...</p>
              )}
            </div>

            {/* Tags */}
            {tagsArray.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-2">
                {tagsArray.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Preview Notice */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <span className="px-4 py-2 bg-accent/10 rounded-full inline-flex items-center gap-2">
              <Eye size={14} />
              Preview Mode — This is how your piece will appear when published
            </span>
          </div>
        </article>
      </div>
    </motion.div>
  );
};
