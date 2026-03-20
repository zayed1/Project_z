// ============================================
// صفحة تفاصيل البودكاست | Podcast Detail Page
// ============================================
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { podcastsAPI } from '../utils/api';
import { usePlayer } from '../context/PlayerContext';
import { isInListenLater, addToListenLater, removeFromListenLater } from '../utils/listenLater';

export default function PodcastDetail() {
  const { id } = useParams();
  const { playEpisode, currentEpisode, isPlaying } = usePlayer();
  const [podcast, setPodcast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [listenLaterIds, setListenLaterIds] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await podcastsAPI.getById(id);
        setPodcast(data.podcast);
        // تحميل قائمة استمع لاحقاً | Load listen later state
        const saved = (data.podcast.episodes || [])
          .filter((ep) => isInListenLater(ep.id))
          .map((ep) => ep.id);
        setListenLaterIds(new Set(saved));
      } catch {
        setError('فشل في تحميل البودكاست');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  const toggleListenLater = (episode) => {
    if (listenLaterIds.has(episode.id)) {
      removeFromListenLater(episode.id);
      setListenLaterIds((prev) => { const s = new Set(prev); s.delete(episode.id); return s; });
    } else {
      addToListenLater(episode);
      setListenLaterIds((prev) => new Set(prev).add(episode.id));
    }
  };

  const shareEpisode = (episode) => {
    const url = `${window.location.origin}/podcast/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(episode.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
        <Link to="/" className="text-primary-600 hover:underline mt-4 inline-block">العودة للرئيسية</Link>
      </div>
    );
  }

  // ترتيب الحلقات | Sort episodes
  const sortedEpisodes = [...(podcast.episodes || [])].sort((a, b) => {
    const diff = (a.episode_number || 0) - (b.episode_number || 0);
    return sortAsc ? diff : -diff;
  });

  const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
  const rssUrl = `${apiBase}/rss/${podcast.id}`;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <Helmet>
        <title>{podcast.title} - منصة البودكاست</title>
        <meta name="description" content={podcast.description || podcast.title} />
        <meta property="og:title" content={podcast.title} />
        <meta property="og:description" content={podcast.description || ''} />
        {podcast.cover_image_url && <meta property="og:image" content={podcast.cover_image_url} />}
      </Helmet>

      {/* معلومات البودكاست | Podcast Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-72 md:h-72 aspect-square bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center flex-shrink-0">
            {podcast.cover_image_url ? (
              <img src={podcast.cover_image_url} alt={podcast.title} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-24 h-24 text-white opacity-50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM8 12a4 4 0 0 0 8 0h2a6 6 0 0 1-5 5.91V21h-2v-3.09A6 6 0 0 1 6 12h2z" />
              </svg>
            )}
          </div>
          <div className="p-6 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{podcast.title}</h1>
            <p className="text-primary-600 dark:text-primary-400 font-medium mb-1">
              {podcast.creator?.username || 'غير معروف'}
            </p>
            {podcast.category && (
              <span className="inline-block text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full mb-3 w-fit">
                {podcast.category.name}
              </span>
            )}
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {podcast.description || 'لا يوجد وصف'}
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
              <span>{podcast.episodes?.length || 0} حلقة</span>
              <a
                href={rssUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-600 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/></svg>
                RSS
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* قائمة الحلقات | Episodes List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">الحلقات</h2>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 flex items-center gap-1"
          >
            {sortAsc ? 'الأقدم أولاً' : 'الأحدث أولاً'}
            <svg className={`w-4 h-4 transition-transform ${sortAsc ? '' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </button>
        </div>

        {sortedEpisodes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">لا توجد حلقات بعد</p>
        ) : (
          <div className="space-y-2">
            {sortedEpisodes.map((episode) => {
              const active = currentEpisode?.id === episode.id;
              return (
                <div
                  key={episode.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    active
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => playEpisode(episode, podcast.title)}
                      className="flex items-center gap-3 flex-1 text-right min-w-0"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        active ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                      }`}>
                        {active && isPlaying ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-800 dark:text-gray-100 truncate">
                          {episode.episode_number && `${episode.episode_number}. `}{episode.title}
                        </h3>
                        {episode.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{episode.description}</p>
                        )}
                      </div>
                    </button>

                    {/* أزرار | Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {episode.listen_count > 0 && (
                        <span className="text-xs text-gray-400">{episode.listen_count} استماع</span>
                      )}
                      {episode.duration_seconds && (
                        <span className="text-xs text-gray-400">{Math.floor(episode.duration_seconds / 60)}د</span>
                      )}

                      {/* استمع لاحقاً | Listen Later */}
                      <button
                        onClick={() => toggleListenLater(episode)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          listenLaterIds.has(episode.id)
                            ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/30'
                            : 'text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={listenLaterIds.has(episode.id) ? 'إزالة من القائمة' : 'استمع لاحقاً'}
                      >
                        <svg className="w-4 h-4" fill={listenLaterIds.has(episode.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>

                      {/* مشاركة | Share */}
                      <button
                        onClick={() => shareEpisode(episode)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="نسخ الرابط"
                      >
                        {copiedId === episode.id ? (
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
