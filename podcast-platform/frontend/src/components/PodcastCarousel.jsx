// ============================================
// سلايدر البودكاست | Podcast Carousel Component
// ============================================
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function PodcastCarousel({ title, podcasts = [] }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  if (podcasts.length === 0) return null;

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    setTimeout(checkScroll, 400);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h2>
        <div className="flex gap-1">
          <button onClick={() => scroll(1)} disabled={!canScrollLeft}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-gray-600"
            aria-label="السابق">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <button onClick={() => scroll(-1)} disabled={!canScrollRight}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-gray-600"
            aria-label="التالي">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {podcasts.map((podcast) => (
          <Link
            key={podcast.id}
            to={`/podcast/${podcast.id}`}
            className="flex-shrink-0 w-40 group"
          >
            <div className="w-40 h-40 rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow bg-gray-200 dark:bg-gray-700 mb-2">
              {podcast.cover_image_url ? (
                <img src={podcast.cover_image_url} alt={podcast.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /></svg>
                </div>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate group-hover:text-primary-500 transition-colors">{podcast.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
