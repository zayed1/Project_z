// ============================================
// تفريغ نصي | Transcript Component
// ============================================
import { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function Transcript({ episodeId, transcript }) {
  const { currentEpisode, seekTo, currentTime } = usePlayer();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isActive = currentEpisode?.id === episodeId;

  // التفريغ النصي يأتي كمصفوفة من الأجزاء | Transcript as segments
  // [{start: 0, end: 10, text: "..."}, ...]
  const segments = transcript || [];

  if (segments.length === 0) return null;

  const filtered = searchTerm
    ? segments.filter((s) => s.text.includes(searchTerm))
    : segments;

  const currentSegment = isActive
    ? segments.findIndex((s) => currentTime >= s.start && currentTime < s.end)
    : -1;

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div className="mt-3">
      <button onClick={() => setOpen(!open)}
        className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {open ? 'إخفاء التفريغ النصي' : 'عرض التفريغ النصي'}
      </button>

      {open && (
        <div className="mt-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
          {/* بحث في النص | Search */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none focus:ring-1 focus:ring-primary-300 mb-2"
            placeholder="بحث في النص..."
          />

          <div className="max-h-[250px] overflow-y-auto space-y-0.5">
            {filtered.map((seg, i) => {
              const idx = segments.indexOf(seg);
              return (
                <div
                  key={i}
                  onClick={() => isActive && seekTo(seg.start)}
                  className={`flex gap-2 p-1.5 rounded cursor-pointer transition-colors text-sm ${
                    idx === currentSegment && isActive
                      ? 'bg-primary-100 dark:bg-primary-900/30'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xs text-gray-400 font-mono min-w-[36px] mt-0.5" dir="ltr">
                    {fmt(seg.start)}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {searchTerm ? (
                      seg.text.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, j) =>
                        part.toLowerCase() === searchTerm.toLowerCase()
                          ? <mark key={j} className="bg-amber-200 dark:bg-amber-800 rounded px-0.5">{part}</mark>
                          : part
                      )
                    ) : seg.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
