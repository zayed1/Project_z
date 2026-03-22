import React, { useCallback, useRef } from 'react';

/**
 * Prefetch Component - مكوّن التحميل المسبق
 * يقوم بتحميل بيانات البودكاست مسبقاً عند تمرير الماوس فوق البطاقة
 * Prefetches podcast data on mouseenter over a card
 */

// ذاكرة تخزين مؤقت عامة لتجنب إعادة التحميل
// Global cache Map to avoid re-fetching
const prefetchCache = new Map();

/**
 * هوك التحميل المسبق - Prefetch hook
 * يجلب بيانات مصغّرة من API عند تمرير الماوس
 * Fetches minimal data from API on mouse hover
 * @param {string|number} id - معرّف البودكاست / Podcast ID
 * @returns {{ data: any, prefetch: Function }} بيانات محمّلة ودالة التحميل / Prefetched data and prefetch function
 */
export function usePrefetch(id) {
  // البيانات المحمّلة مسبقاً - Prefetched data reference
  const dataRef = useRef(null);

  const prefetch = useCallback(async () => {
    // تحقق من وجود البيانات في الذاكرة المؤقتة
    // Check if data already exists in cache
    if (prefetchCache.has(id)) {
      dataRef.current = prefetchCache.get(id);
      return dataRef.current;
    }

    try {
      // جلب البيانات المصغّرة من الخادم
      // Fetch minimal data from server
      const response = await fetch(`/api/podcasts/${id}/prefetch`);
      if (!response.ok) throw new Error('فشل التحميل المسبق / Prefetch failed');

      const data = await response.json();

      // تخزين البيانات في الذاكرة المؤقتة العامة
      // Store data in global cache
      prefetchCache.set(id, data);
      dataRef.current = data;

      return data;
    } catch (error) {
      // تسجيل الخطأ دون تعطيل التجربة
      // Log error without disrupting UX
      console.warn(`خطأ في التحميل المسبق / Prefetch error for ${id}:`, error);
      return null;
    }
  }, [id]);

  return { data: dataRef.current, prefetch };
}

/**
 * مكوّن غلاف التحميل المسبق - Prefetch Wrapper Component
 * يلف العناصر الفرعية ويضيف معالج حدث تمرير الماوس
 * Wraps children and adds onMouseEnter handler for prefetching
 * @param {{ id: string|number, children: React.ReactNode, className: string }} props
 */
export default function Prefetch({ id, children, className = '' }) {
  const { prefetch } = usePrefetch(id);

  // معالج حدث دخول الماوس - Mouse enter event handler
  const handleMouseEnter = useCallback(() => {
    prefetch();
  }, [prefetch]);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      className={className}
      dir="rtl"
    >
      {children}
    </div>
  );
}
