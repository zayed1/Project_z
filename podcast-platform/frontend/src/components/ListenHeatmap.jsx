import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

/**
 * ListenHeatmap - خريطة حرارية للاستماع | Listen Heatmap Component
 * خريطة حرارية مرئية لحلقة تُظهر الأجزاء الأكثر استماعًا
 * Visual heatmap of an episode showing most-listened segments
 */
const ListenHeatmap = ({ episodeId }) => {
  // بيانات الخريطة الحرارية | Heatmap data
  const [buckets, setBuckets] = useState([]);
  // حالة التحميل | Loading state
  const [loading, setLoading] = useState(true);
  // رسالة الخطأ | Error message
  const [error, setError] = useState('');
  // تلميح الأداة (الجزء الممرر فوقه) | Tooltip (hovered bucket)
  const [hoveredBucket, setHoveredBucket] = useState(null);
  // موضع التلميح | Tooltip position
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  /**
   * جلب بيانات الخريطة الحرارية | Fetch heatmap data
   */
  const fetchHeatmapData = useCallback(async () => {
    if (!episodeId) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/api/episodes/${episodeId}/heatmap`);
      setBuckets(response.data || []);
    } catch {
      setError('فشل تحميل بيانات الخريطة الحرارية | Failed to load heatmap data');
    } finally {
      setLoading(false);
    }
  }, [episodeId]);

  // جلب البيانات عند التحميل | Fetch data on mount
  useEffect(() => {
    fetchHeatmapData();
  }, [fetchHeatmapData]);

  /**
   * حساب أقصى عدد استماع | Calculate max listen count
   */
  const maxCount = buckets.length > 0
    ? Math.max(...buckets.map((b) => b.count || 0), 1)
    : 1;

  /**
   * حساب شدة اللون بناءً على عدد الاستماع | Calculate color intensity based on listen count
   * يُرجع لونًا من الأزرق الفاتح إلى الأحمر الداكن
   * Returns color from light blue to dark red
   */
  const getColor = (count) => {
    const intensity = count / maxCount;
    if (intensity === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (intensity < 0.2) return 'bg-blue-200 dark:bg-blue-900';
    if (intensity < 0.4) return 'bg-green-300 dark:bg-green-700';
    if (intensity < 0.6) return 'bg-yellow-300 dark:bg-yellow-600';
    if (intensity < 0.8) return 'bg-orange-400 dark:bg-orange-600';
    return 'bg-red-500 dark:bg-red-600';
  };

  /**
   * تنسيق الوقت بالثواني إلى دقائق:ثوانٍ | Format seconds to mm:ss
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  /**
   * معالجة حركة الفأرة فوق الجزء | Handle mouse move over bucket
   */
  const handleMouseEnter = (bucket, e) => {
    setHoveredBucket(bucket);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  if (loading) {
    return (
      <div dir="rtl" className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="mr-3 text-gray-600 dark:text-gray-400">
            جاري تحميل الخريطة الحرارية... | Loading heatmap...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div dir="rtl" className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800
                        text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      {/* العنوان | Header */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        خريطة الاستماع الحرارية
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        كثافة الاستماع لكل جزء (فترات ١٠ ثوانٍ) | Listen intensity per segment (10-sec intervals)
      </p>

      {/* مفتاح الألوان | Color legend */}
      <div className="flex items-center gap-2 mb-4 text-xs text-gray-600 dark:text-gray-400">
        <span>أقل | Low</span>
        <div className="flex gap-0.5">
          <div className="w-6 h-4 bg-gray-200 dark:bg-gray-700 rounded-sm" />
          <div className="w-6 h-4 bg-blue-200 dark:bg-blue-900 rounded-sm" />
          <div className="w-6 h-4 bg-green-300 dark:bg-green-700 rounded-sm" />
          <div className="w-6 h-4 bg-yellow-300 dark:bg-yellow-600 rounded-sm" />
          <div className="w-6 h-4 bg-orange-400 dark:bg-orange-600 rounded-sm" />
          <div className="w-6 h-4 bg-red-500 dark:bg-red-600 rounded-sm" />
        </div>
        <span>أكثر | High</span>
      </div>

      {/* الخريطة الحرارية - شريط أفقي | Heatmap - Horizontal bar */}
      <div className="relative">
        <div className="flex w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          {buckets.map((bucket, index) => (
            <div
              key={index}
              className={`h-14 ${getColor(bucket.count)} transition-all duration-200 cursor-pointer
                         hover:opacity-80 hover:scale-y-110 relative`}
              style={{ flex: 1 }}
              onMouseEnter={(e) => handleMouseEnter(bucket, e)}
              onMouseLeave={() => setHoveredBucket(null)}
              title={`${formatTime(bucket.startTime)} - ${formatTime(bucket.endTime)}: ${bucket.count} استماع`}
            />
          ))}
        </div>

        {/* علامات الوقت | Time markers */}
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          {buckets.length > 0 && (
            <>
              <span>{formatTime(buckets[0]?.startTime || 0)}</span>
              {buckets.length > 4 && (
                <span>{formatTime(buckets[Math.floor(buckets.length / 4)]?.startTime || 0)}</span>
              )}
              {buckets.length > 2 && (
                <span>{formatTime(buckets[Math.floor(buckets.length / 2)]?.startTime || 0)}</span>
              )}
              {buckets.length > 4 && (
                <span>{formatTime(buckets[Math.floor((buckets.length * 3) / 4)]?.startTime || 0)}</span>
              )}
              <span>{formatTime(buckets[buckets.length - 1]?.endTime || 0)}</span>
            </>
          )}
        </div>
      </div>

      {/* تلميح الأداة | Tooltip */}
      {hoveredBucket && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900
                          px-3 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap">
            <p className="font-medium">
              {formatTime(hoveredBucket.startTime)} - {formatTime(hoveredBucket.endTime)}
            </p>
            <p className="text-gray-300 dark:text-gray-600">
              عدد الاستماعات: {hoveredBucket.count.toLocaleString('ar-EG')}
              <span className="mx-1">|</span>
              Listens: {hoveredBucket.count.toLocaleString()}
            </p>
          </div>
          {/* سهم التلميح | Tooltip arrow */}
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-gray-900 dark:bg-gray-100 transform rotate-45 -mt-1" />
          </div>
        </div>
      )}

      {/* إحصائيات سريعة | Quick stats */}
      {buckets.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">أعلى استماع | Peak</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {maxCount.toLocaleString('ar-EG')}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">المتوسط | Average</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {Math.round(buckets.reduce((s, b) => s + b.count, 0) / buckets.length).toLocaleString('ar-EG')}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">عدد الأجزاء | Segments</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {buckets.length.toLocaleString('ar-EG')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListenHeatmap;
