// ============================================
// مؤشر التشغيل الحالي | Now Playing Indicator
// ============================================
import React from 'react';

/**
 * أنماط الرسوم المتحركة للأعمدة | Bar animation styles
 * ثلاثة أعمدة بتأثير معادل صوتي | Three bars with equalizer effect
 */
const animationStyles = `
@keyframes equalizerBar1 {
  0%, 100% { height: 30%; }
  50% { height: 100%; }
}
@keyframes equalizerBar2 {
  0%, 100% { height: 60%; }
  50% { height: 30%; }
}
@keyframes equalizerBar3 {
  0%, 100% { height: 45%; }
  50% { height: 80%; }
}
`;

/**
 * NowPlayingIndicator - أيقونة أعمدة متحركة (معادل صوتي) تظهر على الحلقة قيد التشغيل
 * Animated bars icon (equalizer-style) shown on currently playing episode
 *
 * @param {boolean} isPlaying - تتحرك عند التشغيل، ثابتة عند الإيقاف | Animates when true, static when paused
 * @param {string} size - الحجم (sm/md/lg) | Size variant
 * @param {string} color - لون الأعمدة | Bar color class
 */
const NowPlayingIndicator = ({
  isPlaying = false,
  size = 'md',
  color = 'bg-purple-500 dark:bg-purple-400',
}) => {
  // أحجام مختلفة | Size variants
  const sizes = {
    sm: { container: 'w-3 h-3', bar: 'w-0.5' },
    md: { container: 'w-4 h-4', bar: 'w-1' },
    lg: { container: 'w-6 h-6', bar: 'w-1.5' },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <>
      {/* إدراج أنماط CSS | Inject CSS styles */}
      <style>{animationStyles}</style>

      {/* حاوية الأعمدة | Bars container */}
      <span
        className={`inline-flex items-end gap-[2px] ${currentSize.container}`}
        role="img"
        aria-label={isPlaying ? 'قيد التشغيل | Now playing' : 'متوقف مؤقتاً | Paused'}
        dir="ltr"
      >
        {/* العمود الأول | Bar 1 */}
        <span
          className={`${currentSize.bar} rounded-full ${color}`}
          style={{
            height: isPlaying ? undefined : '30%',
            animation: isPlaying ? 'equalizerBar1 0.8s ease-in-out infinite' : 'none',
          }}
        />
        {/* العمود الثاني | Bar 2 */}
        <span
          className={`${currentSize.bar} rounded-full ${color}`}
          style={{
            height: isPlaying ? undefined : '60%',
            animation: isPlaying ? 'equalizerBar2 0.6s ease-in-out infinite' : 'none',
          }}
        />
        {/* العمود الثالث | Bar 3 */}
        <span
          className={`${currentSize.bar} rounded-full ${color}`}
          style={{
            height: isPlaying ? undefined : '45%',
            animation: isPlaying ? 'equalizerBar3 0.7s ease-in-out infinite' : 'none',
          }}
        />
      </span>
    </>
  );
};

export default NowPlayingIndicator;
