// ============================================
// التطبيق الرئيسي | Main App Component
// ============================================
import { Routes, Route, Link } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import { usePlayer } from './context/PlayerContext';
import GlobalPlayer from './components/GlobalPlayer';
import Home from './pages/Home';
import PodcastDetail from './pages/PodcastDetail';
import About from './pages/About';
import ListenLaterPage from './pages/ListenLaterPage';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

export default function App() {
  const { dark, toggleTheme } = useTheme();
  const { currentEpisode } = usePlayer();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* شريط التنقل | Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors">
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
            <Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              عن المنصة
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={dark ? 'الوضع الفاتح' : 'الوضع الليلي'}
            >
              {dark ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className={`max-w-6xl mx-auto px-4 py-8 ${currentEpisode ? 'pb-28' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/podcast/:id" element={<PodcastDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/listen-later" element={<ListenLaterPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16 py-6 text-center text-sm text-gray-500 dark:text-gray-400 transition-colors ${currentEpisode ? 'mb-20' : ''}`}>
        <p>منصة البودكاست &copy; {new Date().getFullYear()}</p>
      </footer>

      <GlobalPlayer />
    </div>
  );
}
