// ============================================
// لوحة صحة النظام | System Health Dashboard
// ============================================
import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function SystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = () => {
    setLoading(true);
    api.get('/admin/system-health')
      .then(({ data }) => setHealth(data))
      .catch(() => setHealth(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHealth(); }, []);

  if (loading) return <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto" /></div>;
  if (!health) return <p className="text-gray-400 text-center py-8">فشل في جلب حالة النظام</p>;

  const statusColor = health.status === 'healthy' ? 'text-emerald-500' : health.status === 'degraded' ? 'text-amber-500' : 'text-red-500';
  const statusBg = health.status === 'healthy' ? 'bg-emerald-50 dark:bg-emerald-900/20' : health.status === 'degraded' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">صحة النظام</h3>
        <button onClick={fetchHealth} className="text-primary-500 hover:text-primary-600 text-sm flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          تحديث
        </button>
      </div>

      {/* الحالة العامة | Overall status */}
      <div className={`${statusBg} rounded-xl p-4 flex items-center gap-3`}>
        <div className={`w-3 h-3 rounded-full ${health.status === 'healthy' ? 'bg-emerald-500' : health.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`} />
        <div>
          <p className={`font-bold ${statusColor}`}>{health.status === 'healthy' ? 'النظام يعمل بشكل طبيعي' : 'النظام متدهور'}</p>
          <p className="text-xs text-gray-400">وقت الاستجابة: {health.responseTime}ms</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* معلومات السيرفر | Server info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">السيرفر</h4>
          <div className="space-y-2 text-sm">
            {[
              { label: 'وقت التشغيل', value: health.server?.uptimeFormatted },
              { label: 'Node.js', value: health.server?.nodeVersion },
              { label: 'المعالجات', value: health.server?.cpus },
              { label: 'RAM المستخدمة', value: `${health.server?.memory?.heapUsed}MB / ${health.server?.memory?.heapTotal}MB` },
              { label: 'RAM الحرة', value: `${health.server?.freeMem}MB / ${health.server?.totalMem}MB` },
              { label: 'الحمل', value: health.server?.loadAvg?.join(' / ') },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-800 dark:text-gray-200 font-mono text-xs" dir="ltr">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* قاعدة البيانات | Database */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">قاعدة البيانات</h4>
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${health.database?.status === 'healthy' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-700 dark:text-gray-300">{health.database?.status === 'healthy' ? 'متصل' : 'غير متصل'}</span>
              <span className="text-xs text-gray-400 mr-auto">{health.database?.latency}ms</span>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {Object.entries(health.database?.counts || {}).map(([table, count]) => (
              <div key={table} className="flex justify-between">
                <span className="text-gray-500">{table}</span>
                <span className="text-gray-800 dark:text-gray-200 font-mono">{count >= 0 ? count.toLocaleString('ar') : '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
