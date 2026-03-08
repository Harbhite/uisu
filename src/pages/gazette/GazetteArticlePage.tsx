import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SocialShare } from '@/components/SocialShare';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Bookmark, BookmarkCheck, Clock, Eye, User, ArrowLeft,
  Heart, ThumbsUp, Lightbulb, MessageCircle, Send, Trash2
} from 'lucide-react';

const REACTIONS = [
  { type: 'like', icon: ThumbsUp, label: 'Like' },
  { type: 'love', icon: Heart, label: 'Love' },
  { type: 'insightful', icon: Lightbulb, label: 'Insightful' },
];

const GazetteArticlePage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchArticle = async () => {
      const { data } = await supabase
        .from('gazette_articles')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (data) {
        setArticle(data);
        supabase.from('gazette_articles').update({ view_count: (data.view_count || 0) + 1 }).eq('id', data.id).then();

        const { data: rxns } = await supabase.from('gazette_reactions').select('reaction_type').eq('article_id', data.id);
        const counts: Record<string, number> = {};
        rxns?.forEach(r => { counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1; });
        setReactions(counts);

        const { data: cmts } = await supabase
          .from('gazette_comments')
          .select('*, profiles:user_id(full_name, avatar_url)')
          .eq('article_id', data.id)
          .order('created_at', { ascending: true });
        setComments(cmts || []);

        if (user) {
          const [bookmarkRes, userRxnRes] = await Promise.all([
            supabase.from('gazette_bookmarks').select('id').eq('article_id', data.id).eq('user_id', user.id).maybeSingle(),
            supabase.from('gazette_reactions').select('reaction_type').eq('article_id', data.id).eq('user_id', user.id),
          ]);
          setIsBookmarked(!!bookmarkRes.data);
          setUserReactions(userRxnRes.data?.map(r => r.reaction_type) || []);
        }
      }
      setLoading(false);
    };
    fetchArticle();
  }, [slug, user]);

  const toggleBookmark = async () => {
    if (!user || !article) return toast.error('Sign in to bookmark');
    if (isBookmarked) {
      await supabase.from('gazette_bookmarks').delete().eq('article_id', article.id).eq('user_id', user.id);
      setIsBookmarked(false);
      toast.success('Bookmark removed');
    } else {
      await supabase.from('gazette_bookmarks').insert({ article_id: article.id, user_id: user.id });
      setIsBookmarked(true);
      toast.success('Article bookmarked');
    }
  };

  const toggleReaction = async (type: string) => {
    if (!user || !article) return toast.error('Sign in to react');
    if (userReactions.includes(type)) {
      await supabase.from('gazette_reactions').delete().eq('article_id', article.id).eq('user_id', user.id).eq('reaction_type', type);
      setUserReactions(prev => prev.filter(r => r !== type));
      setReactions(prev => ({ ...prev, [type]: Math.max(0, (prev[type] || 0) - 1) }));
    } else {
      await supabase.from('gazette_reactions').insert({ article_id: article.id, user_id: user.id, reaction_type: type });
      setUserReactions(prev => [...prev, type]);
      setReactions(prev => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
    }
  };

  const submitComment = async () => {
    if (!user || !article) return toast.error('Sign in to comment');
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    const { data, error } = await supabase
      .from('gazette_comments')
      .insert({ article_id: article.id, user_id: user.id, content: newComment.trim() })
      .select('*, profiles:user_id(full_name, avatar_url)')
      .single();
    if (error) { toast.error('Failed to post comment'); }
    else { setComments(prev => [...prev, data]); setNewComment(''); toast.success('Comment posted'); }
    setSubmittingComment(false);
  };

  const deleteComment = async (commentId: string) => {
    await supabase.from('gazette_comments').delete().eq('id', commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
    toast.success('Comment deleted');
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
  if (!article) return <div className="text-center py-20 text-muted-foreground"><p>Article not found.</p><Link to="/gazette" className="text-accent underline">Back to Gazette</Link></div>;

  const renderContent = (content: any) => {
    if (!content?.blocks) return <p className="text-muted-foreground">No content available.</p>;
    return content.blocks.map((block: any, i: number) => {
      switch (block.type) {
        case 'header': {
          const Tag = `h${block.data.level}` as keyof JSX.IntrinsicElements;
          return <Tag key={i} className="font-serif font-bold mt-10 mb-4 text-foreground" dangerouslySetInnerHTML={{ __html: block.data.text }} />;
        }
        case 'paragraph':
          return <p key={i} className="mb-5 leading-[1.8] text-foreground/85 font-serif text-[17px]" dangerouslySetInnerHTML={{ __html: block.data.text }} />;
        case 'list':
          return block.data.style === 'ordered'
            ? <ol key={i} className="list-decimal pl-6 mb-5 space-y-2 font-serif text-foreground/85">{block.data.items.map((item: string, j: number) => <li key={j} dangerouslySetInnerHTML={{ __html: item }} />)}</ol>
            : <ul key={i} className="list-disc pl-6 mb-5 space-y-2 font-serif text-foreground/85">{block.data.items.map((item: string, j: number) => <li key={j} dangerouslySetInnerHTML={{ __html: item }} />)}</ul>;
        case 'image':
          return <figure key={i} className="my-8"><img src={block.data.file?.url || block.data.url} alt={block.data.caption || ''} className="w-full" />{block.data.caption && <figcaption className="text-[11px] text-muted-foreground mt-2 text-center uppercase tracking-wider">{block.data.caption}</figcaption>}</figure>;
        case 'quote':
          return <blockquote key={i} className="border-l-4 border-accent pl-6 py-2 my-8 text-lg font-serif italic text-foreground/70">{block.data.text}<cite className="block text-xs mt-3 not-italic text-muted-foreground uppercase tracking-wider">— {block.data.caption}</cite></blockquote>;
        case 'delimiter':
          return <div key={i} className="my-10 flex items-center justify-center gap-2"><span className="w-1.5 h-1.5 bg-accent rounded-full" /><span className="w-1.5 h-1.5 bg-accent/50 rounded-full" /><span className="w-1.5 h-1.5 bg-accent/25 rounded-full" /></div>;
        default:
          return null;
      }
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <Link to="/gazette" className="inline-flex items-center gap-2 text-[10px] text-muted-foreground hover:text-foreground mb-8 uppercase tracking-[0.2em] font-bold transition-colors">
        <ArrowLeft size={12} /> Back to Gazette
      </Link>

      {/* Header */}
      <header className="mb-10 space-y-5">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] uppercase tracking-[0.15em]">{article.category}</Badge>
          {article.is_featured && <Badge className="bg-accent text-accent-foreground text-[9px]">Featured</Badge>}
        </div>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground leading-[1.05] tracking-tight">{article.title}</h1>
        {article.summary && <p className="text-lg text-muted-foreground leading-relaxed font-serif italic">{article.summary}</p>}
        <div className="flex items-center gap-5 text-xs text-muted-foreground flex-wrap pt-2 border-t border-border">
          <span className="flex items-center gap-1.5 font-medium"><User size={13} /> {article.author_name}</span>
          {article.published_at && <span>{format(new Date(article.published_at), 'MMMM d, yyyy')}</span>}
          <span className="flex items-center gap-1"><Clock size={12} /> {article.reading_time} min read</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {article.view_count}</span>
        </div>
      </header>

      {/* Cover Image */}
      {article.cover_image && (
        <img src={article.cover_image} alt={article.title} className="w-full aspect-[16/9] object-cover mb-10" />
      )}

      {/* Content */}
      <div className="mb-14">
        {renderContent(article.content)}
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 py-5 border-y border-border mb-10">
        <div className="flex items-center gap-2">
          {REACTIONS.map(({ type, icon: Icon }) => (
            <button
              key={type}
              onClick={() => toggleReaction(type)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider border transition-all ${
                userReactions.includes(type)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent text-muted-foreground border-border hover:border-accent hover:text-accent'
              }`}
            >
              <Icon size={13} />
              {reactions[type] || 0}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleBookmark} className="text-muted-foreground hover:text-accent transition-colors p-2">
            {isBookmarked ? <BookmarkCheck size={18} className="text-accent" /> : <Bookmark size={18} />}
          </button>
          <SocialShare title={article.title} summary={article.summary || ''} />
        </div>
      </div>

      {/* Comments */}
      <section className="space-y-6">
        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground flex items-center gap-2">
          <MessageCircle size={13} /> Discussion ({comments.length})
        </h3>

        {user && (
          <div className="flex gap-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="min-h-[80px] font-serif"
            />
            <Button onClick={submitComment} disabled={submittingComment || !newComment.trim()} size="sm" className="self-end">
              <Send size={14} />
            </Button>
          </div>
        )}

        <div className="space-y-0 divide-y divide-border">
          {comments.map((comment) => (
            <div key={comment.id} className="py-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">{(comment.profiles as any)?.full_name || 'Anonymous'}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{format(new Date(comment.created_at), 'MMM d, yyyy')}</span>
                  {user && comment.user_id === user.id && (
                    <button onClick={() => deleteComment(comment.id)} className="text-destructive hover:text-destructive/80"><Trash2 size={12} /></button>
                  )}
                </div>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && <p className="text-sm text-muted-foreground py-4">No comments yet. Be the first to share your thoughts!</p>}
        </div>
      </section>
    </motion.article>
  );
};

export default GazetteArticlePage;
