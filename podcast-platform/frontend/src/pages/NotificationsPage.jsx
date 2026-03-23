// ============================================
// مركز الإشعارات | Notifications Center Page
// صفحة كاملة مع تصنيفات وتحديد الكل كمقروء
// ============================================
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';

const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: null },
  { id: 'episode', label: 'حلقات جديدة', icon: '🎙️' },
  { id: 'reply', label: 'ردود', icon: '💬' },
  { id: 'like', label: 'إعجابات', icon: '❤️' },
  { id: 'follow', label: 'متابعات', icon: '👤' },
  { id: 'system', label: 'النظام', icon: '⚙️' },
];

function getNotificationType(notification) {
  const title = (notification.title || '').toLowerCase();
  const msg = (notification.message || '').toLowerCase();
  if (title.includes('حلقة') || title.includes('episode') || msg.includes('حلقة جديدة')) return 'episode';
  if (title.includes('رد') || title.includes('reply') || title.includes('تعليق') || title.includes('comment')) return 'reply';
  if (title.includes('إعجاب') || title.includes('like') || title.includes('أعجب')) return 'like';
  if (title.includes('متابع') || title.includes('follow')) return 'follow';
  return 'system';
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days} يوم`;
  return new Date(dateStr).toLocaleDateString('ar', { month: 'short', day: 'numeric' });
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get('/me/notifications')
      .then(({ data }) => setNotifications(data.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return notifications;
    return notifications.filter((n) => getNotificationType(n) === activeCategory);
  }, [notifications, activeCategory]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications]);

  const markAllRead = async () => {
    try {
      await api.put('/me/notifications/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success('تم تحديد جميع الإشعارات كمقروءة');
    } catch {
      toast.error('حدث خطأ');
    }
  };

  if (!user) {
    return (
      <EmptyState
        icon="podcast"
        title="سجّل الدخول"
        message="يجب تسجيل الدخول لعرض الإشعارات"
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Helmet><title>الإشعارات - منصة البودكاست</title></Helmet>

      {/* العنوان | Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">الإشعارات</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      {/* التصنيفات | Categories */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORIES.map((cat) => {
          const count = cat.id === 'all'
            ? notifications.length
            : notifications.filter((n) => getNotificationType(n) === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.icon && <span>{cat.icon}</span>}
              {cat.label}
              {count > 0 && (
                <span className={`text-xs ${activeCategory === cat.id ? 'text-white/80' : 'text-gray-400'}`}>
                  ({count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* المحتوى | Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="podcast"
          title="لا توجد إشعارات"
          message={activeCategory !== 'all' ? 'لا توجد إشعارات في هذا التصنيف' : 'ستظهر إشعاراتك هنا'}
          action={activeCategory !== 'all' ? () => setActiveCategory('all') : undefined}
          actionLabel={activeCategory !== 'all' ? 'عرض الكل' : undefined}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const type = getNotificationType(n);
            const typeColors = {
              episode: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
              reply: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
              like: 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400',
              follow: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
              system: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
            };
            const typeIcons = {
              episode: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />,
              reply: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
              like: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
              follow: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
              system: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
            };

            return (
              <div
                key={n.id}
                className={`bg-white dark:bg-gray-800 rounded-xl p-4 transition-colors border ${
                  !n.is_read
                    ? 'border-primary-200 dark:border-primary-800 bg-primary-50/30 dark:bg-primary-900/10'
                    : 'border-transparent'
                }`}
              >
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeColors[type]}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {typeIcons[type]}
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm ${!n.is_read ? 'font-semibold' : 'font-medium'} text-gray-800 dark:text-gray-100`}>
                          {n.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                      </div>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
