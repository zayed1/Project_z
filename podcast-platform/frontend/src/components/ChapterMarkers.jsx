// ============================================
// علامات الفصول | Chapter Markers Component
// ============================================
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { usePlayer } from '../context/PlayerContext';

export default function ChapterMarkers({ episodeId }) {
  const { currentEpisode, seekTo, currentTime } = usePlayer();
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    api.get(`/episodes/${episodeId}/chapters`)
      .then(({ data }) => setChapters(data.chapters || []))
      .catch(() => {});
  }, [episodeId]);

  if (chapters.length === 0) return null;

  const isActive = currentEpisode?.id === episodeId;
  const currentChapter = isActive
    ? chapters.findIndex((ch, i) => {
        const next = chapters[i + 1];
        return currentTime >= ch.start_time && (!next || currentTime < next.start_time);
      })
    : -1;

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div className="mt-3" role="navigation" aria-label="فصول الحلقة">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">الفصول</p>
      <div className="space-y-1">
        {chapters.map((ch, i) => (
          <button
            key={ch.id || i}
            onClick={() => isActive && seekTo(ch.start_time)}
            disabled={!isActive}
            className={`w-full text-right flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
              i === currentChapter
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            } ${!isActive ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
          >
            <span className="text-xs text-gray-400 font-mono min-w-[36px]" dir="ltr">{fmt(ch.start_time)}</span>
            <span className="truncate">{ch.title}</span>
            {i === currentChapter && isActive && (
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-auto animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
