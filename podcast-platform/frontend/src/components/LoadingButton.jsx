// ============================================
// زر مع حالة تحميل | Loading Button Component
// ============================================

export default function LoadingButton({
  loading = false,
  children,
  className = '',
  disabled,
  variant = 'primary',
  size = 'md',
  ...props
}) {
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white disabled:bg-primary-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-300',
    secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50',
    ghost: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-2.5 text-base rounded-xl',
  };

  return (
    <button
      className={`font-medium transition-colors inline-flex items-center justify-center gap-2 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
