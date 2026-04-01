// ============================================
// صفحة الإعدادات الشخصية | User Settings Page
// ============================================
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';

const SECTIONS = [
  { id: 'playback', label: 'التشغيل', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /> },
  { id: 'notifications', label: 'الإشعارات', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> },
  { id: 'appearance', label: 'المظهر', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /> },
  { id: 'storage', label: 'التخزين', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /> },
];

function getSettings() {
  try {
    return JSON.parse(localStorage.getItem('user_settings') || '{}');
  } catch { return {}; }
}

function saveSettings(settings) {
  localStorage.setItem('user_settings', JSON.stringify(settings));
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const toast = useToast();
  const [activeSection, setActiveSection] = useState('playback');
  const [settings, setSettings] = useState(() => ({
    defaultSpeed: 1,
    skipForward: 15,
    skipBackward: 15,
    autoPlay: true,
    notifyNewEpisodes: true,
    notifyReplies: true,
    notifyLikes: false,
    autoDarkMode: false,
    darkModeStart: '20:00',
    darkModeEnd: '07:00',
    autoDownload: false,
    ...getSettings(),
  }));

  const update = (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  };

  const handleSave = () => {
    saveSettings(settings);
    toast.success('تم حفظ الإعدادات');
  };

  if (!user) {
    return <EmptyState icon="podcast" title="سجّل الدخول" message="يجب تسجيل الدخول للوصول للإعدادات" />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Helmet><title>الإعدادات - منصة البودكاست</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">الإعدادات</h1>

      {/* التبويبات | Tabs */}
      <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-xl shadow p-1 mb-4">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeSection === s.id
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{s.icon}</svg>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        {/* التشغيل | Playback */}
        {activeSection === 'playback' && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">إعدادات التشغيل</h2>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">سرعة التشغيل الافتراضية</p>
                <p className="text-xs text-gray-400">تطبق على جميع الحلقات الجديدة</p>
              </div>
              <select
                value={settings.defaultSpeed}
                onChange={(e) => update('defaultSpeed', parseFloat(e.target.value))}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                  <option key={s} value={s}>{s}x</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">التخطي للأمام</p>
                <p className="text-xs text-gray-400">عدد الثواني عند الضغط على زر التقديم</p>
              </div>
              <select
                value={settings.skipForward}
                onChange={(e) => update('skipForward', parseInt(e.target.value))}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
              >
                {[5, 10, 15, 30, 60].map((s) => (
                  <option key={s} value={s}>{s} ثانية</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">التخطي للخلف</p>
                <p className="text-xs text-gray-400">عدد الثواني عند الضغط على زر الترجيع</p>
              </div>
              <select
                value={settings.skipBackward}
                onChange={(e) => update('skipBackward', parseInt(e.target.value))}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
              >
                {[5, 10, 15, 30, 60].map((s) => (
                  <option key={s} value={s}>{s} ثانية</option>
                ))}
              </select>
            </div>

            <ToggleSetting
              label="تشغيل تلقائي"
              description="تشغيل الحلقة التالية تلقائياً"
              value={settings.autoPlay}
              onChange={(v) => update('autoPlay', v)}
            />
          </div>
        )}

        {/* الإشعارات | Notifications */}
        {activeSection === 'notifications' && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">إعدادات الإشعارات</h2>
            <ToggleSetting
              label="حلقات جديدة"
              description="إشعار عند صدور حلقة جديدة من بودكاست تتابعه"
              value={settings.notifyNewEpisodes}
              onChange={(v) => update('notifyNewEpisodes', v)}
            />
            <ToggleSetting
              label="الردود"
              description="إشعار عند الرد على تعليقاتك"
              value={settings.notifyReplies}
              onChange={(v) => update('notifyReplies', v)}
            />
            <ToggleSetting
              label="الإعجابات"
              description="إشعار عند إعجاب أحدهم بتعليقك"
              value={settings.notifyLikes}
              onChange={(v) => update('notifyLikes', v)}
            />
          </div>
        )}

        {/* المظهر | Appearance */}
        {activeSection === 'appearance' && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">المظهر</h2>
            <ToggleSetting
              label="الوضع الليلي"
              description="تفعيل الوضع الليلي الآن"
              value={dark}
              onChange={toggleTheme}
            />
            <ToggleSetting
              label="وضع ليلي تلقائي"
              description="تبديل تلقائي بناءً على الوقت"
              value={settings.autoDarkMode}
              onChange={(v) => update('autoDarkMode', v)}
            />
            {settings.autoDarkMode && (
              <div className="flex gap-4 pr-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">يبدأ الساعة</label>
                  <input type="time" value={settings.darkModeStart}
                    onChange={(e) => update('darkModeStart', e.target.value)}
                    className="px-2 py-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">ينتهي الساعة</label>
                  <input type="time" value={settings.darkModeEnd}
                    onChange={(e) => update('darkModeEnd', e.target.value)}
                    className="px-2 py-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* التخزين | Storage */}
        {activeSection === 'storage' && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">التخزين والبيانات</h2>
            <ToggleSetting
              label="تحميل تلقائي"
              description="تحميل الحلقات الجديدة من البودكاست المتابعة تلقائياً"
              value={settings.autoDownload}
              onChange={(v) => update('autoDownload', v)}
            />
            <div className="pt-2 border-t dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">مسح البيانات المحلية</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { localStorage.removeItem('listen_history'); toast.info('تم مسح سجل الاستماع'); }}
                  className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                >
                  مسح سجل الاستماع
                </button>
                <button
                  onClick={() => { localStorage.removeItem('search_history'); toast.info('تم مسح سجل البحث'); }}
                  className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                >
                  مسح سجل البحث
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t dark:border-gray-700">
          <button onClick={handleSave} className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg text-sm transition-colors">
            حفظ الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({ label, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</p>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative ${
          value ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          value ? 'left-5' : 'left-0.5'
        }`} />
      </button>
    </div>
  );
}
