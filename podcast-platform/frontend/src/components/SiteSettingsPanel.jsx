// ============================================
// لوحة إعدادات الموقع | Site Settings Panel
// ============================================
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function SiteSettingsPanel() {
  const toast = useToast();
  const [settings, setSettings] = useState({ site_name: '', description: '', logo_url: '', primary_color: '#6366f1', maintenance_mode: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => { if (data.settings) setSettings(data.settings); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success('تم حفظ الإعدادات');
    } catch { toast.error('فشل'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto" /></div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-2xl">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">إعدادات الموقع</h3>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-500 mb-1 block">اسم الموقع</label>
          <input type="text" value={settings.site_name} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
            className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none" />
        </div>

        <div>
          <label className="text-sm text-gray-500 mb-1 block">وصف الموقع</label>
          <textarea value={settings.description} onChange={(e) => setSettings({ ...settings, description: e.target.value })}
            className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none h-20 resize-none" />
        </div>

        <div>
          <label className="text-sm text-gray-500 mb-1 block">رابط الشعار</label>
          <input type="url" value={settings.logo_url} onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
            className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none" dir="ltr" />
        </div>

        <div>
          <label className="text-sm text-gray-500 mb-1 block">اللون الرئيسي</label>
          <div className="flex items-center gap-3">
            <input type="color" value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer border-0" />
            <input type="text" value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
              className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none w-32 font-mono" dir="ltr" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={settings.maintenance_mode} onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
              className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[-100%]" />
          </label>
          <span className="text-sm text-gray-700 dark:text-gray-300">وضع الصيانة</span>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="mt-6 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg text-sm disabled:opacity-50">
        {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
      </button>
    </div>
  );
}
