import { useProgress, useMarkComplete, useTutorialModules } from '@/hooks/useTutorials';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProgressTrackerProps {
  tutorialId: string;
  currentModuleId?: string;
  onModuleComplete?: () => void;
}

const ProgressTracker = ({ tutorialId, currentModuleId, onModuleComplete }: ProgressTrackerProps) => {
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);
  
  const { data: modules = [] } = useTutorialModules(tutorialId);
  const { data: completedModuleIds = [] } = useProgress(tutorialId, userId || undefined);
  const markCompleteMutation = useMarkComplete();
  
  const progressPercent = modules.length > 0 
    ? Math.round((completedModuleIds.length / modules.length) * 100) 
    : 0;
  
  const isCurrentComplete = currentModuleId ? completedModuleIds.includes(currentModuleId) : false;
  
  const handleMarkComplete = async () => {
    if (!userId || !currentModuleId) return;
    
    try {
      await markCompleteMutation.mutateAsync({ 
        moduleId: currentModuleId, 
        tutorialId, 
        userId 
      });
      toast.success('Module marked as complete!');
      onModuleComplete?.();
    } catch (error) {
      toast.error('Failed to mark module as complete');
    }
  };
  
  if (!userId) return null;
  
  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs uppercase tracking-widest font-bold text-slate-500">
          <span>Progress</span>
          <span>{progressPercent}% Complete</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>
      
      {/* Module checklist (compact) */}
      <div className="flex flex-wrap gap-2">
        {modules.map((module, index) => {
          const isComplete = completedModuleIds.includes(module.id);
          const isCurrent = module.id === currentModuleId;
          
          return (
            <div
              key={module.id}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all",
                isComplete 
                  ? "bg-green-100 text-green-700" 
                  : isCurrent 
                    ? "bg-purple-100 text-purple-700 ring-2 ring-purple-300"
                    : "bg-slate-100 text-slate-500"
              )}
            >
              {isComplete ? (
                <CheckCircle2 size={12} className="text-green-600" />
              ) : (
                <Circle size={12} />
              )}
              <span>{index + 1}</span>
            </div>
          );
        })}
      </div>
      
      {/* Mark complete button */}
      {currentModuleId && !isCurrentComplete && (
        <Button
          onClick={handleMarkComplete}
          disabled={markCompleteMutation.isPending}
          className="w-full bg-green-600 hover:bg-green-700 text-white rounded-none uppercase tracking-widest text-xs font-bold"
        >
          {markCompleteMutation.isPending ? (
            <Loader2 size={16} className="mr-2 animate-spin" />
          ) : (
            <CheckCircle2 size={16} className="mr-2" />
          )}
          Mark as Complete
        </Button>
      )}
      
      {isCurrentComplete && (
        <div className="flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 rounded-none">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold uppercase tracking-widest">Module Completed</span>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
