// ============================================
// هياكل تحميل محسنة | Enhanced Skeleton Components
// مع تأثير وميض + أشكال واقعية
// ============================================

function ShimmerOverlay() {
  return (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent" />
  );
}

export function PodcastCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 relative overflow-hidden">
        <ShimmerOverlay />
        {/* أيقونة ميكروفون شبحية | Ghost mic icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          </svg>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 relative overflow-hidden">
          <ShimmerOverlay />
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2 relative overflow-hidden">
          <ShimmerOverlay />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full relative overflow-hidden">
            <ShimmerOverlay />
          </div>
          <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full w-full" />
          <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full w-4/5" />
        </div>
      </div>
    </div>
  );
}

export function EpisodeSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 relative overflow-hidden flex-shrink-0">
          <ShimmerOverlay />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-2/3 relative overflow-hidden">
            <ShimmerOverlay />
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full w-1/3" />
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-72 md:h-72 aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 relative overflow-hidden">
            <ShimmerOverlay />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 opacity-40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              </svg>
            </div>
          </div>
          <div className="p-6 flex-1 space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 relative overflow-hidden">
              <ShimmerOverlay />
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full w-full" />
              <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full w-5/6" />
              <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full w-2/3" />
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
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i}>
          <div className="flex justify-between mb-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 relative overflow-hidden">
              <ShimmerOverlay />
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          </div>
          <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
            <div className="h-full bg-gray-200 dark:bg-gray-600 rounded-full" style={{ width: `${80 - i * 15}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="flex gap-3 py-3">
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 relative overflow-hidden">
        <ShimmerOverlay />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-24" />
        <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full w-full" />
        <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full w-3/4" />
      </div>
    </div>
  );
}
