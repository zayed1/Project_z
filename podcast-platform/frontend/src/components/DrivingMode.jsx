// ============================================
// وضع القيادة | Driving Mode Component
// ============================================
import { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function DrivingMode() {
  const { currentEpisode, isPlaying, togglePlay, seekBy } = usePlayer();
  const [active, setActive] = useState(false);

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
        title="وضع القيادة"
        aria-label="تفعيل وضع القيادة"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center select-none" role="dialog" aria-label="وضع القيادة">
      <button onClick={() => setActive(false)}
        className="absolute top-6 left-6 text-gray-500 hover:text-white text-lg p-3"
        aria-label="إغلاق وضع القيادة">✕</button>

      <p className="text-white text-xl font-bold text-center px-8 mb-12 max-w-md">
        {currentEpisode?.title || 'لا توجد حلقة'}
      </p>

      <div className="flex items-center gap-8">
        <button onClick={() => seekBy(-30)}
          className="w-20 h-20 rounded-full bg-gray-800 hover:bg-gray-700 text-white flex flex-col items-center justify-center active:scale-95 transition-transform"
          aria-label="رجوع 30 ثانية">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" /></svg>
          <span className="text-xs">30</span>
        </button>

        <button onClick={togglePlay}
          className="w-28 h-28 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center active:scale-95 transition-transform shadow-2xl shadow-primary-500/30"
          aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}>
          {isPlaying
            ? <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
            : <svg className="w-14 h-14 mr-[-4px]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          }
        </button>

        <button onClick={() => seekBy(30)}
          className="w-20 h-20 rounded-full bg-gray-800 hover:bg-gray-700 text-white flex flex-col items-center justify-center active:scale-95 transition-transform"
          aria-label="تقديم 30 ثانية">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" /></svg>
          <span className="text-xs">30</span>
        </button>
      </div>
    </div>
  );
}
