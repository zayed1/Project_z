// ============================================
// المشغل العام الثابت | Fixed Global Audio Player
// ============================================
import { usePlayer } from '../context/PlayerContext';
import { useState } from 'react';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(s) {
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function GlobalPlayer() {
  const {
    currentEpisode, podcastTitle, isPlaying, currentTime, duration, playbackRate,
    togglePlay, seek, skipForward, skipBackward, changeSpeed,
  } = usePlayer();

  const [showSpeed, setShowSpeed] = useState(false);

  if (!currentEpisode) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;

  const handleBarClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seek(pct * duration);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl z-50 px-4 py-3">
      <div className="max-w-6xl mx-auto">
        {/* شريط التقدم | Progress Bar */}
        <div
          className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer mb-3 group"
          onClick={handleBarClick}
        >
          <div
            className="h-full bg-primary-500 rounded-full relative transition-all duration-150"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* معلومات الحلقة | Episode Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{currentEpisode.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{podcastTitle}</p>
          </div>

          {/* أزرار التحكم | Controls */}
          <div className="flex items-center gap-3">
            <button onClick={skipBackward} className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors" title="رجوع 15 ثانية">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.5 3C17.15 3 21.08 6.03 22.45 10.16l-1.8.67C19.53 7.33 16.28 5 12.5 5c-2.9 0-5.47 1.38-7.12 3.5H9v2H3V4.5h2v3.18C6.86 5.29 9.5 3 12.5 3zM6 13h2v2H6v-2zm3 0h2v2H9v-2zm3 0h2v2h-2v-2z"/></svg>
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
              ) : (
                <svg className="w-5 h-5 mr-[-2px]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>

            <button onClick={skipForward} className="text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors" title="تقديم 15 ثانية">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.5 3C6.85 3 2.92 6.03 1.55 10.16l1.8.67C4.47 7.33 7.72 5 11.5 5c2.9 0 5.47 1.38 7.12 3.5H15v2h6V4.5h-2v3.18C17.14 5.29 14.5 3 11.5 3zM18 13h-2v2h2v-2zm-3 0h-2v2h2v-2zm-3 0h-2v2h2v-2z"/></svg>
            </button>
          </div>

          {/* الوقت والسرعة | Time & Speed */}
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            <div className="relative">
              <button
                onClick={() => setShowSpeed(!showSpeed)}
                className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {playbackRate}x
              </button>
              {showSpeed && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-lg border dark:border-gray-700 py-1 min-w-[60px]">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { changeSpeed(s); setShowSpeed(false); }}
                      className={`block w-full text-center px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 ${playbackRate === s ? 'text-primary-500 font-bold' : ''}`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
