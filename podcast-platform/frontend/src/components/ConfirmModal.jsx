// ============================================
// نافذة التأكيد المحسّنة | Enhanced Confirm Modal
// مع أيقونات + تحريك + أنواع متعددة
// ============================================
import { useEffect } from 'react';

const MODAL_TYPES = {
  danger: {
    iconBg: 'bg-red-50 dark:bg-red-900/20',
    iconColor: 'text-red-500',
    btnClass: 'bg-red-500 hover:bg-red-600',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
  },
  warning: {
    iconBg: 'bg-amber-50 dark:bg-amber-900/20',
    iconColor: 'text-amber-500',
    btnClass: 'bg-amber-500 hover:bg-amber-600',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
  },
  info: {
    iconBg: 'bg-primary-50 dark:bg-primary-900/20',
    iconColor: 'text-primary-500',
    btnClass: 'bg-primary-500 hover:bg-primary-600',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
};

export default function ConfirmModal({ open, title, message, confirmText = 'تأكيد', cancelText = 'إلغاء', danger = false, type, onConfirm, onCancel }) {
  // إغلاق بزر Escape | Close with Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  const modalType = type || (danger ? 'danger' : 'info');
  const config = MODAL_TYPES[modalType] || MODAL_TYPES.info;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={onCancel}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all duration-200 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* أيقونة | Icon */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${config.iconBg}`}>
          <svg className={`w-7 h-7 ${config.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {config.icon}
          </svg>
        </div>

        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            {cancelText}
          </button>
          <button onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors ${config.btnClass}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
