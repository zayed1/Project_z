// ============================================
// مشغل الحلقات | Episode Player Component
// ============================================
import { useState, useRef, useEffect } from 'react';

export default function EpisodePlayer({ episode }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // إيقاف التشغيل عند تغيير الحلقة | Reset on episode change
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [episode?.id]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // التخطي للأمام 15 ثانية | Skip forward 15s
  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 15,
        duration
      );
    }
  };

  // التخطي للخلف 15 ثانية | Skip backward 15s
  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        audioRef.current.currentTime - 15,
        0
      );
    }
  };

  // تنسيق الوقت | Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // شريط التقدم | Progress bar click handler
  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    audioRef.current.currentTime = percentage * duration;
  };

  if (!episode) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-4">
      <audio
        ref={audioRef}
        src={episode.audio_file_url}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* عنوان الحلقة | Episode Title */}
      <h3 className="text-lg font-bold text-gray-800 mb-1">{episode.title}</h3>
      {episode.description && (
        <p className="text-sm text-gray-500 mb-4">{episode.description}</p>
      )}

      {/* شريط التقدم | Progress Bar */}
      <div
        className="w-full h-2 bg-gray-200 rounded-full cursor-pointer mb-2"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-150"
          style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
        />
      </div>

      {/* الوقت | Time Display */}
      <div className="flex justify-between text-xs text-gray-500 mb-4">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* أزرار التحكم | Control Buttons */}
      <div className="flex items-center justify-center gap-6">
        {/* زر الرجوع | Skip Backward */}
        <button
          onClick={skipBackward}
          className="text-gray-600 hover:text-primary-600 transition-colors"
          title="رجوع 15 ثانية"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.5 3C17.15 3 21.08 6.03 22.45 10.16l-1.8.67C19.53 7.33 16.28 5 12.5 5c-2.9 0-5.47 1.38-7.12 3.5H9v2H3V4.5h2v3.18C6.86 5.29 9.5 3 12.5 3zM6 13h2v2H6v-2zm3 0h2v2H9v-2zm3 0h2v2h-2v-2z" />
          </svg>
        </button>

        {/* زر التشغيل/الإيقاف | Play/Pause */}
        <button
          onClick={togglePlay}
          className="w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 mr-[-2px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* زر التقديم | Skip Forward */}
        <button
          onClick={skipForward}
          className="text-gray-600 hover:text-primary-600 transition-colors"
          title="تقديم 15 ثانية"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.5 3C6.85 3 2.92 6.03 1.55 10.16l1.8.67C4.47 7.33 7.72 5 11.5 5c2.9 0 5.47 1.38 7.12 3.5H15v2h6V4.5h-2v3.18C17.14 5.29 14.5 3 11.5 3zM18 13h-2v2h2v-2zm-3 0h-2v2h2v-2zm-3 0h-2v2h2v-2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
