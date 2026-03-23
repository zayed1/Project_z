// ============================================
// مسار التنقل المحسّن | Enhanced Breadcrumbs Component
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

const ROUTE_ICONS = {
  'admin': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
  'listen-later': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />,
  'history': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  'playlists': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />,
  'follows': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
  'creator': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />,
};

export default function Breadcrumbs({ items }) {
  const location = useLocation();

  const crumbs = items || location.pathname.split('/').filter(Boolean).map((segment, i, arr) => ({
    label: ROUTE_NAMES[segment] || decodeURIComponent(segment),
    path: '/' + arr.slice(0, i + 1).join('/'),
    isLast: i === arr.length - 1,
    segment,
  }));

  if (crumbs.length <= 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm mb-4 overflow-x-auto py-1" aria-label="مسار التنقل">
      <Link to="/" className="text-gray-400 hover:text-primary-500 transition-colors flex-shrink-0 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </Link>

      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5 flex-shrink-0">
          <svg className="w-3 h-3 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          {crumb.isLast ? (
            <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md truncate max-w-[180px]">
              {ROUTE_ICONS[crumb.segment] && (
                <svg className="w-3.5 h-3.5 flex-shrink-0 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {ROUTE_ICONS[crumb.segment]}
                </svg>
              )}
              {crumb.label}
            </span>
          ) : (
            <Link to={crumb.path} className="text-gray-400 hover:text-primary-500 transition-colors truncate max-w-[120px] px-1.5 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
