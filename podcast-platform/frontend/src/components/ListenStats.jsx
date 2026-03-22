// ============================================
// إحصائيات الاستماع الشخصية | Personal Listen Stats
// ============================================
import { useState, useEffect } from 'react';

export default function ListenStats() {
  const [stats, setStats] = useState({ totalMinutes: 0, episodeCount: 0, streak: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('listen_history');
      const history = raw ? JSON.parse(raw) : [];

      // حساب الإحصائيات | Calculate stats
      const totalMinutes = Math.floor(history.reduce((sum, h) => sum + (h.position || 0), 0) / 60);
      const episodeCount = history.length;

      // حساب سلسلة الأيام | Calculate streak
      const days = new Set(history.map((h) => new Date(h.timestamp).toDateString()));
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if (days.has(d.toDateString())) streak++;
        else break;
      }

      setStats({ totalMinutes, episodeCount, streak });
    } catch {}
  }, []);

  if (stats.episodeCount === 0) return null;

  const hours = Math.floor(stats.totalMinutes / 60);
  const mins = stats.totalMinutes % 60;

  return (
    <div className="bg-gradient-to-l from-primary-50 to-transparent dark:from-primary-900/10 rounded-xl p-4 mb-6">
      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">إحصائياتك</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xl font-bold text-primary-500">
            {hours > 0 ? `${hours}س ${mins}د` : `${mins}د`}
          </p>
          <p className="text-[10px] text-gray-400">وقت الاستماع</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-emerald-500">{stats.episodeCount}</p>
          <p className="text-[10px] text-gray-400">حلقة</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-amber-500">{stats.streak}</p>
          <p className="text-[10px] text-gray-400">يوم متتالي</p>
        </div>
      </div>
    </div>
  );
}
