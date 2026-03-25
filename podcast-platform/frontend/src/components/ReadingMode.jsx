import React, { useState, useEffect, useCallback } from 'react';

/**
 * ReadingMode - وضع القراءة
 * طبقة علوية تعرض وصف البودكاست/الحلقة بنص كبير وقابل للقراءة
 * Modal overlay displaying podcast/episode description in large readable text
 *
 * @param {{ content: string, title: string }} props
 */
export default function ReadingMode({ content, title }) {
  // حالة فتح/إغلاق وضع القراءة - Open/close state
  const [isOpen, setIsOpen] = useState(false);

  // فتح وضع القراءة - Open reading mode
  const open = useCallback(() => setIsOpen(true), []);

  // إغلاق وضع القراءة - Close reading mode
  const close = useCallback(() => setIsOpen(false), []);

  // إغلاق بمفتاح Escape - Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // منع التمرير في الخلفية - Prevent background scrolling
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, close]);

  return (
    <>
      {/* زر تفعيل وضع القراءة - Reading mode toggle button */}
      <button
        onClick={open}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
          bg-indigo-600 dark:bg-indigo-500 text-white
          hover:bg-indigo-700 dark:hover:bg-indigo-600
          transition-colors text-sm font-medium"
        aria-label="فتح وضع القراءة / Open reading mode"
      >
        {/* أيقونة القراءة - Reading icon */}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span>وضع القراءة / Reading Mode</span>
      </button>

      {/* طبقة وضع القراءة العلوية - Reading mode overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          dir="rtl"
          role="dialog"
          aria-modal="true"
          aria-label="وضع القراءة / Reading Mode"
        >
          {/* خلفية داكنة - Dark background overlay */}
          <div
            className="absolute inset-0 bg-black/90 dark:bg-black/95"
            onClick={close}
          />

          {/* محتوى وضع القراءة - Reading mode content */}
          <div className="relative z-10 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto
            bg-gray-900 dark:bg-gray-950 rounded-2xl p-8 md:p-12 shadow-2xl">

            {/* زر الإغلاق - Close button */}
            <button
              onClick={close}
              className="absolute top-4 left-4 p-2 rounded-full
                text-gray-400 hover:text-white hover:bg-gray-800
                transition-colors"
              aria-label="إغلاق وضع القراءة / Close reading mode"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* عنوان المحتوى - Content title */}
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center leading-relaxed">
                {title}
              </h2>
            )}

            {/* فاصل - Divider */}
            <div className="w-16 h-1 bg-indigo-500 mx-auto mb-8 rounded-full" />

            {/* نص المحتوى الرئيسي - Main content text */}
            <div className="text-lg md:text-xl text-gray-200 dark:text-gray-100
              leading-loose text-center whitespace-pre-wrap font-light">
              {content}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
