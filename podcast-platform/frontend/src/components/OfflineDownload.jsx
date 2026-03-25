// ============================================
// زر التحميل للاستماع بدون انترنت | Offline Download Button
// ============================================
import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';

export default function OfflineDownload({ audioUrl }) {
  const toast = useToast();
  const [cached, setCached] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!audioUrl || !('serviceWorker' in navigator)) return;

    // check if already cached
    const handler = (e) => {
      if (e.data.type === 'CACHED_AUDIOS_LIST') {
        setCached(e.data.urls.includes(audioUrl));
      }
      if (e.data.type === 'AUDIO_CACHED' && e.data.url === audioUrl) {
        setCached(true);
        setDownloading(false);
        toast.success('تم حفظ الحلقة للاستماع بدون انترنت');
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    navigator.serviceWorker.ready.then((reg) => {
      reg.active?.postMessage({ type: 'GET_CACHED_AUDIOS' });
    });

    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [audioUrl, toast]);

  if (!audioUrl || !('serviceWorker' in navigator)) return null;

  const handleDownload = () => {
    setDownloading(true);
    navigator.serviceWorker.ready.then((reg) => {
      reg.active?.postMessage({ type: 'CACHE_AUDIO', url: audioUrl });
    });
    // timeout fallback
    setTimeout(() => setDownloading(false), 30000);
  };

  const handleRemove = () => {
    navigator.serviceWorker.ready.then((reg) => {
      reg.active?.postMessage({ type: 'REMOVE_CACHED_AUDIO', url: audioUrl });
    });
    setCached(false);
    toast.info('تم حذف الحلقة من التخزين');
  };

  if (cached) {
    return (
      <button
        onClick={handleRemove}
        className="p-1.5 rounded-lg text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
        title="محفوظ - اضغط للحذف"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors disabled:opacity-50"
      title="حفظ للاستماع بدون انترنت"
    >
      {downloading ? (
        <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      )}
    </button>
  );
}
