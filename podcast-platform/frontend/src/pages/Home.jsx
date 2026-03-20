// ============================================
// الصفحة الرئيسية | Home Page
// ============================================
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { podcastsAPI } from '../utils/api';
import PodcastCard from '../components/PodcastCard';
import Pagination from '../components/Pagination';

export default function Home() {
  const [podcasts, setPodcasts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1 });

  useEffect(() => {
    podcastsAPI.getCategories().then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const params = { page, limit: 12 };
        if (search) params.search = search;
        if (selectedCategory) params.category = selectedCategory;

        const { data } = await podcastsAPI.getAll(params);
        setPodcasts(data.podcasts || []);
        setPagination(data.pagination || { pages: 1 });
      } catch {
        setPodcasts([]);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [search, selectedCategory, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
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

          {/* شريط البحث | Search Bar */}
          <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ابحث عن بودكاست..."
              className="flex-1 px-4 py-2.5 rounded-lg text-gray-800 outline-none focus:ring-2 focus:ring-primary-300"
            />
            <button
              type="submit"
              className="bg-white text-primary-600 font-medium px-6 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              بحث
            </button>
          </form>
        </div>
      </div>

      {/* التصنيفات | Categories Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => { setSelectedCategory(''); setPage(1); }}
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
            onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
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

      {/* عنوان القسم | Section Title */}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        {search ? `نتائج البحث: "${search}"` : 'جميع البودكاست'}
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-300 dark:bg-gray-700" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : podcasts.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM8 12a4 4 0 0 0 8 0h2a6 6 0 0 1-5 5.91V21h-2v-3.09A6 6 0 0 1 6 12h2z" />
          </svg>
          <p className="text-lg">{search ? 'لا توجد نتائج' : 'لا يوجد بودكاست حالياً'}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {podcasts.map((podcast) => (
              <PodcastCard key={podcast.id} podcast={podcast} />
            ))}
          </div>
          <Pagination page={page} pages={pagination.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
