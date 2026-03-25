// ============================================
// حاسبة وقت الاستماع | Playlist Duration Calculator
// ============================================

export default function PlaylistDuration({ episodes = [] }) {
  if (episodes.length === 0) return null;

  const totalSeconds = episodes.reduce((sum, ep) => sum + (ep.duration || 0), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);

  return (
    <div className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>
        {episodes.length} حلقة &middot;{' '}
        {hours > 0 ? `${hours} ساعة و ${mins} دقيقة` : `${mins} دقيقة`}
      </span>
    </div>
  );
}
