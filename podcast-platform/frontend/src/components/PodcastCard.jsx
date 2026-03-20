// ============================================
// بطاقة البودكاست | Podcast Card Component
// ============================================
import { Link } from 'react-router-dom';

export default function PodcastCard({ podcast }) {
  return (
    <Link
      to={`/podcast/${podcast.id}`}
      className="block bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
    >
      {/* صورة الغلاف | Cover Image */}
      <div className="aspect-square bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center">
        {podcast.cover_image_url ? (
          <img
            src={podcast.cover_image_url}
            alt={podcast.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg className="w-16 h-16 text-white opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM8 12a4 4 0 0 0 8 0h2a6 6 0 0 1-5 5.91V21h-2v-3.09A6 6 0 0 1 6 12h2z" />
          </svg>
        )}
      </div>

      {/* معلومات البودكاست | Podcast Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">
          {podcast.title}
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          {podcast.creator?.username || 'مذيع غير معروف'}
        </p>
        <p className="text-sm text-gray-600 line-clamp-2">
          {podcast.description || 'لا يوجد وصف'}
        </p>
        <div className="mt-3 flex items-center text-xs text-primary-600">
          <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          </svg>
          {podcast.episode_count || 0} حلقة
        </div>
      </div>
    </Link>
  );
}
