// ============================================
// مكون تقسيم الصفحات المحسّن | Enhanced Pagination Component
// مع عرض العدد الإجمالي + الصفحة الحالية
// ============================================
export default function Pagination({ page, pages, onChange, total }) {
  if (pages <= 1) return null;

  const items = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, page + 2);

  for (let i = start; i <= end; i++) items.push(i);

  return (
    <div className="flex flex-col items-center gap-3 mt-8">
      <div className="flex items-center gap-2">
        {/* زر السابق | Previous */}
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          السابق
        </button>

        {/* أول صفحة | First page */}
        {start > 1 && (
          <>
            <button
              onClick={() => onChange(1)}
              className="w-9 h-9 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              1
            </button>
            {start > 2 && <span className="text-gray-400 px-1">...</span>}
          </>
        )}

        {items.map((i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
              i === page
                ? 'bg-primary-500 text-white shadow-md scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {i}
          </button>
        ))}

        {/* آخر صفحة | Last page */}
        {end < pages && (
          <>
            {end < pages - 1 && <span className="text-gray-400 px-1">...</span>}
            <button
              onClick={() => onChange(pages)}
              className="w-9 h-9 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {pages}
            </button>
          </>
        )}

        {/* زر التالي | Next */}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
        >
          التالي
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* معلومات الصفحة | Page info */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        صفحة {page} من {pages}
        {total !== undefined && ` - ${total} نتيجة`}
      </p>
    </div>
  );
}
