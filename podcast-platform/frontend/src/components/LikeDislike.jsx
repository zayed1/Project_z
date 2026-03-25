// ============================================
// أزرار الإعجاب وعدم الإعجاب | Like/Dislike Buttons
// ============================================
import { useState, useEffect } from 'react';
import api from '../utils/api';
import ConfettiEffect from './ConfettiEffect';

export default function LikeDislike({ episodeId }) {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userLike, setUserLike] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    api.get(`/episodes/${episodeId}/likes`)
      .then(({ data }) => {
        setLikes(data.likes || 0);
        setDislikes(data.dislikes || 0);
        setUserLike(data.userLike || null);
      })
      .catch(() => {});
  }, [episodeId]);

  const handleLike = async (type) => {
    try {
      if (userLike === type) {
        const { data } = await api.delete(`/episodes/${episodeId}/like`);
        setLikes(data.likes || 0);
        setDislikes(data.dislikes || 0);
        setUserLike(null);
      } else {
        const { data } = await api.post(`/episodes/${episodeId}/like`, { type });
        setLikes(data.likes || 0);
        setDislikes(data.dislikes || 0);
        setUserLike(type);
        if (type === 'like') {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2500);
        }
      }
    } catch {
      // يحتاج تسجيل دخول
    }
  };

  return (
    <>
      <ConfettiEffect active={showConfetti} />
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleLike('like')}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
            userLike === 'like'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : 'text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
          }`}
        >
          <svg className="w-4 h-4" fill={userLike === 'like' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z M3 15v4a2 2 0 002 2h1V13H5a2 2 0 00-2 2z" />
          </svg>
          {likes > 0 && <span>{likes}</span>}
        </button>
        <button
          onClick={() => handleLike('dislike')}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
            userLike === 'dislike'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
          }`}
        >
          <svg className="w-4 h-4 rotate-180" fill={userLike === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z M3 15v4a2 2 0 002 2h1V13H5a2 2 0 00-2 2z" />
          </svg>
          {dislikes > 0 && <span>{dislikes}</span>}
        </button>
      </div>
    </>
  );
}
