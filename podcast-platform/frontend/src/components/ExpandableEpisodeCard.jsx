// ============================================
// بطاقة حلقة قابلة للتوسيع | Expandable Episode Card
// ============================================
import React, { useState, useRef, useEffect } from 'react';

/**
 * ExpandableEpisodeCard - بطاقة حلقة تتوسع عند النقر لإظهار التفاصيل الكاملة
 * Episode card that expands inline on click to show full details
 *
 * @param {object} episode - بيانات الحلقة | Episode data
 * @param {boolean} isPlaying - هل الحلقة قيد التشغيل | Is episode currently playing
 * @param {function} onPlay - معالج التشغيل | Play handler
 * @param {function} onAddToPlaylist - إضافة لقائمة التشغيل | Add to playlist handler
 * @param {function} onShare - مشاركة | Share handler
 */
const ExpandableEpisodeCard = ({
  episode,
  isPlaying = false,
  onPlay,
  onAddToPlaylist,
  onShare,
}) => {
  // حالة التوسيع | Expanded state
  const [isExpanded, setIsExpanded] = useState(false);
  // الارتفاع الفعلي للمحتوى الموسع | Actual height of expanded content
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);

  // قياس ارتفاع المحتوى | Measure content height
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isExpanded, episode]);

  // تنسيق المدة | Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // حساب نسبة التقدم | Calculate progress percentage
  const progressPercent = episode?.progress && episode?.duration
    ? Math.min((episode.progress / episode.duration) * 100, 100)
    : 0;

  // تبديل التوسيع | Toggle expand
  const toggleExpand = () => setIsExpanded((prev) => !prev);

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
        shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      dir="rtl"
    >
      {/* الجزء المطوي (يظهر دائماً) | Collapsed part (always visible) */}
      <button
        onClick={toggleExpand}
        className="w-full flex items-center gap-4 p-4 text-right hover:bg-gray-50 dark:hover:bg-gray-750
          transition-colors"
        aria-expanded={isExpanded}
      >
        {/* صورة مصغرة | Thumbnail */}
        {episode?.thumbnail && (
          <img
            src={episode.thumbnail}
            alt={episode.title}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
        )}

        {/* العنوان والمدة | Title and duration */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {episode?.title || 'بدون عنوان'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {formatDuration(episode?.duration)}
            {episode?.published_at && (
              <span className="mr-2">
                {new Date(episode.published_at).toLocaleDateString('ar-EG')}
              </span>
            )}
          </p>
        </div>

        {/* سهم التوسيع | Expand arrow */}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0
            ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* شريط التقدم | Progress bar */}
      {progressPercent > 0 && (
        <div className="px-4 pb-1">
          <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 dark:bg-purple-400 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* الجزء الموسع (مع تحريك سلس) | Expanded part (with smooth animation) */}
      <div
        ref={contentRef}
        className="transition-[max-height] duration-300 ease-in-out overflow-hidden"
        style={{ maxHeight: isExpanded ? `${contentHeight}px` : '0px' }}
      >
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700">
          {/* الوصف | Description */}
          {episode?.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              {episode.description}
            </p>
          )}

          {/* معلومات إضافية | Additional info */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
            {/* عدد التعليقات | Comments count */}
            {episode?.comments_count !== undefined && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                {episode.comments_count} تعليق
              </span>
            )}
            {/* عدد الاستماعات | Listen count */}
            {episode?.listens_count !== undefined && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-8.464a5 5 0 000 7.072" />
                </svg>
                {episode.listens_count} استماع
              </span>
            )}
          </div>

          {/* أزرار الإجراءات | Action buttons */}
          <div className="flex items-center gap-2">
            {/* زر التشغيل | Play button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay?.(episode);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${isPlaying
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600'
                }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                {isPlaying ? (
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                ) : (
                  <path d="M8 5v14l11-7z" />
                )}
              </svg>
              {isPlaying ? 'إيقاف' : 'تشغيل'}
            </button>

            {/* إضافة لقائمة التشغيل | Add to playlist */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToPlaylist?.(episode);
              }}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100
                dark:hover:bg-gray-700 transition-colors"
              title="إضافة لقائمة التشغيل | Add to playlist"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* مشاركة | Share */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare?.(episode);
              }}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100
                dark:hover:bg-gray-700 transition-colors"
              title="مشاركة | Share"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandableEpisodeCard;
