// ============================================
// مشغل صغير عائم محسّن | Enhanced Mini Floating Player
// مع أزرار تقديم/رجوع + اسم البودكاست + animation
// ============================================
import { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function MiniPlayer() {
  const { currentEpisode, podcastTitle, isPlaying, togglePlay, skipForward, skipBackward, currentTime, duration } = usePlayer();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => { setVisible(window.scrollY > 400); };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // إعادة إظهار عند تغيير الحلقة | Re-show on episode change
  useEffect(() => {
    if (currentEpisode) setDismissed(false);
  }, [currentEpisode?.id]);

  if (!currentEpisode || !visible || dismissed) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed top-4 right-4 z-40 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 p-2.5 max-w-[300px] animate-slide-down">
      {/* شريط التقدم | Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 rounded-b-xl overflow-hidden">
        <div className="h-full bg-primary-500 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex items-center gap-2">
        {/* أزرار التحكم | Controls */}
        <div className="flex items-center gap-0.5">
          <button onClick={skipBackward}
            className="p-1 text-gray-400 hover:text-primary-500 transition-colors"
            aria-label="رجوع 15 ثانية">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" /></svg>
          </button>

          <button onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center flex-shrink-0 transition-colors"
            aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}>
            {isPlaying
              ? <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
              : <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            }
          </button>

          <button onClick={skipForward}
            className="p-1 text-gray-400 hover:text-primary-500 transition-colors"
            aria-label="تقديم 15 ثانية">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" /></svg>
          </button>
        </div>

        {/* معلومات | Info */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate">{currentEpisode.title}</p>
          <p className="text-[10px] text-gray-400 truncate">{podcastTitle} - {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</p>
        </div>

        {/* إغلاق | Close */}
        <button onClick={() => setDismissed(true)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 flex-shrink-0" aria-label="إخفاء">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
