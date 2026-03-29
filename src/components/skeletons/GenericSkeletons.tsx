import React from 'react';

/** Generic card-list skeleton for pages that show lists of cards with icons/badges. */
export const CardListSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-slate-100 rounded-full w-1/3" />
              <div className="h-5 bg-slate-100 rounded-full w-16" />
            </div>
            <div className="h-3 bg-slate-100 rounded-full w-4/5" />
            <div className="h-3 bg-slate-100 rounded-full w-2/3" />
            <div className="flex gap-2 pt-1">
              <div className="h-5 bg-slate-100 rounded-full w-14" />
              <div className="h-5 bg-slate-100 rounded-full w-14" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

/** Hero header skeleton with stat pills */
export const HeroHeaderSkeleton = () => (
  <div className="animate-pulse mb-8">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-4 h-4 rounded bg-slate-100" />
      <div className="h-3 bg-slate-100 rounded-full w-24" />
    </div>
    <div className="h-10 bg-slate-100 rounded w-2/3 mb-3" />
    <div className="h-4 bg-slate-100 rounded w-1/2 mb-5" />
    <div className="flex gap-2">
      <div className="h-7 bg-slate-100 rounded-full w-20" />
      <div className="h-7 bg-slate-100 rounded-full w-24" />
      <div className="h-7 bg-slate-100 rounded-full w-20" />
    </div>
  </div>
);

/** Confession / post feed skeleton */
export const FeedSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-slate-100" />
          <div className="h-3 bg-slate-100 rounded-full w-20" />
          <div className="h-3 bg-slate-100 rounded-full w-14 ml-auto" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-slate-100 rounded-full w-full" />
          <div className="h-3 bg-slate-100 rounded-full w-5/6" />
          <div className="h-3 bg-slate-100 rounded-full w-2/3" />
        </div>
        <div className="flex gap-3">
          <div className="h-7 bg-slate-100 rounded-full w-16" />
          <div className="h-7 bg-slate-100 rounded-full w-16" />
          <div className="h-7 bg-slate-100 rounded-full w-16" />
        </div>
      </div>
    ))}
  </div>
);

/** Grid skeleton for document / resource cards */
export const GridCardSkeleton = ({ count = 6, cols = 3 }: { count?: number; cols?: 2 | 3 }) => (
  <div className={`grid grid-cols-1 ${cols === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 bg-slate-100 rounded-full w-3/4" />
            <div className="h-3 bg-slate-100 rounded-full w-1/2" />
          </div>
        </div>
        <div className="h-3 bg-slate-100 rounded-full w-full mb-2" />
        <div className="h-3 bg-slate-100 rounded-full w-2/3" />
      </div>
    ))}
  </div>
);

/** Admin dashboard table skeleton */
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
    <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 border-b border-slate-200">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-3 bg-slate-200 rounded-full" />)}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b border-slate-100">
        {[1, 2, 3, 4].map(j => <div key={j} className="h-3 bg-slate-100 rounded-full" />)}
      </div>
    ))}
  </div>
);
