// ============================================
// التعليقات الموقّتة | Timed Comments Component
// ============================================
import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function TimedComments({ episodeId }) {
  const { user } = useAuth();
  const toast = useToast();
  const { currentEpisode, currentTime, seekTo } = usePlayer();
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState('');
  const [showAll, setShowAll] = useState(false);
  const listRef = useRef(null);

  const isActive = currentEpisode?.id === episodeId;

  useEffect(() => {
    api.get(`/episodes/${episodeId}/timed-comments`)
      .then(({ data }) => setComments(data.comments || []))
      .catch(() => {});
  }, [episodeId]);

  // التعليق الحالي حسب الوقت | Current comment based on time
  const currentComments = isActive
    ? comments.filter((c) => Math.abs(c.timestamp - currentTime) < 3)
    : [];

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  const handleSubmit = async () => {
    if (!user) { toast.error('سجل دخولك'); return; }
    if (!input.trim() || !isActive) return;

    try {
      const { data } = await api.post('/timed-comments', {
        episode_id: episodeId,
        content: input.trim(),
        timestamp: currentTime,
      });
      setComments([...comments, data.comment].sort((a, b) => a.timestamp - b.timestamp));
      setInput('');
      toast.success(`تعليق عند ${fmt(currentTime)}`);
    } catch {
      toast.error('فشل');
    }
  };

  return (
    <div className="mt-3">
      {/* التعليق المباشر | Live comment bubble */}
      {currentComments.length > 0 && (
        <div className="mb-2 space-y-1">
          {currentComments.map((c) => (
            <div key={c.id} className="bg-primary-50 dark:bg-primary-900/20 rounded-lg px-3 py-1.5 text-sm animate-in fade-in duration-300">
              <span className="font-medium text-primary-600 dark:text-primary-400 text-xs">{c.user?.username}</span>
              <span className="text-gray-600 dark:text-gray-300 mr-2">{c.content}</span>
            </div>
          ))}
        </div>
      )}

      {/* إضافة تعليق | Add comment */}
      {isActive && user && (
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="flex-1 px-3 py-1.5 text-sm border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none focus:ring-1 focus:ring-primary-300"
            placeholder={`تعليق عند ${fmt(currentTime)}...`}
          />
          <button onClick={handleSubmit}
            className="bg-primary-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-600">
            إرسال
          </button>
        </div>
      )}

      {/* كل التعليقات | All comments */}
      <button onClick={() => setShowAll(!showAll)}
        className="text-xs text-primary-500 hover:text-primary-600 mb-1">
        {showAll ? 'إخفاء التعليقات الموقّتة' : `عرض ${comments.length} تعليق موقّت`}
      </button>

      {showAll && (
        <div ref={listRef} className="max-h-[200px] overflow-y-auto space-y-1">
          {comments.map((c) => (
            <div key={c.id}
              className={`flex items-start gap-2 p-1.5 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-sm ${
                isActive && Math.abs(c.timestamp - currentTime) < 3 ? 'bg-primary-50 dark:bg-primary-900/20' : ''
              }`}
              onClick={() => isActive && seekTo(c.timestamp)}
            >
              <span className="text-xs text-primary-500 font-mono min-w-[36px]" dir="ltr">{fmt(c.timestamp)}</span>
              <span className="text-xs font-medium text-gray-500">{c.user?.username}:</span>
              <span className="text-gray-700 dark:text-gray-300 flex-1">{c.content}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
