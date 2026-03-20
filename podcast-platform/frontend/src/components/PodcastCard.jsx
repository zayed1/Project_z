// ============================================
// بطاقة البودكاست | Podcast Card Component
// ============================================
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function PodcastCard({ podcast }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link
      to={`/podcast/${podcast.id}`}
      className="block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
    >
      {/* صورة الغلاف مع Lazy Loading */}
      <div className="aspect-square bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center relative">
        {podcast.cover_image_url ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-gray-700" />
            )}
            <img
              src={podcast.cover_image_url}
              alt={podcast.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
            />
          </>
        ) : (
          <svg className="w-16 h-16 text-white opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM8 12a4 4 0 0 0 8 0h2a6 6 0 0 1-5 5.91V21h-2v-3.09A6 6 0 0 1 6 12h2z" />
          </svg>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1 line-clamp-1">
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
        <div className="mt-3 text-xs text-primary-600 dark:text-primary-400">
          {podcast.episode_count || 0} حلقة
        </div>
      </div>
    </Link>
  );
}
