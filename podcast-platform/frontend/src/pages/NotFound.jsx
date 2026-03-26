// ============================================
// صفحة 404 المحسّنة | Enhanced Not Found Page
// مع اقتراحات بحث وأنيميشن
// ============================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/?q=${encodeURIComponent(search.trim())}`);
  };

  const suggestions = [
    { label: 'الصفحة الرئيسية', to: '/', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    { label: 'تصفح البودكاست', to: '/', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /> },
    { label: 'قوائم التشغيل', to: '/playlists', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /> },
    { label: 'سجل الاستماع', to: '/history', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
  ];

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Helmet><title>404 - الصفحة غير موجودة</title></Helmet>
      <div className="text-center max-w-md mx-auto">
        {/* الرقم المتحرك | Animated number */}
        <div className="relative mb-6">
          <div className="text-[120px] font-black text-primary-500/10 dark:text-primary-400/10 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">الصفحة غير موجودة</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">يبدو أن هذه الصفحة غير متاحة. جرّب البحث أو اختر صفحة من الأسفل.</p>

        {/* شريط البحث | Search bar */}
        <form onSubmit={handleSearch} className="relative mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن بودكاست..."
            className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        {/* اقتراحات | Suggestions */}
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((s) => (
            <Link
              key={s.to + s.label}
              to={s.to}
              className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm transition-all text-sm text-gray-700 dark:text-gray-300"
            >
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">{s.icon}</svg>
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
