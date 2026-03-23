// ============================================
// شريط التقدم العلوي المحسّن | Enhanced Top Progress Bar
// مع تأثيرات متقدمة مثل YouTube
// ============================================
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function ProgressBar() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const trickleRef = useRef(null);

  useEffect(() => {
    // بدء التحميل | Start loading
    setVisible(true);
    setProgress(15);

    // تقدم تدريجي عشوائي | Random trickle progress
    let current = 15;
    trickleRef.current = setInterval(() => {
      current += Math.random() * 12;
      if (current >= 90) {
        current = 90;
        clearInterval(trickleRef.current);
      }
      setProgress(current);
    }, 150);

    // إكمال بعد تحميل الصفحة | Complete after page loads
    const complete = setTimeout(() => {
      clearInterval(trickleRef.current);
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    }, 500);

    return () => {
      clearInterval(trickleRef.current);
      clearTimeout(complete);
    };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-[3px]">
      <div
        className="h-full bg-gradient-to-l from-primary-400 via-primary-500 to-primary-600 transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? '200ms' : '400ms',
        }}
      >
        {/* نقطة متوهجة في المقدمة | Glowing dot at the tip */}
        <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-l from-white/40 to-transparent" />
        <div className="absolute top-0 left-0 h-[5px] w-[5px] rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" style={{ boxShadow: '0 0 10px var(--theme-primary, #6366f1), 0 0 5px var(--theme-primary, #6366f1)' }} />
      </div>
    </div>
  );
}
