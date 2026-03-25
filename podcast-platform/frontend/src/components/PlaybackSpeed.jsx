// ============================================
// التحكم بسرعة التشغيل | Playback Speed Control
// ============================================
import { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function PlaybackSpeed() {
  const { audioRef } = usePlayer();
  const [speed, setSpeed] = useState(() => {
    return parseFloat(localStorage.getItem('playback_speed') || '1');
  });

  useEffect(() => {
    if (audioRef?.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed, audioRef]);

  const cycleSpeed = () => {
    const idx = SPEEDS.indexOf(speed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(next);
    localStorage.setItem('playback_speed', String(next));
    if (audioRef?.current) audioRef.current.playbackRate = next;
  };

  return (
    <button
      onClick={cycleSpeed}
      className="px-2 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors min-w-[40px]"
      title="سرعة التشغيل"
      aria-label={`سرعة التشغيل ${speed}x`}
    >
      {speed}x
    </button>
  );
}
