// ============================================
// صفحة قوائم التشغيل | Playlists Page
// مع تأكيد الحذف + EmptyState + Drag & Drop
// ============================================
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PlaylistDuration from '../components/PlaylistDuration';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import LoadingButton from '../components/LoadingButton';

export default function PlaylistsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    if (!user) return;
    api.get('/me/playlists')
      .then(({ data }) => setPlaylists(data.playlists || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post('/playlists', form);
      setPlaylists([data.playlist, ...playlists]);
      setForm({ name: '', description: '' });
      setCreating(false);
      toast.success('تم إنشاء القائمة');
    } catch { toast.error('فشل في إنشاء القائمة'); }
    finally { setSaving(false); }
  };

  const openPlaylist = async (pl) => {
    setSelected(pl);
    try {
      const { data } = await api.get(`/playlists/${pl.id}`);
      setItems(data.items || []);
    } catch { setItems([]); }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deletePlaylist(deleteTarget);
  };

  const deletePlaylist = async (id) => {
    try {
      await api.delete(`/playlists/${id}`);
      setPlaylists(playlists.filter((p) => p.id !== id));
      if (selected?.id === id) { setSelected(null); setItems([]); }
      toast.success('تم حذف القائمة');
    } catch { toast.error('فشل في حذف القائمة'); }
    finally { setDeleteTarget(null); }
  };

  // Drag & Drop handlers
  const handleDragStart = (idx) => { dragItem.current = idx; };
  const handleDragEnter = (idx) => { dragOverItem.current = idx; };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const copy = [...items];
    const dragged = copy.splice(dragItem.current, 1)[0];
    copy.splice(dragOverItem.current, 0, dragged);
    setItems(copy);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  if (!user) {
    return (
      <EmptyState
        icon="playlist"
        title="سجل دخولك"
        message="سجل دخولك لإنشاء وإدارة قوائم التشغيل الخاصة بك"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Helmet><title>قوائم التشغيل - منصة البودكاست</title></Helmet>

      {/* تأكيد الحذف | Delete confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        title="حذف القائمة"
        message="سيتم حذف هذه القائمة نهائياً. هل أنت متأكد؟"
        confirmText="حذف"
        cancelText="إلغاء"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">قوائم التشغيل</h1>
        <button onClick={() => setCreating(!creating)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          + قائمة جديدة
        </button>
      </div>

      {creating && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-4">
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm mb-2 outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="اسم القائمة" />
          <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm mb-2 outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="وصف (اختياري)" />
          <div className="flex gap-2">
            <LoadingButton onClick={handleCreate} loading={saving}>إنشاء</LoadingButton>
            <LoadingButton onClick={() => setCreating(false)} variant="secondary">إلغاء</LoadingButton>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {/* قائمة الـ playlists */}
        <div className="md:col-span-1 space-y-2">
          {loading ? (
            <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto" /></div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">لا توجد قوائم بعد</p>
              <p className="text-xs text-gray-400 mt-1">أنشئ قائمة جديدة للبدء</p>
            </div>
          ) : playlists.map((pl) => (
            <div key={pl.id}
              className={`p-3 rounded-lg cursor-pointer transition-all ${selected?.id === pl.id ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 shadow-sm' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-transparent hover:shadow-sm'}`}
              onClick={() => openPlaylist(pl)}>
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800 dark:text-gray-100 text-sm">{pl.name}</h3>
                <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(pl.id); }}
                  className="text-gray-400 hover:text-red-500 text-xs p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              {pl.description && <p className="text-xs text-gray-400 mt-1">{pl.description}</p>}
            </div>
          ))}
        </div>

        {/* حلقات القائمة المختارة مع Drag & Drop */}
        <div className="md:col-span-2">
          {selected ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-800 dark:text-gray-100">{selected.name}</h2>
                <PlaylistDuration episodes={items.map((i) => i.episodes).filter(Boolean)} />
              </div>
              {items.length === 0 ? (
                <EmptyState
                  icon="playlist"
                  title="لا توجد حلقات"
                  message="أضف حلقات لهذه القائمة من صفحات البودكاست"
                />
              ) : (
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragEnter={() => handleDragEnter(idx)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-grab active:cursor-grabbing group"
                    >
                      {/* مقبض السحب | Drag handle */}
                      <div className="text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z" />
                        </svg>
                      </div>
                      <div className="w-10 h-10 rounded bg-primary-100 dark:bg-primary-900/30 flex-shrink-0 flex items-center justify-center overflow-hidden">
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
            <EmptyState
              icon="playlist"
              title="اختر قائمة"
              message="اختر قائمة من الجانب لعرض حلقاتها"
            />
          )}
        </div>
      </div>
    </div>
  );
}
