// ============================================
// فوتر الموقع | Footer Component
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

  return (
    <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* عن المنصة | About */}
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3 text-sm">المنصة</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-500 hover:text-primary-500 transition-colors">عن المنصة</Link></li>
              <li><Link to="/" className="text-gray-500 hover:text-primary-500 transition-colors">تصفح البودكاست</Link></li>
            </ul>
          </div>

          {/* روابط سريعة | Quick links */}
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3 text-sm">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/playlists" className="text-gray-500 hover:text-primary-500 transition-colors">قوائم التشغيل</Link></li>
              <li><Link to="/listen-later" className="text-gray-500 hover:text-primary-500 transition-colors">استمع لاحقاً</Link></li>
              <li><Link to="/history" className="text-gray-500 hover:text-primary-500 transition-colors">سجل الاستماع</Link></li>
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

          {/* التقنية | Tech */}
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3 text-sm">التقنية</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>React + Vite</li>
              <li>Tailwind CSS</li>
              <li>Supabase</li>
              <li>Node.js + Express</li>
            </ul>
          </div>
        </div>

        {/* حقوق | Copyright */}
        <div className="border-t dark:border-gray-700 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            {stats?.site_name || 'منصة البودكاست'} &copy; {new Date().getFullYear()}
          </p>
          <p className="text-xs text-gray-400">صُنعت بشغف للبودكاست العربي</p>
        </div>
      </div>
    </footer>
  );
}
