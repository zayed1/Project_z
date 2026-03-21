// ============================================
// صفحة المتابعات | My Follows Page
// ============================================
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { followsAPI } from '../utils/api';
import PodcastCard from '../components/PodcastCard';
import { PodcastCardSkeleton } from '../components/EnhancedSkeleton';

export default function FollowsPage() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    followsAPI.getMyFollows()
      .then(({ data }) => setPodcasts(data.podcasts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Helmet>
        <title>متابعاتي - منصة البودكاست</title>
      </Helmet>

      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">متابعاتي</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <PodcastCardSkeleton key={i} />)}
        </div>
      ) : podcasts.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <p className="text-lg">لا توجد متابعات بعد</p>
          <p className="text-sm mt-1">تابع بودكاست لتظهر هنا</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {podcasts.map((podcast) => (
            <PodcastCard key={podcast.id} podcast={podcast} />
          ))}
        </div>
      )}
    </div>
  );
}
