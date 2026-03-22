import React, { useState, useRef, useCallback } from 'react';

/**
 * DragDropPlaylist - قائمة تشغيل قابلة للسحب والإفلات
 * Sortable playlist items using HTML5 drag and drop API (no external library)
 * يستقبل عناصر ودالة إعادة الترتيب
 * Receives items and onReorder callback
 *
 * @param {{ items: Array, onReorder: Function }} props
 */

export default function DragDropPlaylist({ items = [], onReorder }) {
  // معرّف العنصر المسحوب - Dragged item index
  const [dragIndex, setDragIndex] = useState(null);
  // معرّف العنصر المستهدف - Drop target index
  const [overIndex, setOverIndex] = useState(null);
  // مرجع العنصر المسحوب - Dragged item ref
  const dragItemRef = useRef(null);
  // مرجع العنصر المستهدف - Drop target ref
  const dragOverRef = useRef(null);

  /**
   * معالج بداية السحب - Drag start handler
   * @param {DragEvent} e - حدث السحب / Drag event
   * @param {number} index - فهرس العنصر / Item index
   */
  const handleDragStart = useCallback((e, index) => {
    dragItemRef.current = index;
    setDragIndex(index);

    // تعيين بيانات السحب - Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));

    // تأخير لتطبيق تأثير الشفافية - Delay to apply opacity effect
    requestAnimationFrame(() => {
      if (e.target) {
        e.target.style.opacity = '0.5';
      }
    });
  }, []);

  /**
   * معالج نهاية السحب - Drag end handler
   * @param {DragEvent} e - حدث السحب / Drag event
   */
  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = '1';
    setDragIndex(null);
    setOverIndex(null);
    dragItemRef.current = null;
    dragOverRef.current = null;
  }, []);

  /**
   * معالج السحب فوق عنصر - Drag over handler
   * @param {DragEvent} e - حدث السحب / Drag event
   * @param {number} index - فهرس العنصر المستهدف / Target item index
   */
  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverRef.current = index;
    setOverIndex(index);
  }, []);

  /**
   * معالج الدخول فوق عنصر - Drag enter handler
   * @param {DragEvent} e - حدث السحب / Drag event
   * @param {number} index - فهرس العنصر / Item index
   */
  const handleDragEnter = useCallback((e, index) => {
    e.preventDefault();
    dragOverRef.current = index;
    setOverIndex(index);
  }, []);

  /**
   * معالج مغادرة عنصر - Drag leave handler
   */
  const handleDragLeave = useCallback(() => {
    // لا نعيد تعيين overIndex هنا لتجنب الوميض
    // Don't reset overIndex here to avoid flickering
  }, []);

  /**
   * معالج الإفلات - Drop handler
   * @param {DragEvent} e - حدث الإفلات / Drop event
   * @param {number} dropIndex - فهرس الإفلات / Drop index
   */
  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault();

    const fromIndex = dragItemRef.current;
    if (fromIndex === null || fromIndex === dropIndex) return;

    // إعادة ترتيب العناصر - Reorder items
    const reordered = [...items];
    const [movedItem] = reordered.splice(fromIndex, 1);
    reordered.splice(dropIndex, 0, movedItem);

    // استدعاء دالة إعادة الترتيب - Call reorder callback
    if (onReorder) {
      onReorder(reordered);
    }

    // إعادة تعيين حالة السحب - Reset drag state
    setDragIndex(null);
    setOverIndex(null);
    dragItemRef.current = null;
    dragOverRef.current = null;
  }, [items, onReorder]);

  return (
    <div
      dir="rtl"
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      role="list"
      aria-label="قائمة تشغيل قابلة لإعادة الترتيب / Reorderable playlist"
    >
      {/* رأس القائمة - List header */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          قائمة التشغيل
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
            ({items.length} حلقة / {items.length} episodes)
          </span>
        </h3>
      </div>

      {/* عناصر القائمة - List items */}
      {items.map((item, index) => {
        const isDragging = dragIndex === index;
        const isOver = overIndex === index && dragIndex !== index;

        return (
          <div
            key={item.id || index}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            role="listitem"
            aria-grabbed={isDragging}
            className={`flex items-center gap-3 px-4 py-3 cursor-grab active:cursor-grabbing
              border-b border-gray-100 dark:border-gray-800 transition-all duration-150
              ${isDragging
                ? 'opacity-50 bg-gray-100 dark:bg-gray-800'
                : 'opacity-100 bg-white dark:bg-gray-900'
              }
              ${isOver
                ? 'border-t-2 border-t-indigo-500 dark:border-t-indigo-400'
                : ''
              }
              hover:bg-gray-50 dark:hover:bg-gray-850`}
          >
            {/* أيقونة مقبض السحب - Drag handle icon */}
            <div className="flex-shrink-0 text-gray-400 dark:text-gray-500 cursor-grab">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="9" cy="5" r="1.5" />
                <circle cx="15" cy="5" r="1.5" />
                <circle cx="9" cy="12" r="1.5" />
                <circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="19" r="1.5" />
                <circle cx="15" cy="19" r="1.5" />
              </svg>
            </div>

            {/* رقم العنصر - Item number */}
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700
              text-xs font-bold text-gray-600 dark:text-gray-400
              flex items-center justify-center">
              {index + 1}
            </span>

            {/* عنوان الحلقة - Episode title */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {item.title || item.episodeTitle || `حلقة ${index + 1}`}
              </p>
              {/* المدة إن وجدت - Duration if available */}
              {item.duration && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {typeof item.duration === 'number'
                    ? `${Math.floor(item.duration / 60)} دقيقة`
                    : item.duration}
                </p>
              )}
            </div>

            {/* مؤشر السحب المرئي - Visual drag indicator */}
            {isDragging && (
              <span className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">
                جاري النقل...
              </span>
            )}
          </div>
        );
      })}

      {/* رسالة القائمة الفارغة - Empty list message */}
      {items.length === 0 && (
        <div className="flex items-center justify-center py-12 text-gray-400 dark:text-gray-500">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <p className="text-sm">لا توجد حلقات في القائمة / No episodes in playlist</p>
          </div>
        </div>
      )}
    </div>
  );
}
