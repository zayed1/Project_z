// ============================================
// حاجز الأخطاء | Error Boundary Component
// ============================================
import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">حدث خطأ غير متوقع</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              نعتذر عن هذا الخطأ. يمكنك تحديث الصفحة أو العودة للرئيسية.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
                className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-lg text-sm transition-colors"
              >
                تحديث الصفحة
              </button>
              <Link to="/" onClick={() => this.setState({ hasError: false })}
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                الرئيسية
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
