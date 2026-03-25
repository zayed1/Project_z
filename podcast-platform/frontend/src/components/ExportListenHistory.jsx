// ============================================
// تصدير سجل الاستماع | Export Listen History
// ============================================
import { useToast } from '../context/ToastContext';

export default function ExportListenHistory() {
  const toast = useToast();

  const getHistory = () => {
    try {
      const raw = localStorage.getItem('listen_history');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  };

  const exportJSON = () => {
    const history = getHistory();
    if (history.length === 0) { toast.error('لا يوجد سجل'); return; }
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    download(blob, 'listen-history.json');
  };

  const exportCSV = () => {
    const history = getHistory();
    if (history.length === 0) { toast.error('لا يوجد سجل'); return; }
    const headers = ['العنوان', 'البودكاست', 'الموضع (ثانية)', 'التاريخ'];
    const rows = history.map((h) => [
      `"${h.episodeTitle || ''}"`, `"${h.podcastTitle || ''}"`, h.position || 0, new Date(h.timestamp).toLocaleString('ar'),
    ]);
    const bom = '\uFEFF';
    const csv = bom + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    download(blob, 'listen-history.csv');
  };

  const download = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast.success('تم التصدير');
  };

  return (
    <div className="flex gap-2">
      <button onClick={exportCSV}
        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
        تصدير CSV
      </button>
      <button onClick={exportJSON}
        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
        تصدير JSON
      </button>
    </div>
  );
}
