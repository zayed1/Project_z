// ============================================
// بطاقة البودكاست المحسّنة | Enhanced Podcast Card Component
// مع hover effects + play overlay + انتقالات سلسة
// ============================================
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function PodcastCard({ podcast }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link
      to={`/podcast/${podcast.id}`}
      className="group block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
    >
      {/* صورة الغلاف مع Lazy Loading + Play Overlay */}
      <div className="aspect-square bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center relative overflow-hidden">
        {podcast.cover_image_url ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-gray-700" />
            )}
            <img
              src={podcast.cover_image_url}
              alt={podcast.title}
              className={`w-full h-full object-cover transition-all duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
            />
          </>
        ) : (
          <svg className="w-16 h-16 text-white opacity-50 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM8 12a4 4 0 0 0 8 0h2a6 6 0 0 1-5 5.91V21h-2v-3.09A6 6 0 0 1 6 12h2z" />
          </svg>
        )}

        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 shadow-lg">
            <svg className="w-6 h-6 text-primary-600 mr-[-2px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* عدد الحلقات badge | Episode count badge */}
        {podcast.episode_count > 0 && (
          <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
            {podcast.episode_count} حلقة
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {podcast.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          {podcast.creator?.username || 'غير معروف'}
        </p>
        {podcast.category && (
          <span className="inline-block text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full mb-2">
            {podcast.category.name}
          </span>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {podcast.description || 'لا يوجد وصف'}
        </p>
      </div>
    </Link>
  );
}
