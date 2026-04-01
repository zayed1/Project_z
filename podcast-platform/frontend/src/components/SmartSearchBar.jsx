// ============================================
// شريط بحث ذكي | Smart Search Bar
// مع سجل البحث + اقتراحات + فلترة
// ============================================
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { podcastsAPI } from '../utils/api';

const HISTORY_KEY = 'search_history';
const MAX_HISTORY = 8;

function getSearchHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}

function saveSearchHistory(term) {
  const history = getSearchHistory().filter((h) => h !== term);
  history.unshift(term);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

function removeFromHistory(term) {
  const history = getSearchHistory().filter((h) => h !== term);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export default function SmartSearchBar({ onSearch, className = '' }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setHistory(getSearchHistory());
  }, [focused]);

  // إغلاق عند الضغط خارج | Close on click outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setFocused(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback((term) => {
    if (!term || term.length < 2) { setSuggestions([]); return; }
    setLoading(true);
    podcastsAPI.getAll({ search: term, limit: 5 })
      .then(({ data }) => {
        const pods = (data.podcasts || []).map((p) => ({ type: 'podcast', id: p.id, title: p.title, category: p.category }));
        setSuggestions(pods);
      })
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    saveSearchHistory(query.trim());
    setFocused(false);
    if (onSearch) onSearch(query.trim(), filter);
    else navigate(`/?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSuggestionClick = (suggestion) => {
    saveSearchHistory(suggestion.title);
    setFocused(false);
    setQuery(suggestion.title);
    if (suggestion.type === 'podcast') navigate(`/podcast/${suggestion.id}`);
  };

  const handleHistoryClick = (term) => {
    setQuery(term);
    setFocused(false);
    if (onSearch) onSearch(term, filter);
    else navigate(`/?q=${encodeURIComponent(term)}`);
  };

  const handleRemoveHistory = (e, term) => {
    e.stopPropagation();
    removeFromHistory(term);
    setHistory(getSearchHistory());
  };

  const showDropdown = focused && (query.length >= 2 || history.length > 0);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          placeholder="ابحث عن بودكاست، حلقة..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-shadow"
        />
        <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        {query && (
          <button type="button" onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }} className="absolute left-9 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7A1 1 0 105.7 7.11L10.59 12 5.7 16.89a1 1 0 101.41 1.41L12 13.41l4.89 4.89a1 1 0 001.41-1.41L13.41 12l4.89-4.89a1 1 0 000-1.4z" /></svg>
          </button>
        )}
      </form>

      {/* الفلاتر | Filters */}
      {focused && (
        <div className="flex gap-1 mt-2">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'podcast', label: 'بودكاست' },
            { key: 'episode', label: 'حلقات' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                filter === f.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* القائمة المنسدلة | Dropdown */}
      {showDropdown && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 max-h-80 overflow-y-auto">
          {/* سجل البحث | Search history */}
          {!query && history.length > 0 && (
            <div className="p-2">
              <p className="text-xs text-gray-400 px-2 mb-1">عمليات البحث الأخيرة</p>
              {history.map((term) => (
                <button
                  key={term}
                  onClick={() => handleHistoryClick(term)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg group"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {term}
                  </span>
                  <span
                    onClick={(e) => handleRemoveHistory(e, term)}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7A1 1 0 105.7 7.11L10.59 12 5.7 16.89a1 1 0 101.41 1.41L12 13.41l4.89 4.89a1 1 0 001.41-1.41L13.41 12l4.89-4.89a1 1 0 000-1.4z" /></svg>
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* الاقتراحات | Suggestions */}
          {query && suggestions.length > 0 && (
            <div className="p-2">
              <p className="text-xs text-gray-400 px-2 mb-1">نتائج مقترحة</p>
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSuggestionClick(s)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                >
                  <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <div className="text-right">
                    <p className="font-medium truncate">{s.title}</p>
                    {s.category && <p className="text-xs text-gray-400">{s.category}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* جاري التحميل | Loading */}
          {query && loading && (
            <div className="p-4 text-center">
              <div className="animate-spin w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
            </div>
          )}

          {/* لا نتائج | No results */}
          {query && !loading && suggestions.length === 0 && query.length >= 2 && (
            <div className="p-4 text-center text-sm text-gray-400">
              لا توجد نتائج لـ "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
