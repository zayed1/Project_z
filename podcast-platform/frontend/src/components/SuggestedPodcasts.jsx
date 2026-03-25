// ============================================
// بودكاست مقترحة | Suggested Podcasts
// ============================================
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function SuggestedPodcasts({ podcastId }) {
  const [suggested, setSuggested] = useState([]);

  useEffect(() => {
    if (!podcastId) return;
    api.get(`/discover/suggested/${podcastId}`)
      .then(({ data }) => setSuggested(data.podcasts || []))
      .catch(() => {});
  }, [podcastId]);

  if (suggested.length === 0) return null;

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">قد يعجبك أيضاً</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {suggested.map((p) => (
          <Link key={p.id} to={`/podcast/${p.id}`} className="group">
            <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-primary-400 to-primary-700 mb-2">
              {p.cover_image_url ? (
                <img src={p.cover_image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-white opacity-50" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate group-hover:text-primary-500 transition-colors">{p.title}</p>
            {p.category && <p className="text-xs text-gray-400">{p.category.name}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
