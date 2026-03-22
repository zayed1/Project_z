// ============================================
// حلقات مشابهة | Similar Episodes Component
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import { episodesAPI, discoverAPI } from '../utils/api';

/**
 * SimilarEpisodes - يجمع الحلقات المشابهة من بودكاستات مختلفة
 * Groups similar episodes from different podcasts
 *
 * @param {string|number} currentEpisodeId - معرف الحلقة الحالية | Current episode ID
 * @param {string[]} tags - وسوم الحلقة | Episode tags
 * @param {string} title - عنوان الحلقة | Episode title
 * @param {object[]} cachedEpisodes - حلقات مخزنة للبحث المحلي | Cached episodes for local search
 */
const SimilarEpisodes = ({
  currentEpisodeId,
  tags = [],
  title = '',
  cachedEpisodes = [],
}) => {
  // الحلقات المشابهة | Similar episodes
  const [similar, setSimilar] = useState([]);
  // حالة التحميل | Loading state
  const [loading, setLoading] = useState(true);
  // خطأ | Error state
  const [error, setError] = useState(null);

  /**
   * مطابقة الكلمات المفتاحية محلياً | Client-side keyword matching
   * يحسب درجة التشابه بناءً على الوسوم والكلمات المشتركة
   * Calculates similarity score based on shared tags and title words
   */
  const findSimilarLocally = useMemo(() => {
    if (cachedEpisodes.length === 0) return null;

    // استخراج كلمات العنوان | Extract title keywords
    const titleWords = title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const tagsLower = tags.map((t) => t.toLowerCase());

    return cachedEpisodes
      .filter((ep) => ep.id !== currentEpisodeId)
      .map((ep) => {
        let score = 0;

        // مطابقة الوسوم | Tag matching
        const epTags = (ep.tags || []).map((t) => t.toLowerCase());
        tagsLower.forEach((tag) => {
          if (epTags.includes(tag)) score += 3;
        });

        // مطابقة كلمات العنوان | Title word matching
        const epTitleWords = (ep.title || '')
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 2);
        titleWords.forEach((word) => {
          if (epTitleWords.includes(word)) score += 1;
        });

        return { ...ep, similarityScore: score };
      })
      .filter((ep) => ep.similarityScore > 0)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 10);
  }, [cachedEpisodes, currentEpisodeId, tags, title]);

  // جلب الحلقات المشابهة | Fetch similar episodes
  useEffect(() => {
    const fetchSimilar = async () => {
      setLoading(true);
      setError(null);

      try {
        // محاولة الجلب من API أولاً | Try API first
        if (currentEpisodeId) {
          const res = await discoverAPI.suggested(currentEpisodeId);
          if (res.data && res.data.length > 0) {
            setSimilar(res.data.slice(0, 10));
            setLoading(false);
            return;
          }
        }
      } catch (apiErr) {
        // فشل API، نستخدم البحث المحلي | API failed, use local search
        console.warn('API غير متاح، استخدام البحث المحلي | API unavailable, using local search');
      }

      // استخدام المطابقة المحلية | Use local matching
      if (findSimilarLocally && findSimilarLocally.length > 0) {
        setSimilar(findSimilarLocally);
      } else {
        setSimilar([]);
      }
      setLoading(false);
    };

    fetchSimilar();
  }, [currentEpisodeId, findSimilarLocally]);

  // تنسيق المدة | Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    return `${mins} د`;
  };

  // حالة التحميل | Loading state
  if (loading) {
    return (
      <div className="space-y-2" dir="rtl">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          حلقات مشابهة
        </h3>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-36 h-28 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // لا توجد حلقات مشابهة | No similar episodes
  if (similar.length === 0 && !error) {
    return null;
  }

  return (
    <div className="space-y-3" dir="rtl">
      {/* العنوان | Title */}
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
        حلقات مشابهة
        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal mr-2">
          Similar Episodes
        </span>
      </h3>

      {/* خطأ | Error */}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}

      {/* قائمة أفقية قابلة للتمرير | Horizontal scrollable list */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {similar.map((ep) => (
          <div
            key={ep.id}
            className="flex-shrink-0 w-40 bg-white dark:bg-gray-800 rounded-lg border border-gray-200
              dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
          >
            {/* صورة الغلاف | Cover image */}
            <div className="w-full h-20 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
              {ep.thumbnail || ep.cover_url ? (
                <img
                  src={ep.thumbnail || ep.cover_url}
                  alt={ep.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              )}
            </div>

            {/* معلومات الحلقة | Episode info */}
            <div className="p-2">
              <h4 className="text-xs font-medium text-gray-900 dark:text-white truncate">
                {ep.title}
              </h4>
              {ep.podcast_title && (
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {ep.podcast_title}
                </p>
              )}
              {ep.duration && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                  {formatDuration(ep.duration)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarEpisodes;
