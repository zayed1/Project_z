// ============================================
// زر عائم للموبايل | Floating Action Button
// وصول سريع للبحث والقوائم
// ============================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FloatingActionButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      label: 'بحث',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
      onClick: () => { document.querySelector('input[type="search"], input[placeholder*="بحث"]')?.focus(); setOpen(false); },
    },
    {
      label: 'قوائم التشغيل',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />,
      onClick: () => { navigate('/playlists'); setOpen(false); },
    },
    {
      label: 'استمع لاحقاً',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />,
      onClick: () => { navigate('/listen-later'); setOpen(false); },
    },
  ];

  return (
    <div className="fixed bottom-20 left-4 z-40 md:hidden">
      {/* القائمة | Menu */}
      {open && (
        <div className="mb-3 space-y-2 animate-slide-down">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 shadow-lg rounded-full pl-4 pr-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span>{action.label}</span>
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {action.icon}
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* الزر الرئيسي | Main FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          open
            ? 'bg-gray-600 rotate-45'
            : 'bg-primary-500 hover:bg-primary-600'
        }`}
      >
        <svg className="w-6 h-6 text-white transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
