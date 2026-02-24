import { Skeleton } from "@/components/ui/skeleton";

export const CommunitiesSkeleton = () => (
  <div className="min-h-screen bg-background pt-32 pb-16">
    <div className="container mx-auto px-6">
      {/* Back button */}
      <Skeleton className="h-8 w-40 mb-12" />

      {/* Header */}
      <div className="mb-16">
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-14 w-72 mb-2" />
        <Skeleton className="h-14 w-48 mb-8" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>

      {/* Search + filter */}
      <div className="flex gap-4 mb-8">
        <Skeleton className="h-12 flex-1" />
        <Skeleton className="h-12 w-32" />
      </div>

      {/* Category pills */}
      <div className="flex gap-3 mb-10 flex-wrap">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>

      {/* Club cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border border-border p-6">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-4/5 mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
