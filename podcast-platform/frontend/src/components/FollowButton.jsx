// ============================================
// زر المتابعة | Follow Button
// ============================================
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function FollowButton({ podcastId }) {
  const [following, setFollowing] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get(`/podcasts/${podcastId}/followers/count`)
      .then(({ data }) => setCount(data.count || 0))
      .catch(() => {});

    const token = localStorage.getItem('token');
    if (token) {
      api.get(`/podcasts/${podcastId}/follow/check`)
        .then(({ data }) => setFollowing(data.following))
        .catch(() => {});
    }
  }, [podcastId]);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/podcasts/${podcastId}/follow`);
      setFollowing(data.following);
      setCount((prev) => data.following ? prev + 1 : Math.max(0, prev - 1));
      toast.success(data.message);
    } catch {
      toast.error('يجب تسجيل الدخول للمتابعة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
        following
          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      <svg className="w-4 h-4" fill={following ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d={following ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} />
      </svg>
      {following ? 'متابَع' : 'متابعة'}
      {count > 0 && <span className="text-xs opacity-70">({count})</span>}
    </button>
  );
}
