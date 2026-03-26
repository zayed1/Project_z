// ============================================
// صفحة استمع لاحقاً المحسّنة | Enhanced Listen Later Page
// مع فرز + تحديد متعدد + حذف جماعي
// ============================================
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getListenLater, removeFromListenLater } from '../utils/listenLater';
import { usePlayer } from '../context/PlayerContext';
import { useToast } from '../context/ToastContext';
import { podcastsAPI } from '../utils/api';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import SwipeableCard from '../components/SwipeableCard';

export default function ListenLaterPage() {
  const { playEpisode, currentEpisode, isPlaying } = usePlayer();
  const toast = useToast();
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('added');
  const [selected, setSelected] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    async function load() {
      const saved = getListenLater();
      if (saved.length === 0) { setLoading(false); return; }

      const podcastIds = [...new Set(saved.map((s) => s.podcast_id).filter(Boolean))];
      const allEpisodes = [];

      for (const pid of podcastIds) {
        try {
          const { data } = await podcastsAPI.getById(pid);
          const podcast = data.podcast;
          const eps = (podcast.episodes || [])
            .filter((ep) => saved.some((s) => s.id === ep.id))
            .map((ep) => {
              const savedItem = saved.find((s) => s.id === ep.id);
              return { ...ep, podcastTitle: podcast.title, podcastId: podcast.id, addedAt: savedItem?.addedAt || Date.now() };
            });
          allEpisodes.push(...eps);
        } catch {}
      }

      const found = new Set(allEpisodes.map((e) => e.id));
      const orphans = saved
        .filter((s) => !found.has(s.id))
        .map((s) => ({ id: s.id, title: s.title, orphan: true, addedAt: s.addedAt || Date.now() }));

      setEpisodes([...allEpisodes, ...orphans]);
      setLoading(false);
    }
    load();
  }, []);

  const sorted = useMemo(() => {
    const list = [...episodes];
    if (sortBy === 'added') list.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    else if (sortBy === 'title') list.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'ar'));
    else if (sortBy === 'podcast') list.sort((a, b) => (a.podcastTitle || '').localeCompare(b.podcastTitle || '', 'ar'));
    return list;
  }, [episodes, sortBy]);

  const handleRemove = (episodeId) => {
    removeFromListenLater(episodeId);
    setEpisodes((prev) => prev.filter((e) => e.id !== episodeId));
    setSelected((prev) => { const s = new Set(prev); s.delete(episodeId); return s; });
    toast.info('تم إزالة الحلقة');
  };

  const handleBulkDelete = () => {
    selected.forEach((id) => removeFromListenLater(id));
    setEpisodes((prev) => prev.filter((e) => !selected.has(e.id)));
    setSelected(new Set());
    setSelectMode(false);
    setShowConfirm(false);
    toast.success(`تم حذف ${selected.size} حلقة`);
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  };

  const selectAll = () => {
    if (selected.size === episodes.length) setSelected(new Set());
    else setSelected(new Set(episodes.map((e) => e.id)));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Helmet><title>استمع لاحقاً - منصة البودكاست</title></Helmet>

      {/* العنوان + أدوات التحكم | Header + Controls */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">استمع لاحقاً</h1>
          {episodes.length > 0 && (
            <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">
              {episodes.length}
            </span>
          )}
        </div>

        {episodes.length > 0 && (
          <div className="flex items-center gap-2">
            {/* فرز | Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
            >
              <option value="added">الأحدث إضافة</option>
              <option value="title">العنوان</option>
              <option value="podcast">البودكاست</option>
            </select>

            {/* تحديد | Select mode */}
            <button
              onClick={() => { setSelectMode(!selectMode); setSelected(new Set()); }}
              className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                selectMode ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {selectMode ? 'إلغاء' : 'تحديد'}
            </button>
          </div>
        )}
      </div>

      {/* شريط التحديد الجماعي | Bulk actions bar */}
      {selectMode && selected.size > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-3 mb-4 flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2">
            <button onClick={selectAll} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
              {selected.size === episodes.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
            </button>
            <span className="text-xs text-gray-500">({selected.size} محدد)</span>
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            حذف ({selected.size})
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : episodes.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title="لا توجد حلقات محفوظة"
          message="اضغط على أيقونة الإشارة المرجعية في أي حلقة لحفظها هنا"
          action={() => window.location.href = '/'}
          actionLabel="تصفح البودكاست"
        />
      ) : (
        <div className="space-y-2">
          {sorted.map((ep) => {
            const active = currentEpisode?.id === ep.id;
            const isSelected = selected.has(ep.id);
            return (
              <SwipeableCard
                key={ep.id}
                onSwipeLeft={() => handleRemove(ep.id)}
                leftLabel="إزالة"
                disabled={selectMode}
              >
                <div className={`p-4 flex items-center gap-3 rounded-xl transition-colors ${
                  isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}>
                  {selectMode && (
                    <button onClick={() => toggleSelect(ep.id)} className="flex-shrink-0">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-primary-500 border-primary-500' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                      </div>
                    </button>
                  )}

                  {!ep.orphan && !selectMode && (
                    <button
                      onClick={() => playEpisode(ep, ep.podcastTitle || '')}
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        active ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-primary-100 dark:hover:bg-primary-900/30'
                      }`}
                    >
                      {active && isPlaying ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      )}
                    </button>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-800 dark:text-gray-100 truncate text-sm">{ep.title}</h3>
                    {ep.podcastTitle && (
                      <Link to={`/podcast/${ep.podcastId}`} className="text-xs text-primary-500 hover:underline">{ep.podcastTitle}</Link>
                    )}
                  </div>

                  {!selectMode && (
                    <button
                      onClick={() => handleRemove(ep.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                      title="إزالة"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </SwipeableCard>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleBulkDelete}
        title="حذف الحلقات المحددة"
        message={`هل تريد حذف ${selected.size} حلقة من القائمة؟`}
        type="danger"
      />
    </div>
  );
}
