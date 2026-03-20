// ============================================
// التطبيق الرئيسي | Main App Component
// ============================================
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import PodcastDetail from './pages/PodcastDetail';
import Admin from './pages/Admin';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* شريط التنقل | Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary-600">
            منصة البودكاست
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors">
              الرئيسية
            </Link>
          </div>
        </div>
      </nav>

      {/* المحتوى الرئيسي | Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/podcast/:id" element={<PodcastDetail />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {/* الفوتر | Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16 py-6 text-center text-sm text-gray-500">
        <p>منصة البودكاست &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
