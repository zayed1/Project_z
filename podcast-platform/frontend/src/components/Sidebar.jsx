// ============================================
// شريط جانبي قابل للطي | Collapsible Sidebar Navigation
// ============================================
import React, { useState, useEffect, useCallback } from 'react';

// مفتاح التخزين المحلي | localStorage key
const SIDEBAR_STATE_KEY = 'sidebar_collapsed';

/**
 * Sidebar - شريط جانبي قابل للطي مع روابط تنقل
 * Collapsible sidebar navigation with nav links and icons
 *
 * يحفظ الحالة في localStorage | Saves state to localStorage
 * يظهر كـ overlay على الموبايل | Shows as overlay on mobile
 */
const Sidebar = ({ onNavigate, currentPath = '/' }) => {
  // حالة الطي | Collapsed state (from localStorage)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
    return saved ? JSON.parse(saved) : false;
  });

  // حالة الموبايل | Mobile state
  const [isMobile, setIsMobile] = useState(false);
  // إظهار القائمة على الموبايل | Show menu on mobile
  const [mobileOpen, setMobileOpen] = useState(false);

  // كشف حجم الشاشة | Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // حفظ حالة الطي | Save collapsed state
  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // تبديل القائمة على الموبايل | Toggle mobile menu
  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  // معالج التنقل | Navigation handler
  const handleNav = useCallback(
    (path) => {
      if (onNavigate) onNavigate(path);
      if (isMobile) setMobileOpen(false);
    },
    [onNavigate, isMobile]
  );

  // عناصر التنقل | Navigation items
  const navItems = [
    { path: '/', label: 'الرئيسية', labelEn: 'Home', icon: '🏠' },
    { path: '/playlists', label: 'قوائم التشغيل', labelEn: 'Playlists', icon: '📋' },
    { path: '/history', label: 'السجل', labelEn: 'History', icon: '🕐' },
    { path: '/follows', label: 'المتابعات', labelEn: 'Follows', icon: '⭐' },
    { path: '/discover', label: 'اكتشف', labelEn: 'Discover', icon: '🔍' },
    { path: '/downloads', label: 'التنزيلات', labelEn: 'Downloads', icon: '📥' },
    { path: '/stats', label: 'الإحصائيات', labelEn: 'Stats', icon: '📊' },
    { path: '/settings', label: 'الإعدادات', labelEn: 'Settings', icon: '⚙️' },
  ];

  // محتوى الشريط الجانبي | Sidebar content
  const sidebarContent = (
    <div
      className={`h-full flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700
        transition-all duration-300 ${isCollapsed && !isMobile ? 'w-16' : 'w-64'}`}
      dir="rtl"
    >
      {/* رأس الشريط الجانبي | Sidebar header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {(!isCollapsed || isMobile) && (
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            القائمة
          </h2>
        )}
        {/* زر الطي/التوسيع | Collapse/Expand button */}
        <button
          onClick={isMobile ? toggleMobile : toggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400
            transition-colors"
          aria-label={isCollapsed ? 'توسيع القائمة | Expand sidebar' : 'طي القائمة | Collapse sidebar'}
        >
          {isMobile ? (
            // أيقونة إغلاق | Close icon
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // أيقونة طي/توسيع | Collapse/Expand icon
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isCollapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7M19 19l-7-7 7-7'}
              />
            </svg>
          )}
        </button>
      </div>

      {/* قائمة التنقل | Navigation list */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <li key={item.path}>
                <button
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                    ${isActive
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                    ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
                  title={isCollapsed ? `${item.label} | ${item.labelEn}` : ''}
                >
                  {/* أيقونة | Icon */}
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  {/* التسمية (مخفية عند الطي) | Label (hidden when collapsed) */}
                  {(!isCollapsed || isMobile) && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* تذييل الشريط | Sidebar footer */}
      {(!isCollapsed || isMobile) && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            منصة البودكاست العربي
          </p>
        </div>
      )}
    </div>
  );

  // على الموبايل: زر القائمة + overlay | On mobile: menu button + overlay
  if (isMobile) {
    return (
      <>
        {/* زر فتح القائمة | Menu open button */}
        <button
          onClick={toggleMobile}
          className="fixed top-4 right-4 z-40 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg
            border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
          aria-label="فتح القائمة | Open menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* طبقة التظليل | Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 transition-opacity"
            onClick={toggleMobile}
          />
        )}

        {/* الشريط الجانبي المنزلق | Sliding sidebar */}
        <div
          className={`fixed top-0 right-0 h-full z-50 transition-transform duration-300
            ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {sidebarContent}
        </div>
      </>
    );
  }

  // على سطح المكتب: شريط جانبي ثابت | On desktop: fixed sidebar
  return <aside className="sticky top-0 h-screen flex-shrink-0">{sidebarContent}</aside>;
};

export default Sidebar;
