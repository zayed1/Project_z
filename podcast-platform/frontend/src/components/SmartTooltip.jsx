// ============================================
// تلميح ذكي | Smart Tooltip Component
// ============================================
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

/**
 * SmartTooltip - تلميح يظهر عند التمرير مع معلومات إضافية
 * Tooltip that appears on hover with additional info
 *
 * @param {string|JSX} content - محتوى التلميح | Tooltip content
 * @param {JSX} children - العنصر المستهدف | Target element
 * @param {string} position - الموضع (top/bottom/left/right) | Position
 */
const SmartTooltip = ({ content, children, position = 'top' }) => {
  // حالة الظهور | Visibility state
  const [isVisible, setIsVisible] = useState(false);
  // حالة التلاشي | Fade state for animation
  const [isFading, setIsFading] = useState(false);
  // إحداثيات التلميح | Tooltip coordinates
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  // الموضع المعدّل تلقائياً | Auto-adjusted position
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  /**
   * حساب الموضع الأمثل | Calculate optimal position
   * يبقى ضمن حدود نافذة العرض | Stays within viewport bounds
   */
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8; // المسافة بين العنصر والتلميح | Gap between trigger and tooltip
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let finalPosition = position;
    let top = 0;
    let left = 0;

    // حساب الموضع المبدئي | Calculate initial position
    const positions = {
      top: {
        top: triggerRect.top - tooltipRect.height - gap,
        left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
      },
      bottom: {
        top: triggerRect.bottom + gap,
        left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
      },
      left: {
        top: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2,
        left: triggerRect.left - tooltipRect.width - gap,
      },
      right: {
        top: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2,
        left: triggerRect.right + gap,
      },
    };

    // التحقق من الحدود وتعديل الموضع | Check bounds and adjust
    const pos = positions[position];
    if (pos.top < 0 && position === 'top') finalPosition = 'bottom';
    else if (pos.top + tooltipRect.height > viewportHeight && position === 'bottom') finalPosition = 'top';
    else if (pos.left < 0 && position === 'left') finalPosition = 'right';
    else if (pos.left + tooltipRect.width > viewportWidth && position === 'right') finalPosition = 'left';

    const finalPos = positions[finalPosition];
    top = finalPos.top;
    left = finalPos.left;

    // ضمان البقاء ضمن العرض | Ensure within viewport width
    left = Math.max(8, Math.min(left, viewportWidth - tooltipRect.width - 8));
    top = Math.max(8, Math.min(top, viewportHeight - tooltipRect.height - 8));

    setAdjustedPosition(finalPosition);
    setCoords({ top, left });
  }, [position]);

  // معالج الإظهار | Show handler
  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(true);
    // تأخير بسيط ثم تفعيل التلاشي | Small delay then enable fade
    requestAnimationFrame(() => setIsFading(true));
  };

  // معالج الإخفاء | Hide handler
  const handleMouseLeave = () => {
    setIsFading(false);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 200); // مدة انتهاء التلاشي | Fade out duration
  };

  // حساب الموضع عند الظهور | Calculate position on show
  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible, calculatePosition]);

  // تنظيف المؤقت | Cleanup timeout
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  // سهم التلميح حسب الاتجاه | Arrow based on direction
  const arrowClasses = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800 dark:border-t-gray-200',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800 dark:border-b-gray-200',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800 dark:border-l-gray-200',
    right: 'left-[-4px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800 dark:border-r-gray-200',
  };

  return (
    <>
      {/* العنصر المستهدف | Trigger element */}
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </span>

      {/* بوابة التلميح | Tooltip portal */}
      {isVisible &&
        ReactDOM.createPortal(
          <div
            ref={tooltipRef}
            className={`fixed z-[9999] px-3 py-2 text-sm rounded-lg shadow-lg
              bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900
              transition-opacity duration-200 pointer-events-none
              ${isFading ? 'opacity-100' : 'opacity-0'}`}
            style={{ top: coords.top, left: coords.left }}
            dir="rtl"
          >
            {content}
            {/* السهم | Arrow */}
            <div
              className={`absolute w-0 h-0 border-4 ${arrowClasses[adjustedPosition]}`}
            />
          </div>,
          document.body
        )}
    </>
  );
};

export default SmartTooltip;
