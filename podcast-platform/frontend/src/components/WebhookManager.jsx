// ============================================
// إدارة Webhooks | Webhook Manager Component
// ============================================
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const EVENTS = ['episode.published', 'episode.deleted', 'podcast.created', 'user.registered', 'comment.created'];

export default function WebhookManager() {
  const toast = useToast();
  const [webhooks, setWebhooks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ url: '', events: [] });
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    api.get('/admin/webhooks').then(({ data }) => setWebhooks(data.webhooks || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleEvent = (e) => {
    setForm((f) => ({
      ...f,
      events: f.events.includes(e) ? f.events.filter((x) => x !== e) : [...f.events, e],
    }));
  };

  const handleCreate = async () => {
    if (!form.url || form.events.length === 0) { toast.error('URL والأحداث مطلوبة'); return; }
    try {
      const { data } = await api.post('/admin/webhooks', form);
      setWebhooks([data.webhook, ...webhooks]);
      setForm({ url: '', events: [] });
      setCreating(false);
      toast.success('تم إنشاء Webhook');
    } catch { toast.error('فشل'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/webhooks/${id}`);
      setWebhooks(webhooks.filter((w) => w.id !== id));
      toast.success('تم الحذف');
    } catch { toast.error('فشل'); }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await api.put(`/admin/webhooks/${id}/toggle`);
      setWebhooks(webhooks.map((w) => w.id === id ? { ...w, active: data.active } : w));
    } catch { toast.error('فشل'); }
  };

  const loadLogs = () => {
    setShowLogs(!showLogs);
    if (!showLogs) {
      api.get('/admin/webhook-logs').then(({ data }) => setLogs(data.logs || [])).catch(() => {});
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Webhooks</h3>
        <div className="flex gap-2">
          <button onClick={loadLogs} className="text-gray-400 hover:text-gray-600 text-sm">السجل</button>
          <button onClick={() => setCreating(!creating)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm">+ جديد</button>
        </div>
      </div>

      {creating && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4 space-y-2">
          <input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="w-full px-3 py-1.5 border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm outline-none"
            placeholder="https://example.com/webhook" dir="ltr" />
          <div className="flex flex-wrap gap-1">
            {EVENTS.map((ev) => (
              <button key={ev} onClick={() => toggleEvent(ev)}
                className={`px-2 py-0.5 rounded text-xs ${form.events.includes(ev) ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>
                {ev}
              </button>
            ))}
          </div>
          <button onClick={handleCreate} className="bg-primary-500 text-white px-4 py-1.5 rounded-lg text-sm">إنشاء</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto" /></div>
      ) : webhooks.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">لا توجد webhooks</p>
      ) : (
        <div className="space-y-2">
          {webhooks.map((wh) => (
            <div key={wh.id} className="border dark:border-gray-700 rounded-lg p-3 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${wh.active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 dark:text-gray-100 truncate font-mono" dir="ltr">{wh.url}</p>
                <p className="text-[10px] text-gray-400">{(wh.events || []).join(', ')}</p>
              </div>
              <button onClick={() => handleToggle(wh.id)} className="text-xs text-gray-400 hover:text-gray-600">{wh.active ? 'تعطيل' : 'تفعيل'}</button>
              <button onClick={() => handleDelete(wh.id)} className="text-xs text-red-400 hover:text-red-600">حذف</button>
            </div>
          ))}
        </div>
      )}

      {showLogs && logs.length > 0 && (
        <div className="mt-4 border-t dark:border-gray-700 pt-4">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">السجل</p>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-2 text-xs text-gray-500 p-1 bg-gray-50 dark:bg-gray-700/50 rounded">
                <span className={log.status === 'sent' ? 'text-emerald-500' : 'text-red-500'}>{log.status}</span>
                <span className="truncate font-mono" dir="ltr">{log.webhook_url}</span>
                <span>{log.event}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
