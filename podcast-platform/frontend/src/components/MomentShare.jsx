import React, { useState, useRef, useCallback } from 'react';
import api from '../utils/api';

/**
 * MomentShare - مشاركة لحظة | Moment Share Component
 * اختيار لحظة (نطاق زمني) من حلقة ومشاركتها كبطاقة
 * Select a moment (time range) from an episode and share it as a card
 */
const MomentShare = ({ episodeId, episodeTitle, coverUrl }) => {
  // وقت البداية (بالثواني) | Start time (in seconds)
  const [startTime, setStartTime] = useState(0);
  // وقت النهاية (بالثواني) | End time (in seconds)
  const [endTime, setEndTime] = useState(30);
  // تعليق المستخدم | User comment
  const [comment, setComment] = useState('');
  // حالة النسخ | Copy state
  const [copied, setCopied] = useState(false);
  // عرض المعاينة | Show preview
  const [showPreview, setShowPreview] = useState(false);
  // مرجع بطاقة المعاينة | Preview card ref
  const cardRef = useRef(null);

  /**
   * تنسيق الوقت بالثواني إلى دقائق:ثوانٍ | Format seconds to mm:ss
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  /**
   * تحليل نص الوقت إلى ثوانٍ | Parse time text to seconds
   */
  const parseTime = (timeStr) => {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return parseInt(timeStr, 10) || 0;
  };

  /**
   * إنشاء رابط قابل للمشاركة | Generate shareable link
   */
  const getShareableLink = useCallback(() => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/episode/${episodeId}?start=${startTime}&end=${endTime}`;
  }, [episodeId, startTime, endTime]);

  /**
   * نسخ الرابط | Copy link to clipboard
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareableLink());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // احتياطي: نسخ يدوي | Fallback: manual copy
      const textArea = document.createElement('textarea');
      textArea.value = getShareableLink();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /**
   * محاكاة مشاركة كصورة (بطاقة منمقة) | Simulate share as image (styled card)
   * في التطبيق الحقيقي يمكن استخدام html2canvas
   * In real app, html2canvas could be used
   */
  const handleShareAsImage = () => {
    setShowPreview(true);
    // في التطبيق الحقيقي: html2canvas(cardRef.current).then(canvas => ...)
    // In real app: html2canvas(cardRef.current).then(canvas => ...)
  };

  return (
    <div dir="rtl" className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      {/* رأس المكون | Component header */}
      <div className="bg-gradient-to-l from-teal-500 to-cyan-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">
          مشاركة لحظة | Share a Moment
        </h2>
        <p className="text-teal-200 text-sm mt-1">
          اختر لحظة مميزة من الحلقة وشاركها | Select a special moment and share it
        </p>
      </div>

      <div className="p-6">
        {/* معلومات الحلقة | Episode info */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          {coverUrl && (
            <img
              src={coverUrl}
              alt={episodeTitle}
              className="w-16 h-16 rounded-lg object-cover shadow"
            />
          )}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">الحلقة | Episode</p>
            <p className="font-semibold text-gray-900 dark:text-white">{episodeTitle}</p>
          </div>
        </div>

        {/* اختيار النطاق الزمني | Time range selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              وقت البداية | Start Time
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formatTime(startTime)}
                onChange={(e) => setStartTime(parseTime(e.target.value))}
                placeholder="00:00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center
                           focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            {/* شريط تمرير البداية | Start slider */}
            <input
              type="range"
              min={0}
              max={3600}
              step={1}
              value={startTime}
              onChange={(e) => {
                const val = Number(e.target.value);
                setStartTime(val);
                if (val >= endTime) setEndTime(val + 10);
              }}
              className="w-full mt-2 accent-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              وقت النهاية | End Time
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formatTime(endTime)}
                onChange={(e) => setEndTime(parseTime(e.target.value))}
                placeholder="00:30"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center
                           focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            {/* شريط تمرير النهاية | End slider */}
            <input
              type="range"
              min={0}
              max={3600}
              step={1}
              value={endTime}
              onChange={(e) => {
                const val = Number(e.target.value);
                setEndTime(val);
                if (val <= startTime) setStartTime(Math.max(0, val - 10));
              }}
              className="w-full mt-2 accent-teal-500"
            />
          </div>
        </div>

        {/* مدة اللحظة | Moment duration */}
        <div className="text-center mb-6">
          <span className="inline-block px-4 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700
                           dark:text-teal-400 rounded-full text-sm font-medium">
            المدة: {formatTime(Math.max(0, endTime - startTime))} | Duration: {formatTime(Math.max(0, endTime - startTime))}
          </span>
        </div>

        {/* تعليق المستخدم | User comment */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            تعليقك (اختياري) | Your Comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="أضف تعليقك على هذه اللحظة... | Add your comment about this moment..."
            rows={2}
            maxLength={200}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       placeholder-gray-400 dark:placeholder-gray-500 resize-none
                       focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-left">
            {comment.length}/200
          </p>
        </div>

        {/* أزرار المشاركة | Share buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleCopyLink}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium
                       transition-all ${copied
                         ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                         : 'bg-teal-600 hover:bg-teal-700 text-white'}`}
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                تم النسخ! | Copied!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                نسخ الرابط | Copy Link
              </>
            )}
          </button>
          <button
            onClick={handleShareAsImage}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-200
                       dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg
                       font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            معاينة البطاقة | Preview Card
          </button>
        </div>

        {/* معاينة بطاقة المشاركة | Share card preview */}
        {showPreview && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              معاينة البطاقة | Card Preview
            </h3>
            <div
              ref={cardRef}
              className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-2xl p-6 text-white
                         shadow-xl max-w-sm mx-auto"
            >
              {/* غلاف الحلقة | Episode cover */}
              <div className="flex items-center gap-4 mb-4">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={episodeTitle}
                    className="w-20 h-20 rounded-xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-white/20 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg leading-tight truncate">{episodeTitle}</p>
                  <p className="text-teal-200 text-sm mt-1">
                    {formatTime(startTime)} - {formatTime(endTime)}
                  </p>
                </div>
              </div>

              {/* شريط الوقت | Time bar */}
              <div className="bg-white/20 rounded-full h-2 mb-4 overflow-hidden">
                <div
                  className="bg-white h-2 rounded-full"
                  style={{
                    marginRight: `${(startTime / 3600) * 100}%`,
                    width: `${((endTime - startTime) / 3600) * 100}%`,
                  }}
                />
              </div>

              {/* تعليق المستخدم | User comment */}
              {comment && (
                <div className="border-t border-white/20 pt-3 mt-3">
                  <p className="text-sm italic text-teal-100">
                    &ldquo;{comment}&rdquo;
                  </p>
                </div>
              )}

              {/* شعار المنصة | Platform branding */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
                <span className="text-xs text-teal-200">
                  منصة البودكاست | Podcast Platform
                </span>
                <svg className="w-5 h-5 text-teal-200" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
              </div>
            </div>

            {/* رسالة توضيحية | Info note */}
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
              يمكنك أخذ لقطة شاشة لهذه البطاقة ومشاركتها | You can screenshot this card and share it
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MomentShare;
