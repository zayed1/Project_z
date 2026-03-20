// ============================================
// صفحة 404 | Not Found Page
// ============================================
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Helmet><title>404 - الصفحة غير موجودة</title></Helmet>
      <div className="text-center">
        <div className="text-8xl font-bold text-primary-500 mb-4 opacity-80">404</div>
        <div className="mb-6">
          <svg className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM8 12a4 4 0 0 0 8 0h2a6 6 0 0 1-5 5.91V21h-2v-3.09A6 6 0 0 1 6 12h2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">الصفحة غير موجودة</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها</p>
        <Link
          to="/"
          className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
