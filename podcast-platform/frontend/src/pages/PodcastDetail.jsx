// ============================================
// صفحة تفاصيل البودكاست | Podcast Detail Page
// ============================================
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { podcastsAPI } from '../utils/api';
import EpisodePlayer from '../components/EpisodePlayer';

export default function PodcastDetail() {
  const { id } = useParams();
  const [podcast, setPodcast] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPodcast() {
      try {
        const { data } = await podcastsAPI.getById(id);
        setPodcast(data.podcast);
      } catch {
        setError('فشل في تحميل البودكاست | Failed to load podcast');
      } finally {
        setLoading(false);
      }
    }
    fetchPodcast();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error || !podcast) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 text-lg">{error || 'البودكاست غير موجود'}</p>
        <Link to="/" className="text-primary-600 hover:underline mt-4 inline-block">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* معلومات البودكاست | Podcast Info */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="md:flex">
          {/* صورة الغلاف | Cover Image */}
          <div className="md:w-72 md:h-72 aspect-square bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center flex-shrink-0">
            {podcast.cover_image_url ? (
              <img
                src={podcast.cover_image_url}
                alt={podcast.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-24 h-24 text-white opacity-50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM8 12a4 4 0 0 0 8 0h2a6 6 0 0 1-5 5.91V21h-2v-3.09A6 6 0 0 1 6 12h2z" />
              </svg>
            )}
          </div>

          {/* التفاصيل | Details */}
          <div className="p-6 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{podcast.title}</h1>
            <p className="text-primary-600 font-medium mb-3">
              {podcast.creator?.username || 'مذيع غير معروف'}
            </p>
            <p className="text-gray-600 leading-relaxed">
              {podcast.description || 'لا يوجد وصف لهذا البودكاست'}
            </p>
            <p className="text-sm text-gray-400 mt-4">
              {podcast.episodes?.length || 0} حلقة
            </p>
          </div>
        </div>
      </div>

      {/* مشغل الحلقة المحددة | Selected Episode Player */}
      {selectedEpisode && <EpisodePlayer episode={selectedEpisode} />}

      {/* قائمة الحلقات | Episodes List */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">الحلقات</h2>

        {!podcast.episodes || podcast.episodes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">لا توجد حلقات بعد</p>
        ) : (
          <div className="space-y-3">
            {podcast.episodes.map((episode) => (
              <button
                key={episode.id}
                onClick={() => setSelectedEpisode(episode)}
                className={`w-full text-right p-4 rounded-lg border transition-colors ${
                  selectedEpisode?.id === episode.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedEpisode?.id === episode.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {selectedEpisode?.id === episode.id ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {episode.episode_number && `${episode.episode_number}. `}
                        {episode.title}
                      </h3>
                      {episode.description && (
                        <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                          {episode.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {episode.duration_seconds && (
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {Math.floor(episode.duration_seconds / 60)} دقيقة
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
