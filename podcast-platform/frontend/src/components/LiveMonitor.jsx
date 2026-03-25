// ============================================
// مراقب البث المباشر | Live Monitor (Admin Component)
// ============================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { adminAPI } from '../utils/api';

/**
 * أنماط الرقم المتحرك | Animated number styles
 */
const counterStyles = `
@keyframes countPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.count-animate {
  animation: countPulse 0.3s ease-in-out;
}
`;

/**
 * LiveMonitor - مكون إداري يعرض إحصائيات الوقت الفعلي
 * Admin component showing real-time stats
 *
 * يتحدث تلقائياً كل 30 ثانية | Auto-refreshes every 30 seconds
 * يستخدم adminAPI.getLiveStats() | Uses adminAPI.getLiveStats()
 */
const LiveMonitor = () => {
  // إحصائيات الوقت الفعلي | Real-time stats
  const [stats, setStats] = useState({
    activeListeners: 0,
    currentlyPlaying: [],
    peakListeners: 0,
    totalStreams: 0,
  });
  // حالة التحميل | Loading state
  const [loading, setLoading] = useState(true);
  // خطأ | Error state
  const [error, setError] = useState(null);
  // آخر تحديث | Last update timestamp
  const [lastUpdate, setLastUpdate] = useState(null);
  // حالة تحريك الرقم | Number animation state
  const [animating, setAnimating] = useState(false);

  const intervalRef = useRef(null);
  const prevListeners = useRef(0);

  /**
   * جلب الإحصائيات الحية | Fetch live stats
   */
  const fetchStats = useCallback(async () => {
    try {
      const res = await adminAPI.getLiveStats();
      const data = res.data;

      // تحريك الرقم عند التغيير | Animate number on change
      if (data.activeListeners !== prevListeners.current) {
        setAnimating(true);
        setTimeout(() => setAnimating(false), 300);
        prevListeners.current = data.activeListeners;
      }

      setStats({
        activeListeners: data.activeListeners || data.active_listeners || 0,
        currentlyPlaying: data.currentlyPlaying || data.currently_playing || [],
        peakListeners: data.peakListeners || data.peak_listeners || 0,
        totalStreams: data.totalStreams || data.total_streams || 0,
      });
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('فشل جلب الإحصائيات الحية | Failed to fetch live stats:', err);
      setError('فشل تحميل البيانات | Failed to load data');
    }
    setLoading(false);
  }, []);

  // التحديث التلقائي كل 30 ثانية | Auto-refresh every 30 seconds
  useEffect(() => {
    fetchStats();
    intervalRef.current = setInterval(fetchStats, 30000);
    return () => clearInterval(intervalRef.current);
  }, [fetchStats]);

  // تنسيق الوقت | Format time
  const formatTime = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700" dir="rtl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
      dir="rtl"
    >
      <style>{counterStyles}</style>

      {/* الرأس | Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {/* نقطة خضراء حية | Green live dot */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
            المراقبة المباشرة
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Live Monitor</p>
        </div>
        {/* زر التحديث | Refresh button */}
        <button
          onClick={fetchStats}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100
            dark:hover:bg-gray-700 transition-colors"
          title="تحديث | Refresh"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* خطأ | Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* بطاقات الإحصائيات | Stats cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* المستمعون النشطون | Active listeners */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
          <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">
            المستمعون النشطون
          </p>
          <p
            className={`text-3xl font-bold text-purple-700 dark:text-purple-300 ${animating ? 'count-animate' : ''}`}
          >
            {stats.activeListeners}
          </p>
        </div>
        {/* ذروة المستمعين | Peak listeners */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
            الذروة اليوم
          </p>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
            {stats.peakListeners}
          </p>
        </div>
        {/* إجمالي البث | Total streams */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
          <p className="text-xs text-green-600 dark:text-green-400 mb-1">
            إجمالي البث
          </p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-300">
            {stats.totalStreams}
          </p>
        </div>
      </div>

      {/* الحلقات قيد التشغيل حالياً | Currently playing episodes */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          قيد التشغيل الآن
          <span className="text-xs text-gray-500 dark:text-gray-400 font-normal mr-1">
            ({stats.currentlyPlaying.length})
          </span>
        </h4>
        {stats.currentlyPlaying.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {stats.currentlyPlaying.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-750 rounded-lg
                  border border-gray-100 dark:border-gray-700"
              >
                {/* مؤشر التشغيل | Playing indicator */}
                <div className="flex items-end gap-[1px] h-4 w-4">
                  <span className="w-1 bg-green-500 rounded-full animate-pulse" style={{ height: '60%' }} />
                  <span className="w-1 bg-green-500 rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }} />
                  <span className="w-1 bg-green-500 rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0.4s' }} />
                </div>
                {/* معلومات الحلقة | Episode info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white truncate">
                    {item.episode_title || item.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {item.podcast_title || item.podcast}
                  </p>
                </div>
                {/* عدد المستمعين | Listener count */}
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex-shrink-0">
                  {item.listeners || item.listener_count || 1} مستمع
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            لا توجد حلقات قيد التشغيل حالياً | No episodes currently playing
          </p>
        )}
      </div>

      {/* آخر تحديث | Last update */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-center">
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          آخر تحديث: {formatTime(lastUpdate)} | يتحدث تلقائياً كل ٣٠ ثانية
        </p>
      </div>
    </div>
  );
};

export default LiveMonitor;
