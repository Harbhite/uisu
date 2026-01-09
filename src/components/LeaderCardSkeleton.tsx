import { Skeleton } from "@/components/ui/skeleton";

export const LeaderCardSkeleton = () => {
  return (
    <div className="group block bg-background border border-border transition-all duration-300">
      <div className="aspect-[4/5] bg-muted relative overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="p-6 border-t border-border">
        <div className="flex items-start justify-between gap-2 mb-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
};
