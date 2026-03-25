// ============================================
// أكمل الاستماع | Continue Listening Component
// يعرض آخر الحلقات المسموعة مع إمكانية الاستكمال
// ============================================
import { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';

function formatTime(s) {
  if (!s) return '0:00';
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function ContinueListening() {
  const { playEpisode, currentEpisode } = usePlayer();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('listen_history');
      if (raw) {
        const parsed = JSON.parse(raw);
        // إظهار آخر 5 حلقات لم تكتمل | Show last 5 unfinished episodes
        const recent = parsed
          .filter((h) => h.position > 0 && h.episode)
          .slice(0, 5);
        setHistory(recent);
      }
    } catch {}
  }, [currentEpisode]);

  if (history.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        أكمل الاستماع
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {history.map((item) => (
          <button
            key={item.episodeId}
            onClick={() => playEpisode(item.episode, item.podcastTitle, [])}
            className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 flex items-center gap-3 hover:shadow-lg transition-all hover:-translate-y-0.5 min-w-[280px] max-w-[320px] text-right group"
          >
            {/* صورة الغلاف | Cover */}
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex-shrink-0 flex items-center justify-center overflow-hidden relative">
              {item.coverUrl ? (
                <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-6 h-6 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                </svg>
              )}
              {/* أيقونة تشغيل صغيرة | Small play icon */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* معلومات الحلقة | Episode info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{item.episodeTitle}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.podcastTitle}</p>
              <p className="text-xs text-primary-500 mt-0.5">
                توقفت عند {formatTime(item.position)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
