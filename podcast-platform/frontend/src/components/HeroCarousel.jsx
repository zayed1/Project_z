// ============================================
// سلايدر البانر | Hero Carousel
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

export default function HeroCarousel({ podcasts = [] }) {
  const [current, setCurrent] = useState(0);
  const featured = podcasts.slice(0, 5);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % featured.length);
  }, [featured.length]);

  const prev = () => {
    setCurrent((c) => (c - 1 + featured.length) % featured.length);
  };

  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next, featured.length]);

  if (featured.length === 0) return null;

  const podcast = featured[current];

  return (
    <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-l from-primary-600 to-primary-800 min-h-[280px]">
      <div className="absolute inset-0 flex transition-transform duration-500">
        {podcast.cover_image_url && (
          <img
            src={podcast.cover_image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}
      </div>

      <div className="relative z-10 flex items-center p-8 md:p-12 min-h-[280px]">
        <div className="flex-1 text-white">
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full mb-3 inline-block">
            {podcast.category?.name || 'مميز'}
          </span>
          <h2 className="text-3xl font-bold mb-2">{podcast.title}</h2>
          <p className="text-white/80 line-clamp-2 mb-4 max-w-lg">
            {podcast.description || 'اكتشف هذا البودكاست المميز'}
          </p>
          <Link
            to={`/podcast/${podcast.id}`}
            className="inline-block bg-white text-primary-700 font-medium px-6 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            استمع الآن
          </Link>
        </div>

        {podcast.cover_image_url && (
          <div className="hidden md:block w-48 h-48 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 mr-8">
            <img src={podcast.cover_image_url} alt={podcast.title} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* أزرار التنقل | Nav buttons */}
      {featured.length > 1 && (
        <>
          <button onClick={prev} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </button>
          <button onClick={next} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>

          {/* نقاط | Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {featured.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current ? 'bg-white w-6' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
