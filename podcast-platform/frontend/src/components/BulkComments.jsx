// ============================================
// إدارة التعليقات المجمّعة | Bulk Comments Manager
// ============================================
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import ConfirmModal from './ConfirmModal';

export default function BulkComments() {
  const toast = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = (p = 0) => {
    setLoading(true);
    api.get('/admin/comments', { params: { page: p, limit: 20 } })
      .then(({ data }) => { setComments(data.comments || []); setPage(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === comments.length) setSelected(new Set());
    else setSelected(new Set(comments.map((c) => c.id)));
  };

  const handleBulkDelete = async () => {
    try {
      await api.post('/admin/comments/bulk-delete', { ids: [...selected] });
      setComments(comments.filter((c) => !selected.has(c.id)));
      toast.success(`تم حذف ${selected.size} تعليق`);
      setSelected(new Set());
      setConfirmOpen(false);
    } catch { toast.error('فشل'); }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">إدارة التعليقات</h3>
        {selected.size > 0 && (
          <button onClick={() => setConfirmOpen(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm">
            حذف المحدد ({selected.size})
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto" /></div>
      ) : comments.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">لا توجد تعليقات</p>
      ) : (
        <>
          <div className="mb-2">
            <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
              <input type="checkbox" checked={selected.size === comments.length} onChange={toggleAll}
                className="rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
              تحديد الكل
            </label>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {comments.map((c) => (
              <div key={c.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${selected.has(c.id) ? 'border-primary-300 bg-primary-50/50 dark:bg-primary-900/10' : 'border-transparent bg-gray-50 dark:bg-gray-700/50'}`}>
                <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)}
                  className="mt-1 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{c.user?.username || '—'}</span>
                    <span className="text-[10px] text-gray-400">{c.episode?.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{c.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={() => load(Math.max(0, page - 1))} disabled={page === 0}
              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30">السابق</button>
            <span className="text-sm text-gray-400">صفحة {page + 1}</span>
            <button onClick={() => load(page + 1)} disabled={comments.length < 20}
              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30">التالي</button>
          </div>
        </>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="حذف التعليقات"
        message={`هل أنت متأكد من حذف ${selected.size} تعليق؟ لا يمكن التراجع.`}
        confirmText="حذف"
        danger
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
