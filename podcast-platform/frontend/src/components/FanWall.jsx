import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

/**
 * FanWall - جدار المعجبين | Fan Wall Component
 * جدار رسائل المعجبين لبودكاست معين
 * Fan message wall for a specific podcast
 */
const FanWall = ({ podcastId }) => {
  // رسائل الجدار | Wall messages
  const [messages, setMessages] = useState([]);
  // رسالة جديدة | New message input
  const [newMessage, setNewMessage] = useState('');
  // حالة التحميل | Loading state
  const [loading, setLoading] = useState(true);
  // حالة الإرسال | Sending state
  const [sending, setSending] = useState(false);
  // رسالة الخطأ | Error message
  const [error, setError] = useState('');
  // معرّف المستخدم الحالي (محاكاة) | Current user ID (simulated)
  const [currentUserId] = useState('current-user');

  // الحد الأقصى للأحرف | Character limit
  const MAX_CHARS = 280;

  /**
   * جلب رسائل الجدار | Fetch wall messages
   */
  const fetchMessages = useCallback(async () => {
    if (!podcastId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/podcasts/${podcastId}/fan-wall`);
      setMessages(res.data || []);
    } catch {
      setError('فشل تحميل الرسائل | Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [podcastId]);

  // جلب الرسائل عند التحميل | Fetch messages on mount
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  /**
   * إرسال رسالة جديدة | Post new message
   */
  const handlePostMessage = async (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_CHARS) {
      setError(`الرسالة تتجاوز الحد الأقصى (${MAX_CHARS} حرف) | Message exceeds limit (${MAX_CHARS} chars)`);
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await api.post(`/api/podcasts/${podcastId}/fan-wall`, {
        content: trimmed,
      });
      // إضافة الرسالة الجديدة في أعلى القائمة | Add new message at the top
      setMessages((prev) => [res.data || {
        id: Date.now(),
        content: trimmed,
        userName: 'أنت | You',
        userId: currentUserId,
        createdAt: new Date().toISOString(),
      }, ...prev]);
      setNewMessage('');
    } catch {
      setError('فشل إرسال الرسالة | Failed to post message');
    } finally {
      setSending(false);
    }
  };

  /**
   * حذف رسالة خاصة بالمستخدم | Delete own message
   */
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('هل تريد حذف هذه الرسالة؟ | Delete this message?')) return;
    try {
      await api.delete(`/api/podcasts/${podcastId}/fan-wall/${messageId}`);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch {
      setError('فشل حذف الرسالة | Failed to delete message');
    }
  };

  /**
   * الأحرف المتبقية | Remaining characters
   */
  const remainingChars = MAX_CHARS - newMessage.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div dir="rtl" className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      {/* رأس المكون | Component header */}
      <div className="bg-gradient-to-l from-amber-500 to-orange-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">
          جدار المعجبين | Fan Wall
        </h2>
        <p className="text-amber-200 text-sm mt-1">
          شارك رأيك مع المستمعين الآخرين | Share your thoughts with other listeners
        </p>
      </div>

      <div className="p-6">
        {/* نموذج الرسالة الجديدة | New message form */}
        <form onSubmit={handlePostMessage} className="mb-6">
          <div className="relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="اكتب رسالتك على الجدار... | Write on the wall..."
              rows={3}
              maxLength={MAX_CHARS + 10} // سماح طفيف فوق الحد | Slight allowance over limit
              className={`w-full px-4 py-3 border rounded-xl resize-none
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         placeholder-gray-400 dark:placeholder-gray-500
                         focus:ring-2 focus:border-transparent transition-colors
                         ${isOverLimit
                           ? 'border-red-500 focus:ring-red-500'
                           : 'border-gray-300 dark:border-gray-600 focus:ring-amber-500'}`}
            />
            {/* عداد الأحرف | Character counter */}
            <div className={`absolute bottom-3 left-3 text-xs font-medium
                            ${isOverLimit ? 'text-red-500' : remainingChars < 30 ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'}`}>
              {remainingChars}
            </div>
          </div>
          <button
            type="submit"
            disabled={sending || !newMessage.trim() || isOverLimit}
            className="mt-3 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium
                       rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {sending ? 'جاري النشر... | Posting...' : 'نشر الرسالة | Post Message'}
          </button>
        </form>

        {/* رسالة الخطأ | Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800
                          text-red-700 dark:text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
            <button onClick={() => setError('')} className="float-left font-bold">×</button>
          </div>
        )}

        {/* حالة التحميل | Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          /* لا توجد رسائل | No messages */
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg">لا توجد رسائل بعد. كن أول من يكتب!</p>
            <p className="text-sm mt-1">No messages yet. Be the first to write!</p>
          </div>
        ) : (
          /* قائمة الرسائل | Messages list */
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100
                           dark:border-gray-700 hover:shadow-sm transition-shadow"
              >
                {/* رأس الرسالة | Message header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {/* أيقونة المستخدم | User avatar */}
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40
                                    flex items-center justify-center text-amber-600
                                    dark:text-amber-400 font-bold">
                      {(msg.userName || '?')[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {msg.userName || 'مجهول | Anonymous'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(msg.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* زر الحذف (فقط للرسائل الخاصة) | Delete button (only for own messages) */}
                  {msg.userId === currentUserId && (
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500
                                 dark:hover:text-red-400 transition-colors rounded-lg
                                 hover:bg-red-50 dark:hover:bg-red-900/20"
                      aria-label="حذف الرسالة | Delete message"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* محتوى الرسالة | Message content */}
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed pr-13">
                  {msg.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FanWall;
