// ============================================
// مكون الاقتراحات الذكية | Smart Recommendations Component
// ============================================
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function SmartRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get('/me/recommendations')
      .then(({ data }) => setRecommendations(data.recommendations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || loading || recommendations.length === 0) return null;

  return (
    <section className="mt-8" aria-label="اقتراحات لك">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.5 3A6.5 6.5 0 0116 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 019.5 16 6.5 6.5 0 013 9.5 6.5 6.5 0 019.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z" />
        </svg>
        مقترح لك
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {recommendations.slice(0, 6).map((podcast) => (
          <Link
            key={podcast.id}
            to={`/podcast/${podcast.id}`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden group"
          >
            <div className="aspect-square bg-gradient-to-br from-primary-300 to-primary-700 relative">
              {podcast.cover_image_url ? (
                <img src={podcast.cover_image_url} alt={podcast.title} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-white opacity-40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            <div className="p-3">
              <h3 className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">{podcast.title}</h3>
              {podcast.category && (
                <span className="text-xs text-primary-500">{podcast.category.name}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
