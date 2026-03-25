// ============================================
// صفحة سجل الاستماع | Listening History Page
// مع تأكيد الحذف + EmptyState + تحميل تدريجي
// ============================================
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePlayer } from '../context/PlayerContext';
import ExportListenHistory from '../components/ExportListenHistory';
import ListenStats from '../components/ListenStats';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';

const PAGE_SIZE = 20;

export default function HistoryPage() {
  const navigate = useNavigate();
  const { playEpisode } = usePlayer();
  const [history, setHistory] = useState([]);
  const [showCount, setShowCount] = useState(PAGE_SIZE);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  function loadHistory() {
    try {
      const raw = localStorage.getItem('listen_history');
      if (raw) {
        const parsed = JSON.parse(raw);
        setHistory(parsed.sort((a, b) => b.timestamp - a.timestamp));
      }
    } catch { setHistory([]); }
  }

  function clearHistory() {
    localStorage.removeItem('listen_history');
    setHistory([]);
    setConfirmClear(false);
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleDateString('ar', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function formatTime(seconds) {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const displayedHistory = useMemo(() => history.slice(0, showCount), [history, showCount]);
  const hasMore = showCount < history.length;

  return (
    <div>
      <Helmet>
        <title>سجل الاستماع - منصة البودكاست</title>
      </Helmet>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">سجل الاستماع</h1>
        <div className="flex items-center gap-3">
          {history.length > 0 && <ExportListenHistory />}
          {history.length > 0 && (
            <button
              onClick={() => setConfirmClear(true)}
              className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              مسح السجل
            </button>
          )}
        </div>
      </div>

      {/* تأكيد المسح | Confirm clear */}
      <ConfirmModal
        open={confirmClear}
        title="مسح سجل الاستماع"
        message="سيتم حذف جميع سجل الاستماع نهائياً. هل أنت متأكد؟"
        confirmText="مسح الكل"
        cancelText="إلغاء"
        danger
        onConfirm={clearHistory}
        onCancel={() => setConfirmClear(false)}
      />

      {/* إحصائيات الاستماع | Listen Stats */}
      {history.length > 0 && <ListenStats />}

      {history.length === 0 ? (
        <EmptyState
          icon="history"
          title="لا يوجد سجل استماع"
          message="ابدأ بالاستماع لتظهر الحلقات هنا"
          action={() => navigate('/')}
          actionLabel="تصفح البودكاست"
        />
      ) : (
        <>
          <div className="space-y-3">
            {displayedHistory.map((item, idx) => (
              <div key={`${item.episodeId}-${idx}`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                {/* Cover */}
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.coverUrl ? (
                    <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-6 h-6 text-white opacity-60" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 dark:text-gray-100 truncate">{item.episodeTitle}</h3>
                  <p className="text-sm text-primary-500 truncate">{item.podcastTitle}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span>{formatDate(item.timestamp)}</span>
                    {item.position > 0 && (
                      <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                        وصلت إلى {formatTime(item.position)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => playEpisode(item.episode, item.podcastTitle, [])}
                    className="p-2 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                    title="تشغيل"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </button>
                  {item.podcastId && (
                    <Link to={`/podcast/${item.podcastId}`}
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-primary-500 transition-colors"
                      title="عرض البودكاست"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* تحميل المزيد | Load more */}
          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowCount((prev) => prev + PAGE_SIZE)}
                className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-6 py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                عرض المزيد ({history.length - showCount} متبقية)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
