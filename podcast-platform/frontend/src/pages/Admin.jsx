// ============================================
// صفحة المشرف | Admin Page
// تجمع تسجيل الدخول ولوحة التحكم في صفحة واحدة
// ============================================
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { podcastsAPI, episodesAPI } from '../utils/api';

export default function Admin() {
  const { user, login, logout, loading: authLoading } = useAuth();

  // إذا لم يسجل الدخول يظهر نموذج الدخول | Show login if not authenticated
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onLogin={login} />;
  }

  return <AdminDashboard user={user} onLogout={logout} />;
}

// ============================================
// نموذج تسجيل دخول المشرف | Admin Login Form
// ============================================
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* أيقونة القفل | Lock Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <h1 className="text-xl font-bold text-center text-gray-800 mb-6">
            دخول المشرف
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================
// لوحة تحكم المشرف | Admin Dashboard
// ============================================
function AdminDashboard({ user, onLogout }) {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // نماذج الإنشاء | Creation forms state
  const [showPodcastForm, setShowPodcastForm] = useState(false);
  const [showEpisodeForm, setShowEpisodeForm] = useState(null);
  const [podcastForm, setPodcastForm] = useState({ title: '', description: '', cover_image_url: '' });
  const [episodeForm, setEpisodeForm] = useState({ title: '', description: '', episode_number: '', audio: null });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAllPodcasts();
  }, []);

  // جلب جميع البودكاست (المشرف يرى الكل) | Fetch all podcasts
  async function fetchAllPodcasts() {
    try {
      const { data } = await podcastsAPI.getAll();
      const allPodcasts = data.podcasts || [];
      const podcastsWithEpisodes = await Promise.all(
        allPodcasts.map(async (podcast) => {
          try {
            const { data: epData } = await episodesAPI.getAll(podcast.id);
            return { ...podcast, episodes: epData.episodes || [] };
          } catch {
            return { ...podcast, episodes: [] };
          }
        })
      );
      setPodcasts(podcastsWithEpisodes);
    } catch {
      setError('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePodcast(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await podcastsAPI.create(podcastForm);
      setPodcastForm({ title: '', description: '', cover_image_url: '' });
      setShowPodcastForm(false);
      await fetchAllPodcasts();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في إنشاء البودكاست');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateEpisode(e) {
    e.preventDefault();
    if (!episodeForm.audio) {
      setError('يرجى اختيار ملف صوتي');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', episodeForm.title);
      formData.append('description', episodeForm.description);
      formData.append('episode_number', episodeForm.episode_number);
      formData.append('audio', episodeForm.audio);

      await episodesAPI.create(showEpisodeForm, formData);
      setEpisodeForm({ title: '', description: '', episode_number: '', audio: null });
      setShowEpisodeForm(null);
      await fetchAllPodcasts();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في إضافة الحلقة');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeletePodcast(podcastId) {
    if (!window.confirm('هل أنت متأكد من حذف هذا البودكاست وجميع حلقاته؟')) return;
    try {
      await podcastsAPI.delete(podcastId);
      await fetchAllPodcasts();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في حذف البودكاست');
    }
  }

  async function handleDeleteEpisode(episodeId) {
    if (!window.confirm('هل أنت متأكد من حذف هذه الحلقة؟')) return;
    try {
      await episodesAPI.delete(episodeId);
      await fetchAllPodcasts();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في حذف الحلقة');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* رأس لوحة التحكم | Dashboard Header */}
      <div className="bg-gray-800 text-white rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">لوحة تحكم المشرف</h1>
            <p className="text-gray-300 text-sm mt-1">مرحباً {user?.username} - إدارة المنصة</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
              مشرف
            </span>
            <button
              onClick={onLogout}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              تسجيل خروج
            </button>
          </div>
        </div>

        {/* إحصائيات سريعة | Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">عدد البودكاست</p>
            <p className="text-2xl font-bold">{podcasts.length}</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">عدد الحلقات</p>
            <p className="text-2xl font-bold">
              {podcasts.reduce((sum, p) => sum + (p.episodes?.length || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* زر إضافة بودكاست | Add Podcast Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">إدارة البودكاست</h2>
        <button
          onClick={() => setShowPodcastForm(!showPodcastForm)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          + بودكاست جديد
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
          <button onClick={() => setError('')} className="float-left text-red-400 hover:text-red-600">&times;</button>
        </div>
      )}

      {/* نموذج إنشاء بودكاست | Create Podcast Form */}
      {showPodcastForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">إنشاء بودكاست جديد</h3>
          <form onSubmit={handleCreatePodcast} className="space-y-4">
            <input
              type="text"
              placeholder="عنوان البودكاست"
              value={podcastForm.title}
              onChange={(e) => setPodcastForm({ ...podcastForm, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
            <textarea
              placeholder="وصف البودكاست"
              value={podcastForm.description}
              onChange={(e) => setPodcastForm({ ...podcastForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              rows={3}
            />
            <input
              type="url"
              placeholder="رابط صورة الغلاف (اختياري)"
              value={podcastForm.cover_image_url}
              onChange={(e) => setPodcastForm({ ...podcastForm, cover_image_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? 'جاري الإنشاء...' : 'إنشاء'}
              </button>
              <button
                type="button"
                onClick={() => setShowPodcastForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* قائمة البودكاست | Podcasts List */}
      {podcasts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center text-gray-500">
          <p className="text-lg mb-2">لا يوجد بودكاست في المنصة بعد</p>
          <p>أضف أول بودكاست بالضغط على الزر أعلاه</p>
        </div>
      ) : (
        <div className="space-y-6">
          {podcasts.map((podcast) => (
            <div key={podcast.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* رأس البودكاست | Podcast Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{podcast.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {podcast.creator?.username && (
                        <span className="text-primary-600">{podcast.creator.username}</span>
                      )}
                      {' - '}
                      {podcast.episodes?.length || 0} حلقة
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowEpisodeForm(showEpisodeForm === podcast.id ? null : podcast.id);
                        setEpisodeForm({ title: '', description: '', episode_number: '', audio: null });
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                    >
                      + حلقة
                    </button>
                    <button
                      onClick={() => handleDeletePodcast(podcast.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>

              {/* نموذج إضافة حلقة | Add Episode Form */}
              {showEpisodeForm === podcast.id && (
                <div className="p-6 bg-gray-50 border-b border-gray-100">
                  <h4 className="font-bold mb-3">إضافة حلقة جديدة</h4>
                  <form onSubmit={handleCreateEpisode} className="space-y-3">
                    <input
                      type="text"
                      placeholder="عنوان الحلقة"
                      value={episodeForm.title}
                      onChange={(e) => setEpisodeForm({ ...episodeForm, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      required
                    />
                    <textarea
                      placeholder="وصف الحلقة"
                      value={episodeForm.description}
                      onChange={(e) => setEpisodeForm({ ...episodeForm, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      rows={2}
                    />
                    <input
                      type="number"
                      placeholder="رقم الحلقة"
                      value={episodeForm.episode_number}
                      onChange={(e) => setEpisodeForm({ ...episodeForm, episode_number: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      min="1"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الملف الصوتي</label>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setEpisodeForm({ ...episodeForm, audio: e.target.files[0] })}
                        className="w-full text-sm text-gray-500 file:ml-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {submitting ? 'جاري الرفع...' : 'إضافة الحلقة'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEpisodeForm(null)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* قائمة الحلقات | Episodes List */}
              {podcast.episodes && podcast.episodes.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {podcast.episodes.map((episode) => (
                    <div key={episode.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {episode.episode_number && `${episode.episode_number}. `}
                          {episode.title}
                        </h4>
                        {episode.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">{episode.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteEpisode(episode.id)}
                        className="text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
