// ============================================
// التقييم بالنجوم | Star Rating Component
// ============================================
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function StarRating({ episodeId }) {
  const { user } = useAuth();
  const toast = useToast();
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    api.get(`/episodes/${episodeId}/rating`, { params: { userId: user?.id } })
      .then(({ data }) => { setAvg(data.average); setCount(data.count); setUserRating(data.userRating); })
      .catch(() => {});
  }, [episodeId, user]);

  const handleRate = async (rating) => {
    if (!user) { toast.error('سجل دخولك للتقييم'); return; }
    try {
      const { data } = await api.post(`/episodes/${episodeId}/rate`, { rating });
      setAvg(data.average);
      setCount(data.count);
      setUserRating(data.userRating);
      toast.success('تم التقييم');
    } catch (err) {
      toast.error('فشل في التقييم');
    }
  };

  return (
    <div className="flex items-center gap-2" role="group" aria-label="تقييم الحلقة">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-0 border-0 bg-transparent cursor-pointer"
            aria-label={`${star} نجوم`}
          >
            <svg className={`w-4 h-4 transition-colors ${
              star <= (hover || userRating || 0) ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'
            }`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {avg > 0 ? `${avg}` : ''} {count > 0 ? `(${count})` : ''}
      </span>
    </div>
  );
}
