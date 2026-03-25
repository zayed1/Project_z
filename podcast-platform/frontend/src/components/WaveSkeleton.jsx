// ============================================
// هيكل تحميل متحرك بموجة | Wave Skeleton Loading Component
// ============================================
import React from 'react';

/**
 * أنماط الموجة المتحركة | Wave animation styles
 * يستخدم CSS keyframes لتأثير التلألؤ | Uses CSS keyframes for shimmer effect
 */
const waveStyles = `
@keyframes waveShimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
.wave-skeleton {
  background: linear-gradient(
    90deg,
    rgba(156, 163, 175, 0.15) 25%,
    rgba(156, 163, 175, 0.3) 50%,
    rgba(156, 163, 175, 0.15) 75%
  );
  background-size: 200% 100%;
  animation: waveShimmer 1.8s ease-in-out infinite;
}
.dark .wave-skeleton {
  background: linear-gradient(
    90deg,
    rgba(75, 85, 99, 0.3) 25%,
    rgba(75, 85, 99, 0.6) 50%,
    rgba(75, 85, 99, 0.3) 75%
  );
  background-size: 200% 100%;
  animation: waveShimmer 1.8s ease-in-out infinite;
}
`;

// قاعدة الهيكل | Base skeleton element
const WaveSkeletonBase = ({ className = '', style = {} }) => (
  <div
    className={`wave-skeleton rounded ${className}`}
    style={style}
  />
);

/**
 * بطاقة هيكلية | Skeleton Card
 * تحاكي شكل بطاقة بودكاست أو حلقة | Mimics podcast/episode card shape
 */
export const WaveSkeletonCard = ({ count = 1 }) => {
  return (
    <>
      {/* إدراج أنماط CSS | Inject CSS styles */}
      <style>{waveStyles}</style>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            {/* صورة الغلاف | Cover image placeholder */}
            <WaveSkeletonBase className="w-full h-40 rounded-lg mb-4" />
            {/* العنوان | Title */}
            <WaveSkeletonBase className="h-5 w-3/4 mb-3 rounded-md" />
            {/* الوصف - سطران | Description - 2 lines */}
            <WaveSkeletonBase className="h-3 w-full mb-2 rounded" />
            <WaveSkeletonBase className="h-3 w-5/6 mb-4 rounded" />
            {/* التذييل - أيقونات وأزرار | Footer - icons and buttons */}
            <div className="flex items-center justify-between">
              <WaveSkeletonBase className="h-8 w-20 rounded-full" />
              <WaveSkeletonBase className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

/**
 * قائمة هيكلية | Skeleton List
 * تحاكي شكل قائمة حلقات أو عناصر | Mimics episode/item list shape
 */
export const WaveSkeletonList = ({ rows = 5 }) => {
  return (
    <>
      <style>{waveStyles}</style>
      <div className="space-y-3" dir="rtl">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700"
          >
            {/* صورة مصغرة | Thumbnail */}
            <WaveSkeletonBase className="w-12 h-12 rounded-lg flex-shrink-0" />
            {/* المحتوى | Content */}
            <div className="flex-1 min-w-0">
              <WaveSkeletonBase className="h-4 w-2/3 mb-2 rounded" />
              <WaveSkeletonBase className="h-3 w-1/3 rounded" />
            </div>
            {/* إجراء | Action */}
            <WaveSkeletonBase className="h-8 w-16 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </>
  );
};

/**
 * نص هيكلي | Skeleton Text
 * يحاكي فقرات نصية | Mimics text paragraphs
 */
export const WaveSkeletonText = ({ lines = 4 }) => {
  // أعرض مختلفة لكل سطر لمظهر طبيعي | Different widths for natural look
  const widths = ['w-full', 'w-11/12', 'w-4/5', 'w-5/6', 'w-3/4', 'w-full', 'w-2/3'];

  return (
    <>
      <style>{waveStyles}</style>
      <div className="space-y-3" dir="rtl">
        {Array.from({ length: lines }).map((_, i) => (
          <WaveSkeletonBase
            key={i}
            className={`h-3 ${widths[i % widths.length]} rounded`}
          />
        ))}
      </div>
    </>
  );
};

// تصدير افتراضي يجمع كل المتغيرات | Default export combining all variants
const WaveSkeleton = { Card: WaveSkeletonCard, List: WaveSkeletonList, Text: WaveSkeletonText };
export default WaveSkeleton;
