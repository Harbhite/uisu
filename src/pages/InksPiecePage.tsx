import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Feather, Mic, FileText, Quote, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { SEO } from '@/components/SEO';
import { SocialShare } from '@/components/SocialShare';
import { InkComments } from '@/components/InkComments';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Breadcrumbs } from '@/components/Breadcrumbs';

interface InksPiece {
  id: string;
  type: string;
  title: string;
  author_name: string;
  author_role: string | null;
  created_at: string;
  summary: string | null;
  content: Json;
  tags: string[] | null;
  view_count: number | null;
  user_id: string | null;
  cover_image: string | null;
}

interface EditorBlock {
  id?: string;
  type: string;
  data: Record<string, unknown>;
}

interface EditorContent {
  time?: number;
  blocks?: EditorBlock[];
  version?: string;
}

// Calculate reading time from content blocks
const calculateReadingTime = (content: Json): number => {
  if (!content || typeof content !== 'object' || Array.isArray(content)) return 1;
  
  const editorContent = content as unknown as EditorContent;
  const blocks = editorContent.blocks || [];
  
  let wordCount = 0;
  blocks.forEach(block => {
    if (typeof block.data.text === 'string') {
      wordCount += block.data.text.split(/\s+/).filter(Boolean).length;
    }
    if (Array.isArray(block.data.items)) {
      block.data.items.forEach((item: unknown) => {
        if (typeof item === 'string') {
          wordCount += item.split(/\s+/).filter(Boolean).length;
        }
      });
    }
  });
  
  return Math.max(1, Math.ceil(wordCount / 200));
};

// Extract first image from content for SEO
const extractImageFromContent = (content: Json): string | undefined => {
  if (!content || typeof content !== 'object' || Array.isArray(content)) return undefined;

  const editorContent = content as unknown as EditorContent;
  const blocks = editorContent.blocks || [];

  const imageBlock = blocks.find(block => block.type === 'image');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = imageBlock?.data as any;

  if (data && data.file && typeof data.file.url === 'string') {
    return data.file.url;
  }
  return undefined;
};

const InksPiecePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [piece, setPiece] = useState<InksPiece | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingTime, setReadingTime] = useState(1);
  const [relatedPieces, setRelatedPieces] = useState<InksPiece[]>([]);

  useEffect(() => {
    const fetchPiece = async () => {
      if (!id) {
        navigate('/inks-vault');
        return;
      }

      const { data, error } = await supabase
        .from('ink_pieces')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Piece not found:', error);
        setPiece(null);
      } else {
        setPiece(data as InksPiece);
        setReadingTime(calculateReadingTime(data.content));
        // Increment view count
        supabase
          .from('ink_pieces')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', id)
          .then();
      }
      setLoading(false);
    };

    fetchPiece();
  }, [id, navigate]);

  useEffect(() => {
    if (!piece || !piece.tags || piece.tags.length === 0) return;

    const fetchRelated = async () => {
      const { data } = await supabase
        .from('ink_pieces')
        .select('*')
        .contains('tags', piece.tags)
        .neq('id', piece.id)
        .limit(3);

      if (data) setRelatedPieces(data as InksPiece[]);
    };

    fetchRelated();
  }, [piece]);

  // Render Editor.js content blocks as HTML
  const renderContent = (content: Json) => {
    if (!content || typeof content !== 'object' || Array.isArray(content)) {
      return null;
    }

    const editorContent = content as unknown as EditorContent;
    const blocks = editorContent.blocks || [];

    return blocks.map((block, index) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = block.data as any;

      switch (block.type) {
        case 'header': {
          const HeaderTag = `h${data.level || 2}` as keyof JSX.IntrinsicElements;
          return <HeaderTag key={index} className="font-serif text-foreground mb-4">{data.text}</HeaderTag>;
        }
        
        case 'paragraph':
          return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: data.text || '' }} />;
        
        case 'list': {
          const ListTag = data.style === 'ordered' ? 'ol' : 'ul';
          return (
            <ListTag key={index} className={`mb-4 ml-6 ${data.style === 'ordered' ? 'list-decimal' : 'list-disc'}`}>
              {(data.items || []).map((item: string, i: number) => (
                <li key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ListTag>
          );
        }
        
        case 'quote':
          return (
            <blockquote key={index} className="border-l-4 border-accent pl-6 my-6 italic text-muted-foreground">
              <p dangerouslySetInnerHTML={{ __html: data.text || '' }} />
              {data.caption && (
                <cite className="text-sm text-muted-foreground mt-2 block">— {data.caption}</cite>
              )}
            </blockquote>
          );

        case 'delimiter':
          return <hr key={index} className="my-8 border-border" />;

        case 'code':
          return (
            <pre key={index} className="bg-muted p-4 mb-4 overflow-x-auto border border-border">
              <code className="text-sm text-foreground">{data.code}</code>
            </pre>
          );

        case 'table':
          return (
            <div key={index} className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-border">
                <tbody>
                  {(data.content || []).map((row: string[], rowIndex: number) => (
                    <tr key={rowIndex}>
                      {row.map((cell: string, cellIndex: number) => (
                        <td key={cellIndex} className="border border-border p-2" dangerouslySetInnerHTML={{ __html: cell }} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );

        case 'checklist':
          return (
            <div key={index} className="mb-4">
              {(data.items || []).map((item: { text: string; checked: boolean }, i: number) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <span className={item.checked ? 'line-through text-muted-foreground' : ''}>
                    {item.checked ? '☑' : '☐'} {item.text}
                  </span>
                </div>
              ))}
            </div>
          );

        case 'warning':
          return (
            <div key={index} className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mb-4">
              <div className="font-bold text-yellow-700 dark:text-yellow-400">{data.title}</div>
              <p className="text-yellow-600 dark:text-yellow-300">{data.message}</p>
            </div>
          );

        case 'embed':
          return (
            <div key={index} className="mb-4 aspect-video">
              <iframe
                src={data.embed}
                className="w-full h-full border-0"
                allowFullScreen
              />
            </div>
          );
        
        default:
          return null;
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-16 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!piece) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-32">
        <div className="text-center">
          <h2 className="text-3xl font-serif text-primary mb-4">Piece Not Found</h2>
          <p className="text-muted-foreground mb-6">The piece you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/inks-vault')} variant="outline">
            Return to Vault
          </Button>
        </div>
      </div>
    );
  }

  const renderView = () => {
    const viewProps = { piece, renderContent, readingTime };
    switch (piece.type) {
      case 'Poetry':
        return <PoetryView {...viewProps} />;
      case 'Report':
        return <ReportView {...viewProps} />;
      case 'Fiction':
        return <FictionView {...viewProps} />;
      case 'Opinion':
        return <OpinionView {...viewProps} />;
      case 'Interview':
        return <InterviewView {...viewProps} />;
      case 'Essay':
        return <EssayView {...viewProps} />;
      case 'Blog':
        return <BlogView {...viewProps} />;
      default:
        return <ArticleView {...viewProps} />;
    }
  };

  // Use cover_image first, then extract from content
  const imageUrl = piece?.cover_image || extractImageFromContent(piece?.content);

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <SEO
        title={piece.title}
        description={piece.summary || `Read ${piece.title} by ${piece.author_name} in the Inks Vault.`}
        image={imageUrl || '/screenshots/inks-piece-detail.png'}
        type="article"
        author={piece.author_name}
        publishedTime={piece.created_at}
      />
      <div className="container mx-auto px-6 no-print">
        <Breadcrumbs />
        <button
          onClick={() => navigate('/inks-vault')}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors mb-12"
        >
          <div className="p-2 border border-border group-hover:border-accent transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Back to Vault</span>
        </button>
        <div className="flex justify-end mb-4">
             <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-2"
            >
                <Printer size={14} /> Print
            </Button>
        </div>
      </div>
      {renderView()}

      {relatedPieces.length > 0 && (
        <section className="container mx-auto px-6 max-w-4xl mt-16 pt-16 border-t border-border no-print">
          <h3 className="font-serif text-2xl mb-8">Related Pieces</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPieces.map((rp) => (
              <Link key={rp.id} to={`/inks-vault/${rp.id}`} className="group block">
                <div className="aspect-[4/3] bg-muted mb-4 overflow-hidden relative">
                    {rp.cover_image ? (
                        <img src={rp.cover_image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-accent/10 text-accent font-serif text-4xl">{rp.title.charAt(0)}</div>
                    )}
                </div>
                <h4 className="font-serif text-lg font-bold leading-tight mb-2 group-hover:text-accent transition-colors">{rp.title}</h4>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{rp.type}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// Author Link component
const AuthorLink = ({ userId, authorName, className = '' }: { userId: string | null; authorName: string; className?: string }) => {
  if (!userId) return <span className={className}>{authorName}</span>;
  return (
    <Link to={`/profile/${userId}`} className={`hover:text-accent transition-colors ${className}`}>
      {authorName}
    </Link>
  );
};

// --- Sub-components for distinct views ---

interface ViewProps {
  piece: InksPiece;
  renderContent: (content: Json) => React.ReactNode;
  readingTime: number;
}

const ArticleView = ({ piece, renderContent, readingTime }: ViewProps) => (
  <article className="container mx-auto px-6 max-w-3xl">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-8 md:p-12 border border-border">
      <div className="flex items-center gap-2 mb-6 text-primary">
        <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest">{piece.type}</span>
        <span className="text-border">|</span>
        <span className="text-xs font-medium text-muted-foreground">{piece.author_role}</span>
      </div>
      <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">{piece.title}</h1>
      <div className="flex items-center justify-between border-y border-border py-4 mb-8">
        <div className="flex items-center gap-3">
          <Link to={piece.user_id ? `/profile/${piece.user_id}` : '#'} className="w-10 h-10 bg-muted flex items-center justify-center text-muted-foreground font-bold hover:bg-accent/20 transition-colors">{piece.author_name.charAt(0)}</Link>
          <div>
            <AuthorLink userId={piece.user_id} authorName={piece.author_name} className="text-sm font-bold text-foreground" />
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              {new Date(piece.created_at).toLocaleDateString()}
              <span>•</span>
              <Clock size={12} className="inline" /> {readingTime} min read
              {piece.view_count !== null && (
                <>
                  <span>•</span>
                  {piece.view_count} views
                </>
              )}
            </div>
          </div>
        </div>
        <SocialShare title={piece.title} summary={piece.summary || ''} />
      </div>
      <div className="prose prose-lg prose-slate dark:prose-invert max-w-none font-serif leading-relaxed">
        {renderContent(piece.content)}
      </div>
      {piece.tags && piece.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-2">
          {piece.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-muted text-muted-foreground text-xs">#{tag}</span>
          ))}
        </div>
      )}
      <InkComments pieceId={piece.id} />
    </motion.div>
  </article>
);

const PoetryView = ({ piece, renderContent, readingTime }: ViewProps) => (
  <article className="container mx-auto px-6 max-w-2xl">
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#FAF9F6] dark:bg-card p-12 md:p-20 shadow-lg border border-border text-center relative overflow-hidden">
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

const ReportView = ({ piece, renderContent, readingTime }: ViewProps) => (
  <article className="container mx-auto px-6 max-w-5xl">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border overflow-hidden">
      <div className="bg-primary text-primary-foreground p-8 md:p-12">
        <div className="flex items-center gap-2 mb-4 text-accent">
          <FileText size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">Official Report</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 font-sans">{piece.title}</h1>
        <div className="flex flex-wrap gap-6 text-sm text-primary-foreground/60 font-mono">
          <span>DATE: {new Date(piece.created_at).toLocaleDateString().toUpperCase()}</span>
          <span>AUTHOR: <AuthorLink userId={piece.user_id} authorName={piece.author_name.toUpperCase()} className="hover:underline" /></span>
          <span>READ: {readingTime} MIN</span>
          {piece.view_count !== null && <span>VIEWS: {piece.view_count}</span>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-2 p-8 md:p-12 border-r border-border">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {renderContent(piece.content)}
          </div>
          <InkComments pieceId={piece.id} />
        </div>
        <div className="bg-muted p-8 border-t md:border-t-0">
          <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">Summary</h3>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">{piece.summary}</p>
          <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">Metadata</h3>
          <ul className="space-y-2 text-sm text-muted-foreground mb-8">
            <li className="flex justify-between border-b border-border pb-1"><span>Role</span> <span className="font-medium">{piece.author_role}</span></li>
            <li className="flex justify-between border-b border-border pb-1"><span>Type</span> <span className="font-medium">{piece.type}</span></li>
          </ul>
          <SocialShare title={piece.title} summary={piece.summary || ''} className="mb-4" />
          <Button className="w-full gap-2" variant="outline"><Printer size={16}/> Print Report</Button>
        </div>
      </div>
    </motion.div>
  </article>
);

const OpinionView = ({ piece, renderContent, readingTime }: ViewProps) => (
  <article className="container mx-auto px-6 max-w-3xl">
    <div className="relative mb-12 py-12 bg-primary text-primary-foreground p-8 md:p-16 overflow-hidden">
      <Quote size={120} className="absolute -right-6 -bottom-6 text-primary-foreground/5 rotate-180" />
      <span className="relative z-10 px-3 py-1 bg-accent text-primary text-xs font-bold uppercase tracking-widest mb-6 inline-block">Opinion</span>
      <h1 className="relative z-10 text-3xl md:text-5xl font-bold leading-tight mb-6">"{piece.title}"</h1>
      <div className="relative z-10 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary-foreground/20 flex items-center justify-center text-xl">💬</div>
        <div>
          <AuthorLink userId={piece.user_id} authorName={piece.author_name} className="font-bold" />
          <div className="text-primary-foreground/60 text-sm flex items-center gap-2">
            {piece.author_role}
            <span>•</span>
            <Clock size={12} /> {readingTime} min
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-6">
        <SocialShare title={piece.title} summary={piece.summary || ''} />
      </div>
    </div>
    <div className="prose prose-lg prose-slate dark:prose-invert mx-auto first-letter:text-5xl first-letter:font-bold first-letter:text-accent first-letter:mr-3 first-letter:float-left">
      {renderContent(piece.content)}
    </div>
    <div className="max-w-none">
      <InkComments pieceId={piece.id} />
    </div>
  </article>
);

const InterviewView = ({ piece, renderContent, readingTime }: ViewProps) => (
  <article className="container mx-auto px-6 max-w-4xl">
    <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
      <div className="bg-primary text-primary-foreground p-6 md:w-1/3 shrink-0">
        <Mic size={32} className="mb-4 text-accent" />
        <h3 className="text-lg font-bold mb-2">The Conversation</h3>
        <p className="text-primary-foreground/70 text-sm mb-4">An exclusive sit-down exploring key issues.</p>
        <div className="border-t border-primary-foreground/10 pt-4 mt-4">
          <p className="text-xs uppercase tracking-widest text-primary-foreground/50 mb-1">Guest</p>
          <AuthorLink userId={piece.user_id} authorName={piece.author_name} className="font-bold" />
          <p className="text-sm text-primary-foreground/60 mt-2">
            <Clock size={12} className="inline mr-1" /> {readingTime} min read
          </p>
        </div>
        <div className="mt-4">
          <SocialShare title={piece.title} summary={piece.summary || ''} />
        </div>
      </div>
      <div>
        <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4 leading-none">{piece.title}</h1>
        <p className="text-xl text-muted-foreground font-light leading-relaxed">{piece.summary}</p>
      </div>
    </div>
    <div className="bg-card p-8 md:p-12 border border-border">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        {renderContent(piece.content)}
      </div>
      <InkComments pieceId={piece.id} />
    </div>
  </article>
);

const FictionView = ({ piece, renderContent, readingTime }: ViewProps) => (
  <article className="container mx-auto px-6 max-w-2xl">
    <div className="bg-[#FFFBF0] dark:bg-card p-12 md:p-16 shadow-2xl border-l-8 border-[#8B4513] relative min-h-[60vh]">
      <div className="absolute top-8 right-8 text-[#8B4513]/20 font-serif text-6xl font-bold opacity-50 select-none">1</div>
      <h1 className="text-4xl md:text-5xl font-serif text-[#5D4037] dark:text-foreground mb-8 mt-4">{piece.title}</h1>
      <div className="flex items-center gap-2 text-[#8B4513] dark:text-accent text-sm font-bold uppercase tracking-widest mb-4">
        <span>By <AuthorLink userId={piece.user_id} authorName={piece.author_name} /></span>
        <span className="w-4 h-px bg-[#8B4513] dark:bg-accent"></span>
        <span>Short Story</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-[#8B4513]/60 dark:text-muted-foreground mb-12">
        <span><Clock size={12} className="inline mr-1" />{readingTime} min read</span>
        {piece.view_count !== null && <span>{piece.view_count} views</span>}
      </div>
      <div className="prose prose-lg prose-p:font-serif prose-headings:font-serif text-[#4E342E] dark:text-foreground leading-loose">
        {renderContent(piece.content)}
      </div>
      <div className="mt-16 flex justify-center">
        <span className="text-[#8B4513] dark:text-accent text-2xl">***</span>
      </div>
      <div className="mt-8">
        <SocialShare title={piece.title} summary={piece.summary || ''} className="justify-center" />
      </div>
      <InkComments pieceId={piece.id} />
    </div>
  </article>
);

const EssayView = ({ piece, renderContent, readingTime }: ViewProps) => (
  <article className="container mx-auto px-6 max-w-3xl">
    <div className="mb-16 text-center">
      <span className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground mb-4 inline-block">Academic Essay</span>
      <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-6">{piece.title}</h1>
      <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
      <p className="text-muted-foreground italic mb-4">By <AuthorLink userId={piece.user_id} authorName={piece.author_name} /></p>
      <div className="flex justify-center items-center gap-4 text-xs text-muted-foreground">
        <span><Clock size={12} className="inline mr-1" />{readingTime} min read</span>
        {piece.view_count !== null && <span>{piece.view_count} views</span>}
      </div>
      <div className="mt-4">
        <SocialShare title={piece.title} summary={piece.summary || ''} className="justify-center" />
      </div>
    </div>
    <div className="prose prose-xl prose-slate dark:prose-invert mx-auto font-serif">
      {renderContent(piece.content)}
    </div>
    {piece.summary && (
      <div className="mt-16 bg-muted p-8 border border-border">
        <h4 className="font-bold text-foreground mb-2">Abstract</h4>
        <p className="text-muted-foreground text-sm leading-relaxed">{piece.summary}</p>
      </div>
    )}
    <InkComments pieceId={piece.id} />
  </article>
);

const BlogView = ({ piece, renderContent, readingTime }: ViewProps) => (
  <article className="container mx-auto px-6 max-w-4xl">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="md:col-span-1">
        <div className="sticky top-32">
          <Link to={piece.user_id ? `/profile/${piece.user_id}` : '#'} className="block w-20 h-20 mb-4 overflow-hidden hover:opacity-80 transition-opacity">
            <div className="w-full h-full bg-gradient-to-br from-accent to-yellow-500 flex items-center justify-center text-primary-foreground text-2xl font-bold">
              {piece.author_name.charAt(0)}
            </div>
          </Link>
          <AuthorLink userId={piece.user_id} authorName={piece.author_name} className="font-bold text-foreground block" />
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-6">{piece.author_role}</p>
          <div className="text-sm text-muted-foreground mb-6">
            <p>Sharing thoughts and stories from the university community.</p>
          </div>
          <SocialShare title={piece.title} summary={piece.summary || ''} />
        </div>
      </div>
      <div className="md:col-span-3">
        <div className="mb-8">
          <span className="text-accent text-xs font-bold uppercase tracking-widest mb-2 block">
            {new Date(piece.created_at).toLocaleDateString()}
          </span>
          <h1 className="text-4xl font-bold text-foreground mb-4">{piece.title}</h1>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
            <span><Clock size={12} className="inline mr-1" />{readingTime} min read</span>
            {piece.view_count !== null && <span>{piece.view_count} views</span>}
          </div>
          {piece.tags && piece.tags.length > 0 && (
            <div className="flex gap-2">
              {piece.tags.map(t => (
                <span key={t} className="bg-muted text-muted-foreground px-2 py-1 text-xs">#{t}</span>
              ))}
            </div>
          )}
        </div>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {renderContent(piece.content)}
        </div>
        <InkComments pieceId={piece.id} />
      </div>
    </div>
  </article>
);

export default InksPiecePage;
