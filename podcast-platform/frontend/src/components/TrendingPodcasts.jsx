// ============================================
// البودكاست الرائجة | Trending Podcasts
// ============================================
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function TrendingPodcasts() {
  const [podcasts, setPodcasts] = useState([]);

  useEffect(() => {
    api.get('/discover/trending')
      .then(({ data }) => setPodcasts(data.podcasts || []))
      .catch(() => {});
  }, []);

  if (podcasts.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
        </svg>
        الرائج هذا الأسبوع
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {podcasts.map((p) => (
          <Link key={p.id} to={`/podcast/${p.id}`} className="flex-shrink-0 w-36 group">
            <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-red-400 to-orange-500 mb-2 shadow-md">
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
