// ============================================
// التطبيق الرئيسي | Main App Component
// مع ثيمات متعددة + مشغل مصغر + Code Splitting
// ============================================
import { useState, lazy, Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import { usePlayer } from './context/PlayerContext';
import GlobalPlayer from './components/GlobalPlayer';
import MiniPlayer from './components/MiniPlayer';
import NotificationBell from './components/NotificationBell';
import ErrorBoundary from './components/ErrorBoundary';
import ProgressBar from './components/ProgressBar';
import Footer from './components/Footer';
import Breadcrumbs from './components/Breadcrumbs';

// Code Splitting - تحميل كسول | Lazy Loading Pages
const Home = lazy(() => import('./pages/Home'));
const PodcastDetail = lazy(() => import('./pages/PodcastDetail'));
const About = lazy(() => import('./pages/About'));
const ListenLaterPage = lazy(() => import('./pages/ListenLaterPage'));
const Admin = lazy(() => import('./pages/Admin'));
const FollowsPage = lazy(() => import('./pages/FollowsPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PlaylistsPage = lazy(() => import('./pages/PlaylistsPage'));
const CreatorDashboard = lazy(() => import('./pages/CreatorDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import SeasonalTheme from './components/SeasonalTheme';
import PageTransition from './components/PageTransition';

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]" role="status" aria-label="جاري التحميل">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
    </div>
  );
}

export default function App() {
  const { dark, toggleTheme, colorTheme, changeColorTheme, themes } = useTheme();
  const { currentEpisode } = usePlayer();
  useKeyboardShortcuts();
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <ProgressBar />
      {/* شريط التنقل | Navigation Bar */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 bg-primary-500 text-white px-4 py-2 rounded-lg z-[60]">تخطي إلى المحتوى</a>
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors" role="navigation" aria-label="التنقل الرئيسي">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary-600 dark:text-primary-400">
            منصة البودكاست
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              الرئيسية
            </Link>
            <Link to="/listen-later" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              قائمتي
            </Link>
            <Link to="/playlists" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              قوائم
            </Link>
            <Link to="/creator" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              </svg>
              صانع المحتوى
            </Link>
            <Link to="/follows" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              متابعاتي
            </Link>
            <Link to="/history" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              السجل
            </Link>
            <Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              عن المنصة
            </Link>

            <NotificationBell />

            {/* اختيار الثيم | Theme Selector */}
            <div className="relative">
              <SeasonalTheme />
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="تغيير الثيم"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67A2.5 2.5 0 0 1 12 22zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5a.54.54 0 0 0-.14-.35c-.41-.46-.63-1.05-.63-1.65a2.5 2.5 0 0 1 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z"/>
                  <circle cx="6.5" cy="11.5" r="1.5"/>
                  <circle cx="9.5" cy="7.5" r="1.5"/>
                  <circle cx="14.5" cy="7.5" r="1.5"/>
                  <circle cx="17.5" cy="11.5" r="1.5"/>
                </svg>
              </button>
              {showThemeMenu && (
                <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 p-3 z-50 min-w-[180px]">
                  <p className="text-xs text-gray-400 mb-2">اختر اللون</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {Object.entries(themes).map(([key, theme]) => (
                      <button
                        key={key}
                        onClick={() => { changeColorTheme(key); }}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          colorTheme === key ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: theme.primary }}
                        title={theme.name}
                      />
                    ))}
                  </div>
                  <hr className="border-gray-200 dark:border-gray-700 mb-2" />
                  <button
                    onClick={() => { toggleTheme(); setShowThemeMenu(false); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {dark ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z"/></svg>
                        الوضع الفاتح
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>
                        الوضع الليلي
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className={`max-w-6xl mx-auto px-4 py-8 ${currentEpisode ? 'pb-28' : ''}`} role="main">
        <Breadcrumbs />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/podcast/:id" element={<PodcastDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/listen-later" element={<ListenLaterPage />} />
            <Route path="/follows" element={<FollowsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
            <Route path="/creator" element={<CreatorDashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />

      <MiniPlayer />
      <GlobalPlayer />
    </div>
    </ErrorBoundary>
  );
}
