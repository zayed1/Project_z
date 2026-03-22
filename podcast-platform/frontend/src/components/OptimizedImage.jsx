import React, { useState, useRef, useEffect } from 'react';

/**
 * OptimizedImage - مكوّن الصورة المحسّنة
 * يعرض صوراً محسّنة مع أحجام متعددة وتحميل كسول وتأثير ضبابي
 * Displays optimized images with multiple sizes, lazy loading, and blur placeholder
 */

// الأحجام المتاحة للصور - Available image sizes
const IMAGE_SIZES = [150, 400, 800];

/**
 * إنشاء مجموعة مصادر الصور - Generate srcSet string
 * @param {string} src - رابط الصورة الأصلي / Original image URL
 * @returns {string} سلسلة srcSet / srcSet string
 */
function generateSrcSet(src) {
  return IMAGE_SIZES.map((size) => {
    // إضافة معامل العرض للرابط - Append width parameter to URL
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}w=${size} ${size}w`;
  }).join(', ');
}

/**
 * إنشاء رابط النسخة المصغّرة للتأثير الضبابي
 * Generate low-res URL for blur placeholder
 * @param {string} src - رابط الصورة الأصلي / Original image URL
 * @returns {string} رابط النسخة المصغّرة / Low-res URL
 */
function getLowResUrl(src) {
  const separator = src.includes('?') ? '&' : '?';
  return `${src}${separator}w=150`;
}

export default function OptimizedImage({ src, alt, className = '' }) {
  // حالة تحميل الصورة - Image loading state
  const [isLoaded, setIsLoaded] = useState(false);
  // حالة الخطأ - Error state
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // إعادة تعيين الحالة عند تغيير المصدر - Reset state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  // معالج اكتمال التحميل - Load complete handler
  const handleLoad = () => {
    setIsLoaded(true);
  };

  // معالج خطأ التحميل - Load error handler
  const handleError = () => {
    setHasError(true);
  };

  // عرض عنصر بديل في حالة الخطأ - Show fallback on error
  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 ${className}`}
        dir="rtl"
        role="img"
        aria-label={alt}
      >
        {/* أيقونة خطأ التحميل - Error icon */}
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} dir="rtl">
      {/* طبقة التأثير الضبابي - Blur placeholder layer */}
      {!isLoaded && (
        <img
          src={getLowResUrl(src)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(20px)', transform: 'scale(1.1)' }}
        />
      )}

      {/* الصورة الرئيسية المحسّنة - Main optimized image */}
      <img
        ref={imgRef}
        src={src}
        srcSet={generateSrcSet(src)}
        sizes="(max-width: 640px) 150px, (max-width: 1024px) 400px, 800px"
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
