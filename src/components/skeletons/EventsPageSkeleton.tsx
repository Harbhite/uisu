import { Skeleton } from "@/components/ui/skeleton";

export const EventsPageSkeleton = () => (
  <div className="min-h-screen bg-background pt-32 pb-16">
    <div className="container mx-auto px-6">
      {/* Back button */}
      <Skeleton className="h-8 w-40 mb-12" />

      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-20 gap-12 border-b border-border pb-12">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-16 w-48 mb-2" />
          <Skeleton className="h-16 w-40" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Calendar grid skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border">
            <div className="flex items-center justify-between p-8 border-b border-border">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-10" />
            </div>
            {/* Days header */}
            <div className="grid grid-cols-7 border-b border-border bg-muted/50 p-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-4 mx-auto" />
              ))}
            </div>
            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-px bg-muted p-px">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square bg-card p-2">
                  <Skeleton className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
);
