import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Send, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { User } from '@supabase/supabase-js';

interface Comment {
  id: string;
  piece_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface InkCommentsProps {
  pieceId: string;
}

export const InkComments: React.FC<InkCommentsProps> = ({ pieceId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState<User | null>(null);

  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('ink_comments')
      .select('*')
      .eq('piece_id', pieceId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else if (data) {
      // Fetch profile data for each comment
      const commentsWithProfiles = await Promise.all(
        data.map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', comment.user_id)
            .single();
          return { ...comment, profile };
        })
      );
      setComments(commentsWithProfiles);
    }
    setLoading(false);
  }, [pieceId]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchComments();
    checkAuth();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('ink_comments')
        .insert({
          piece_id: pieceId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      fetchComments();
      toast.success('Comment added');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add comment';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('ink_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="mt-16 pt-8 border-t border-border">
      <h3 className="font-bold text-foreground mb-6 flex items-center gap-2 text-lg">
        <MessageCircle size={20} />
        Discussion ({comments.length})
      </h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="mb-3 bg-muted border-border resize-none"
          />
          <Button 
            type="submit" 
            disabled={submitting || !newComment.trim()}
            size="sm"
            className="bg-accent hover:bg-accent/90 text-primary"
          >
            {submitting ? (
              <Loader2 size={14} className="mr-2 animate-spin" />
            ) : (
              <Send size={14} className="mr-2" />
            )}
            Post Comment
          </Button>
        </form>
      ) : (
        <div className="bg-muted p-4 mb-8 border border-border text-center">
          <p className="text-muted-foreground text-sm mb-3">Sign in to join the discussion</p>
          <Button variant="outline" size="sm" asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="group flex gap-4">
              <div className="w-10 h-10 shrink-0 bg-muted flex items-center justify-center text-foreground font-bold text-sm border border-border">
                {comment.profile?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground text-sm">
                    {comment.profile?.full_name || 'Anonymous'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed">
                  {comment.content}
                </p>
                {user?.id === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="mt-2 text-xs text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InkComments;
