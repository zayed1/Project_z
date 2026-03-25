// ============================================
// مؤقت النوم | Sleep Timer Component
// ============================================
import { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useToast } from '../context/ToastContext';

const OPTIONS = [
  { label: '15 دقيقة', minutes: 15 },
  { label: '30 دقيقة', minutes: 30 },
  { label: '45 دقيقة', minutes: 45 },
  { label: '60 دقيقة', minutes: 60 },
  { label: 'نهاية الحلقة', minutes: -1 },
];

export default function SleepTimer() {
  const { togglePlay, isPlaying, audioRef } = usePlayer();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState(null); // seconds
  const [endOfEpisode, setEndOfEpisode] = useState(false);
  const intervalRef = useRef(null);

  const startTimer = (minutes) => {
    clearTimer();
    if (minutes === -1) {
      setEndOfEpisode(true);
      setRemaining(null);
      toast.success('سيتوقف عند نهاية الحلقة');
    } else {
      setEndOfEpisode(false);
      setRemaining(minutes * 60);
      toast.success(`مؤقت النوم: ${minutes} دقيقة`);
    }
    setOpen(false);
  };

  const clearTimer = () => {
    setRemaining(null);
    setEndOfEpisode(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // عد تنازلي | Countdown
  useEffect(() => {
    if (remaining === null || remaining <= 0) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (isPlaying) togglePlay();
          toast.info('انتهى مؤقت النوم');
          return null;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [remaining !== null]);

  // نهاية الحلقة | End of episode
  useEffect(() => {
    if (!endOfEpisode || !audioRef?.current) return;
    const audio = audioRef.current;
    const onEnded = () => {
      toast.info('انتهت الحلقة - مؤقت النوم');
      setEndOfEpisode(false);
    };
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [endOfEpisode, audioRef]);

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const isActive = remaining !== null || endOfEpisode;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`p-1.5 rounded-lg transition-colors ${isActive ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
        title="مؤقت النوم"
        aria-label="مؤقت النوم"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>

      {remaining !== null && (
        <span className="absolute -top-1 -left-1 text-[9px] bg-amber-500 text-white rounded-full px-1">{fmt(remaining)}</span>
      )}

      {open && (
        <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 py-1 min-w-[140px] z-50">
          {OPTIONS.map((opt) => (
            <button
              key={opt.minutes}
              onClick={() => startTimer(opt.minutes)}
              className="w-full text-right px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {opt.label}
            </button>
          ))}
          {isActive && (
            <button onClick={() => { clearTimer(); setOpen(false); }}
              className="w-full text-right px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-t dark:border-gray-700">
              إلغاء المؤقت
            </button>
          )}
        </div>
      )}
    </div>
  );
}
