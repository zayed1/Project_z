// ============================================
// بحث متقدم بفلاتر | Advanced Search Component
// ============================================
import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function AdvancedSearch({ onSearch, categories }) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    minDuration: '',
    maxDuration: '',
    sortBy: 'newest',
  });

  const handleApply = () => {
    onSearch(filters);
    setOpen(false);
  };

  const handleReset = () => {
    const reset = { category: '', minDuration: '', maxDuration: '', sortBy: 'newest' };
    setFilters(reset);
    onSearch(reset);
    setOpen(false);
  };

  const hasFilters = filters.category || filters.minDuration || filters.maxDuration || filters.sortBy !== 'newest';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`p-2 rounded-lg border transition-colors ${
          hasFilters
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-500'
            : 'border-gray-200 dark:border-gray-600 text-gray-400 hover:text-gray-600'
        }`}
        aria-label="فلاتر البحث"
        title="فلاتر البحث"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 sm:right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 p-4 min-w-[280px] z-40">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">فلاتر البحث المتقدم</h3>

          {/* التصنيف */}
          <div className="mb-3">
            <label className="text-xs text-gray-400 mb-1 block">التصنيف</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none"
            >
              <option value="">الكل</option>
              {(categories || []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* المدة */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">أقل مدة (دقيقة)</label>
              <input type="number" value={filters.minDuration} min={0}
                onChange={(e) => setFilters({ ...filters, minDuration: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none"
                placeholder="0" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">أكثر مدة (دقيقة)</label>
              <input type="number" value={filters.maxDuration} min={0}
                onChange={(e) => setFilters({ ...filters, maxDuration: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none"
                placeholder="∞" />
            </div>
          </div>

          {/* الترتيب */}
          <div className="mb-3">
            <label className="text-xs text-gray-400 mb-1 block">الترتيب</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none"
            >
              <option value="newest">الأحدث</option>
              <option value="oldest">الأقدم</option>
              <option value="popular">الأكثر استماعاً</option>
              <option value="rated">الأعلى تقييماً</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button onClick={handleApply} className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-1.5 rounded-lg text-sm">تطبيق</button>
            <button onClick={handleReset} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-sm">إعادة</button>
          </div>
        </div>
      )}
    </div>
  );
}
