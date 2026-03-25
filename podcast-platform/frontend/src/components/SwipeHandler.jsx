// ============================================
// معالج السحب | Swipe Gesture Handler
// ============================================
import { useRef, useCallback } from 'react';

export function useSwipe({ onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50 }) {
  const touchStart = useRef(null);

  const onTouchStart = useCallback((e) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (!touchStart.current) return;

    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > absDy && absDx > threshold) {
      if (dx > 0) onSwipeRight?.();
      else onSwipeLeft?.();
    } else if (absDy > absDx && absDy > threshold) {
      if (dy > 0) onSwipeDown?.();
      else onSwipeUp?.();
    }

    touchStart.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return { onTouchStart, onTouchEnd };
}
