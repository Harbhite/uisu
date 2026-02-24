import { Skeleton } from "@/components/ui/skeleton";

export const InksVaultSkeleton = () => (
  <div className="min-h-screen bg-background pt-32 pb-16">
    <div className="container mx-auto px-6">
      {/* Header */}
      <div className="mb-12">
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-12 w-64 mb-2" />
        <Skeleton className="h-12 w-40 mb-8" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>

      {/* Tabs / Filters */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border border-border overflow-hidden">
            <Skeleton className="h-52 w-full" />
            <div className="p-5">
              <Skeleton className="h-5 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
