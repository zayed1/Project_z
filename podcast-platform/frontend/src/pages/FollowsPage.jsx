// ============================================
// صفحة المتابعات | My Follows Page
// ============================================
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { followsAPI } from '../utils/api';
import PodcastCard from '../components/PodcastCard';
import { PodcastCardSkeleton } from '../components/EnhancedSkeleton';
import EmptyState from '../components/EmptyState';

export default function FollowsPage() {
  const navigate = useNavigate();
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
        <EmptyState
          icon="heart"
          title="لا توجد متابعات بعد"
          message="تابع بودكاست مفضلة لتظهر هنا واحصل على إشعارات بالحلقات الجديدة"
          action={() => navigate('/')}
          actionLabel="اكتشف بودكاست"
        />
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
