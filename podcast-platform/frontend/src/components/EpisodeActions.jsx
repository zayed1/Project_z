// ============================================
// قائمة إجراءات الحلقة | Episode Actions Dropdown
// ينظم الأزرار الكثيرة في قائمة منسدلة
// ============================================
import { useState, useRef, useEffect } from 'react';

export default function EpisodeActions({ children, mainActions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      {/* الإجراءات الرئيسية تظهر دائماً | Main actions always visible */}
      {mainActions}

      {/* قائمة المزيد | More dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="المزيد"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>

        {open && (
          <div className="absolute top-full mt-1 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 py-2 z-20 min-w-[180px]">
            <div className="flex flex-wrap gap-1 px-3 py-1" onClick={() => setOpen(false)}>
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
