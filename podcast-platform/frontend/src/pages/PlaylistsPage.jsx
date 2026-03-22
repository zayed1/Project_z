// ============================================
// صفحة قوائم التشغيل | Playlists Page
// ============================================
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function PlaylistsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!user) return;
    api.get('/me/playlists')
      .then(({ data }) => setPlaylists(data.playlists || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      const { data } = await api.post('/playlists', form);
      setPlaylists([data.playlist, ...playlists]);
      setForm({ name: '', description: '' });
      setCreating(false);
      toast.success('تم إنشاء القائمة');
    } catch { toast.error('فشل'); }
  };

  const openPlaylist = async (pl) => {
    setSelected(pl);
    try {
      const { data } = await api.get(`/playlists/${pl.id}`);
      setItems(data.items || []);
    } catch { setItems([]); }
  };

  const deletePlaylist = async (id) => {
    try {
      await api.delete(`/playlists/${id}`);
      setPlaylists(playlists.filter((p) => p.id !== id));
      if (selected?.id === id) { setSelected(null); setItems([]); }
      toast.success('تم حذف القائمة');
    } catch { toast.error('فشل'); }
  };

  if (!user) {
    return <div className="text-center py-16"><p className="text-gray-500">سجل دخولك لإدارة قوائم التشغيل</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Helmet><title>قوائم التشغيل - منصة البودكاست</title></Helmet>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">قوائم التشغيل</h1>
        <button onClick={() => setCreating(!creating)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm">
          + قائمة جديدة
        </button>
      </div>

      {creating && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-4">
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm mb-2 outline-none"
            placeholder="اسم القائمة" />
          <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm mb-2 outline-none"
            placeholder="وصف (اختياري)" />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="bg-primary-500 text-white px-4 py-1.5 rounded-lg text-sm">إنشاء</button>
            <button onClick={() => setCreating(false)} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-lg text-sm">إلغاء</button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {/* قائمة الـ playlists */}
        <div className="md:col-span-1 space-y-2">
          {loading ? (
            <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto" /></div>
          ) : playlists.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">لا توجد قوائم بعد</p>
          ) : playlists.map((pl) => (
            <div key={pl.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${selected?.id === pl.id ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-transparent'}`}
              onClick={() => openPlaylist(pl)}>
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800 dark:text-gray-100 text-sm">{pl.name}</h3>
                <button onClick={(e) => { e.stopPropagation(); deletePlaylist(pl.id); }}
                  className="text-gray-400 hover:text-red-500 text-xs">حذف</button>
              </div>
              {pl.description && <p className="text-xs text-gray-400 mt-1">{pl.description}</p>}
            </div>
          ))}
        </div>

        {/* حلقات القائمة المختارة */}
        <div className="md:col-span-2">
          {selected ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-3">{selected.name}</h2>
              {items.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">لا توجد حلقات في هذه القائمة</p>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="w-10 h-10 rounded bg-primary-100 dark:bg-primary-900/30 flex-shrink-0 flex items-center justify-center">
                        {item.episodes?.podcasts?.cover_image_url ? (
                          <img src={item.episodes.podcasts.cover_image_url} alt="" className="w-full h-full rounded object-cover" />
                        ) : (
                          <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /></svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to={`/podcast/${item.episodes?.podcast_id}`} className="text-sm font-medium text-gray-800 dark:text-gray-100 hover:text-primary-500 truncate block">
                          {item.episodes?.title}
                        </Link>
                        <p className="text-xs text-gray-400">{item.episodes?.podcasts?.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p>اختر قائمة لعرض حلقاتها</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
