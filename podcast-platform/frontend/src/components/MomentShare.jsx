// ============================================
// مشاركة لحظة مميزة | Moment Share
// ============================================
import { useState, useRef } from 'react';
import { useToast } from '../context/ToastContext';

export default function MomentShare({ episodeId, episodeTitle, coverUrl }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [comment, setComment] = useState('');
  const cardRef = useRef(null);

  const shareUrl = `${window.location.origin}/podcast/?ep=${episodeId}&t=${startTime}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('تم نسخ الرابط');
  };

  const formatTimeInput = (val) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return '0:00';
    return `${Math.floor(num / 60)}:${(num % 60).toString().padStart(2, '0')}`;
  };

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors" title="مشاركة لحظة">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">مشاركة لحظة مميزة</h3>

            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">من (ثانية)</label>
                <input type="number" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none" placeholder="0" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">إلى (ثانية)</label>
                <input type="number" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none" placeholder="30" />
              </div>
            </div>

            <textarea value={comment} onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none resize-none mb-4"
              rows={2} placeholder="تعليقك على هذه اللحظة..." />

            {/* بطاقة المعاينة | Preview Card */}
            <div ref={cardRef} className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-4 text-white mb-4">
              <div className="flex items-center gap-3 mb-3">
                {coverUrl ? (
                  <img src={coverUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /></svg>
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm">{episodeTitle}</p>
                  <p className="text-xs opacity-80">
                    {formatTimeInput(startTime)} - {formatTimeInput(endTime)}
                  </p>
                </div>
              </div>
              {comment && <p className="text-sm opacity-90 italic">"{comment}"</p>}
              <p className="text-[10px] opacity-60 mt-2">منصة البودكاست</p>
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">إغلاق</button>
              <button onClick={copyLink} className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-600">
                نسخ الرابط
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
