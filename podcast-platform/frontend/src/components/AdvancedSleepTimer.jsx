import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePlayer } from '../context/PlayerContext';

/**
 * AdvancedSleepTimer - مؤقت النوم المتقدم
 * يوفر خيارات متعددة لمؤقت النوم: نهاية الحلقة الحالية، بعد عدد حلقات، دقائق مخصصة
 * Provides multiple sleep timer options: end of current episode, after N episodes, custom minutes
 */

// مفتاح التخزين المحلي - localStorage key
const STORAGE_KEY = 'advanced_sleep_timer_setting';

// أنواع المؤقت - Timer types
const TIMER_TYPES = {
  END_OF_EPISODE: 'end_of_episode',    // نهاية الحلقة الحالية
  AFTER_N_EPISODES: 'after_n_episodes', // بعد عدد من الحلقات
  CUSTOM_MINUTES: 'custom_minutes',     // دقائق مخصصة
};

/**
 * تنسيق الثواني إلى دقائق:ثواني - Format seconds to MM:SS
 * @param {number} totalSeconds - إجمالي الثواني / Total seconds
 * @returns {string} الوقت المنسّق / Formatted time
 */
function formatTime(totalSeconds) {
  if (totalSeconds <= 0) return '0:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function AdvancedSleepTimer() {
  // سياق المشغل - Player context
  const {
    isPlaying,
    togglePlay,
    currentEpisode,
    audioRef,
    duration,
    currentTime,
  } = usePlayer();

  // حالة فتح القائمة - Menu open state
  const [isOpen, setIsOpen] = useState(false);
  // نوع المؤقت النشط - Active timer type
  const [activeType, setActiveType] = useState(null);
  // العد التنازلي بالثواني - Countdown in seconds
  const [countdown, setCountdown] = useState(0);
  // عدد الحلقات المتبقية - Episodes remaining
  const [episodesRemaining, setEpisodesRemaining] = useState(0);
  // قيمة الدقائق المخصصة - Custom minutes input value
  const [customMinutes, setCustomMinutes] = useState(30);

  // مراجع المؤقت - Timer refs
  const intervalRef = useRef(null);
  const menuRef = useRef(null);

  // تحميل الإعدادات المحفوظة من التخزين المحلي
  // Load saved settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.customMinutes) {
          setCustomMinutes(parsed.customMinutes);
        }
      }
    } catch {
      // تجاهل أخطاء التحليل - Ignore parse errors
    }
  }, []);

  // حفظ الإعدادات في التخزين المحلي - Save settings to localStorage
  const saveSettings = useCallback((settings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // تجاهل أخطاء التخزين - Ignore storage errors
    }
  }, []);

  // إيقاف المؤقت وإيقاف التشغيل - Stop timer and pause playback
  const stopAndPause = useCallback(() => {
    if (isPlaying) {
      togglePlay();
    }
    setActiveType(null);
    setCountdown(0);
    setEpisodesRemaining(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isPlaying, togglePlay]);

  // إلغاء المؤقت - Cancel timer
  const cancelTimer = useCallback(() => {
    setActiveType(null);
    setCountdown(0);
    setEpisodesRemaining(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // بدء مؤقت نهاية الحلقة الحالية - Start end-of-episode timer
  const startEndOfEpisode = useCallback(() => {
    cancelTimer();
    setActiveType(TIMER_TYPES.END_OF_EPISODE);
    saveSettings({ type: TIMER_TYPES.END_OF_EPISODE, customMinutes });
    setIsOpen(false);
  }, [cancelTimer, saveSettings, customMinutes]);

  // بدء مؤقت بعد عدد حلقات - Start after-N-episodes timer
  const startAfterNEpisodes = useCallback((n) => {
    cancelTimer();
    setActiveType(TIMER_TYPES.AFTER_N_EPISODES);
    setEpisodesRemaining(n);
    saveSettings({ type: TIMER_TYPES.AFTER_N_EPISODES, episodes: n, customMinutes });
    setIsOpen(false);
  }, [cancelTimer, saveSettings, customMinutes]);

  // بدء مؤقت دقائق مخصصة - Start custom minutes timer
  const startCustomMinutes = useCallback((minutes) => {
    cancelTimer();
    const totalSeconds = minutes * 60;
    setActiveType(TIMER_TYPES.CUSTOM_MINUTES);
    setCountdown(totalSeconds);
    saveSettings({ type: TIMER_TYPES.CUSTOM_MINUTES, customMinutes: minutes });
    setIsOpen(false);

    // بدء العد التنازلي - Start countdown
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // انتهى المؤقت - Timer ended
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [cancelTimer, saveSettings]);

  // إيقاف التشغيل عند انتهاء العد التنازلي للدقائق المخصصة
  // Pause playback when custom minutes countdown reaches zero
  useEffect(() => {
    if (activeType === TIMER_TYPES.CUSTOM_MINUTES && countdown === 0 && intervalRef.current === null && activeType !== null) {
      // التحقق من أن المؤقت قد بدأ فعلاً وانتهى
      // Verify timer actually started and ended
      stopAndPause();
    }
  }, [countdown, activeType, stopAndPause]);

  // مراقبة نهاية الحلقة - Monitor episode end
  useEffect(() => {
    if (!activeType || !audioRef?.current) return;

    const audio = audioRef.current;
    const handleEnded = () => {
      if (activeType === TIMER_TYPES.END_OF_EPISODE) {
        // إيقاف عند نهاية الحلقة الحالية - Stop at end of current episode
        stopAndPause();
      } else if (activeType === TIMER_TYPES.AFTER_N_EPISODES) {
        // تقليل عدد الحلقات المتبقية - Decrement episodes remaining
        setEpisodesRemaining((prev) => {
          if (prev <= 1) {
            stopAndPause();
            return 0;
          }
          return prev - 1;
        });
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [activeType, audioRef, stopAndPause]);

  // إغلاق القائمة عند النقر خارجها - Close menu on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // تنظيف المؤقت عند إلغاء التحميل - Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // حساب الوقت المتبقي لنهاية الحلقة - Calculate remaining time for end-of-episode
  const episodeTimeRemaining = duration > 0 ? Math.max(0, Math.floor(duration - currentTime)) : 0;

  // هل المؤقت نشط - Is timer active
  const isActive = activeType !== null;

  // نص الحالة - Status text
  const getStatusText = () => {
    switch (activeType) {
      case TIMER_TYPES.END_OF_EPISODE:
        return `نهاية الحلقة: ${formatTime(episodeTimeRemaining)}`;
      case TIMER_TYPES.AFTER_N_EPISODES:
        return `${episodesRemaining} حلقة متبقية`;
      case TIMER_TYPES.CUSTOM_MINUTES:
        return formatTime(countdown);
      default:
        return '';
    }
  };

  return (
    <div className="relative" ref={menuRef} dir="rtl">
      {/* زر المؤقت - Timer button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium
          ${isActive
            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        aria-label="مؤقت النوم المتقدم / Advanced Sleep Timer"
      >
        {/* أيقونة القمر - Moon icon */}
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>

        {/* عرض العد التنازلي إذا كان المؤقت نشطاً - Show countdown if active */}
        {isActive && (
          <span className="text-xs font-bold">{getStatusText()}</span>
        )}
      </button>

      {/* قائمة خيارات المؤقت - Timer options menu */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50">
          {/* عنوان القائمة - Menu title */}
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
            مؤقت النوم المتقدم
            <span className="text-xs text-gray-500 dark:text-gray-400 block mt-0.5">
              Advanced Sleep Timer
            </span>
          </h3>

          {/* خيار: نهاية الحلقة الحالية - Option: End of current episode */}
          <button
            onClick={startEndOfEpisode}
            className={`w-full text-right px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors
              ${activeType === TIMER_TYPES.END_OF_EPISODE
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            {/* نهاية الحلقة الحالية - End of current episode */}
            <span className="block font-medium">نهاية الحلقة الحالية</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">End of current episode</span>
          </button>

          {/* خيار: بعد عدد من الحلقات - Option: After N episodes */}
          <div className="mb-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1">
              بعد عدد حلقات / After N episodes
            </p>
            <div className="flex gap-1 px-3">
              {[1, 2, 3, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => startAfterNEpisodes(n)}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${activeType === TIMER_TYPES.AFTER_N_EPISODES && episodesRemaining === n
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* خيار: دقائق مخصصة - Option: Custom minutes */}
          <div className="mt-2 px-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 py-1">
              دقائق مخصصة / Custom minutes
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="480"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="flex-1 px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-amber-500"
                dir="ltr"
              />
              <button
                onClick={() => startCustomMinutes(customMinutes)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-600
                  text-white transition-colors"
              >
                بدء / Start
              </button>
            </div>
          </div>

          {/* أزرار سريعة للدقائق - Quick minute buttons */}
          <div className="flex gap-1 px-3 mt-2">
            {[15, 30, 45, 60, 90].map((m) => (
              <button
                key={m}
                onClick={() => startCustomMinutes(m)}
                className={`flex-1 py-1 rounded text-xs font-medium transition-colors
                  ${activeType === TIMER_TYPES.CUSTOM_MINUTES && countdown > 0
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {m}m
              </button>
            ))}
          </div>

          {/* زر إلغاء المؤقت - Cancel timer button */}
          {isActive && (
            <button
              onClick={() => { cancelTimer(); setIsOpen(false); }}
              className="w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400
                bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              إلغاء المؤقت / Cancel Timer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
