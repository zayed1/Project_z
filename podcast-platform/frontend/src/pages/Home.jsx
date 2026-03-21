// ============================================
// الصفحة الرئيسية | Home Page
// مع Infinite Scroll + Autocomplete + Trending + Popular
// ============================================
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { podcastsAPI } from '../utils/api';
import PodcastCard from '../components/PodcastCard';
import { PodcastCardSkeleton } from '../components/EnhancedSkeleton';
import TrendingPodcasts from '../components/TrendingPodcasts';
import PopularEpisodes from '../components/PopularEpisodes';
import ListenerStats from '../components/ListenerStats';

export default function Home() {
  const navigate = useNavigate();
  const [podcasts, setPodcasts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    podcastsAPI.getCategories().then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  const handleInputChange = (value) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await podcastsAPI.autocomplete(value);
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    async function fetchPodcasts() {
      setLoading(true);
      try {
        const params = { page: 1, limit: 12 };
        if (search) params.search = search;
        if (selectedCategory) params.category = selectedCategory;

        const { data } = await podcastsAPI.getAll(params);
        setPodcasts(data.podcasts || []);
        setHasMore((data.pagination?.page || 1) < (data.pagination?.pages || 1));
        setPage(1);
      } catch {
        setPodcasts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPodcasts();
  }, [search, selectedCategory]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const params = { page: nextPage, limit: 12 };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;

      const { data } = await podcastsAPI.getAll(params);
      const newPodcasts = data.podcasts || [];
      setPodcasts((prev) => [...prev, ...newPodcasts]);
      setPage(nextPage);
      setHasMore(nextPage < (data.pagination?.pages || 1));
    } catch { /* ignore */ }
    finally { setLoadingMore(false); }
  }, [page, hasMore, loadingMore, search, selectedCategory]);

  const observerRef = useRef(null);
  const lastCardRef = useCallback((node) => {
    if (loading || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) loadMore();
    });
    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, hasMore, loadMore]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setShowSuggestions(false);
  };

  return (
    <div>
      <Helmet>
        <title>منصة البودكاست - الرئيسية</title>
        <meta name="description" content="اكتشف بودكاست جديدة واستمع إلى حلقاتك المفضلة على منصة البودكاست العربية" />
      </Helmet>

      {/* البانر | Hero */}
      <div className="bg-gradient-to-l from-primary-600 to-primary-800 text-white py-12 px-4 rounded-2xl mb-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">منصة البودكاست</h1>
          <p className="text-xl opacity-90 mb-6">اكتشف بودكاست جديدة واستمع إلى حلقاتك المفضلة</p>

          <div className="max-w-lg mx-auto relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="ابحث عن بودكاست..."
                className="flex-1 px-4 py-2.5 rounded-lg text-gray-800 outline-none focus:ring-2 focus:ring-primary-300"
              />
              <button type="submit" className="bg-white text-primary-600 font-medium px-6 py-2.5 rounded-lg hover:bg-gray-100 transition-colors">
                بحث
              </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 overflow-hidden z-10">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      navigate(`/podcast/${s.id}`);
                      setShowSuggestions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-right hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {s.cover_image_url ? (
                      <img src={s.cover_image_url} alt="" className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        </svg>
                      </div>
                    )}
                    <span className="text-sm text-gray-800 dark:text-gray-100 truncate">{s.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* إحصائيات المستمع | Listener Stats */}
      <ListenerStats />

      {/* البودكاست الرائجة | Trending */}
      {!search && !selectedCategory && <TrendingPodcasts />}

      {/* الأكثر استماعاً | Popular */}
      {!search && !selectedCategory && <PopularEpisodes />}

      {/* التصنيفات | Categories Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !selectedCategory
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          الكل
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        {search ? `نتائج البحث: "${search}"` : 'جميع البودكاست'}
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <PodcastCardSkeleton key={i} />)}
        </div>
      ) : podcasts.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM8 12a4 4 0 0 0 8 0h2a6 6 0 0 1-5 5.91V21h-2v-3.09A6 6 0 0 1 6 12h2z" />
          </svg>
          <p className="text-lg">{search ? 'لا توجد نتائج' : 'لا يوجد بودكاست حالياً'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {podcasts.map((podcast, i) => (
            <div key={podcast.id} ref={i === podcasts.length - 1 ? lastCardRef : undefined}>
              <PodcastCard podcast={podcast} />
            </div>
          ))}
          {loadingMore && (
            <>
              {[...Array(4)].map((_, i) => <PodcastCardSkeleton key={`skeleton-${i}`} />)}
            </>
          )}
        </div>
      )}
    </div>
  );
}
