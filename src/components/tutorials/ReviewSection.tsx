import { useState, useEffect } from 'react';
import { useReviews, useAddReview, useEnrollmentStatus } from '@/hooks/useTutorials';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ReviewSectionProps {
  tutorialId: string;
}

const StarRating = ({ rating, onRate, readonly = false }: { rating: number; onRate?: (r: number) => void; readonly?: boolean }) => {
  const [hovered, setHovered] = useState(0);
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={cn(
            "transition-colors",
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            size={readonly ? 14 : 24}
            className={cn(
              "transition-colors",
              (hovered || rating) >= star 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-slate-300"
            )}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewSection = ({ tutorialId }: ReviewSectionProps) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);
  
  const { data: reviews = [], isLoading } = useReviews(tutorialId);
  const { data: isEnrolled } = useEnrollmentStatus(tutorialId, userId || undefined);
  const addReviewMutation = useAddReview();
  
  const hasReviewed = reviews.some(r => r.user_id === userId);
  const canReview = userId && isEnrolled && !hasReviewed;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || rating === 0) return;
    
    try {
      await addReviewMutation.mutateAsync({
        tutorialId,
        userId,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success('Review submitted!');
      setRating(0);
      setComment('');
      setIsWriting(false);
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };
  
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-xl text-slate-800">Reviews</h3>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={parseFloat(averageRating)} readonly />
            <span className="text-sm text-slate-500">
              {averageRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
        
        {canReview && !isWriting && (
          <Button 
            onClick={() => setIsWriting(true)}
            variant="outline"
            className="rounded-none uppercase tracking-widest text-xs font-bold"
          >
            <MessageSquare size={14} className="mr-2" />
            Write Review
          </Button>
        )}
      </div>
      
      {/* Review form */}
      {isWriting && canReview && (
        <form onSubmit={handleSubmit} className="border border-slate-200 p-6 space-y-4 bg-white">
          <div>
            <label className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-2 block">
              Your Rating
            </label>
            <StarRating rating={rating} onRate={setRating} />
          </div>
          
          <div>
            <label className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-2 block">
              Your Review (Optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this tutorial..."
              rows={4}
              className="rounded-none bg-slate-50 border-slate-200"
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={rating === 0 || addReviewMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-none uppercase tracking-widest text-xs font-bold"
            >
              {addReviewMutation.isPending ? (
                <Loader2 size={14} className="mr-2 animate-spin" />
              ) : null}
              Submit Review
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsWriting(false)}
              className="rounded-none"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
      
      {/* Reviews list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-slate-400" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border border-slate-200 p-4 bg-white">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-purple-100 text-purple-700">
                    {(review.profile?.full_name || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-800">
                      {review.profile?.full_name || 'Anonymous'}
                    </span>
                    <StarRating rating={review.rating} readonly />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {format(new Date(review.created_at), 'MMM d, yyyy')}
                  </p>
                  {review.comment && (
                    <p className="mt-2 text-slate-600 text-sm">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
