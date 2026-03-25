// ============================================
// مكون إنشاء المقاطع | Clip Creator Component
// ============================================
import { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

export default function ClipCreator({ episodeId }) {
  const { currentEpisode, currentTime } = usePlayer();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(30);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const isActive = currentEpisode?.id === episodeId;

  const handleOpen = () => {
    if (isActive) {
      setStartTime(Math.max(0, Math.floor(currentTime) - 15));
      setEndTime(Math.floor(currentTime) + 15);
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (endTime - startTime < 5) {
      toast.error('المقطع يجب أن يكون 5 ثواني على الأقل');
      return;
    }
    if (endTime - startTime > 120) {
      toast.error('المقطع يجب أن لا يتجاوز دقيقتين');
      return;
    }
    setSaving(true);
    try {
      await api.post('/clips', {
        episode_id: episodeId,
        start_time: startTime,
        end_time: endTime,
        title: title.trim() || undefined,
      });
      toast.success('تم إنشاء المقطع');
      setOpen(false);
      setTitle('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل في إنشاء المقطع');
    } finally {
      setSaving(false);
    }
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <>
      <button
        onClick={handleOpen}
        className="p-1.5 rounded-lg text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
        title="إنشاء مقطع"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-5 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">إنشاء مقطع مميز</h3>

            <div className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان المقطع (اختياري)"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">البداية (ثانية)</label>
                  <input type="number" value={startTime} min={0}
                    onChange={(e) => setStartTime(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none"
                  />
                  <span className="text-xs text-gray-400">{fmt(startTime)}</span>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">النهاية (ثانية)</label>
                  <input type="number" value={endTime} min={startTime + 5}
                    onChange={(e) => setEndTime(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none"
                  />
                  <span className="text-xs text-gray-400">{fmt(endTime)}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400">المدة: {fmt(endTime - startTime)} (5 ثواني - دقيقتين)</p>

              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                  {saving ? 'جاري الحفظ...' : 'إنشاء المقطع'}
                </button>
                <button onClick={() => setOpen(false)}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
