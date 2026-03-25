// ============================================
// صفحة استمع لاحقاً | Listen Later Page
// ============================================
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getListenLater, removeFromListenLater } from '../utils/listenLater';
import { usePlayer } from '../context/PlayerContext';
import { podcastsAPI } from '../utils/api';

export default function ListenLaterPage() {
  const { playEpisode, currentEpisode, isPlaying } = usePlayer();
  const [items, setItems] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const saved = getListenLater();
      setItems(saved);

      if (saved.length === 0) { setLoading(false); return; }

      // جلب بيانات الحلقات الكاملة | Fetch full episode data
      const podcastIds = [...new Set(saved.map((s) => s.podcast_id).filter(Boolean))];
      const allEpisodes = [];

      for (const pid of podcastIds) {
        try {
          const { data } = await podcastsAPI.getById(pid);
          const podcast = data.podcast;
          const eps = (podcast.episodes || [])
            .filter((ep) => saved.some((s) => s.id === ep.id))
            .map((ep) => ({ ...ep, podcastTitle: podcast.title, podcastId: podcast.id }));
          allEpisodes.push(...eps);
        } catch { /* skip */ }
      }

      // للحلقات بدون podcast_id، عرض البيانات المحفوظة فقط
      const found = new Set(allEpisodes.map((e) => e.id));
      const orphans = saved
        .filter((s) => !found.has(s.id))
        .map((s) => ({ id: s.id, title: s.title, orphan: true }));

      setEpisodes([...allEpisodes, ...orphans]);
      setLoading(false);
    }
    load();
  }, []);

  const handleRemove = (episodeId) => {
    removeFromListenLater(episodeId);
    setEpisodes((prev) => prev.filter((e) => e.id !== episodeId));
    setItems((prev) => prev.filter((i) => i.id !== episodeId));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Helmet><title>استمع لاحقاً - منصة البودكاست</title></Helmet>

      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">استمع لاحقاً</h1>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" /></div>
      ) : episodes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">لا توجد حلقات محفوظة</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">اضغط على أيقونة الإشارة المرجعية في أي حلقة لحفظها هنا</p>
          <Link to="/" className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors">
            تصفح البودكاست
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg divide-y divide-gray-100 dark:divide-gray-700">
          {episodes.map((ep) => {
            const active = currentEpisode?.id === ep.id;
            return (
              <div key={ep.id} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {!ep.orphan && (
                    <button
                      onClick={() => playEpisode(ep, ep.podcastTitle || '')}
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        active ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                      }`}
                    >
                      {active && isPlaying ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      )}
                    </button>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-800 dark:text-gray-100 truncate">{ep.title}</h3>
                    {ep.podcastTitle && (
                      <Link to={`/podcast/${ep.podcastId}`} className="text-sm text-primary-500 hover:underline">{ep.podcastTitle}</Link>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(ep.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                  title="إزالة"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
