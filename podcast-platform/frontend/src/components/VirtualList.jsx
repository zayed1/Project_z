import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';

/**
 * VirtualList - القائمة الافتراضية
 * يعرض فقط العناصر المرئية + منطقة عازلة لتحسين الأداء
 * Renders only visible items + buffer zone for performance optimization
 *
 * @param {{ items: Array, renderItem: Function, itemHeight: number, containerHeight: number }} props
 */

// حجم المنطقة العازلة - عدد العناصر الإضافية فوق وتحت المنطقة المرئية
// Buffer size - number of extra items above and below visible area
const BUFFER_COUNT = 5;

export default function VirtualList({
  items = [],
  renderItem,
  itemHeight = 80,
  containerHeight = 600,
}) {
  // موضع التمرير الحالي - Current scroll position
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  // حساب العناصر المرئية - Calculate visible items
  const { visibleItems, startIndex, totalHeight, offsetY } = useMemo(() => {
    // إجمالي ارتفاع القائمة - Total list height
    const totalH = items.length * itemHeight;

    // أول عنصر مرئي مع المنطقة العازلة
    // First visible item with buffer
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - BUFFER_COUNT);

    // عدد العناصر المرئية مع المنطقة العازلة
    // Number of visible items with buffer
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2 * BUFFER_COUNT;
    const end = Math.min(items.length, start + visibleCount);

    // العناصر المقطوعة للعرض - Sliced items for rendering
    const visible = items.slice(start, end).map((item, i) => ({
      item,
      index: start + i,
    }));

    // الإزاحة الرأسية للعناصر المرئية - Vertical offset for visible items
    const offset = start * itemHeight;

    return {
      visibleItems: visible,
      startIndex: start,
      totalHeight: totalH,
      offsetY: offset,
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  // معالج حدث التمرير - Scroll event handler
  const handleScroll = useCallback((e) => {
    // تحديث موضع التمرير - Update scroll position
    setScrollTop(e.target.scrollTop);
  }, []);

  // مراقب التقاطع للكشف عن العناصر المرئية (اختياري)
  // IntersectionObserver for detecting visible items (optional enhancement)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // إضافة مستمع التمرير مع تحسين الأداء
    // Add scroll listener with passive flag for performance
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div
      ref={containerRef}
      dir="rtl"
      className="overflow-y-auto bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      role="list"
      aria-label="قائمة افتراضية / Virtual List"
    >
      {/* الحاوية الداخلية بالارتفاع الكامل - Inner container with full height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* العناصر المرئية مع الإزاحة - Visible items with offset */}
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{ height: itemHeight }}
              className="border-b border-gray-100 dark:border-gray-800"
              role="listitem"
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>

      {/* رسالة القائمة الفارغة - Empty list message */}
      {items.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p>لا توجد عناصر / No items</p>
        </div>
      )}
    </div>
  );
}
