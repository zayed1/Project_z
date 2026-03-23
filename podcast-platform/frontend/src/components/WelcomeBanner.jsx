// ============================================
// بانر الترحيب | Welcome Banner for New Users
// يظهر مرة واحدة فقط للمستخدمين الجدد
// ============================================
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const FEATURES = [
  { icon: '🎙️', title: 'اكتشف بودكاست جديدة', desc: 'تصفح مئات البودكاست العربية في مختلف المجالات' },
  { icon: '📋', title: 'أنشئ قوائم تشغيل', desc: 'نظم حلقاتك المفضلة في قوائم تشغيل مخصصة' },
  { icon: '🔔', title: 'تابع المحتوى المفضل', desc: 'احصل على إشعارات عند نشر حلقات جديدة' },
];

export default function WelcomeBanner() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/') return;
    const dismissed = localStorage.getItem('welcome_dismissed');
    if (!dismissed) setVisible(true);
  }, [location.pathname]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('welcome_dismissed', '1');
  };

  if (!visible) return null;

  return (
    <div className="bg-gradient-to-l from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 mb-8 border border-primary-200 dark:border-primary-800/50 relative">
      <button
        onClick={dismiss}
        className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
        aria-label="إغلاق"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
        مرحباً بك في منصة البودكاست!
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        اكتشف عالماً من المحتوى الصوتي العربي
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {FEATURES.map((f, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
            <span className="text-2xl mb-1 block">{f.icon}</span>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-0.5">{f.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          onClick={dismiss}
          className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          ابدأ التصفح
        </Link>
        <button
          onClick={dismiss}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          تخطي
        </button>
      </div>
    </div>
  );
}
