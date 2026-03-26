// ============================================
// لوحة تحكم صانع المحتوى المحسّنة | Enhanced Creator Dashboard
// مع إحصائيات بصرية + اختصارات + نظرة عامة
// ============================================
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function StatCard({ icon, label, value, color, trend }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
            trend >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold ${color} mt-1`}>{(value || 0).toLocaleString('ar')}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function MiniBarChart({ data, label }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      <div className="flex items-end gap-1 h-20">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-primary-400 dark:bg-primary-500 rounded-t transition-all hover:bg-primary-500 dark:hover:bg-primary-400"
              style={{ height: `${(d.value / max) * 100}%`, minHeight: '2px' }}
              title={`${d.label}: ${d.value}`}
            />
            <span className="text-[10px] text-gray-400 leading-none">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickAction({ icon, label, to }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-gray-600 dark:text-gray-300">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}

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
        if (data.podcasts?.length > 0) {
          api.get(`/podcasts/${data.podcasts[0].id}/best-times`)
            .then(({ data: bt }) => setBestTimes(bt))
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <p className="text-gray-500 dark:text-gray-400 mb-3">سجل دخولك للوصول للوحة التحكم</p>
      <Link to="/" className="text-primary-500 hover:underline text-sm">العودة للرئيسية</Link>
    </div>
  );

  if (loading) return (
    <div className="max-w-5xl mx-auto">
      <Helmet><title>لوحة صانع المحتوى - منصة البودكاست</title></Helmet>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
            <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 animate-pulse h-48" />
        ))}
      </div>
    </div>
  );

  if (!stats) return (
    <div className="text-center py-16">
      <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-gray-500 dark:text-gray-400">فشل في جلب البيانات</p>
    </div>
  );

  // بيانات الرسم البياني التجريبي | Sample chart data
  const weekDays = ['سبت', 'أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع'];
  const chartData = weekDays.map((d) => ({
    label: d,
    value: Math.floor(Math.random() * (stats.totalPlays || 100) / 7),
  }));

  return (
    <div className="max-w-5xl mx-auto">
      <Helmet><title>لوحة صانع المحتوى - منصة البودكاست</title></Helmet>

      {/* الترحيب | Welcome */}
      <div className="bg-gradient-to-l from-primary-500 via-primary-600 to-primary-800 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10">
          <h1 className="text-xl font-bold mb-1">مرحباً {user.username || 'صانع المحتوى'}</h1>
          <p className="text-white/70 text-sm">إليك نظرة عامة على أداء محتواك</p>
        </div>
      </div>

      {/* بطاقات الإحصائيات | Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon="🎙️" label="بودكاست" value={stats.podcasts?.length || 0} color="text-primary-500" />
        <StatCard icon="🎧" label="حلقات" value={stats.totalEpisodes} color="text-emerald-500" />
        <StatCard icon="▶️" label="إجمالي التشغيل" value={stats.totalPlays} color="text-amber-500" />
        <StatCard icon="👥" label="متابعين" value={stats.totalFollowers} color="text-rose-500" />
      </div>

      {/* اختصارات سريعة | Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">إجراءات سريعة</h2>
        <div className="grid grid-cols-4 gap-2">
          <QuickAction label="رفع حلقة" to="/creator" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />} />
          <QuickAction label="الإحصائيات" to="/creator" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />} />
          <QuickAction label="التعليقات" to="/creator" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />} />
          <QuickAction label="الإعدادات" to="/settings" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* أفضل الحلقات | Top episodes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            أفضل الحلقات أداءً
          </h2>
          {stats.topEpisodes?.length > 0 ? (
            <div className="space-y-1.5">
              {stats.topEpisodes.map((ep, i) => (
                <div key={ep.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                    i === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-500' :
                    'bg-amber-50 dark:bg-amber-900/20 text-amber-700'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{ep.title}</p>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold text-primary-500">{(ep.play_count || 0).toLocaleString('ar')}</span>
                    <span className="text-xs text-gray-400 mr-1">تشغيل</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm">لا توجد حلقات بعد</p>
              <p className="text-xs text-gray-300 mt-1">ابدأ برفع أول حلقة</p>
            </div>
          )}
        </div>

        {/* رسم بياني + أوقات النشر | Chart + Publish times */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
            <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-3 text-sm">الاستماع خلال الأسبوع</h2>
            <MiniBarChart data={chartData} />
          </div>

          {bestTimes?.suggestion && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
              <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-3 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                أفضل وقت للنشر
              </h2>
              <div className="bg-gradient-to-l from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/10 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {bestTimes.suggestion.day} - {bestTimes.suggestion.hour}:00
                </p>
                <p className="text-xs text-gray-500 mt-1">متوسط {bestTimes.suggestion.avgPlays} استماع</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* آخر التعليقات | Recent comments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          آخر التعليقات
        </h2>
        {stats.recentComments?.length > 0 ? (
          <div className="space-y-2">
            {stats.recentComments.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-500 flex-shrink-0">
                  {c.user?.username?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">{c.user?.username}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">لا توجد تعليقات حديثة</p>
          </div>
        )}
      </div>
    </div>
  );
}
