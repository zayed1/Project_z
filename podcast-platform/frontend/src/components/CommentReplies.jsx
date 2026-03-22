// ============================================
// مكون الردود المتداخلة | Nested Replies Component
// ============================================
import { useState } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function CommentReplies({ commentId }) {
  const toast = useToast();
  const [replies, setReplies] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyInput, setReplyInput] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function loadReplies() {
    try {
      const { data } = await api.get(`/comments/${commentId}/replies`);
      setReplies(data.replies || []);
      setLoaded(true);
    } catch {}
  }

  function toggleReplies() {
    if (!loaded) loadReplies();
    setShowReplies(!showReplies);
  }

  async function submitReply() {
    const text = replyInput.trim();
    if (!text) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/comments/${commentId}/replies`, { content: text });
      setReplies((prev) => [...prev, data.reply]);
      setReplyInput('');
      setShowReplyForm(false);
      if (!showReplies) setShowReplies(true);
      toast.success('تم إضافة الرد');
    } catch {
      toast.error('يجب تسجيل الدخول للرد');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-1">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleReplies}
          className="text-xs text-primary-500 hover:underline"
        >
          {showReplies ? 'إخفاء الردود' : `الردود${loaded && replies.length > 0 ? ` (${replies.length})` : ''}`}
        </button>
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-xs text-gray-400 hover:text-primary-500"
        >
          رد
        </button>
      </div>

      {/* نموذج الرد | Reply Form */}
      {showReplyForm && (
        <div className="flex gap-2 mt-2 mr-9">
          <input
            type="text"
            placeholder="اكتب رداً..."
            value={replyInput}
            onChange={(e) => setReplyInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitReply()}
            className="flex-1 px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            onClick={submitReply}
            disabled={submitting}
            className="bg-primary-500 hover:bg-primary-600 text-white px-2 py-1 rounded-lg text-xs disabled:opacity-50"
          >
            إرسال
          </button>
        </div>
      )}

      {/* قائمة الردود | Replies List */}
      {showReplies && replies.length > 0 && (
        <div className="mr-9 mt-2 space-y-2 border-r-2 border-primary-200 dark:border-primary-800 pr-3">
          {replies.map((r) => (
            <div key={r.id} className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-primary-50 dark:bg-primary-900/50 flex items-center justify-center text-xs font-bold text-primary-500 flex-shrink-0">
                {(r.user?.username || '?')[0]}
              </div>
              <div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{r.user?.username || 'مجهول'}</span>
                <p className="text-xs text-gray-600 dark:text-gray-400">{r.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
