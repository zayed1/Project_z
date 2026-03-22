// ============================================
// موصي أوقات الاستماع | Listen Time Recommender
// ============================================
import React, { useState, useEffect, useMemo } from 'react';

// مفتاح سجل الاستماع | Listen history localStorage key
const LISTEN_HISTORY_KEY = 'listen_history';

/**
 * ListenTimeRecommender - يحلل أوقات الاستماع ويقترح أفضل الأوقات
 * Analyzes localStorage listen_history timestamps and recommends best times
 *
 * يعرض مخطط ساعات بسيط مع نص توصية
 * Shows a simple hour chart with recommendation text
 */
const ListenTimeRecommender = () => {
  // بيانات سجل الاستماع | Listen history data
  const [history, setHistory] = useState([]);

  // تحميل السجل من localStorage | Load history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LISTEN_HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch (err) {
      // خطأ في تحليل البيانات | Parse error
      console.error('خطأ في تحميل سجل الاستماع | Error loading listen history:', err);
    }
  }, []);

  /**
   * تحليل الساعات الأكثر استماعاً | Analyze most common listening hours
   * يعيد مصفوفة من 24 عنصر (لكل ساعة) | Returns array of 24 items (each hour)
   */
  const hourCounts = useMemo(() => {
    const counts = new Array(24).fill(0);
    history.forEach((entry) => {
      // استخراج الساعة من الطابع الزمني | Extract hour from timestamp
      const timestamp = entry.timestamp || entry.listened_at || entry.date;
      if (timestamp) {
        const hour = new Date(timestamp).getHours();
        if (!isNaN(hour)) counts[hour]++;
      }
    });
    return counts;
  }, [history]);

  // أعلى قيمة للتطبيع | Max value for normalization
  const maxCount = useMemo(() => Math.max(...hourCounts, 1), [hourCounts]);

  /**
   * أفضل 3 ساعات استماع | Top 3 listening hours
   */
  const topHours = useMemo(() => {
    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .filter((item) => item.count > 0)
      .slice(0, 3);
  }, [hourCounts]);

  /**
   * تنسيق الساعة بالعربية | Format hour in Arabic
   */
  const formatHour = (hour) => {
    const period = hour < 12 ? 'صباحاً' : 'مساءً';
    const h = hour % 12 || 12;
    return `${h} ${period}`;
  };

  /**
   * نص التوصية | Recommendation text
   */
  const recommendation = useMemo(() => {
    if (topHours.length === 0) {
      return 'لا توجد بيانات كافية بعد. استمع لبعض الحلقات وسنقترح لك أفضل الأوقات!';
    }
    const bestHour = formatHour(topHours[0].hour);
    return `أفضل وقت للاستماع هو ${bestHour}. تميل للاستماع أكثر في هذا الوقت!`;
  }, [topHours]);

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
      dir="rtl"
    >
      {/* العنوان | Title */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
        أفضل أوقات الاستماع
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Best listening times
      </p>

      {/* مخطط الساعات | Hour chart */}
      <div className="mb-4">
        <div className="flex items-end gap-[2px] h-24">
          {hourCounts.map((count, hour) => {
            const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
            const isTop = topHours.some((t) => t.hour === hour);
            return (
              <div
                key={hour}
                className="flex-1 flex flex-col items-center justify-end group relative"
              >
                {/* شريط الساعة | Hour bar */}
                <div
                  className={`w-full rounded-t transition-all duration-300 min-h-[2px]
                    ${isTop
                      ? 'bg-purple-500 dark:bg-purple-400'
                      : count > 0
                        ? 'bg-gray-300 dark:bg-gray-600'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  style={{ height: `${Math.max(heightPercent, 2)}%` }}
                  title={`${formatHour(hour)}: ${count} مرة | ${count} times`}
                />
              </div>
            );
          })}
        </div>
        {/* تسميات الساعات | Hour labels */}
        <div className="flex justify-between mt-1 text-[9px] text-gray-400 dark:text-gray-500" dir="ltr">
          <span>12am</span>
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
          <span>11pm</span>
        </div>
      </div>

      {/* أفضل الأوقات | Top times */}
      {topHours.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {topHours.map(({ hour, count }, idx) => (
            <span
              key={hour}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                ${idx === 0
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
            >
              <span>{formatHour(hour)}</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </span>
          ))}
        </div>
      )}

      {/* نص التوصية | Recommendation text */}
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        {recommendation}
      </p>
    </div>
  );
};

export default ListenTimeRecommender;
