// ============================================
// الإحصائيات الجغرافية | Geo Analytics Component
// ============================================
import { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';

export default function GeoAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getGeoStats()
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto" /></div>;
  }

  if (!data || !data.countries || data.countries.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 text-center py-8">لا توجد بيانات جغرافية بعد</p>;
  }

  const maxCount = data.countries[0]?.count || 1;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">توزيع المستمعين الجغرافي</h2>
        <span className="text-sm text-gray-400">{data.total} استماع</span>
      </div>

      <div className="space-y-3">
        {data.countries.map((c, i) => {
          const pct = (c.count / maxCount) * 100;
          return (
            <div key={c.country}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{c.country}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{c.count} ({Math.round((c.count / data.total) * 100)}%)</span>
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
