// ============================================
// مسار التنقل | Breadcrumbs Component
// ============================================
import { Link, useLocation } from 'react-router-dom';

const ROUTE_NAMES = {
  '': 'الرئيسية',
  'podcast': 'البودكاست',
  'admin': 'لوحة التحكم',
  'listen-later': 'استمع لاحقاً',
  'follows': 'المتابعات',
  'history': 'السجل',
  'playlists': 'قوائم التشغيل',
  'creator': 'صانع المحتوى',
  'profile': 'الملف الشخصي',
  'about': 'عن المنصة',
};

export default function Breadcrumbs({ items }) {
  const location = useLocation();

  // إنشاء تلقائي من الـ URL إذا لم تُمرر items | Auto-generate from URL
  const crumbs = items || location.pathname.split('/').filter(Boolean).map((segment, i, arr) => ({
    label: ROUTE_NAMES[segment] || decodeURIComponent(segment),
    path: '/' + arr.slice(0, i + 1).join('/'),
    isLast: i === arr.length - 1,
  }));

  if (crumbs.length <= 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm mb-4 overflow-x-auto" aria-label="مسار التنقل">
      <Link to="/" className="text-gray-400 hover:text-primary-500 transition-colors flex-shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </Link>

      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1 flex-shrink-0">
          <svg className="w-3 h-3 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          {crumb.isLast ? (
            <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[150px]">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="text-gray-400 hover:text-primary-500 transition-colors truncate max-w-[120px]">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
