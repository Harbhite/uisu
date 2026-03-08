import { useParams, Link } from 'react-router-dom';
import { useTutorial, useTutor, useTutorials } from '@/hooks/useTutorials';
import { useTutorialReviews, useSubmitReview } from '@/hooks/useTutorialReviews';
import CoursePlayer from '@/components/tutorials/CoursePlayer';
import TutorialCard from '@/components/tutorials/TutorialCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Star, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const TutorialDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: tutorial, isLoading, error } = useTutorial(id || '');
  const { data: tutor } = useTutor(tutorial?.tutor_id || '');
  const { data: allTutorials = [] } = useTutorials();
  const { data: reviews = [] } = useTutorialReviews(id || '');
  const submitReview = useSubmitReview();
  const { user } = useAuth();

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  if (!tutorial || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Tutorial Not Found</h2>
        <p className="text-slate-500 mb-6">The tutorial you are looking for does not exist or has been removed.</p>
        <Link to="/tutorials/catalog">
          <Button>Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  // Feature #17: Related tutorials (same tags or same tutor)
  const relatedTutorials = allTutorials
    .filter(t => t.id !== tutorial.id && (
      t.tutor_id === tutorial.tutor_id ||
      (t.tags || []).some(tag => (tutorial.tags || []).includes(tag))
    ))
    .slice(0, 3);

  const handleSubmitReview = () => {
    if (!user) { toast.error('Please sign in to leave a review'); return; }
    submitReview.mutate(
      { tutorialId: tutorial.id, rating: reviewRating, comment: reviewComment },
      {
        onSuccess: () => { toast.success('Review submitted!'); setReviewComment(''); },
        onError: (err: any) => toast.error(err.message || 'Failed to submit review'),
      }
    );
  };

  return (
    <div className="space-y-8">
      <Link to="/tutorials/catalog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-purple-600 transition-colors">
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      <CoursePlayer tutorial={tutorial} tutorName={tutor?.name} />

      {/* Reviews Section - Feature #12 */}
      <div className="bg-white border border-purple-100 p-8">
        <h3 className="text-xl font-serif font-bold text-[#2D1B4E] mb-6">Reviews ({reviews.length})</h3>
        
        {/* Submit review */}
        {user && (
          <div className="mb-8 p-6 bg-purple-50 border border-purple-100">
            <h4 className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-4">Leave a Review</h4>
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setReviewRating(s)} className="p-0.5">
                  <Star size={20} className={s <= reviewRating ? "text-yellow-500 fill-current" : "text-slate-300"} />
                </button>
              ))}
            </div>
            <Textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="rounded-none border-purple-200 bg-white mb-3"
              rows={3}
            />
            <Button onClick={handleSubmitReview} disabled={submitReview.isPending} className="rounded-none bg-purple-600 hover:bg-purple-700 text-xs uppercase tracking-widest gap-2">
              <Send size={12} /> Submit Review
            </Button>
          </div>
        )}

        {/* Review list */}
        {reviews.length === 0 ? (
          <p className="text-slate-400 text-sm">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="p-4 border border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={14} className={s <= review.rating ? "text-yellow-500 fill-current" : "text-slate-200"} />
                  ))}
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest ml-2">
                    {format(new Date(review.created_at), 'MMM dd, yyyy')}
                  </span>
                </div>
                {review.comment && <p className="text-sm text-slate-600">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Tutorials - Feature #17 */}
      {relatedTutorials.length > 0 && (
        <div>
          <h3 className="text-xl font-serif font-bold text-[#2D1B4E] mb-6">Related Tutorials</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedTutorials.map(t => (
              <TutorialCard key={t.id} tutorial={t} tutor={allTutorials.find(at => at.tutor_id === t.tutor_id) ? undefined : undefined} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorialDetailPage;
