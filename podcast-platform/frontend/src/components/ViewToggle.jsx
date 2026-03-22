// ============================================
// تبديل العرض | Grid/List View Toggle Component
// ============================================
import { useState, useEffect } from 'react';

export default function ViewToggle({ onChange }) {
  const [view, setView] = useState(() => localStorage.getItem('view_mode') || 'grid');

  useEffect(() => {
    localStorage.setItem('view_mode', view);
    onChange?.(view);
  }, [view, onChange]);

  return (
    <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
      <button
        onClick={() => setView('grid')}
        className={`p-1.5 rounded transition-colors ${view === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        title="عرض شبكي"
        aria-label="عرض شبكي"
        aria-pressed={view === 'grid'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
      <button
        onClick={() => setView('list')}
        className={`p-1.5 rounded transition-colors ${view === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        title="عرض قائمة"
        aria-label="عرض قائمة"
        aria-pressed={view === 'list'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  );
}
