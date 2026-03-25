// ============================================
// متتبع المزاج | Mood Tracker Component
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

/**
 * MoodTracker - يعرض اختيار المزاج بعد إنهاء حلقة
 * Shows mood selection after finishing an episode
 *
 * @param {string|number} episodeId - معرف الحلقة | Episode ID
 * @param {boolean} show - إظهار المكون | Show component
 * @param {function} onClose - معالج الإغلاق | Close handler
 */
const MoodTracker = ({ episodeId, show = true, onClose }) => {
  // المزاج المختار | Selected mood
  const [selectedMood, setSelectedMood] = useState(null);
  // حالة الإرسال | Submission state
  const [submitting, setSubmitting] = useState(false);
  // تم الإرسال | Submitted state
  const [submitted, setSubmitted] = useState(false);
  // سجل المزاج | Mood history
  const [moodHistory, setMoodHistory] = useState([]);
  // تحميل السجل | Loading history
  const [loadingHistory, setLoadingHistory] = useState(false);

  /**
   * خيارات المزاج مع إيموجي وتسمية عربية
   * Mood options with emoji and Arabic label
   */
  const moods = [
    { id: 'happy', emoji: '😊', label: 'سعيد', labelEn: 'Happy' },
    { id: 'sad', emoji: '😢', label: 'حزين', labelEn: 'Sad' },
    { id: 'inspired', emoji: '✨', label: 'مُلهَم', labelEn: 'Inspired' },
    { id: 'relaxed', emoji: '😌', label: 'مسترخي', labelEn: 'Relaxed' },
    { id: 'energized', emoji: '⚡', label: 'نشيط', labelEn: 'Energized' },
  ];

  // جلب سجل المزاج | Fetch mood history
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/api/me/mood-track');
      const data = res.data || [];
      // آخر 7 إدخالات | Last 7 entries
      setMoodHistory(data.slice(-7));
    } catch (err) {
      console.warn('فشل جلب سجل المزاج | Failed to fetch mood history:', err);
    }
    setLoadingHistory(false);
  }, []);

  useEffect(() => {
    if (show) fetchHistory();
  }, [show, fetchHistory]);

  /**
   * إرسال المزاج | Submit mood
   * يحفظ إلى API POST /api/me/mood-track
   */
  const handleSubmit = async (moodId) => {
    setSelectedMood(moodId);
    setSubmitting(true);
    try {
      await api.post('/api/me/mood-track', {
        episode_id: episodeId,
        mood: moodId,
        timestamp: new Date().toISOString(),
      });
      setSubmitted(true);
      // تحديث السجل | Refresh history
      fetchHistory();
    } catch (err) {
      console.error('فشل حفظ المزاج | Failed to save mood:', err);
    }
    setSubmitting(false);
  };

  // ألوان أعمدة المخطط حسب المزاج | Chart bar colors by mood
  const moodColors = {
    happy: 'bg-yellow-400 dark:bg-yellow-500',
    sad: 'bg-blue-400 dark:bg-blue-500',
    inspired: 'bg-purple-400 dark:bg-purple-500',
    relaxed: 'bg-green-400 dark:bg-green-500',
    energized: 'bg-orange-400 dark:bg-orange-500',
  };

  if (!show) return null;

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
      dir="rtl"
    >
      {/* العنوان | Title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          كيف شعرت؟
          <span className="text-xs text-gray-500 dark:text-gray-400 font-normal mr-2">
            How did you feel?
          </span>
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="إغلاق | Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* اختيار المزاج | Mood selection */}
      {!submitted ? (
        <div className="flex items-center justify-center gap-3 mb-6">
          {moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleSubmit(mood.id)}
              disabled={submitting}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all
                ${selectedMood === mood.id
                  ? 'bg-purple-100 dark:bg-purple-900/30 scale-110 ring-2 ring-purple-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105'
                }
                ${submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="text-3xl">{mood.emoji}</span>
              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                {mood.label}
              </span>
            </button>
          ))}
        </div>
      ) : (
        /* رسالة الشكر | Thank you message */
        <div className="text-center mb-6 py-3">
          <p className="text-lg text-gray-900 dark:text-white">
            شكراً لمشاركتك! {moods.find((m) => m.id === selectedMood)?.emoji}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Thanks for sharing!
          </p>
        </div>
      )}

      {/* مخطط سجل المزاج | Mood history chart */}
      {moodHistory.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            سجل المزاج
            <span className="text-xs text-gray-500 dark:text-gray-400 font-normal mr-1">
              (آخر ٧ حلقات)
            </span>
          </h4>

          {/* مخطط أعمدة بسيط | Simple bar chart */}
          <div className="flex items-end gap-2 h-20">
            {moodHistory.map((entry, idx) => {
              const moodInfo = moods.find((m) => m.id === entry.mood);
              const barColor = moodColors[entry.mood] || 'bg-gray-400';
              // ارتفاعات عشوائية مختلفة لكل مزاج | Different heights per mood
              const heightMap = { happy: '80%', sad: '40%', inspired: '90%', relaxed: '60%', energized: '100%' };
              const height = heightMap[entry.mood] || '50%';

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  {/* إيموجي المزاج | Mood emoji */}
                  <span className="text-xs">{moodInfo?.emoji || '❓'}</span>
                  {/* العمود | Bar */}
                  <div
                    className={`w-full rounded-t ${barColor} transition-all duration-300`}
                    style={{ height }}
                    title={`${moodInfo?.label || entry.mood}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* لا يوجد سجل | No history */}
      {!loadingHistory && moodHistory.length === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
          لا يوجد سجل مزاج بعد | No mood history yet
        </p>
      )}
    </div>
  );
};

export default MoodTracker;
