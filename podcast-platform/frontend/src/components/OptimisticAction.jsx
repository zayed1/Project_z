import React, { useState, useCallback, useRef } from 'react';

/**
 * OptimisticAction - مكوّن الإجراء التفاؤلي
 * يطبّق التحديث فوراً ثم يتراجع عنه في حالة الخطأ
 * Immediately applies optimistic update, rolls back on error
 */

/**
 * هوك useToast بسيط - Simple useToast hook
 * يعرض إشعارات الخطأ للمستخدم
 * Displays error notifications to user
 */
function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // إزالة الإشعار تلقائياً بعد 4 ثوانٍ
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}

/**
 * هوك الإجراء التفاؤلي - Optimistic Action hook
 * يأخذ دالة غير متزامنة ودالة تحديث تفاؤلي
 * Takes an async action function and an optimistic update function
 *
 * @param {Function} asyncAction - الإجراء غير المتزامن / Async action to execute
 * @param {Function} optimisticUpdate - دالة التحديث التفاؤلي / Optimistic update function
 * @returns {{ execute: Function, isPending: boolean, error: Error|null, toasts: Array }}
 */
export function useOptimistic(asyncAction, optimisticUpdate) {
  // حالة الانتظار - Pending state
  const [isPending, setIsPending] = useState(false);
  // حالة الخطأ - Error state
  const [error, setError] = useState(null);
  // إشعارات الخطأ - Error toasts
  const { toasts, showToast, dismissToast } = useToast();
  // مرجع للحالة السابقة للتراجع - Previous state ref for rollback
  const previousStateRef = useRef(null);

  /**
   * تنفيذ الإجراء التفاؤلي - Execute optimistic action
   * @param  {...any} args - معاملات الإجراء / Action arguments
   */
  const execute = useCallback(
    async (...args) => {
      setError(null);
      setIsPending(true);

      // حفظ الحالة السابقة وتطبيق التحديث التفاؤلي فوراً
      // Save previous state and apply optimistic update immediately
      let rollback = null;
      try {
        rollback = optimisticUpdate(...args);
      } catch (updateError) {
        console.warn('خطأ في التحديث التفاؤلي / Optimistic update error:', updateError);
      }

      try {
        // تنفيذ الإجراء الفعلي على الخادم
        // Execute actual server action
        const result = await asyncAction(...args);
        setIsPending(false);
        return result;
      } catch (err) {
        // التراجع عن التحديث التفاؤلي في حالة الخطأ
        // Roll back optimistic update on error
        if (typeof rollback === 'function') {
          try {
            rollback();
          } catch (rollbackError) {
            console.error('خطأ في التراجع / Rollback error:', rollbackError);
          }
        }

        setError(err);
        setIsPending(false);

        // عرض إشعار الخطأ - Show error toast
        showToast(
          err.message || 'حدث خطأ، يرجى المحاولة مرة أخرى / An error occurred, please try again'
        );

        throw err;
      }
    },
    [asyncAction, optimisticUpdate, showToast]
  );

  return { execute, isPending, error, toasts, dismissToast };
}

/**
 * مكوّن عرض إشعارات الخطأ - Toast notification display component
 * يعرض قائمة الإشعارات في أسفل الشاشة
 * Displays toast list at bottom of screen
 */
export default function OptimisticAction({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div
      dir="rtl"
      className="fixed bottom-4 left-4 right-4 z-50 flex flex-col items-center gap-2 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto max-w-md w-full px-4 py-3 rounded-lg shadow-lg flex items-center justify-between
            ${
              toast.type === 'error'
                ? 'bg-red-600 dark:bg-red-700 text-white'
                : 'bg-green-600 dark:bg-green-700 text-white'
            }`}
        >
          {/* نص الإشعار - Toast message */}
          <span className="text-sm font-medium">{toast.message}</span>

          {/* زر إغلاق الإشعار - Dismiss button */}
          <button
            onClick={() => onDismiss?.(toast.id)}
            className="mr-3 text-white/80 hover:text-white transition-colors"
            aria-label="إغلاق / Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
