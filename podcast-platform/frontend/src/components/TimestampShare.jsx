// ============================================
// مشاركة مقطع محدد | Timestamp Share
// مشاركة رابط يبدأ من ثانية معينة
// ============================================
import { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useToast } from '../context/ToastContext';

function formatTime(s) {
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function TimestampShare({ podcastId, episodeId }) {
  const { currentTime, currentEpisode } = usePlayer();
  const toast = useToast();
  const [show, setShow] = useState(false);

  const isActive = currentEpisode?.id === episodeId;
  const time = isActive ? Math.floor(currentTime) : 0;

  const shareUrl = `${window.location.origin}/podcast/${podcastId}?ep=${episodeId}&t=${time}`;

  const copyTimestampLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success(`تم نسخ الرابط عند ${formatTime(time)}`);
    setShow(false);
  };

  if (!isActive || time < 1) return null;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShow(!show)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="مشاركة من هذه اللحظة"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {show && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 p-3 z-50 min-w-[200px]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            مشاركة من {formatTime(time)}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 text-xs px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300"
              dir="ltr"
            />
            <button
              onClick={copyTimestampLink}
              className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs"
            >
              نسخ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
