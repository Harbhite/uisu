import { Skeleton } from "@/components/ui/skeleton";

export const LeadersPageSkeleton = () => (
  <div className="min-h-screen bg-background pt-32 pb-16">
    <div className="container mx-auto px-6">
      {/* Back button */}
      <Skeleton className="h-8 w-40 mb-12" />
      
      {/* Header */}
      <div className="mb-20">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-16 w-80 mb-2" />
        <Skeleton className="h-16 w-48 mb-8" />
        <Skeleton className="h-6 w-full max-w-2xl" />
        <Skeleton className="h-6 w-3/4 max-w-2xl mt-2" />
      </div>

      {/* Section title */}
      <div className="flex items-center gap-4 mb-10">
        <Skeleton className="h-8 w-64" />
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>

      {/* Second section */}
      <div className="flex items-center gap-4 mb-10 mt-20">
        <Skeleton className="h-8 w-72" />
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
