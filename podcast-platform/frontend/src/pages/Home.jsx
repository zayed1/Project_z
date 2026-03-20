// ============================================
// الصفحة الرئيسية | Home Page
// ============================================
import { useState, useEffect } from 'react';
import { podcastsAPI } from '../utils/api';
import PodcastCard from '../components/PodcastCard';

export default function Home() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPodcasts() {
      try {
        const { data } = await podcastsAPI.getAll();
        setPodcasts(data.podcasts || []);
      } catch {
        setError('فشل في تحميل البودكاست | Failed to load podcasts');
      } finally {
        setLoading(false);
      }
    }
    fetchPodcasts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div>
      {/* العنوان الرئيسي | Hero Section */}
      <div className="bg-gradient-to-l from-primary-600 to-primary-800 text-white py-16 px-4 rounded-2xl mb-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">منصة البودكاست</h1>
          <p className="text-xl opacity-90">
            اكتشف بودكاست جديدة واستمع إلى حلقاتك المفضلة
          </p>
        </div>
      </div>

      {/* قائمة البودكاست | Podcasts Grid */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">جميع البودكاست</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>
      )}

      {podcasts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM8 12a4 4 0 0 0 8 0h2a6 6 0 0 1-5 5.91V21h-2v-3.09A6 6 0 0 1 6 12h2z" />
          </svg>
          <p className="text-lg">لا يوجد بودكاست حالياً</p>
          <p>كن أول من يضيف بودكاست على المنصة!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {podcasts.map((podcast) => (
            <PodcastCard key={podcast.id} podcast={podcast} />
          ))}
        </div>
      )}
    </div>
  );
}
