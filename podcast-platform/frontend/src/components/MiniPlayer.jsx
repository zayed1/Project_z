// ============================================
// مشغل صغير عائم | Mini Floating Player
// ============================================
import { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function MiniPlayer() {
  const { currentEpisode, isPlaying, togglePlay, currentTime, duration } = usePlayer();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => { setVisible(window.scrollY > 400); };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!currentEpisode || !visible) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed top-4 right-4 z-40 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 p-2 flex items-center gap-2 max-w-[260px]">
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 rounded-b-xl overflow-hidden">
        <div className="h-full bg-primary-500 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <button onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center flex-shrink-0"
        aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}>
        {isPlaying
          ? <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
          : <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        }
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate">{currentEpisode.title}</p>
        <p className="text-[10px] text-gray-400">{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</p>
      </div>
      <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-gray-600 text-xs p-1" aria-label="إخفاء">✕</button>
    </div>
  );
}
