// ============================================
// التحديات الأسبوعية | Weekly Challenges Component
// ============================================
import React, { useState, useEffect, useMemo } from 'react';

// مفتاح سجل الاستماع | Listen history key
const LISTEN_HISTORY_KEY = 'listen_history';

/**
 * WeeklyChallenges - يعرض التحديات الأسبوعية مع أشرطة التقدم
 * Shows weekly challenges with progress bars
 *
 * التحديات: استمع 5 ساعات، جرب 3 بودكاستات جديدة، علق على 5 حلقات
 * Challenges: listen 5 hours, try 3 new podcasts, comment on 5 episodes
 */
const WeeklyChallenges = () => {
  // بيانات التقدم | Progress data
  const [progress, setProgress] = useState({
    listenHours: 0,
    newPodcasts: 0,
    comments: 0,
  });
  // حالة التحميل | Loading state
  const [loading, setLoading] = useState(true);

  /**
   * تعريفات التحديات | Challenge definitions
   */
  const challenges = useMemo(() => [
    {
      id: 'listen',
      title: 'استمع ٥ ساعات',
      titleEn: 'Listen 5 hours',
      icon: '🎧',
      target: 5,
      current: progress.listenHours,
      unit: 'ساعة',
      unitEn: 'hours',
      color: 'purple',
      badge: '🏆',
    },
    {
      id: 'discover',
      title: 'جرّب ٣ بودكاستات جديدة',
      titleEn: 'Try 3 new podcasts',
      icon: '🔍',
      target: 3,
      current: progress.newPodcasts,
      unit: 'بودكاست',
      unitEn: 'podcasts',
      color: 'blue',
      badge: '⭐',
    },
    {
      id: 'engage',
      title: 'علّق على ٥ حلقات',
      titleEn: 'Comment on 5 episodes',
      icon: '💬',
      target: 5,
      current: progress.comments,
      unit: 'تعليق',
      unitEn: 'comments',
      color: 'green',
      badge: '🎖️',
    },
  ], [progress]);

  // حساب التقدم من localStorage والAPI | Calculate progress from localStorage and API
  useEffect(() => {
    const calculateProgress = () => {
      try {
        const raw = localStorage.getItem(LISTEN_HISTORY_KEY);
        const history = raw ? JSON.parse(raw) : [];

        // بداية الأسبوع الحالي | Start of current week
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        // تصفية سجلات هذا الأسبوع | Filter this week's records
        const thisWeek = history.filter((entry) => {
          const entryDate = new Date(entry.timestamp || entry.listened_at || entry.date);
          return entryDate >= startOfWeek;
        });

        // حساب ساعات الاستماع | Calculate listen hours
        const totalSeconds = thisWeek.reduce((sum, entry) => {
          return sum + (entry.duration || entry.listen_duration || 0);
        }, 0);
        const listenHours = Math.round((totalSeconds / 3600) * 10) / 10;

        // حساب البودكاستات الجديدة | Calculate new podcasts
        const uniquePodcasts = new Set(
          thisWeek.map((entry) => entry.podcast_id).filter(Boolean)
        );

        // حساب التعليقات (من localStorage) | Calculate comments (from localStorage)
        const commentsRaw = localStorage.getItem('weekly_comments_count');
        const comments = commentsRaw ? parseInt(commentsRaw, 10) : 0;

        setProgress({
          listenHours,
          newPodcasts: uniquePodcasts.size,
          comments,
        });
      } catch (err) {
        console.error('خطأ في حساب التقدم | Error calculating progress:', err);
      }
      setLoading(false);
    };

    calculateProgress();
  }, []);

  // ألوان التحديات | Challenge colors
  const colorMap = {
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      fill: 'bg-purple-500 dark:bg-purple-400',
      text: 'text-purple-700 dark:text-purple-300',
      badge: 'bg-purple-50 dark:bg-purple-900/40',
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      fill: 'bg-blue-500 dark:bg-blue-400',
      text: 'text-blue-700 dark:text-blue-300',
      badge: 'bg-blue-50 dark:bg-blue-900/40',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/20',
      fill: 'bg-green-500 dark:bg-green-400',
      text: 'text-green-700 dark:text-green-300',
      badge: 'bg-green-50 dark:bg-green-900/40',
    },
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse" dir="rtl">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
      dir="rtl"
    >
      {/* العنوان | Title */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            التحديات الأسبوعية
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Weekly Challenges</p>
        </div>
        {/* أيقونة التحديات | Challenges icon */}
        <span className="text-2xl">🏅</span>
      </div>

      {/* قائمة التحديات | Challenges list */}
      <div className="space-y-4">
        {challenges.map((challenge) => {
          const colors = colorMap[challenge.color];
          const percent = Math.min((challenge.current / challenge.target) * 100, 100);
          const isComplete = challenge.current >= challenge.target;

          return (
            <div
              key={challenge.id}
              className={`p-4 rounded-lg border transition-all
                ${isComplete
                  ? `${colors.badge} border-transparent`
                  : 'bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{challenge.icon}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {challenge.title}
                  </span>
                </div>
                {/* شارة الإنجاز | Completion badge */}
                {isComplete && (
                  <span className="text-xl" title="تم إنجاز التحدي! | Challenge complete!">
                    {challenge.badge}
                  </span>
                )}
              </div>

              {/* شريط التقدم | Progress bar */}
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colors.fill}`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* نص التقدم | Progress text */}
              <div className="flex justify-between text-xs">
                <span className={colors.text}>
                  {challenge.current} / {challenge.target} {challenge.unit}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {Math.round(percent)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyChallenges;
