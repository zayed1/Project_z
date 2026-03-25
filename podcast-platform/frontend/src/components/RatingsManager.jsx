import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../utils/api';

/**
 * RatingsManager - مدير التقييمات | Ratings Manager Component
 * مكون إداري لعرض وتصفية وحذف التقييمات
 * Admin component to view, filter, and delete ratings
 */
const RatingsManager = () => {
  // قائمة التقييمات | Ratings list
  const [ratings, setRatings] = useState([]);
  // حالة التحميل | Loading state
  const [loading, setLoading] = useState(false);
  // رسالة الخطأ | Error message
  const [error, setError] = useState('');
  // فلاتر البحث | Search filters
  const [filters, setFilters] = useState({
    minRating: '',
    maxRating: '',
    episodeSearch: '',
  });
  // حالة الترقيم | Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 10,
  });
  // حالة الحذف الجاري | Deleting state
  const [deletingId, setDeletingId] = useState(null);

  /**
   * جلب التقييمات مع الفلاتر | Fetch ratings with filters
   */
  const fetchRatings = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        perPage: pagination.perPage,
        ...(filters.minRating && { minRating: Number(filters.minRating) }),
        ...(filters.maxRating && { maxRating: Number(filters.maxRating) }),
        ...(filters.episodeSearch && { episodeSearch: filters.episodeSearch }),
      };
      const response = await adminAPI.getFilteredRatings(params);
      setRatings(response.data || []);
      setPagination((prev) => ({
        ...prev,
        currentPage: page,
        totalPages: response.totalPages || 1,
        total: response.total || 0,
      }));
    } catch {
      setError('فشل تحميل التقييمات | Failed to load ratings');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.perPage]);

  // جلب التقييمات عند التحميل الأول | Fetch ratings on mount
  useEffect(() => {
    fetchRatings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * تحديث الفلاتر | Update filters
   */
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * تطبيق الفلاتر | Apply filters
   */
  const applyFilters = () => {
    fetchRatings(1);
  };

  /**
   * إعادة تعيين الفلاتر | Reset filters
   */
  const resetFilters = () => {
    setFilters({ minRating: '', maxRating: '', episodeSearch: '' });
    fetchRatings(1);
  };

  /**
   * حذف تقييم | Delete a rating
   */
  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟ | Are you sure you want to delete this rating?')) {
      return;
    }
    setDeletingId(id);
    try {
      await adminAPI.deleteRating(id);
      // تحديث القائمة بعد الحذف | Update list after deletion
      setRatings((prev) => prev.filter((r) => r.id !== id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch {
      setError('فشل حذف التقييم | Failed to delete rating');
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * عرض النجوم | Render stars
   */
  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < count ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
      >
        ★
      </span>
    ));
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* العنوان | Header */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          إدارة التقييمات
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          عرض وتصفية وحذف تقييمات المستخدمين | View, filter, and delete user ratings
        </p>

        {/* قسم الفلاتر | Filters Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            تصفية التقييمات | Filter Ratings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* الحد الأدنى للنجوم | Min rating stars */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                الحد الأدنى للتقييم | Min Rating
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">الكل | All</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} {'★'.repeat(n)}</option>
                ))}
              </select>
            </div>

            {/* الحد الأقصى للنجوم | Max rating stars */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                الحد الأقصى للتقييم | Max Rating
              </label>
              <select
                value={filters.maxRating}
                onChange={(e) => handleFilterChange('maxRating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">الكل | All</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} {'★'.repeat(n)}</option>
                ))}
              </select>
            </div>

            {/* البحث حسب الحلقة | Search by episode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                البحث حسب الحلقة | Search by Episode
              </label>
              <input
                type="text"
                value={filters.episodeSearch}
                onChange={(e) => handleFilterChange('episodeSearch', e.target.value)}
                placeholder="اسم الحلقة... | Episode name..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>

          {/* أزرار الفلاتر | Filter buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={applyFilters}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                         font-medium transition-colors"
            >
              تطبيق | Apply
            </button>
            <button
              onClick={resetFilters}
              className="px-5 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300
                         dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200
                         rounded-lg font-medium transition-colors"
            >
              إعادة تعيين | Reset
            </button>
          </div>
        </div>

        {/* رسالة الخطأ | Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800
                          text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* إجمالي النتائج | Total results */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          إجمالي التقييمات: {pagination.total} | Total ratings: {pagination.total}
        </p>

        {/* جدول التقييمات | Ratings Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : ratings.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              لا توجد تقييمات | No ratings found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      المستخدم | User
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      الحلقة | Episode
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      التقييم | Rating
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      التاريخ | Date
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      إجراء | Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ratings.map((rating) => (
                    <tr
                      key={rating.id}
                      className="border-t border-gray-200 dark:border-gray-700
                                 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {rating.userName || rating.userId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {rating.episodeTitle || rating.episodeId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {renderStars(rating.rating)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(rating.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(rating.id)}
                          disabled={deletingId === rating.id}
                          className="px-3 py-1.5 bg-red-100 dark:bg-red-900/40 text-red-600
                                     dark:text-red-400 rounded-lg text-sm font-medium
                                     hover:bg-red-200 dark:hover:bg-red-900/60
                                     disabled:opacity-50 transition-colors"
                        >
                          {deletingId === rating.id ? 'جاري الحذف...' : 'حذف | Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* الترقيم | Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {/* زر السابق | Previous button */}
            <button
              onClick={() => fetchRatings(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1 || loading}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300
                         dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300
                         hover:bg-gray-50 dark:hover:bg-gray-700
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              السابق | Prev
            </button>

            {/* أرقام الصفحات | Page numbers */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((page) => {
                const current = pagination.currentPage;
                return page === 1 || page === pagination.totalPages || Math.abs(page - current) <= 2;
              })
              .map((page, idx, arr) => (
                <React.Fragment key={page}>
                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                    <span className="text-gray-400 dark:text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => fetchRatings(page)}
                    disabled={loading}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      page === pagination.currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}

            {/* زر التالي | Next button */}
            <button
              onClick={() => fetchRatings(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages || loading}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300
                         dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300
                         hover:bg-gray-50 dark:hover:bg-gray-700
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              التالي | Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingsManager;
