// ============================================
// ثيمات موسمية | Seasonal Theme Component
// ============================================
import { useState, useEffect } from 'react';

const THEMES = {
  default: { name: 'افتراضي', accent: '#6366f1', bg: '', icon: '' },
  ramadan: { name: 'رمضان', accent: '#d4a017', bg: 'bg-gradient-to-b from-amber-50/30 to-transparent dark:from-amber-900/10', icon: '🌙' },
  national: { name: 'وطني', accent: '#16a34a', bg: 'bg-gradient-to-b from-green-50/30 to-transparent dark:from-green-900/10', icon: '🏳️' },
  winter: { name: 'شتوي', accent: '#0ea5e9', bg: 'bg-gradient-to-b from-sky-50/30 to-transparent dark:from-sky-900/10', icon: '❄️' },
  summer: { name: 'صيفي', accent: '#f59e0b', bg: 'bg-gradient-to-b from-amber-50/30 to-transparent dark:from-orange-900/10', icon: '☀️' },
};

export default function SeasonalTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('seasonal_theme') || 'default');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('seasonal_theme', theme);

    // تطبيق الثيم | Apply theme
    const root = document.documentElement;
    const t = THEMES[theme];
    if (t?.accent && theme !== 'default') {
      root.style.setProperty('--seasonal-accent', t.accent);
    } else {
      root.style.removeProperty('--seasonal-accent');
    }

    // إضافة/إزالة الخلفية | Add/remove bg class
    const body = document.body;
    Object.values(THEMES).forEach((th) => {
      if (th.bg) th.bg.split(' ').forEach((cls) => body.classList.remove(cls));
    });
    if (t?.bg) t.bg.split(' ').forEach((cls) => body.classList.add(cls));
  }, [theme]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        title="الثيم الموسمي"
        aria-label="تغيير الثيم الموسمي"
      >
        <span className="text-sm">{THEMES[theme]?.icon || '🎨'}</span>
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 py-1 min-w-[140px] z-50">
          {Object.entries(THEMES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => { setTheme(key); setOpen(false); }}
              className={`w-full text-right px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                theme === key ? 'text-primary-500 font-medium' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{t.icon || '⚪'}</span>
              <span>{t.name}</span>
              {theme === key && <span className="mr-auto text-primary-500">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
