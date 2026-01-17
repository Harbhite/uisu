import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LikeButtonProps {
  pieceId: string;
  initialLikeCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  pieceId,
  initialLikeCount = 0,
  size = 'md',
  showCount = true,
  className = ''
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const iconSize = size === 'sm' ? 14 : size === 'md' ? 18 : 22;

  useEffect(() => {
    const checkLikeStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Check if user has liked this piece
        const { data } = await supabase
          .from('ink_likes')
          .select('id')
          .eq('piece_id', pieceId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        setIsLiked(!!data);
      }

      // Get total like count
      const { count } = await supabase
        .from('ink_likes')
        .select('*', { count: 'exact', head: true })
        .eq('piece_id', pieceId);
      
      if (count !== null) {
        setLikeCount(count);
      }
    };

    checkLikeStatus();
  }, [pieceId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!userId) {
      toast.error('Please sign in to like pieces');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('ink_likes')
          .delete()
          .eq('piece_id', pieceId)
          .eq('user_id', userId);

        if (error) throw error;
        
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        // Like
        const { error } = await supabase
          .from('ink_likes')
          .insert({ piece_id: pieceId, user_id: userId });

        if (error) throw error;
        
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-1.5 transition-all group ${className}`}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isLiked ? 'liked' : 'not-liked'}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <Heart
            size={iconSize}
            className={`transition-colors ${
              isLiked 
                ? 'fill-red-500 text-red-500' 
                : 'text-muted-foreground group-hover:text-red-400'
            }`}
          />
        </motion.div>
      </AnimatePresence>
      {showCount && (
        <span className={`text-xs tabular-nums ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}>
          {likeCount}
        </span>
      )}
    </button>
  );
};
