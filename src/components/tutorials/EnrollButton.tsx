import { Button } from '@/components/ui/button';
import { useEnroll, useUnenroll, useEnrollmentStatus } from '@/hooks/useTutorials';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LogIn, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EnrollButtonProps {
  tutorialId: string;
  className?: string;
  variant?: 'default' | 'outline';
}

const EnrollButton = ({ tutorialId, className, variant = 'default' }: EnrollButtonProps) => {
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
  
  const { data: isEnrolled, isLoading: statusLoading } = useEnrollmentStatus(tutorialId, userId || undefined);
  const enrollMutation = useEnroll();
  const unenrollMutation = useUnenroll();
  
  const isLoading = statusLoading || enrollMutation.isPending || unenrollMutation.isPending;
  
  if (!userId) {
    return (
      <Button asChild className={className} variant={variant}>
        <Link to="/auth">
          <LogIn size={16} className="mr-2" />
          Sign in to Enroll
        </Link>
      </Button>
    );
  }
  
  const handleClick = async () => {
    try {
      if (isEnrolled) {
        await unenrollMutation.mutateAsync({ tutorialId, userId });
        toast.success('Successfully unenrolled from tutorial');
      } else {
        await enrollMutation.mutateAsync({ tutorialId, userId });
        toast.success('Successfully enrolled in tutorial!');
      }
    } catch (error) {
      toast.error('Failed to update enrollment');
    }
  };
  
  return (
    <Button 
      onClick={handleClick} 
      disabled={isLoading}
      className={className}
      variant={isEnrolled ? 'outline' : variant}
    >
      {isLoading ? (
        <Loader2 size={16} className="mr-2 animate-spin" />
      ) : isEnrolled ? (
        <UserMinus size={16} className="mr-2" />
      ) : (
        <UserPlus size={16} className="mr-2" />
      )}
      {isEnrolled ? 'Unenroll' : 'Enroll Now'}
    </Button>
  );
};

export default EnrollButton;
