// ============================================
// رسوم بيانية لوحة التحكم | Dashboard Charts Component
// ============================================
import { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function DashboardCharts() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/detailed-stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto" /></div>;
  }

  if (!stats) return null;

  // بيانات وهمية للاستماع اليومي بناءً على الإحصائيات | Demo daily data
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('ar', { weekday: 'short' });
  });

  const dailyPlays = Array.from({ length: 7 }).map(() =>
    Math.floor(Math.random() * (stats.totalPlays || 100) / 7)
  );

  const lineData = {
    labels: last7,
    datasets: [{
      label: 'الاستماع اليومي',
      data: dailyPlays,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } },
    },
  };

  // توزيع التصنيفات | Category distribution
  const topCategories = (stats.topCategories || []).slice(0, 5);
  const doughnutData = {
    labels: topCategories.map((c) => c.name || 'بدون تصنيف'),
    datasets: [{
      data: topCategories.map((c) => c.count || 1),
      backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      borderWidth: 0,
    }],
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4">الاستماع اليومي (آخر 7 أيام)</h3>
        <Line data={lineData} options={lineOptions} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4">توزيع التصنيفات</h3>
        <div className="max-w-[250px] mx-auto">
          <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }} />
        </div>
      </div>

      {/* بطاقات الأرقام | Number cards */}
      <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي التشغيل', value: stats.totalPlays || 0, color: 'text-primary-500' },
          { label: 'البودكاست', value: stats.totalPodcasts || 0, color: 'text-emerald-500' },
          { label: 'الحلقات', value: stats.totalEpisodes || 0, color: 'text-amber-500' },
          { label: 'المستخدمين', value: stats.totalUsers || 0, color: 'text-rose-500' },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center">
            <p className={`text-2xl font-bold ${card.color}`}>{card.value.toLocaleString('ar')}</p>
            <p className="text-xs text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
