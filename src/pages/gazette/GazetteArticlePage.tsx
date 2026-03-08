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
        // Increment view count
        supabase.from('gazette_articles').update({ view_count: (data.view_count || 0) + 1 }).eq('id', data.id).then();

        // Fetch reactions
        const { data: rxns } = await supabase.from('gazette_reactions').select('reaction_type').eq('article_id', data.id);
        const counts: Record<string, number> = {};
        rxns?.forEach(r => { counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1; });
        setReactions(counts);

        // Fetch comments with profiles
        const { data: cmts } = await supabase
          .from('gazette_comments')
          .select('*, profiles:user_id(full_name, avatar_url)')
          .eq('article_id', data.id)
          .order('created_at', { ascending: true });
        setComments(cmts || []);

        // Fetch user-specific data
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

  // Render EditorJS content blocks
  const renderContent = (content: any) => {
    if (!content?.blocks) return <p className="text-muted-foreground">No content available.</p>;
    return content.blocks.map((block: any, i: number) => {
      switch (block.type) {
        case 'header': {
          const Tag = `h${block.data.level}` as keyof JSX.IntrinsicElements;
          return <Tag key={i} className="font-serif font-bold mt-8 mb-3" dangerouslySetInnerHTML={{ __html: block.data.text }} />;
        }
        case 'paragraph':
          return <p key={i} className="mb-4 leading-relaxed text-foreground/90" dangerouslySetInnerHTML={{ __html: block.data.text }} />;
        case 'list':
          return block.data.style === 'ordered'
            ? <ol key={i} className="list-decimal pl-6 mb-4 space-y-1">{block.data.items.map((item: string, j: number) => <li key={j} dangerouslySetInnerHTML={{ __html: item }} />)}</ol>
            : <ul key={i} className="list-disc pl-6 mb-4 space-y-1">{block.data.items.map((item: string, j: number) => <li key={j} dangerouslySetInnerHTML={{ __html: item }} />)}</ul>;
        case 'image':
          return <figure key={i} className="my-6"><img src={block.data.file?.url || block.data.url} alt={block.data.caption || ''} className="w-full" />{block.data.caption && <figcaption className="text-xs text-muted-foreground mt-2 text-center">{block.data.caption}</figcaption>}</figure>;
        case 'quote':
          return <blockquote key={i} className="border-l-4 border-accent pl-4 italic my-6 text-muted-foreground">{block.data.text}<cite className="block text-xs mt-2 not-italic">— {block.data.caption}</cite></blockquote>;
        case 'delimiter':
          return <hr key={i} className="my-8 border-border" />;
        default:
          return null;
      }
    });
  };

  return (
    <article className="max-w-3xl mx-auto">
      <Link to="/gazette" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-8 uppercase tracking-widest font-bold">
        <ArrowLeft size={14} /> Back to Gazette
      </Link>

      {/* Header */}
      <header className="mb-8 space-y-4">
        <Badge variant="outline">{article.category}</Badge>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight">{article.title}</h1>
        {article.summary && <p className="text-lg text-muted-foreground">{article.summary}</p>}
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><User size={14} /> {article.author_name}</span>
          {article.published_at && <span>{format(new Date(article.published_at), 'MMMM d, yyyy')}</span>}
          <span className="flex items-center gap-1"><Clock size={14} /> {article.reading_time} min read</span>
          <span className="flex items-center gap-1"><Eye size={14} /> {article.view_count} views</span>
        </div>
      </header>

      {/* Cover Image */}
      {article.cover_image && (
        <img src={article.cover_image} alt={article.title} className="w-full aspect-[16/9] object-cover mb-8" />
      )}

      {/* Content */}
      <div className="prose-sm md:prose max-w-none mb-12">
        {renderContent(article.content)}
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 py-6 border-y border-border mb-8">
        <div className="flex items-center gap-2">
          {REACTIONS.map(({ type, icon: Icon, label }) => (
            <Button
              key={type}
              variant={userReactions.includes(type) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleReaction(type)}
              className="gap-1.5"
            >
              <Icon size={14} />
              {reactions[type] || 0}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={toggleBookmark}>
            {isBookmarked ? <BookmarkCheck size={18} className="text-accent" /> : <Bookmark size={18} />}
          </Button>
          <SocialShare title={article.title} summary={article.summary || ''} />
        </div>
      </div>

      {/* Comments */}
      <section className="space-y-6">
        <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-muted-foreground flex items-center gap-2">
          <MessageCircle size={14} /> Comments ({comments.length})
        </h3>

        {user && (
          <div className="flex gap-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="min-h-[80px]"
            />
            <Button onClick={submitComment} disabled={submittingComment || !newComment.trim()} size="sm" className="self-end">
              <Send size={14} />
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border border-border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{(comment.profiles as any)?.full_name || 'Anonymous'}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{format(new Date(comment.created_at), 'MMM d, yyyy')}</span>
                  {user && comment.user_id === user.id && (
                    <button onClick={() => deleteComment(comment.id)} className="text-destructive hover:text-destructive/80"><Trash2 size={12} /></button>
                  )}
                </div>
              </div>
              <p className="text-sm text-foreground/80">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>}
        </div>
      </section>
    </article>
  );
};

export default GazetteArticlePage;
