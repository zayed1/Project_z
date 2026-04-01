// ============================================
// مكون بطاقة المشاركة | Share Card Generator
// توليد صورة جميلة للمشاركة على السوشال ميديا
// ============================================
import { useState, useRef } from 'react';

export default function ShareCard({ episodeTitle, podcastTitle, coverUrl, progress, onClose }) {
  const [style, setStyle] = useState('gradient');
  const cardRef = useRef(null);

  const STYLES = [
    { id: 'gradient', label: 'متدرج', bg: 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800' },
    { id: 'dark', label: 'داكن', bg: 'bg-gradient-to-br from-gray-800 via-gray-900 to-black' },
    { id: 'light', label: 'فاتح', bg: 'bg-gradient-to-br from-gray-50 via-white to-gray-100' },
    { id: 'warm', label: 'دافئ', bg: 'bg-gradient-to-br from-orange-400 via-red-500 to-pink-600' },
  ];

  const currentStyle = STYLES.find((s) => s.id === style);
  const isLight = style === 'light';

  const handleShare = async () => {
    if (!navigator.share) {
      const text = `🎙️ أستمع إلى "${episodeTitle}" من ${podcastTitle}`;
      navigator.clipboard.writeText(text);
      return;
    }
    try {
      await navigator.share({
        title: episodeTitle,
        text: `🎙️ أستمع إلى "${episodeTitle}" من ${podcastTitle}`,
      });
    } catch {}
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* البطاقة | Card Preview */}
        <div ref={cardRef} className={`${currentStyle.bg} p-6 aspect-square flex flex-col justify-between relative overflow-hidden`}>
          {/* زخرفة خلفية | Background decoration */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full translate-x-1/4 translate-y-1/4" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                </svg>
              </div>
              <span className={`text-xs font-medium ${isLight ? 'text-gray-500' : 'text-white/70'}`}>منصة البودكاست</span>
            </div>
          </div>

          <div className="relative z-10">
            {coverUrl && (
              <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg mb-4 border-2 border-white/20">
                <img src={coverUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <h3 className={`text-xl font-bold leading-tight mb-1 ${isLight ? 'text-gray-800' : 'text-white'}`}>
              {episodeTitle}
            </h3>
            <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-white/70'}`}>{podcastTitle}</p>
            {progress > 0 && (
              <div className="mt-3">
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white/80 rounded-full" style={{ width: `${Math.min(100, progress)}%` }} />
                </div>
                <p className={`text-xs mt-1 ${isLight ? 'text-gray-400' : 'text-white/50'}`}>
                  {Math.round(progress)}% مكتمل
                </p>
              </div>
            )}
          </div>
        </div>

        {/* الخيارات | Options */}
        <div className="p-4">
          <p className="text-xs text-gray-400 mb-2">اختر النمط</p>
          <div className="flex gap-2 mb-4">
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  style === s.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              مشاركة
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm transition-colors">
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
