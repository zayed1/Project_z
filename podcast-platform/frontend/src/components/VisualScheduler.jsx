// ============================================
// الجدولة البصرية | Visual Scheduler Component
// ============================================
import { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';

export default function VisualScheduler() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminAPI.getScheduledEpisodes({ year, month })
      .then(({ data }) => setEpisodes(data.episodes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year, month]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const monthName = new Date(year, month - 1).toLocaleDateString('ar', { month: 'long', year: 'numeric' });

  const getEpisodesForDay = (day) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return episodes.filter((ep) => ep.scheduled_at?.startsWith(dateStr));
  };

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const dayNames = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">تقويم الجدولة</h2>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" /></svg>
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px] text-center">{monthName}</span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" /></svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto" /></div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {/* أسماء الأيام | Day names */}
          {dayNames.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
          ))}

          {/* فراغات قبل أول يوم | Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="p-1 min-h-[70px]" />
          ))}

          {/* أيام الشهر | Month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEps = getEpisodesForDay(day);
            const isToday = day === new Date().getDate() && month === new Date().getMonth() + 1 && year === new Date().getFullYear();

            return (
              <div
                key={day}
                className={`p-1 min-h-[70px] rounded-lg border transition-colors ${
                  isToday ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10' : 'border-gray-100 dark:border-gray-700'
                }`}
              >
                <span className={`text-xs font-medium ${isToday ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'}`}>{day}</span>
                {dayEps.map((ep) => (
                  <div key={ep.id} className="mt-0.5 px-1 py-0.5 bg-primary-100 dark:bg-primary-900/30 rounded text-[10px] text-primary-700 dark:text-primary-300 truncate" title={`${ep.podcast_title}: ${ep.title}`}>
                    {ep.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
