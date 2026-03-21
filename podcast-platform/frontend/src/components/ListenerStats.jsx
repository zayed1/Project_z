// ============================================
// إحصائيات المستمع | Listener Personal Stats
// ============================================
import { useState, useEffect } from 'react';

export default function ListenerStats() {
  const [stats, setStats] = useState({ totalTime: 0, episodesPlayed: 0, favorites: 0 });

  useEffect(() => {
    // جمع الإحصائيات من localStorage | Gather stats from localStorage
    const keys = Object.keys(localStorage);
    let totalTime = 0;
    let episodesPlayed = 0;

    keys.forEach((key) => {
      if (key.startsWith('pos_')) {
        const time = parseFloat(localStorage.getItem(key) || '0');
        if (time > 30) {
          totalTime += time;
          episodesPlayed++;
        }
      }
    });

    const listenLater = JSON.parse(localStorage.getItem('listen_later') || '[]');

    setStats({
      totalTime: Math.round(totalTime),
      episodesPlayed,
      favorites: listenLater.length,
    });
  }, []);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours} ساعة ${mins} دقيقة`;
    return `${mins} دقيقة`;
  };

  if (stats.episodesPlayed === 0) return null;

  return (
    <div className="bg-gradient-to-l from-primary-500 to-primary-700 text-white rounded-xl p-5 mb-8">
      <h3 className="font-bold mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        إحصائياتك
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold">{formatDuration(stats.totalTime)}</p>
          <p className="text-xs opacity-80 mt-1">وقت الاستماع</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{stats.episodesPlayed}</p>
          <p className="text-xs opacity-80 mt-1">حلقة استمعت إليها</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{stats.favorites}</p>
          <p className="text-xs opacity-80 mt-1">في قائمتك</p>
        </div>
      </div>
    </div>
  );
}
