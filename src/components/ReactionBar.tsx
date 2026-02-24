import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const REACTIONS = [
  { key: 'like', emoji: '❤️', label: 'Like' },
  { key: 'insightful', emoji: '💡', label: 'Insightful' },
  { key: 'fire', emoji: '🔥', label: 'Fire' },
  { key: 'clap', emoji: '👏', label: 'Clap' },
  { key: 'love', emoji: '🥰', label: 'Love' },
] as const;

type ReactionKey = typeof REACTIONS[number]['key'];

interface ReactionBarProps {
  pieceId: string;
  className?: string;
}

export const ReactionBar: React.FC<ReactionBarProps> = ({ pieceId, className = '' }) => {
  const [counts, setCounts] = useState<Record<ReactionKey, number>>({ like: 0, insightful: 0, fire: 0, clap: 0, love: 0 });
  const [userReactions, setUserReactions] = useState<Set<ReactionKey>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<ReactionKey | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      // Fetch all reaction counts
      const { data: allReactions } = await supabase
        .from('ink_reactions' as any)
        .select('reaction, user_id')
        .eq('piece_id', pieceId);

      if (allReactions) {
        const newCounts: Record<string, number> = { like: 0, insightful: 0, fire: 0, clap: 0, love: 0 };
        const userSet = new Set<ReactionKey>();
        (allReactions as any[]).forEach((r) => {
          newCounts[r.reaction] = (newCounts[r.reaction] || 0) + 1;
          if (user && r.user_id === user.id) userSet.add(r.reaction as ReactionKey);
        });
        setCounts(newCounts as Record<ReactionKey, number>);
        setUserReactions(userSet);
      }
    };
    init();
  }, [pieceId]);

  const toggleReaction = async (reaction: ReactionKey) => {
    if (!userId) {
      toast.error('Please sign in to react');
      return;
    }
    if (loading) return;
    setLoading(reaction);

    try {
      if (userReactions.has(reaction)) {
        await supabase
          .from('ink_reactions' as any)
          .delete()
          .eq('piece_id', pieceId)
          .eq('user_id', userId)
          .eq('reaction', reaction);
        setUserReactions(prev => { const n = new Set(prev); n.delete(reaction); return n; });
        setCounts(prev => ({ ...prev, [reaction]: Math.max(0, prev[reaction] - 1) }));
      } else {
        await supabase
          .from('ink_reactions' as any)
          .insert({ piece_id: pieceId, user_id: userId, reaction });
        setUserReactions(prev => new Set(prev).add(reaction));
        setCounts(prev => ({ ...prev, [reaction]: prev[reaction] + 1 }));
      }
    } catch {
      toast.error('Failed to update reaction');
    } finally {
      setLoading(null);
    }
  };

  const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {REACTIONS.map(({ key, emoji, label }) => {
        const isActive = userReactions.has(key);
        const count = counts[key];
        return (
          <button
            key={key}
            onClick={() => toggleReaction(key)}
            disabled={loading === key}
            title={label}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all border ${
              isActive
                ? 'bg-accent/15 border-accent text-accent'
                : 'bg-muted/50 border-border text-muted-foreground hover:border-accent/50'
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={isActive ? 'active' : 'idle'}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="text-sm"
              >
                {emoji}
              </motion.span>
            </AnimatePresence>
            {count > 0 && <span className="font-bold tabular-nums">{count}</span>}
          </button>
        );
      })}
      {totalReactions > 0 && (
        <span className="text-[10px] text-muted-foreground ml-1">{totalReactions} reactions</span>
      )}
    </div>
  );
};
