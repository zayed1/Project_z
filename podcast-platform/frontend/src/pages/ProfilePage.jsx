// ============================================
// صفحة الملف الشخصي | Profile Page
// مع النشاط الأخير + البودكاست المفضلة
// ============================================
import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingButton from '../components/LoadingButton';
import EmptyState from '../components/EmptyState';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', bio: '', avatar_url: '' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('activity');

  const isOwner = currentUser?.username === username;

  useEffect(() => {
    setLoading(true);
    api.get(`/profile/${username}`)
      .then(({ data }) => {
        setProfile(data.profile);
        setForm({ username: data.profile.username, bio: data.profile.bio || '', avatar_url: data.profile.avatar_url || '' });
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [username]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/me/profile', form);
      toast.success(data.message);
      setProfile((p) => ({ ...p, ...data.user }));
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  // النشاط الأخير من localStorage | Recent activity from localStorage
  const recentActivity = useMemo(() => {
    if (!isOwner) return [];
    try {
      const raw = localStorage.getItem('listen_history');
      if (!raw) return [];
      return JSON.parse(raw)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);
    } catch { return []; }
  }, [isOwner]);

  const TABS = [
    { id: 'activity', label: 'النشاط الأخير', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    { id: 'badges', label: 'الشارات', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /> },
  ];

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
          <div className="h-36 bg-gray-200 dark:bg-gray-700" />
          <div className="px-6 pb-6 -mt-12">
            <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600 border-4 border-white dark:border-gray-800" />
            <div className="mt-4 space-y-2">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto">
        <EmptyState
          icon="search"
          title="المستخدم غير موجود"
          message="لم نتمكن من العثور على هذا المستخدم"
          action={() => window.history.back()}
          actionLabel="العودة"
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Helmet><title>{profile.username} - منصة البودكاست</title></Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* الغلاف | Cover */}
        <div className="h-36 bg-gradient-to-l from-primary-400 via-primary-600 to-primary-700 relative">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="px-6 pb-6 -mt-14 relative z-10">
          {/* الصورة | Avatar */}
          <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-3xl font-bold text-primary-600 dark:text-primary-400 overflow-hidden shadow-lg">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (profile.username || '?')[0]
            )}
          </div>

          {/* المعلومات | Info */}
          <div className="mt-3">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">اسم المستخدم</label>
                  <input type="text" value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">نبذة</label>
                  <textarea value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
                    rows={3} placeholder="اكتب نبذة عنك..."
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">رابط الصورة</label>
                  <input type="url" value={form.avatar_url}
                    onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="https://..." dir="ltr"
                  />
                </div>
                <div className="flex gap-2">
                  <LoadingButton onClick={handleSave} loading={saving}>حفظ</LoadingButton>
                  <LoadingButton onClick={() => setEditing(false)} variant="secondary">إلغاء</LoadingButton>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{profile.username}</h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                      عضو منذ {new Date(profile.created_at).toLocaleDateString('ar', { year: 'numeric', month: 'long' })}
                    </p>
                  </div>
                  {isOwner && (
                    <button onClick={() => setEditing(true)}
                      className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      تعديل
                    </button>
                  )}
                </div>
                {profile.bio && <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm leading-relaxed">{profile.bio}</p>}
              </>
            )}
          </div>

          {/* الإحصائيات | Stats */}
          {!editing && (
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { value: profile.stats?.follows || 0, label: 'متابعة', color: 'text-primary-500' },
                { value: profile.stats?.comments || 0, label: 'تعليق', color: 'text-blue-500' },
                { value: profile.stats?.likes || 0, label: 'إعجاب', color: 'text-red-400' },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* التبويبات | Tabs */}
      {!editing && (
        <div className="mt-4">
          <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-xl shadow p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{tab.icon}</svg>
                {tab.label}
              </button>
            ))}
          </div>

          {/* محتوى التبويب | Tab content */}
          <div className="mt-3">
            {activeTab === 'activity' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                {recentActivity.length === 0 ? (
                  <EmptyState
                    icon="history"
                    title="لا يوجد نشاط"
                    message={isOwner ? 'ابدأ بالاستماع لتظهر نشاطاتك هنا' : 'لا يوجد نشاط حديث لهذا المستخدم'}
                  />
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">آخر ما استمعت إليه</h3>
                    {recentActivity.map((item, idx) => (
                      <div key={`${item.episodeId}-${idx}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.coverUrl ? (
                            <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-5 h-5 text-white opacity-60" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /></svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{item.episodeTitle}</p>
                          <p className="text-xs text-gray-400">{item.podcastTitle}</p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {new Date(item.timestamp).toLocaleDateString('ar', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'badges' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                {!profile.badges || profile.badges.length === 0 ? (
                  <EmptyState
                    icon="bookmark"
                    title="لا توجد شارات"
                    message="اكسب شارات من خلال التفاعل مع المنصة"
                  />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {profile.badges.map((b) => (
                      <div key={b.badge_id} className="flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl p-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-800/40 flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-primary-700 dark:text-primary-300">{b.badge_id}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
