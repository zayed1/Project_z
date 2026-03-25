// ============================================
// وضع التركيز | Focus Mode Component
// ============================================
import { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function FocusMode() {
  const { currentEpisode, isPlaying, togglePlay, currentTime, duration, seekBy } = usePlayer();
  const [active, setActive] = useState(false);

  // إغلاق بـ Escape | Close with Escape
  useEffect(() => {
    if (!active) return;
    const handler = (e) => { if (e.key === 'Escape') setActive(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active]);

  if (!active) {
    return (
      <button onClick={() => setActive(true)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors"
        title="وضع التركيز" aria-label="وضع التركيز">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-8">
      <button onClick={() => setActive(false)}
        className="absolute top-6 left-6 text-gray-500 hover:text-white p-2" aria-label="إغلاق">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      {/* تأثير بصري | Visual effect */}
      <div className={`w-32 h-32 rounded-full mb-8 ${isPlaying ? 'animate-pulse' : ''}`}
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)' }} />

      <h2 className="text-white text-2xl font-bold text-center mb-2 max-w-lg">
        {currentEpisode?.title || 'لا توجد حلقة'}
      </h2>

      {/* شريط التقدم | Progress */}
      <div className="w-full max-w-md mt-8">
        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* أزرار التحكم | Controls */}
      <div className="flex items-center gap-6 mt-6">
        <button onClick={() => seekBy(-15)} className="text-gray-400 hover:text-white p-2" aria-label="رجوع 15">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4z" /></svg>
        </button>
        <button onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center shadow-lg">
          {isPlaying
            ? <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z" /></svg>
            : <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          }
        </button>
        <button onClick={() => seekBy(15)} className="text-gray-400 hover:text-white p-2" aria-label="تقديم 15">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4z" /></svg>
        </button>
      </div>
    </div>
  );
}
