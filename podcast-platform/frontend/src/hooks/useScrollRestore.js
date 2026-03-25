import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * useScrollRestore - هوك استعادة موضع التمرير
 * يحفظ موضع التمرير لكل مسار في sessionStorage ويستعيده عند العودة
 * Saves scroll position per route to sessionStorage and restores on navigate back
 *
 * @param {object} options - خيارات إضافية / Additional options
 * @param {string} options.storageKey - مفتاح التخزين / Storage key prefix
 * @returns {void}
 */

// مفتاح التخزين الافتراضي - Default storage key prefix
const STORAGE_PREFIX = 'scroll_pos_';

export default function useScrollRestore({ storageKey = STORAGE_PREFIX } = {}) {
  const location = useLocation();
  // مرجع لتتبع ما إذا كانت الصفحة قد تم تحميلها للتو
  // Ref to track if the page was just loaded
  const isRestoring = useRef(true);

  // حفظ موضع التمرير عند مغادرة الصفحة
  // Save scroll position when leaving the page
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    const fullKey = `${storageKey}${currentPath}`;

    // استعادة موضع التمرير المحفوظ عند الدخول للصفحة
    // Restore saved scroll position on page enter
    const savedPosition = sessionStorage.getItem(fullKey);
    if (savedPosition !== null && isRestoring.current) {
      // تأخير بسيط لضمان اكتمال العرض
      // Small delay to ensure render is complete
      const timer = setTimeout(() => {
        window.scrollTo(0, parseInt(savedPosition, 10));
      }, 0);

      isRestoring.current = false;
      return () => clearTimeout(timer);
    }

    isRestoring.current = true;

    // دالة حفظ موضع التمرير - Scroll position save function
    const saveScrollPosition = () => {
      sessionStorage.setItem(fullKey, window.scrollY.toString());
    };

    // إضافة مستمع التمرير - Add scroll listener
    window.addEventListener('scroll', saveScrollPosition, { passive: true });

    // حفظ الموضع عند مغادرة الصفحة
    // Save position when leaving the page
    return () => {
      saveScrollPosition();
      window.removeEventListener('scroll', saveScrollPosition);
    };
  }, [location.pathname, location.search, storageKey]);
}
