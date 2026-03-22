// ============================================
// صفحة الملف الشخصي | Profile Page
// ============================================
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', bio: '', avatar_url: '' });
  const [saving, setSaving] = useState(false);

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

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" /></div>;
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400 text-lg">المستخدم غير موجود</p>
        <Link to="/" className="text-primary-500 hover:underline mt-4 inline-block">العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Helmet><title>{profile.username} - منصة البودكاست</title></Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* الغلاف | Cover */}
        <div className="h-32 bg-gradient-to-l from-primary-400 to-primary-700" />

        <div className="px-6 pb-6 -mt-12">
          {/* الصورة | Avatar */}
          <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-3xl font-bold text-primary-600 dark:text-primary-400 overflow-hidden">
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
                  <label className="text-xs text-gray-400">اسم المستخدم</label>
                  <input type="text" value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">نبذة</label>
                  <textarea value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
                    rows={3} placeholder="اكتب نبذة عنك..."
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">رابط الصورة</label>
                  <input type="url" value={form.avatar_url}
                    onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="https://..." dir="ltr"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-1.5 rounded-lg text-sm disabled:opacity-50">
                    {saving ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-lg text-sm">
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{profile.username}</h1>
                  {isOwner && (
                    <button onClick={() => setEditing(true)}
                      className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      تعديل
                    </button>
                  )}
                </div>
                {profile.bio && <p className="text-gray-600 dark:text-gray-400 mt-1">{profile.bio}</p>}
                <p className="text-xs text-gray-400 mt-2">
                  عضو منذ {new Date(profile.created_at).toLocaleDateString('ar', { year: 'numeric', month: 'long' })}
                </p>
              </>
            )}
          </div>

          {/* الإحصائيات | Stats */}
          {!editing && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{profile.stats?.follows || 0}</p>
                <p className="text-xs text-gray-400">متابعة</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{profile.stats?.comments || 0}</p>
                <p className="text-xs text-gray-400">تعليق</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{profile.stats?.likes || 0}</p>
                <p className="text-xs text-gray-400">إعجاب</p>
              </div>
            </div>
          )}

          {/* الشارات | Badges */}
          {profile.badges && profile.badges.length > 0 && !editing && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">الشارات</p>
              <div className="flex flex-wrap gap-2">
                {profile.badges.map((b) => (
                  <span key={b.badge_id} className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full text-xs">
                    {b.badge_id}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
