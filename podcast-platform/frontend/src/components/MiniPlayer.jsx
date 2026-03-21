// ============================================
// مشغل صغير عائم | Mini Floating Player
// يظهر عند التمرير بعيداً عن المشغل الرئيسي
// ============================================
import { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function MiniPlayer() {
  const { currentEpisode, podcastTitle, isPlaying, currentTime, duration, togglePlay } = usePlayer();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!currentEpisode || !visible) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed top-16 left-4 z-40 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 flex items-center gap-2 pr-4 pl-1 py-1 max-w-xs animate-slide-down">
      <button
        onClick={togglePlay}
        className="w-8 h-8 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
      >
        {isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate">{currentEpisode.title}</p>
        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
          <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
