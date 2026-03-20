// ============================================
// لوحة تحكم المذيع | Creator Dashboard
// ============================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { podcastsAPI, episodesAPI } from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // نماذج الإنشاء | Creation forms state
  const [showPodcastForm, setShowPodcastForm] = useState(false);
  const [showEpisodeForm, setShowEpisodeForm] = useState(null); // podcast ID or null
  const [podcastForm, setPodcastForm] = useState({ title: '', description: '', cover_image_url: '' });
  const [episodeForm, setEpisodeForm] = useState({ title: '', description: '', episode_number: '', audio: null });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyPodcasts();
  }, [user, navigate]);

  async function fetchMyPodcasts() {
    try {
      const { data } = await podcastsAPI.getAll();
      // تصفية البودكاست الخاصة بالمستخدم | Filter user's podcasts
      const myPodcasts = (data.podcasts || []).filter(
        (p) => p.creator_id === user?.id
      );
      // جلب حلقات كل بودكاست | Fetch episodes for each
      const podcastsWithEpisodes = await Promise.all(
        myPodcasts.map(async (podcast) => {
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

  // إنشاء بودكاست جديد | Create new podcast
  async function handleCreatePodcast(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await podcastsAPI.create(podcastForm);
      setPodcastForm({ title: '', description: '', cover_image_url: '' });
      setShowPodcastForm(false);
      await fetchMyPodcasts();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في إنشاء البودكاست');
    } finally {
      setSubmitting(false);
    }
  }

  // إضافة حلقة جديدة | Create new episode
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
      await fetchMyPodcasts();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في إضافة الحلقة');
    } finally {
      setSubmitting(false);
    }
  }

  // حذف بودكاست | Delete podcast
  async function handleDeletePodcast(podcastId) {
    if (!window.confirm('هل أنت متأكد من حذف هذا البودكاست وجميع حلقاته؟')) return;
    try {
      await podcastsAPI.delete(podcastId);
      await fetchMyPodcasts();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في حذف البودكاست');
    }
  }

  // حذف حلقة | Delete episode
  async function handleDeleteEpisode(episodeId) {
    if (!window.confirm('هل أنت متأكد من حذف هذه الحلقة؟')) return;
    try {
      await episodesAPI.delete(episodeId);
      await fetchMyPodcasts();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في حذف الحلقة');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          لوحة التحكم - مرحباً {user?.username}
        </h1>
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
          <h2 className="text-lg font-bold mb-4">إنشاء بودكاست جديد</h2>
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
          <p className="text-lg mb-2">لا يوجد لديك بودكاست بعد</p>
          <p>أنشئ أول بودكاست لك بالضغط على الزر أعلاه</p>
        </div>
      ) : (
        <div className="space-y-6">
          {podcasts.map((podcast) => (
            <div key={podcast.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* رأس البودكاست | Podcast Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{podcast.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">
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
                  <h3 className="font-bold mb-3">إضافة حلقة جديدة</h3>
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
