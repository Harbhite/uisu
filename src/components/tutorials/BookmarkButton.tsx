import { Button } from '@/components/ui/button';
import { useToggleBookmark, useBookmarkStatus } from '@/hooks/useTutorials';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bookmark, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  tutorialId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

const BookmarkButton = ({ tutorialId, className, size = 'icon' }: BookmarkButtonProps) => {
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  const { data: isBookmarked, isLoading: statusLoading } = useBookmarkStatus(tutorialId, userId || undefined);
  const toggleMutation = useToggleBookmark();
  
  const isLoading = statusLoading || toggleMutation.isPending;
  
  if (!userId) return null;
  
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await toggleMutation.mutateAsync({ tutorialId, userId, isBookmarked: !!isBookmarked });
      toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };
  
  return (
    <Button 
      onClick={handleClick} 
      disabled={isLoading}
      size={size}
      variant="ghost"
      className={cn(
        "hover:bg-purple-100 transition-colors",
        isBookmarked && "text-purple-600",
        className
      )}
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Bookmark size={18} className={cn(isBookmarked && "fill-current")} />
      )}
    </Button>
  );
};

export default BookmarkButton;
