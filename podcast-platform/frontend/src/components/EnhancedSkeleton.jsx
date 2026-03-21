// ============================================
// هياكل تحميل محسنة | Enhanced Skeleton Components
// ============================================

export function PodcastCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skeleton-shimmer" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-full w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2" />
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function EpisodeSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-full w-2/3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3" />
        </div>
        <div className="flex gap-1">
          <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-72 md:h-72 aspect-square bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700" />
          <div className="p-6 flex-1 space-y-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded-lg w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-full" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6" />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => <EpisodeSkeleton key={i} />)}
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i}>
          <div className="flex justify-between mb-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          </div>
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gray-300 dark:bg-gray-600 rounded-full" style={{ width: `${80 - i * 15}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
