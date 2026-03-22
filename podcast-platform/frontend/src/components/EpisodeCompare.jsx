import React, { useState, useCallback } from 'react';
import { adminAPI } from '../utils/api';

/**
 * EpisodeCompare - مقارنة الحلقات | Episode Comparison Component
 * مكون إداري لمقارنة حلقتين أو أكثر جنبًا إلى جنب
 * Admin component to compare 2+ episodes side by side
 */
const EpisodeCompare = () => {
  // حالة الحلقات المحددة | Selected episodes state
  const [selectedIds, setSelectedIds] = useState([]);
  // حالة البحث | Search state
  const [searchTerm, setSearchTerm] = useState('');
  // نتائج البحث | Search results
  const [searchResults, setSearchResults] = useState([]);
  // بيانات المقارنة | Comparison data
  const [comparisonData, setComparisonData] = useState(null);
  // حالة التحميل | Loading state
  const [loading, setLoading] = useState(false);
  // حالة البحث جاري | Search loading state
  const [searching, setSearching] = useState(false);
  // رسالة الخطأ | Error message
  const [error, setError] = useState('');

  // المقاييس المراد مقارنتها | Metrics to compare
  const metrics = [
    { key: 'listens', label: 'الاستماعات | Listens', color: 'bg-blue-500' },
    { key: 'likes', label: 'الإعجابات | Likes', color: 'bg-green-500' },
    { key: 'comments', label: 'التعليقات | Comments', color: 'bg-yellow-500' },
    { key: 'rating', label: 'التقييم | Rating', color: 'bg-purple-500' },
  ];

  /**
   * البحث عن الحلقات | Search for episodes
   */
  const handleSearch = useCallback(async (term) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      // محاكاة البحث - يمكن استبداله بـ API حقيقي
      // Simulated search - can be replaced with real API
      const results = [
        { id: 1, title: 'حلقة ١: البداية' },
        { id: 2, title: 'حلقة ٢: التطور' },
        { id: 3, title: 'حلقة ٣: المستقبل' },
        { id: 4, title: 'حلقة ٤: الخاتمة' },
      ].filter((ep) => ep.title.includes(term) || String(ep.id).includes(term));
      setSearchResults(results);
    } catch {
      setError('فشل البحث | Search failed');
    } finally {
      setSearching(false);
    }
  }, []);

  /**
   * إضافة حلقة للمقارنة | Add episode to comparison
   */
  const addEpisode = useCallback((episode) => {
    setSelectedIds((prev) => {
      if (prev.find((e) => e.id === episode.id)) return prev;
      return [...prev, episode];
    });
    setSearchTerm('');
    setSearchResults([]);
  }, []);

  /**
   * إزالة حلقة من المقارنة | Remove episode from comparison
   */
  const removeEpisode = useCallback((id) => {
    setSelectedIds((prev) => prev.filter((e) => e.id !== id));
    setComparisonData(null);
  }, []);

  /**
   * تنفيذ المقارنة | Execute comparison
   */
  const handleCompare = useCallback(async () => {
    if (selectedIds.length < 2) {
      setError('يرجى اختيار حلقتين على الأقل | Please select at least 2 episodes');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const ids = selectedIds.map((e) => e.id);
      const data = await adminAPI.compareEpisodes(ids);
      setComparisonData(data);
    } catch {
      setError('فشل تحميل بيانات المقارنة | Failed to load comparison data');
    } finally {
      setLoading(false);
    }
  }, [selectedIds]);

  /**
   * حساب أقصى قيمة لمقياس معين | Calculate max value for a metric
   */
  const getMaxValue = (metricKey) => {
    if (!comparisonData) return 0;
    return Math.max(...comparisonData.map((ep) => ep[metricKey] || 0), 1);
  };

  /**
   * حساب نسبة العرض للشريط | Calculate bar width percentage
   */
  const getBarWidth = (value, metricKey) => {
    const max = getMaxValue(metricKey);
    return max > 0 ? (value / max) * 100 : 0;
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* العنوان | Header */}
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          مقارنة الحلقات
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          قارن بين حلقتين أو أكثر جنبًا إلى جنب | Compare 2+ episodes side by side
        </p>

        {/* قسم البحث والاختيار | Search & Selection Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ابحث عن حلقة لإضافتها | Search for an episode to add
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="اكتب اسم الحلقة أو رقمها... | Type episode name or number..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         placeholder-gray-400 dark:placeholder-gray-500
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {/* مؤشر البحث | Search indicator */}
            {searching && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* نتائج البحث المنسدلة | Dropdown search results */}
          {searchResults.length > 0 && (
            <ul className="mt-2 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              {searchResults.map((ep) => (
                <li
                  key={ep.id}
                  onClick={() => addEpisode(ep)}
                  className="px-4 py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700
                             text-gray-800 dark:text-gray-200 border-b border-gray-100
                             dark:border-gray-700 last:border-b-0 transition-colors"
                >
                  {ep.title}
                </li>
              ))}
            </ul>
          )}

          {/* الحلقات المختارة | Selected episodes chips */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedIds.map((ep) => (
                <span
                  key={ep.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100
                             dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                >
                  {ep.title}
                  <button
                    onClick={() => removeEpisode(ep.id)}
                    className="w-5 h-5 flex items-center justify-center rounded-full
                               bg-blue-200 dark:bg-blue-800 hover:bg-red-300
                               dark:hover:bg-red-700 transition-colors"
                    aria-label="إزالة | Remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* زر المقارنة | Compare button */}
          <button
            onClick={handleCompare}
            disabled={selectedIds.length < 2 || loading}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
                       text-white font-medium rounded-lg transition-colors
                       disabled:cursor-not-allowed"
          >
            {loading ? 'جاري المقارنة... | Comparing...' : 'قارن الحلقات | Compare Episodes'}
          </button>
        </div>

        {/* رسالة الخطأ | Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800
                          text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* جدول المقارنة | Comparison Table */}
        {comparisonData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                      المقياس | Metric
                    </th>
                    {comparisonData.map((ep) => (
                      <th
                        key={ep.id}
                        className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300"
                      >
                        {ep.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric) => (
                    <tr
                      key={metric.key}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">
                        {metric.label}
                      </td>
                      {comparisonData.map((ep) => (
                        <td key={ep.id} className="px-6 py-4">
                          <div className="text-center text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {metric.key === 'rating'
                              ? (ep[metric.key] || 0).toFixed(1)
                              : (ep[metric.key] || 0).toLocaleString('ar-EG')}
                          </div>
                          {/* الأشرطة المرئية | Visual bars */}
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                            <div
                              className={`${metric.color} h-3 rounded-full transition-all duration-500`}
                              style={{ width: `${getBarWidth(ep[metric.key] || 0, metric.key)}%` }}
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ملخص المقارنة | Comparison Summary */}
        {comparisonData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => {
              // حساب الحلقة الأفضل لكل مقياس | Calculate best episode per metric
              const best = comparisonData.reduce((a, b) =>
                (a[metric.key] || 0) > (b[metric.key] || 0) ? a : b
              );
              return (
                <div
                  key={metric.key}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center"
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    الأفضل في {metric.label.split('|')[0].trim()}
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {best.title}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${metric.color.replace('bg-', 'text-')}`}>
                    {metric.key === 'rating'
                      ? (best[metric.key] || 0).toFixed(1)
                      : (best[metric.key] || 0).toLocaleString('ar-EG')}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EpisodeCompare;
