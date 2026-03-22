// ============================================
// قوالب الرسائل | Message Templates Manager
// ============================================
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function MessageTemplates() {
  const toast = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', title: '', body: '', type: 'notification' });

  useEffect(() => {
    api.get('/admin/templates')
      .then(({ data }) => setTemplates(data.templates || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.body) { toast.error('الاسم والمحتوى مطلوبان'); return; }
    try {
      const { data } = await api.post('/admin/templates', form);
      setTemplates([data.template, ...templates]);
      setForm({ name: '', title: '', body: '', type: 'notification' });
      setCreating(false);
      toast.success('تم إنشاء القالب');
    } catch { toast.error('فشل'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/templates/${id}`);
      setTemplates(templates.filter((t) => t.id !== id));
      toast.success('تم الحذف');
    } catch { toast.error('فشل'); }
  };

  const copyToClipboard = (template) => {
    navigator.clipboard.writeText(template.body);
    toast.success('تم نسخ المحتوى');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">قوالب الرسائل</h3>
        <button onClick={() => setCreating(!creating)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm">+ قالب جديد</button>
      </div>

      {creating && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4 space-y-2">
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-1.5 border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm outline-none"
            placeholder="اسم القالب" />
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-1.5 border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm outline-none"
            placeholder="عنوان الرسالة (اختياري)" />
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="w-full px-3 py-1.5 border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm outline-none h-24 resize-none"
            placeholder="محتوى الرسالة" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="px-3 py-1.5 border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm outline-none">
            <option value="notification">إشعار</option>
            <option value="broadcast">رسالة جماعية</option>
            <option value="welcome">ترحيب</option>
          </select>
          <button onClick={handleCreate} className="bg-primary-500 text-white px-4 py-1.5 rounded-lg text-sm">إنشاء</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto" /></div>
      ) : templates.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">لا توجد قوالب</p>
      ) : (
        <div className="space-y-2">
          {templates.map((t) => (
            <div key={t.id} className="border dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-800 dark:text-gray-100">{t.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded">
                    {t.type === 'notification' ? 'إشعار' : t.type === 'broadcast' ? 'جماعية' : 'ترحيب'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => copyToClipboard(t)} className="text-xs text-gray-400 hover:text-primary-500">نسخ</button>
                  <button onClick={() => handleDelete(t.id)} className="text-xs text-red-400 hover:text-red-600">حذف</button>
                </div>
              </div>
              {t.title && <p className="text-xs text-gray-500 mb-1">{t.title}</p>}
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{t.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
