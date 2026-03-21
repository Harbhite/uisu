import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Send, MessageCircle, Heart, Flame, Laugh,
  Loader2, Shield, EyeOff, ChevronDown, ChevronUp, AlertTriangle, Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { formatDistanceToNow } from 'date-fns';

interface Confession {
  id: string;
  content: string;
  parent_id: string | null;
  is_approved: boolean;
  is_flagged: boolean;
  created_at: string;
}

interface ReactionCount {
  reaction_type: string;
  count: number;
  user_reacted: boolean;
}

const REACTIONS = [
  { type: 'like', icon: Heart, label: 'Like' },
  { type: 'fire', icon: Flame, label: 'Fire' },
  { type: 'funny', icon: Laugh, label: 'Funny' },
];

const ConfessionCard = ({ confession, reactions, replies, session, isAdmin, onReact, onReply, onApprove, onDelete }: {
  confession: Confession;
  reactions: ReactionCount[];
  replies: Confession[];
  session: any;
  isAdmin: boolean;
  onReact: (confessionId: string, type: string) => void;
  onReply: (parentId: string) => void;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [showReplies, setShowReplies] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5 space-y-3 hover:shadow-md transition-all"
    >
      {!confession.is_approved && (
        <Badge className="rounded-full text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/20">
          Pending Approval
        </Badge>
      )}
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{confession.content}</p>
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(confession.created_at), { addSuffix: true })}
        </p>
        <div className="flex items-center gap-1">
          {REACTIONS.map(r => {
            const rc = reactions.find(x => x.reaction_type === r.type);
            const count = rc?.count || 0;
            const reacted = rc?.user_reacted || false;
            return (
              <button
                key={r.type}
                onClick={() => session && onReact(confession.id, r.type)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] transition-all ${
                  reacted ? 'bg-accent/20 text-accent' : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                <r.icon size={12} fill={reacted ? 'currentColor' : 'none'} />
                {count > 0 && <span>{count}</span>}
              </button>
            );
          })}
          <button
            onClick={() => onReply(confession.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] text-muted-foreground hover:bg-muted"
          >
            <MessageCircle size={12} />
            {replies.length > 0 && <span>{replies.length}</span>}
          </button>
        </div>
      </div>

      {isAdmin && (
        <div className="flex gap-2 pt-2 border-t border-border">
          {!confession.is_approved && (
            <Button size="sm" variant="outline" className="rounded-full text-[10px] h-8" onClick={() => onApprove(confession.id)}>
              <Shield size={10} className="mr-1" /> Approve
            </Button>
          )}
          <Button size="sm" variant="outline" className="rounded-full text-[10px] h-8 text-destructive" onClick={() => onDelete(confession.id)}>
            <Flag size={10} className="mr-1" /> Remove
          </Button>
        </div>
      )}

      {replies.length > 0 && (
        <div>
          <button onClick={() => setShowReplies(!showReplies)} className="text-[10px] text-accent font-medium flex items-center gap-1">
            {showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </button>
          <AnimatePresence>
            {showReplies && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="ml-4 mt-2 space-y-2 border-l-2 border-accent/20 pl-3">
                  {replies.map(reply => (
                    <div key={reply.id} className="text-xs text-foreground/80 bg-muted/30 rounded-xl p-3">
                      <p className="whitespace-pre-wrap">{reply.content}</p>
                      <p className="text-[9px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

const ConfessionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useAdminCheck();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [reactions, setReactions] = useState<Record<string, ReactionCount[]>>({});
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [repliesMap, setRepliesMap] = useState<Record<string, Confession[]>>({});

  const fetchConfessions = useCallback(async () => {
    const { data, error } = await supabase
      .from('confessions')
      .select('*')
      .is('parent_id', null)
      .order('created_at', { ascending: false });
    if (!error && data) setConfessions(data as Confession[]);

    const { data: repliesData } = await supabase
      .from('confessions')
      .select('*')
      .not('parent_id', 'is', null)
      .order('created_at');

    const { data: reactionsData } = await supabase
      .from('confession_reactions')
      .select('*');

    if (data) {
      const allIds = [...(data || []).map(c => c.id), ...(repliesData || []).map(r => r.id)];
      const rxMap: Record<string, ReactionCount[]> = {};
      allIds.forEach(id => {
        const forThis = (reactionsData || []).filter((r: any) => r.confession_id === id);
        const types = ['like', 'fire', 'funny'];
        rxMap[id] = types.map(t => ({
          reaction_type: t,
          count: forThis.filter((r: any) => r.reaction_type === t).length,
          user_reacted: forThis.some((r: any) => r.reaction_type === t && r.user_id === user?.id),
        }));
      });
      setReactions(rxMap);
    }

    if (repliesData) {
      const rMap: Record<string, Confession[]> = {};
      (repliesData as Confession[]).forEach(r => {
        if (r.parent_id) {
          if (!rMap[r.parent_id]) rMap[r.parent_id] = [];
          rMap[r.parent_id].push(r);
        }
      });
      setRepliesMap(rMap);
    }

    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchConfessions(); }, [fetchConfessions]);

  const totalReactions = Object.values(reactions).flat().reduce((sum, r) => sum + r.count, 0);
  const pendingCount = confessions.filter(c => !c.is_approved).length;

  const handleSubmit = async () => {
    if (!content.trim()) { toast.error('Write something first'); return; }
    if (content.trim().length < 10) { toast.error('At least 10 characters'); return; }
    if (content.trim().length > 1000) { toast.error('Max 1000 characters'); return; }
    setSubmitting(true);
    const { error } = await supabase.from('confessions').insert({
      content: content.trim(),
      parent_id: replyTo,
      is_approved: isAdmin,
    });
    if (error) toast.error('Failed to submit');
    else {
      toast.success(isAdmin ? 'Posted!' : 'Submitted for moderation');
      setContent(''); setReplyTo(null); fetchConfessions();
    }
    setSubmitting(false);
  };

  const handleReact = async (confessionId: string, type: string) => {
    if (!user?.id) { toast.error('Sign in to react'); return; }
    const existing = (reactions[confessionId] || []).find(r => r.reaction_type === type);
    if (existing?.user_reacted) {
      await supabase.from('confession_reactions').delete()
        .eq('confession_id', confessionId).eq('user_id', user.id).eq('reaction_type', type);
    } else {
      await supabase.from('confession_reactions').insert({
        confession_id: confessionId, user_id: user.id, reaction_type: type,
      });
    }
    fetchConfessions();
  };

  const handleApprove = async (id: string) => {
    await supabase.from('confessions').update({ is_approved: true }).eq('id', id);
    toast.success('Approved'); fetchConfessions();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('confessions').delete().eq('id', id);
    toast.success('Removed'); fetchConfessions();
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Confessions | UISU" description="Anonymous confessions board" />

      {/* Hero */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 pt-24 pb-8 max-w-2xl">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate(-1)} className="p-2.5 border border-primary-foreground/20 hover:border-accent transition-colors rounded-full">
              <ArrowLeft size={14} />
            </button>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-primary-foreground/50">Anonymous</p>
              <h1 className="text-xl md:text-2xl font-serif font-bold">Confessions Board</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="bg-primary-foreground/10 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-medium flex items-center gap-1.5">
              <MessageCircle size={10} /> {confessions.length} Confessions
            </span>
            {isAdmin && pendingCount > 0 && (
              <span className="bg-amber-500/20 text-amber-200 rounded-full px-3 py-1 text-[10px] font-medium flex items-center gap-1.5">
                <Shield size={10} /> {pendingCount} Pending
              </span>
            )}
            <span className="bg-primary-foreground/10 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-medium flex items-center gap-1.5">
              <Heart size={10} /> {totalReactions} Reactions
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Submit box */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <EyeOff size={12} />
            <span>Your identity is completely anonymous</span>
          </div>
          {replyTo && (
            <div className="flex items-center gap-2 text-xs text-accent bg-accent/5 rounded-xl px-3 py-2">
              <MessageCircle size={12} />
              <span>Replying to a confession</span>
              <button onClick={() => setReplyTo(null)} className="ml-auto text-muted-foreground hover:text-foreground">✕</button>
            </div>
          )}
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={replyTo ? "Write your reply..." : "Share something on your mind..."}
            className="min-h-[80px] text-sm resize-none rounded-xl"
            maxLength={1000}
          />
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="rounded-full text-[10px] font-normal">
              {content.length}/1000
            </Badge>
            <Button onClick={handleSubmit} disabled={submitting || content.trim().length < 10} size="sm" className="rounded-full bg-primary text-primary-foreground">
              {submitting ? <Loader2 size={14} className="animate-spin mr-1" /> : <Send size={14} className="mr-1" />}
              {replyTo ? 'Reply' : 'Confess'}
            </Button>
          </div>
          <p className="text-[9px] text-muted-foreground flex items-center gap-1">
            <AlertTriangle size={9} /> All posts are moderated. Hate speech and harassment will be removed.
          </p>
        </div>

        {/* Confessions list */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
        ) : confessions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
              <MessageCircle size={32} />
            </div>
            <p className="font-medium">No confessions yet</p>
            <p className="text-xs mt-1">Be the first to share something.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {confessions.map(c => (
              <ConfessionCard
                key={c.id}
                confession={c}
                reactions={reactions[c.id] || []}
                replies={repliesMap[c.id] || []}
                session={user}
                isAdmin={isAdmin}
                onReact={handleReact}
                onReply={(parentId) => { setReplyTo(parentId); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                onApprove={handleApprove}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfessionsPage;
