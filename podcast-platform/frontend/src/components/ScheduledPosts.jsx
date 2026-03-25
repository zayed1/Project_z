// ============================================
// المنشورات المجدولة | Scheduled Posts (Admin Component)
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../utils/api';

/**
 * ScheduledPosts - مكون إداري لإدارة الإعلانات المجدولة
 * Admin component for managing scheduled announcements
 *
 * يتضمن: نموذج إنشاء، قائمة المنشورات، حذف
 * Includes: create form, posts list, delete
 */
const ScheduledPosts = () => {
  // قائمة المنشورات | Posts list
  const [posts, setPosts] = useState([]);
  // حالة التحميل | Loading state
  const [loading, setLoading] = useState(true);
  // خطأ | Error
  const [error, setError] = useState(null);
  // إظهار النموذج | Show form
  const [showForm, setShowForm] = useState(false);
  // حالة الإرسال | Submitting state
  const [submitting, setSubmitting] = useState(false);

  // بيانات النموذج | Form data
  const [form, setForm] = useState({
    title: '',
    content: '',
    scheduled_at: '',
    type: 'announcement',
  });

  // أنواع المنشورات | Post types
  const postTypes = [
    { value: 'announcement', label: 'إعلان', labelEn: 'Announcement' },
    { value: 'update', label: 'تحديث', labelEn: 'Update' },
    { value: 'promotion', label: 'ترويج', labelEn: 'Promotion' },
    { value: 'maintenance', label: 'صيانة', labelEn: 'Maintenance' },
  ];

  /**
   * جلب المنشورات المجدولة | Fetch scheduled posts
   */
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getScheduledPosts();
      setPosts(res.data || []);
      setError(null);
    } catch (err) {
      console.error('فشل جلب المنشورات | Failed to fetch posts:', err);
      setError('فشل تحميل المنشورات المجدولة | Failed to load scheduled posts');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  /**
   * تحديث حقل النموذج | Update form field
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * إرسال النموذج | Submit form
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim() || !form.scheduled_at) return;

    setSubmitting(true);
    try {
      await adminAPI.createScheduledPost(form);
      // إعادة تعيين النموذج | Reset form
      setForm({ title: '', content: '', scheduled_at: '', type: 'announcement' });
      setShowForm(false);
      // تحديث القائمة | Refresh list
      fetchPosts();
    } catch (err) {
      console.error('فشل إنشاء المنشور | Failed to create post:', err);
      setError('فشل إنشاء المنشور | Failed to create post');
    }
    setSubmitting(false);
  };

  /**
   * حذف منشور | Delete post
   */
  const handleDelete = async (postId) => {
    if (!confirm('هل أنت متأكد من الحذف؟ | Are you sure you want to delete?')) return;

    try {
      await adminAPI.deleteScheduledPost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error('فشل حذف المنشور | Failed to delete post:', err);
      setError('فشل حذف المنشور | Failed to delete post');
    }
  };

  // تنسيق التاريخ | Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ألوان الحالة | Status colors
  const statusColors = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
    sent: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    failed: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
  };

  // تسميات الحالة | Status labels
  const statusLabels = {
    pending: 'في الانتظار',
    sent: 'تم الإرسال',
    failed: 'فشل',
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
      dir="rtl"
    >
      {/* الرأس | Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            المنشورات المجدولة
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Scheduled Posts</p>
        </div>
        {/* زر إضافة جديد | Add new button */}
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
            bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500
            dark:hover:bg-purple-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={showForm ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
          </svg>
          {showForm ? 'إلغاء' : 'منشور جديد'}
        </button>
      </div>

      {/* خطأ | Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="mr-2 underline hover:no-underline"
          >
            إخفاء | Dismiss
          </button>
        </div>
      )}

      {/* نموذج الإنشاء | Create form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
          {/* العنوان | Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              العنوان <span className="text-xs text-gray-400">(Title)</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
                focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              placeholder="عنوان المنشور..."
            />
          </div>

          {/* المحتوى | Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              المحتوى <span className="text-xs text-gray-400">(Content)</span>
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
                focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
              placeholder="محتوى المنشور..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* وقت الجدولة | Schedule time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                وقت النشر <span className="text-xs text-gray-400">(Schedule)</span>
              </label>
              <input
                type="datetime-local"
                name="scheduled_at"
                value={form.scheduled_at}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
                  focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>

            {/* نوع المنشور | Post type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                النوع <span className="text-xs text-gray-400">(Type)</span>
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
                  focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              >
                {postTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label} ({t.labelEn})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* زر الإرسال | Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded-lg bg-purple-600 text-white font-medium text-sm
              hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'جاري الجدولة...' : 'جدولة المنشور'}
          </button>
        </form>
      )}

      {/* قائمة المنشورات | Posts list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200
                dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* العنوان | Title */}
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {post.title}
                  </h4>
                  {/* المحتوى | Content */}
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {post.content}
                  </p>
                  {/* معلومات الجدولة | Schedule info */}
                  <div className="flex items-center gap-3 mt-2">
                    {/* الحالة | Status */}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium
                        ${statusColors[post.status] || statusColors.pending}`}
                    >
                      {statusLabels[post.status] || post.status}
                    </span>
                    {/* الوقت | Time */}
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      {formatDate(post.scheduled_at)}
                    </span>
                    {/* النوع | Type */}
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      {postTypes.find((t) => t.value === post.type)?.label || post.type}
                    </span>
                  </div>
                </div>

                {/* زر الحذف | Delete button */}
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50
                    dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                  title="حذف | Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            لا توجد منشورات مجدولة | No scheduled posts
          </p>
        </div>
      )}
    </div>
  );
};

export default ScheduledPosts;
