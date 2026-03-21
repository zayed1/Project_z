// ============================================
// الحلقات الأكثر استماعاً | Popular Episodes
// ============================================
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function PopularEpisodes() {
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    api.get('/discover/popular')
      .then(({ data }) => setEpisodes(data.episodes || []))
      .catch(() => {});
  }, []);

  if (episodes.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
        الأكثر استماعاً
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {episodes.slice(0, 6).map((ep, i) => (
          <Link
            key={ep.id}
            to={`/podcast/${ep.podcast?.id || ep.podcast_id}`}
            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-colors"
          >
            <span className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              {i + 1}
            </span>
            {ep.podcast?.cover_image_url && (
              <img src={ep.podcast.cover_image_url} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" loading="lazy" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{ep.title}</p>
              <p className="text-xs text-gray-400 truncate">{ep.podcast?.title}</p>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">{ep.listen_count} استماع</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
