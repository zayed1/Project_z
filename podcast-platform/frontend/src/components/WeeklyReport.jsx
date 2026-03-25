// ============================================
// التقرير الأسبوعي | Weekly Report Component
// ============================================
import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function WeeklyReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/weekly-report')
      .then(({ data }) => setReport(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto" /></div>;
  if (!report) return <p className="text-gray-400 text-center py-8">فشل في جلب التقرير</p>;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">التقرير الأسبوعي</h3>
        <p className="text-xs text-gray-400 mb-4">
          {new Date(report.period.from).toLocaleDateString('ar')} - {new Date(report.period.to).toLocaleDateString('ar')}
        </p>

        {/* بطاقات الأرقام | Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'حلقات جديدة', value: report.newEpisodes, color: 'text-primary-500' },
            { label: 'بودكاست جديد', value: report.newPodcasts, color: 'text-emerald-500' },
            { label: 'مستخدمين جدد', value: report.newUsers, color: 'text-amber-500' },
            { label: 'تعليقات جديدة', value: report.newComments, color: 'text-rose-500' },
            { label: 'إجمالي التشغيل', value: report.totalPlays, color: 'text-violet-500' },
          ].map((card) => (
            <div key={card.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p className={`text-xl font-bold ${card.color}`}>{(card.value || 0).toLocaleString('ar')}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* أعلى الحلقات | Top episodes */}
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">أعلى 5 حلقات</h4>
        {report.topEpisodes?.length > 0 ? (
          <div className="space-y-1">
            {report.topEpisodes.map((ep, i) => (
              <div key={ep.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <span className={`text-sm font-bold min-w-[20px] ${i === 0 ? 'text-amber-500' : 'text-gray-400'}`}>#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-gray-100 truncate">{ep.title}</p>
                  <p className="text-[10px] text-gray-400">{ep.podcast?.title}</p>
                </div>
                <span className="text-sm font-medium text-primary-500">{(ep.play_count || 0).toLocaleString('ar')}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-2">لا توجد حلقات</p>
        )}

        {/* حلقات هذا الأسبوع | This week's episodes */}
        {report.recentEpisodes?.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">حلقات هذا الأسبوع</h4>
            <div className="space-y-1">
              {report.recentEpisodes.map((ep) => (
                <div key={ep.id} className="flex items-center gap-2 text-sm p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <span className="text-gray-800 dark:text-gray-100 truncate flex-1">{ep.title}</span>
                  <span className="text-xs text-gray-400">{(ep.play_count || 0).toLocaleString('ar')} تشغيل</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
