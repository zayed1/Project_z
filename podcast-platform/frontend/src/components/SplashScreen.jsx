// ============================================
// شاشة التحميل المخصصة | Splash Screen
// تظهر عند أول تحميل مع شعار المنصة متحرك
// ============================================
import { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // اختفاء تدريجي بعد 1.5 ثانية
    const timer = setTimeout(() => setFadeOut(true), 1500);
    const hide = setTimeout(() => setVisible(false), 2000);
    return () => { clearTimeout(timer); clearTimeout(hide); };
  }, []);

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 z-[500] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center transition-opacity duration-500 ${
      fadeOut ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="text-center">
        {/* الشعار المتحرك | Animated logo */}
        <div className="relative mb-6">
          <div className="w-20 h-20 mx-auto bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-pulse">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
              <line x1="12" y1="19" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          {/* حلقات الصوت | Sound waves */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-white/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full border border-white/10 animate-ping" style={{ animationDuration: '2.5s' }} />
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">منصة البودكاست</h1>
        <p className="text-sm text-white/60">اكتشف. استمع. استمتع.</p>

        {/* شريط تحميل | Loading bar */}
        <div className="w-32 h-1 bg-white/20 rounded-full mx-auto mt-6 overflow-hidden">
          <div className="h-full bg-white/60 rounded-full animate-splash-loading" />
        </div>
      </div>
    </div>
  );
}
