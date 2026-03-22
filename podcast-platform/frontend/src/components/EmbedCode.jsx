// ============================================
// مكون كود التضمين | Embed Code Component
// ============================================
import { useState } from 'react';
import { useToast } from '../context/ToastContext';

export default function EmbedCode({ episodeId }) {
  const toast = useToast();
  const [show, setShow] = useState(false);

  const baseUrl = window.location.origin.replace(/:\d+$/, ':3000');
  const embedUrl = `${baseUrl}/embed/${episodeId}`;
  const embedCode = `<iframe src="${embedUrl}" width="100%" height="120" frameborder="0" style="border-radius:12px" allow="autoplay"></iframe>`;

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode);
    toast.success('تم نسخ كود التضمين');
  };

  return (
    <>
      <button
        onClick={() => setShow(!show)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
        title="كود التضمين"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </button>

      {show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShow(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-5 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">تضمين المشغل</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">انسخ الكود وألصقه في موقعك</p>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3">
              <code className="text-xs text-gray-700 dark:text-gray-300 break-all" dir="ltr">{embedCode}</code>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">معاينة:</p>
              <div className="rounded-lg overflow-hidden border dark:border-gray-700">
                <iframe src={embedUrl} width="100%" height="120" frameBorder="0" style={{ borderRadius: '8px' }} title="معاينة التضمين" />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={copyCode}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg text-sm">
                نسخ الكود
              </button>
              <button onClick={() => setShow(false)}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
