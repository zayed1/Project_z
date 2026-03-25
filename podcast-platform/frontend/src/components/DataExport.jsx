// ============================================
// تصدير البيانات | Data Export Component
// ============================================
import { useState } from 'react';
import { useToast } from '../context/ToastContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function DataExport() {
  const toast = useToast();
  const [downloading, setDownloading] = useState(null);

  const download = async (type) => {
    setDownloading(type);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/export/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('تم التحميل');
    } catch {
      toast.error('فشل في التصدير');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">تصدير البيانات</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">تصدير البيانات كملفات CSV</p>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => download('users')}
          disabled={downloading === 'users'}
          className="flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg py-3 px-4 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
          {downloading === 'users' ? 'جاري...' : 'تصدير المستخدمين'}
        </button>

        <button
          onClick={() => download('stats')}
          disabled={downloading === 'stats'}
          className="flex items-center justify-center gap-2 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-lg py-3 px-4 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {downloading === 'stats' ? 'جاري...' : 'تصدير الإحصائيات'}
        </button>
      </div>
    </div>
  );
}
