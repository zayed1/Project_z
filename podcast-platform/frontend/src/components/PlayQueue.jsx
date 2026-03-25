// ============================================
// قائمة الانتظار | Play Queue Component
// ============================================
import { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function PlayQueue() {
  const { playlist, playlistIndex, currentEpisode, playEpisode, podcastTitle } = usePlayer();
  const [open, setOpen] = useState(false);

  const queueItems = playlist.slice(playlistIndex + 1);
  const hasQueue = queueItems.length > 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`p-1.5 rounded-lg transition-colors relative ${open ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
        title="قائمة الانتظار"
        aria-label="قائمة الانتظار"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h7" />
        </svg>
        {hasQueue && (
          <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
            {queueItems.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 min-w-[280px] max-h-[300px] overflow-y-auto z-50">
          <div className="p-3 border-b dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">قائمة الانتظار</h3>
          </div>

          {/* الحلقة الحالية | Now playing */}
          {currentEpisode && (
            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 border-b dark:border-gray-700">
              <p className="text-[10px] text-primary-500 font-medium">يتم التشغيل الآن</p>
              <p className="text-sm text-gray-800 dark:text-gray-100 truncate">{currentEpisode.title}</p>
            </div>
          )}

          {/* القائمة | Queue list */}
          {queueItems.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              لا توجد حلقات في الانتظار
            </div>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {queueItems.map((ep, i) => (
                <button
                  key={ep.id || i}
                  onClick={() => { playEpisode(ep, podcastTitle, playlist); setOpen(false); }}
                  className="w-full text-right p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <span className="text-xs text-gray-400 min-w-[16px]">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-100 truncate">{ep.title}</p>
                    {ep.duration && (
                      <p className="text-[10px] text-gray-400">{Math.floor(ep.duration / 60)} دقيقة</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
