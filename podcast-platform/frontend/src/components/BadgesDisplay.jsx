// ============================================
// عرض الشارات | Badges Display
// ============================================
import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function BadgesDisplay() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    api.get('/me/badges')
      .then(({ data }) => setBadges(data.badges || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || badges.length === 0) return null;

  const earned = badges.filter((b) => b.earned);
  if (earned.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
        <span>🏆</span>
        إنجازاتك
      </h3>
      <div className="flex flex-wrap gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
              badge.earned
                ? 'bg-white dark:bg-gray-800 border-primary-200 dark:border-primary-800 shadow-sm'
                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-40'
            }`}
            title={badge.description}
          >
            <span className="text-xl">{badge.icon}</span>
            <div>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-100">{badge.name}</p>
              <p className="text-[10px] text-gray-400">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
