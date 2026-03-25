// ============================================
// بطاقة قابلة للسحب | Swipeable Card Component
// سحب يميناً/يساراً للإضافة السريعة أو الحذف
// ============================================
import { useState, useRef } from 'react';

const SWIPE_THRESHOLD = 80;

export default function SwipeableCard({
  children,
  onSwipeRight,
  onSwipeLeft,
  rightLabel = 'إضافة للقائمة',
  leftLabel = 'حذف',
  rightColor = 'bg-primary-500',
  leftColor = 'bg-red-500',
  disabled = false,
}) {
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef(null);

  const handleTouchStart = (e) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontal.current = null;
    setSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (disabled || !swiping) return;

    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    // تحديد اتجاه السحب في أول حركة
    if (isHorizontal.current === null) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isHorizontal.current = Math.abs(dx) > Math.abs(dy);
      }
      return;
    }

    if (!isHorizontal.current) return;

    e.preventDefault();
    // تقييد المسافة
    const clamped = Math.max(-150, Math.min(150, dx));
    setOffsetX(clamped);
  };

  const handleTouchEnd = () => {
    if (!swiping) return;
    setSwiping(false);

    if (offsetX > SWIPE_THRESHOLD && onSwipeRight) {
      onSwipeRight();
    } else if (offsetX < -SWIPE_THRESHOLD && onSwipeLeft) {
      onSwipeLeft();
    }

    setOffsetX(0);
    isHorizontal.current = null;
  };

  const rightActive = offsetX > SWIPE_THRESHOLD;
  const leftActive = offsetX < -SWIPE_THRESHOLD;

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* خلفية السحب يميناً | Right swipe background */}
      {onSwipeRight && (
        <div className={`absolute inset-y-0 right-0 w-full flex items-center justify-end pr-5 ${rightColor} transition-opacity ${
          offsetX > 20 ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className={`flex items-center gap-2 text-white transition-transform ${
            rightActive ? 'scale-110' : ''
          }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="text-sm font-medium">{rightLabel}</span>
          </div>
        </div>
      )}

      {/* خلفية السحب يساراً | Left swipe background */}
      {onSwipeLeft && (
        <div className={`absolute inset-y-0 left-0 w-full flex items-center justify-start pl-5 ${leftColor} transition-opacity ${
          offsetX < -20 ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className={`flex items-center gap-2 text-white transition-transform ${
            leftActive ? 'scale-110' : ''
          }`}>
            <span className="text-sm font-medium">{leftLabel}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        </div>
      )}

      {/* المحتوى | Content */}
      <div
        className="relative bg-white dark:bg-gray-800 transition-transform"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: swiping ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
