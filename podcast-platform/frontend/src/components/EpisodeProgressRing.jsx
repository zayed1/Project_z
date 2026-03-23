// ============================================
// حلقة تقدم الاستماع | Episode Progress Ring
// حلقة دائرية صغيرة تُظهر نسبة الاستماع المكتملة
// ============================================
import { useState, useEffect } from 'react';

function getListenProgress(episodeId, duration) {
  if (!episodeId || !duration || duration <= 0) return 0;
  try {
    const directPos = localStorage.getItem(`pos_${episodeId}`);
    if (directPos) return Math.min(100, (parseFloat(directPos) / duration) * 100);

    const raw = localStorage.getItem('listen_history');
    if (!raw) return 0;
    const history = JSON.parse(raw);
    const entry = history.find((h) => h.episodeId === episodeId || h.episodeId === String(episodeId));
    if (entry?.position > 0) return Math.min(100, (entry.position / duration) * 100);
  } catch {}
  return 0;
}

export default function EpisodeProgressRing({ episodeId, duration, size = 32 }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(getListenProgress(episodeId, duration));
  }, [episodeId, duration]);

  // استمع لتغييرات localStorage
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'listen_history' || e.key === `pos_${episodeId}`) {
        setProgress(getListenProgress(episodeId, duration));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [episodeId, duration]);

  if (progress <= 0) return null;

  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const isCompleted = progress >= 95;

  return (
    <div className="relative inline-flex items-center justify-center" title={`${Math.round(progress)}% مكتمل`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* الحلقة الخلفية | Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        {/* حلقة التقدم | Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-500 ${
            isCompleted ? 'text-green-500' : 'text-primary-500'
          }`}
        />
      </svg>
      {/* الأيقونة المركزية | Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isCompleted ? (
          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        ) : (
          <span className="text-[8px] font-bold text-gray-500 dark:text-gray-400">
            {Math.round(progress)}
          </span>
        )}
      </div>
    </div>
  );
}
