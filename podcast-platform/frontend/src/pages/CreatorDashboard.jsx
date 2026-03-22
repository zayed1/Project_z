// ============================================
// لوحة تحكم صانع المحتوى | Creator Dashboard Page
// ============================================
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bestTimes, setBestTimes] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.get('/me/creator-stats')
      .then(({ data }) => {
        setStats(data);
        // جلب أفضل أوقات النشر لأول بودكاست | Get best times for first podcast
        if (data.podcasts?.length > 0) {
          api.get(`/podcasts/${data.podcasts[0].id}/best-times`)
            .then(({ data: bt }) => setBestTimes(bt))
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div className="text-center py-16 text-gray-500">سجل دخولك</div>;

  if (loading) return (
    <div className="text-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto" /></div>
  );

  if (!stats) return <div className="text-center py-16 text-gray-500">فشل في جلب البيانات</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <Helmet><title>لوحة صانع المحتوى - منصة البودكاست</title></Helmet>

      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">لوحة صانع المحتوى</h1>

      {/* بطاقات الأرقام | Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'بودكاست', value: stats.podcasts?.length || 0, color: 'text-primary-500', icon: '🎙️' },
          { label: 'حلقات', value: stats.totalEpisodes, color: 'text-emerald-500', icon: '🎧' },
          { label: 'إجمالي التشغيل', value: stats.totalPlays, color: 'text-amber-500', icon: '▶️' },
          { label: 'متابعين', value: stats.totalFollowers, color: 'text-rose-500', icon: '👥' },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <span className="text-2xl">{card.icon}</span>
            <p className={`text-2xl font-bold ${card.color} mt-1`}>{card.value.toLocaleString('ar')}</p>
            <p className="text-xs text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* أفضل الحلقات | Top episodes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-4">أفضل الحلقات أداءً</h2>
          {stats.topEpisodes?.length > 0 ? (
            <div className="space-y-2">
              {stats.topEpisodes.map((ep, i) => (
                <div key={ep.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <span className={`text-lg font-bold ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : 'text-amber-800'}`}>#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{ep.title}</p>
                  </div>
                  <span className="text-sm font-bold text-primary-500">{(ep.play_count || 0).toLocaleString('ar')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">لا توجد حلقات بعد</p>
          )}
        </div>

        {/* أفضل أوقات النشر | Best publish times */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-4">أفضل أوقات النشر</h2>
          {bestTimes?.suggestion ? (
            <div>
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-4 text-center">
                <p className="text-sm text-gray-500 mb-1">الوقت المثالي للنشر</p>
                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {bestTimes.suggestion.day} - الساعة {bestTimes.suggestion.hour}:00
                </p>
                <p className="text-xs text-gray-400 mt-1">متوسط {bestTimes.suggestion.avgPlays} استماع</p>
              </div>

              {bestTimes.bestDays?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">أفضل الأيام</p>
                  <div className="space-y-1">
                    {bestTimes.bestDays.map((d) => (
                      <div key={d.day} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{d.day}</span>
                        <span className="text-gray-400">{d.avg} متوسط</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">انشر المزيد من الحلقات لتحليل الأوقات</p>
          )}
        </div>

        {/* تعليقات حديثة | Recent comments */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-4">آخر التعليقات</h2>
          {stats.recentComments?.length > 0 ? (
            <div className="space-y-2">
              {stats.recentComments.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-500">
                    {c.user?.username?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500">{c.user?.username}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">لا توجد تعليقات حديثة</p>
          )}
        </div>
      </div>
    </div>
  );
}
