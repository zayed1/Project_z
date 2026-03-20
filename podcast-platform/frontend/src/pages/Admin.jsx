// ============================================
// صفحة المشرف | Admin Page
// مع رسوم بيانية + تصدير + سجل النشاطات
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { podcastsAPI, episodesAPI, adminAPI } from '../utils/api';

export default function Admin() {
  const { user, login, logout, loading: authLoading } = useAuth();

  if (authLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800" /></div>;
  if (!user) return <AdminLogin onLogin={login} />;
  return <AdminDashboard user={user} onLogout={logout} />;
}

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await onLogin(email, password); }
    catch (err) { setError(err.response?.data?.message || 'فشل تسجيل الدخول'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gray-800 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <h1 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">دخول المشرف</h1>
        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-gray-800 outline-none" placeholder="admin@example.com" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-gray-800 outline-none" placeholder="........" required />
          <button type="submit" disabled={loading}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminDashboard({ user, onLogout }) {
  const toast = useToast();
  const [podcasts, setPodcasts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('podcasts');

  const [showPodcastForm, setShowPodcastForm] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState(null);
  const [podcastForm, setPodcastForm] = useState({ title: '', description: '', cover_image_url: '', category_id: '' });
  const [coverFile, setCoverFile] = useState(null);
  const [showEpisodeForm, setShowEpisodeForm] = useState(null);
  const [editingEpisode, setEditingEpisode] = useState(null);
  const [episodeForm, setEpisodeForm] = useState({ title: '', description: '', episode_number: '', audio: null, scheduled_at: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [podRes, catRes] = await Promise.all([podcastsAPI.getAll({ limit: 100 }), podcastsAPI.getCategories()]);
      const allPodcasts = podRes.data.podcasts || [];
      setCategories(catRes.data.categories || []);
      const withEpisodes = await Promise.all(
        allPodcasts.map(async (p) => {
          try { const { data } = await episodesAPI.getAll(p.id); return { ...p, episodes: data.episodes || [] }; }
          catch { return { ...p, episodes: [] }; }
        })
      );
      setPodcasts(withEpisodes);
    } catch { setError('فشل في تحميل البيانات'); }
    finally { setLoading(false); }
  }, []);

  const fetchStats = useCallback(async () => {
    try { const { data } = await podcastsAPI.getStats(); setStats(data.stats); } catch {}
  }, []);

  const fetchLogs = useCallback(async () => {
    try { const { data } = await adminAPI.getActivityLogs({ limit: 20 }); setActivityLogs(data.logs || []); } catch {}
  }, []);

  useEffect(() => { fetchAll(); fetchStats(); fetchLogs(); }, [fetchAll, fetchStats, fetchLogs]);

  async function uploadCover() {
    if (!coverFile) return podcastForm.cover_image_url;
    const fd = new FormData(); fd.append('image', coverFile);
    const { data } = await podcastsAPI.uploadCover(fd);
    return data.url;
  }

  async function handlePodcastSubmit(e) {
    e.preventDefault(); setSubmitting(true);
    try {
      const imageUrl = await uploadCover();
      const payload = { ...podcastForm, cover_image_url: imageUrl, category_id: podcastForm.category_id || null };
      if (editingPodcast) await podcastsAPI.update(editingPodcast.id, payload);
      else await podcastsAPI.create(payload);
      setPodcastForm({ title: '', description: '', cover_image_url: '', category_id: '' }); setCoverFile(null);
      setShowPodcastForm(false); setEditingPodcast(null);
      toast.success(editingPodcast ? 'تم تعديل البودكاست' : 'تم إنشاء البودكاست');
      await fetchAll(); await fetchStats();
    } catch (err) { toast.error(err.response?.data?.message || 'فشل في حفظ البودكاست'); }
    finally { setSubmitting(false); }
  }

  function startEditPodcast(p) {
    setEditingPodcast(p);
    setPodcastForm({ title: p.title, description: p.description || '', cover_image_url: p.cover_image_url || '', category_id: p.category_id || '' });
    setCoverFile(null); setShowPodcastForm(true);
  }

  async function handleEpisodeSubmit(e) {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editingEpisode) {
        await episodesAPI.update(editingEpisode.id, { title: episodeForm.title, description: episodeForm.description, episode_number: episodeForm.episode_number, scheduled_at: episodeForm.scheduled_at || null });
      } else {
        if (!episodeForm.audio) { toast.error('يرجى اختيار ملف صوتي'); setSubmitting(false); return; }
        const fd = new FormData();
        fd.append('title', episodeForm.title); fd.append('description', episodeForm.description);
        fd.append('episode_number', episodeForm.episode_number); fd.append('audio', episodeForm.audio);
        if (episodeForm.scheduled_at) fd.append('scheduled_at', episodeForm.scheduled_at);
        await episodesAPI.create(showEpisodeForm, fd);
      }
      setEpisodeForm({ title: '', description: '', episode_number: '', audio: null, scheduled_at: '' });
      setShowEpisodeForm(null); setEditingEpisode(null);
      toast.success(editingEpisode ? 'تم تعديل الحلقة' : 'تم إضافة الحلقة');
      await fetchAll(); await fetchStats();
    } catch (err) { toast.error(err.response?.data?.message || 'فشل في حفظ الحلقة'); }
    finally { setSubmitting(false); }
  }

  function startEditEpisode(ep, pid) {
    setEditingEpisode(ep); setShowEpisodeForm(pid);
    setEpisodeForm({ title: ep.title, description: ep.description || '', episode_number: ep.episode_number || '', audio: null, scheduled_at: ep.scheduled_at || '' });
  }

  async function moveEpisode(ep, dir, episodes) {
    const sorted = [...episodes].sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));
    const idx = sorted.findIndex((e) => e.id === ep.id);
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= sorted.length) return;
    await Promise.all([
      episodesAPI.update(sorted[idx].id, { episode_number: sorted[swap].episode_number }),
      episodesAPI.update(sorted[swap].id, { episode_number: sorted[idx].episode_number }),
    ]);
    await fetchAll();
  }

  async function handleDeletePodcast(id) {
    if (!window.confirm('هل أنت متأكد من حذف هذا البودكاست وجميع حلقاته؟')) return;
    try { await podcastsAPI.delete(id); toast.success('تم حذف البودكاست'); await fetchAll(); await fetchStats(); }
    catch (err) { toast.error(err.response?.data?.message || 'فشل'); }
  }

  async function handleDeleteEpisode(id) {
    if (!window.confirm('هل أنت متأكد من حذف هذه الحلقة؟')) return;
    try { await episodesAPI.delete(id); toast.success('تم حذف الحلقة'); await fetchAll(); await fetchStats(); }
    catch (err) { toast.error(err.response?.data?.message || 'فشل'); }
  }

  // تصدير | Export
  const handleExport = async (format) => {
    try {
      const { data } = await adminAPI.exportData(format);
      if (format === 'csv') {
        const blob = data instanceof Blob ? data : new Blob([data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `stats-${Date.now()}.csv`;
        a.click(); URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `stats-${Date.now()}.json`;
        a.click(); URL.revokeObjectURL(url);
      }
      toast.success(`تم تصدير البيانات كـ ${format.toUpperCase()}`);
    } catch { toast.error('فشل في تصدير البيانات'); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800" /></div>;

  const inputClass = "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none";

  // حساب بيانات الرسم البياني | Chart data
  const chartData = stats?.top_podcasts || [];
  const maxListens = Math.max(...chartData.map((p) => p.total_listens), 1);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gray-800 text-white rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">لوحة تحكم المشرف</h1>
            <p className="text-gray-300 text-sm mt-1">مرحباً {user?.username}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">مشرف</span>
            <button onClick={onLogout} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">خروج</button>
          </div>
        </div>
        {stats && (
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-700 rounded-lg p-4"><p className="text-gray-400 text-sm">عدد البودكاست</p><p className="text-2xl font-bold">{stats.total_podcasts}</p></div>
            <div className="bg-gray-700 rounded-lg p-4"><p className="text-gray-400 text-sm">عدد الحلقات</p><p className="text-2xl font-bold">{stats.total_episodes}</p></div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['podcasts', 'stats', 'logs'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
            {{ podcasts: 'إدارة المحتوى', stats: 'الإحصائيات', logs: 'سجل النشاطات' }[t]}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
          {error}<button onClick={() => setError('')} className="float-left">&times;</button>
        </div>
      )}

      {/* Stats Tab with Charts */}
      {tab === 'stats' && (
        <div className="space-y-6">
          {/* رسم بياني أفقي | Horizontal Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">أكثر البودكاست استماعاً</h2>
              <div className="flex gap-2">
                <button onClick={() => handleExport('csv')} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs">تصدير CSV</button>
                <button onClick={() => handleExport('json')} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs">تصدير JSON</button>
              </div>
            </div>
            {chartData.length > 0 ? (
              <div className="space-y-4">
                {chartData.map((p, i) => (
                  <div key={p.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate max-w-[200px]">{p.title}</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{p.total_listens} استماع</span>
                    </div>
                    <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-l from-primary-400 to-primary-600 rounded-full transition-all duration-700"
                        style={{ width: `${(p.total_listens / maxListens) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">لا توجد بيانات بعد</p>
            )}
          </div>
        </div>
      )}

      {/* Activity Log Tab */}
      {tab === 'logs' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">سجل النشاطات</h2>
          {activityLogs.length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400 flex-shrink-0">
                    {(log.user?.username || '?')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-100">
                      <span className="font-medium">{log.user?.username || 'نظام'}</span>
                      {' - '}{log.action}
                    </p>
                    {log.details && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{log.details}</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(log.created_at).toLocaleString('ar')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">لا توجد نشاطات مسجلة بعد</p>
          )}
        </div>
      )}

      {/* Content Tab */}
      {tab === 'podcasts' && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">إدارة البودكاست</h2>
            <button onClick={() => { setShowPodcastForm(!showPodcastForm); setEditingPodcast(null); setPodcastForm({ title: '', description: '', cover_image_url: '', category_id: '' }); setCoverFile(null); }}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors">+ بودكاست جديد</button>
          </div>

          {showPodcastForm && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{editingPodcast ? 'تعديل البودكاست' : 'إنشاء بودكاست جديد'}</h3>
              <form onSubmit={handlePodcastSubmit} className="space-y-4">
                <input type="text" placeholder="عنوان البودكاست" value={podcastForm.title}
                  onChange={(e) => setPodcastForm({ ...podcastForm, title: e.target.value })} className={inputClass} required />
                <textarea placeholder="وصف البودكاست" value={podcastForm.description}
                  onChange={(e) => setPodcastForm({ ...podcastForm, description: e.target.value })} className={inputClass} rows={3} />
                <select value={podcastForm.category_id}
                  onChange={(e) => setPodcastForm({ ...podcastForm, category_id: e.target.value })} className={inputClass}>
                  <option value="">اختر التصنيف</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">صورة الغلاف</label>
                  <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:ml-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                  <p className="text-xs text-gray-400 mt-1">أو أدخل رابط مباشر:</p>
                  <input type="url" placeholder="رابط صورة الغلاف" value={podcastForm.cover_image_url}
                    onChange={(e) => setPodcastForm({ ...podcastForm, cover_image_url: e.target.value })} className={inputClass + ' mt-1'} />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={submitting}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg disabled:opacity-50">{submitting ? 'جاري الحفظ...' : (editingPodcast ? 'حفظ التعديلات' : 'إنشاء')}</button>
                  <button type="button" onClick={() => { setShowPodcastForm(false); setEditingPodcast(null); }}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg">إلغاء</button>
                </div>
              </form>
            </div>
          )}

          {podcasts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">لا يوجد بودكاست في المنصة بعد</p>
            </div>
          ) : (
            <div className="space-y-6">
              {podcasts.map((podcast) => (
                <div key={podcast.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{podcast.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {podcast.category?.name && <span className="text-primary-500">{podcast.category.name}</span>}
                          {' - '}{podcast.episodes?.length || 0} حلقة
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEditPodcast(podcast)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm">تعديل</button>
                        <button onClick={() => { setShowEpisodeForm(showEpisodeForm === podcast.id ? null : podcast.id); setEditingEpisode(null); setEpisodeForm({ title: '', description: '', episode_number: '', audio: null, scheduled_at: '' }); }}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm">+ حلقة</button>
                        <button onClick={() => handleDeletePodcast(podcast.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm">حذف</button>
                      </div>
                    </div>
                  </div>

                  {showEpisodeForm === podcast.id && (
                    <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-3">{editingEpisode ? 'تعديل الحلقة' : 'إضافة حلقة جديدة'}</h4>
                      <form onSubmit={handleEpisodeSubmit} className="space-y-3">
                        <input type="text" placeholder="عنوان الحلقة" value={episodeForm.title}
                          onChange={(e) => setEpisodeForm({ ...episodeForm, title: e.target.value })} className={inputClass} required />
                        <textarea placeholder="وصف الحلقة" value={episodeForm.description}
                          onChange={(e) => setEpisodeForm({ ...episodeForm, description: e.target.value })} className={inputClass} rows={2} />
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" placeholder="رقم الحلقة" value={episodeForm.episode_number}
                            onChange={(e) => setEpisodeForm({ ...episodeForm, episode_number: e.target.value })} className={inputClass} min="1" />
                          <input type="datetime-local" value={episodeForm.scheduled_at ? episodeForm.scheduled_at.slice(0, 16) : ''}
                            onChange={(e) => setEpisodeForm({ ...episodeForm, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                            className={inputClass} title="جدولة النشر (اختياري)" />
                        </div>
                        {!editingEpisode && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الملف الصوتي</label>
                            <input type="file" accept="audio/*" onChange={(e) => setEpisodeForm({ ...episodeForm, audio: e.target.files[0] })}
                              className="w-full text-sm text-gray-500 file:ml-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700" required />
                          </div>
                        )}
                        <div className="flex gap-3">
                          <button type="submit" disabled={submitting}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg disabled:opacity-50">
                            {submitting ? 'جاري الحفظ...' : (editingEpisode ? 'حفظ' : 'إضافة')}
                          </button>
                          <button type="button" onClick={() => { setShowEpisodeForm(null); setEditingEpisode(null); }}
                            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg">إلغاء</button>
                        </div>
                      </form>
                    </div>
                  )}

                  {podcast.episodes && podcast.episodes.length > 0 && (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {[...podcast.episodes].sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0)).map((ep) => (
                        <div key={ep.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-800 dark:text-gray-100 truncate">
                              {ep.episode_number && `${ep.episode_number}. `}{ep.title}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                              {ep.listen_count > 0 && <span>{ep.listen_count} استماع</span>}
                              {ep.scheduled_at && new Date(ep.scheduled_at) > new Date() && (
                                <span className="text-yellow-500">مجدولة: {new Date(ep.scheduled_at).toLocaleDateString('ar')}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => moveEpisode(ep, 'up', podcast.episodes)} className="p-1 text-gray-400 hover:text-gray-600" title="نقل لأعلى">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg>
                            </button>
                            <button onClick={() => moveEpisode(ep, 'down', podcast.episodes)} className="p-1 text-gray-400 hover:text-gray-600" title="نقل لأسفل">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                            </button>
                            <button onClick={() => startEditEpisode(ep, podcast.id)} className="text-blue-500 hover:text-blue-700 text-sm px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30">تعديل</button>
                            <button onClick={() => handleDeleteEpisode(ep.id)} className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30">حذف</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
