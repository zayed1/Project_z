// ============================================
// فوتر الموقع | Footer Component
// مع روابط التواصل الاجتماعي + شعار المنصة
// ============================================
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function Footer() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => setStats(data.settings))
      .catch(() => {});
  }, []);

  const siteName = stats?.site_name || 'منصة البودكاست';

  return (
    <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* الشعار والوصف | Logo & description */}
        <div className="flex flex-col md:flex-row md:items-start gap-8 mb-8">
          <div className="md:w-1/3">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-800 dark:text-gray-100">{siteName}</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              منصتك المفضلة للاستماع إلى أفضل البودكاست العربي. اكتشف، تابع، واستمتع بمحتوى صوتي مميز.
            </p>

            {/* روابط التواصل | Social Links */}
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="تويتر">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="يوتيوب">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="تيليغرام">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="انستغرام">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
              </a>
            </div>
          </div>

          {/* الروابط | Links Grid */}
          <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-6">
            {/* عن المنصة | About */}
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3 text-sm">المنصة</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-gray-500 hover:text-primary-500 transition-colors">عن المنصة</Link></li>
                <li><Link to="/" className="text-gray-500 hover:text-primary-500 transition-colors">تصفح البودكاست</Link></li>
                <li><Link to="/search" className="text-gray-500 hover:text-primary-500 transition-colors">البحث</Link></li>
              </ul>
            </div>

            {/* روابط سريعة | Quick links */}
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3 text-sm">روابط سريعة</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/playlists" className="text-gray-500 hover:text-primary-500 transition-colors">قوائم التشغيل</Link></li>
                <li><Link to="/listen-later" className="text-gray-500 hover:text-primary-500 transition-colors">استمع لاحقاً</Link></li>
                <li><Link to="/history" className="text-gray-500 hover:text-primary-500 transition-colors">سجل الاستماع</Link></li>
                <li><Link to="/follows" className="text-gray-500 hover:text-primary-500 transition-colors">متابعاتي</Link></li>
              </ul>
            </div>

            {/* صانع المحتوى | Creator */}
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3 text-sm">لصانعي المحتوى</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/creator" className="text-gray-500 hover:text-primary-500 transition-colors">لوحة التحكم</Link></li>
                <li><Link to="/admin" className="text-gray-500 hover:text-primary-500 transition-colors">إدارة الموقع</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* حقوق | Copyright */}
        <div className="border-t dark:border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            {siteName} &copy; {new Date().getFullYear()} — جميع الحقوق محفوظة
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>صُنعت بـ</span>
            <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
            <span>للبودكاست العربي</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
