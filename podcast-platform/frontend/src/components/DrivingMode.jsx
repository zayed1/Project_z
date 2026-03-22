// ============================================
// وضع القيادة | Driving Mode Component
// ============================================
import { usePlayer } from '../context/PlayerContext';

export default function DrivingMode({ onClose }) {
  const {
    currentEpisode, podcastTitle, isPlaying, currentTime, duration,
    togglePlay, skipForward, skipBackward, playNext, playPrev, hasNext, hasPrev,
  } = usePlayer();

  if (!currentEpisode) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-900 flex flex-col items-center justify-center text-white select-none">
      {/* زر الإغلاق | Close */}
      <button
        onClick={onClose}
        className="absolute top-6 left-6 p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* معلومات الحلقة | Episode Info */}
      <div className="text-center mb-12 px-8">
        <h2 className="text-3xl font-bold mb-2 truncate max-w-[80vw]">{currentEpisode.title}</h2>
        <p className="text-xl text-gray-400">{podcastTitle}</p>
      </div>

      {/* شريط التقدم | Progress */}
      <div className="w-4/5 max-w-lg mb-8">
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* أزرار التحكم الكبيرة | Large Controls */}
      <div className="flex items-center gap-8">
        {/* السابق | Previous */}
        <button
          onClick={playPrev}
          disabled={!hasPrev}
          className="p-4 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-30"
        >
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
        </button>

        {/* رجوع 15 ثانية | Back 15s */}
        <button
          onClick={skipBackward}
          className="p-4 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 absolute" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
            <span className="text-xs font-bold mt-8">15</span>
          </div>
        </button>

        {/* تشغيل/إيقاف | Play/Pause */}
        <button
          onClick={togglePlay}
          className="w-24 h-24 rounded-full bg-primary-500 hover:bg-primary-600 transition-colors flex items-center justify-center shadow-lg shadow-primary-500/30"
        >
          {isPlaying ? (
            <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
          ) : (
            <svg className="w-14 h-14 mr-[-4px]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>

        {/* تقديم 15 ثانية | Forward 15s */}
        <button
          onClick={skipForward}
          className="p-4 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 absolute rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
            <span className="text-xs font-bold mt-8">15</span>
          </div>
        </button>

        {/* التالي | Next */}
        <button
          onClick={playNext}
          disabled={!hasNext}
          className="p-4 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-30"
        >
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
        </button>
      </div>

      {/* تلميح | Hint */}
      <p className="text-gray-600 text-sm mt-12">وضع القيادة - أزرار كبيرة للاستخدام الآمن</p>
    </div>
  );
}
