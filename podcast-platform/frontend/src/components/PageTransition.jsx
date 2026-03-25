// ============================================
// انتقالات الصفحات المحسّنة | Enhanced Page Transitions
// تأثيرات مخصصة لكل نوع تنقل
// ============================================
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useRef } from 'react';

// تحديد نوع الانتقال بناءً على المسار
function getTransitionType(prevPath, nextPath) {
  // الذهاب لتفاصيل → تكبير
  if (nextPath?.startsWith('/podcast/')) return 'zoom';
  // العودة من التفاصيل → تصغير
  if (prevPath?.startsWith('/podcast/') && !nextPath?.startsWith('/podcast/')) return 'zoomOut';
  // التنقل بين تبويبات → انزلاق
  const tabs = ['/', '/listen-later', '/playlists', '/follows', '/history'];
  const prevIdx = tabs.indexOf(prevPath);
  const nextIdx = tabs.indexOf(nextPath);
  if (prevIdx !== -1 && nextIdx !== -1) {
    return nextIdx > prevIdx ? 'slideLeft' : 'slideRight';
  }
  // الافتراضي → تلاشي
  return 'fade';
}

const variants = {
  fade: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  },
  zoom: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
  },
  zoomOut: {
    initial: { opacity: 0, scale: 1.05 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  },
  slideRight: {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 40 },
  },
};

export default function PageTransition({ children }) {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const transitionType = getTransitionType(prevPath.current, location.pathname);

  // تحديث المسار السابق بعد الانتقال
  const currentVariants = variants[transitionType] || variants.fade;

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => { prevPath.current = location.pathname; }}
    >
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={currentVariants}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
