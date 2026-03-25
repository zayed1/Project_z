// ============================================
// عارض سجل التعديلات | Audit Log Viewer
// ============================================
import { useState, useEffect } from 'react';
import api from '../utils/api';

const ACTION_LABELS = {
  'create': 'إنشاء',
  'update': 'تعديل',
  'delete': 'حذف',
  'login': 'تسجيل دخول',
  'ban': 'حظر',
  'publish': 'نشر',
};

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filterAction, setFilterAction] = useState('');

  const load = (p = 0, action = '') => {
    setLoading(true);
    const params = { page: p, limit: 30 };
    if (action) params.action = action;

    api.get('/admin/audit-logs', { params })
      .then(({ data }) => { setLogs(data.logs || []); setPage(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleFilter = (action) => {
    setFilterAction(action);
    load(0, action);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">سجل التعديلات</h3>

      {/* فلاتر | Filters */}
      <div className="flex flex-wrap gap-1 mb-4">
        <button onClick={() => handleFilter('')}
          className={`px-2 py-1 rounded text-xs ${!filterAction ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
          الكل
        </button>
        {Object.entries(ACTION_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => handleFilter(key)}
            className={`px-2 py-1 rounded text-xs ${filterAction === key ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto" /></div>
      ) : logs.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">لا توجد سجلات</p>
      ) : (
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-sm">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                log.action === 'delete' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                log.action === 'create' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
              }`}>{ACTION_LABELS[log.action] || log.action}</span>
              <span className="text-gray-500 text-xs">{log.user?.username || '—'}</span>
              <span className="text-gray-700 dark:text-gray-300 flex-1 truncate">
                {log.target_type} {log.target_id ? `#${log.target_id.slice(0, 8)}` : ''}
              </span>
              <span className="text-[10px] text-gray-400 flex-shrink-0">
                {new Date(log.created_at).toLocaleString('ar', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button onClick={() => load(Math.max(0, page - 1), filterAction)} disabled={page === 0}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30">السابق</button>
        <span className="text-sm text-gray-400">صفحة {page + 1}</span>
        <button onClick={() => load(page + 1, filterAction)} disabled={logs.length < 30}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30">التالي</button>
      </div>
    </div>
  );
}
