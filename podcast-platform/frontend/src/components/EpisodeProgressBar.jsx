import React, { useState, useEffect } from 'react';

/**
 * EpisodeProgressBar - شريط تقدم الحلقة
 * شريط تقدم صغير يُعرض أسفل بطاقات الحلقات
 * Small progress bar shown under episode cards
 *
 * يقرأ سجل الاستماع من localStorage لإيجاد تقدم الحلقة المحددة
 * Reads listen_history from localStorage to find progress for given episodeId
 *
 * @param {{ episodeId: string|number, duration: number }} props
 * - episodeId: معرّف الحلقة / Episode identifier
 * - duration: مدة الحلقة بالثواني / Episode duration in seconds
 */

/**
 * جلب موضع الاستماع من سجل التخزين المحلي
 * Get listen position from localStorage history
 * @param {string|number} episodeId - معرّف الحلقة / Episode ID
 * @returns {number|null} الموضع بالثواني أو null / Position in seconds or null
 */
function getListenPosition(episodeId) {
  try {
    // التحقق أولاً من موضع التشغيل المباشر
    // Check direct playback position first
    const directPos = localStorage.getItem(`pos_${episodeId}`);
    if (directPos) {
      return parseFloat(directPos);
    }

    // البحث في سجل الاستماع - Search in listen history
    const raw = localStorage.getItem('listen_history');
    if (!raw) return null;

    const history = JSON.parse(raw);
    const entry = history.find((h) => h.episodeId === episodeId || h.episodeId === String(episodeId));

    if (entry && entry.position) {
      return entry.position;
    }

    return null;
  } catch {
    // تجاهل أخطاء التحليل - Ignore parse errors
    return null;
  }
}

export default function EpisodeProgressBar({ episodeId, duration }) {
  // نسبة التقدم - Progress percentage
  const [progress, setProgress] = useState(0);
  // هل تم الاستماع - Has been listened to
  const [hasProgress, setHasProgress] = useState(false);

  // حساب التقدم من سجل الاستماع - Calculate progress from listen history
  useEffect(() => {
    if (!episodeId || !duration || duration <= 0) {
      setProgress(0);
      setHasProgress(false);
      return;
    }

    const position = getListenPosition(episodeId);

    if (position !== null && position > 0) {
      // حساب النسبة المئوية - Calculate percentage
      const percentage = Math.min(100, (position / duration) * 100);
      setProgress(percentage);
      setHasProgress(true);
    } else {
      setProgress(0);
      setHasProgress(false);
    }
  }, [episodeId, duration]);

  // الاستماع لتغييرات التخزين المحلي من نوافذ أخرى
  // Listen for localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'listen_history' || e.key === `pos_${episodeId}`) {
        const position = getListenPosition(episodeId);
        if (position !== null && position > 0 && duration > 0) {
          const percentage = Math.min(100, (position / duration) * 100);
          setProgress(percentage);
          setHasProgress(true);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [episodeId, duration]);

  // عدم عرض الشريط إذا لم يكن هناك تقدم - Don't render if no progress
  if (!hasProgress) return null;

  // تحديد اللون بناءً على نسبة التقدم - Determine color based on progress
  const isCompleted = progress >= 95;

  return (
    <div
      dir="rtl"
      className="w-full"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`تقدم الاستماع ${Math.round(progress)}% / Listen progress ${Math.round(progress)}%`}
    >
      {/* حاوية شريط التقدم - Progress bar container */}
      <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        {/* شريط التقدم الملوّن - Colored progress bar */}
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isCompleted
              ? 'bg-green-500 dark:bg-green-400'
              : 'bg-indigo-500 dark:bg-indigo-400'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* نسبة التقدم (اختياري - يظهر عند التمرير) */}
      {/* Progress percentage (optional - shown on hover) */}
      {progress > 0 && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 text-left" dir="ltr">
          {isCompleted ? 'مكتملة / Completed' : `${Math.round(progress)}%`}
        </p>
      )}
    </div>
  );
}
