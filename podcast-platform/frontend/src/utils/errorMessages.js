// ============================================
// رسائل الأخطاء | Error Messages Utility
// رسائل ودية بالعربية والإنجليزية
// ============================================

const ERROR_MESSAGES = {
  // أخطاء الشبكة | Network errors
  NETWORK_ERROR: 'لا يوجد اتصال بالإنترنت. تحقق من اتصالك وحاول مرة أخرى',
  TIMEOUT: 'انتهت مهلة الطلب. حاول مرة أخرى',
  SERVER_ERROR: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً',

  // أخطاء المصادقة | Auth errors
  UNAUTHORIZED: 'يرجى تسجيل الدخول للمتابعة',
  FORBIDDEN: 'ليس لديك صلاحية للقيام بهذا الإجراء',
  INVALID_CREDENTIALS: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',

  // أخطاء البيانات | Data errors
  NOT_FOUND: 'العنصر المطلوب غير موجود',
  VALIDATION_ERROR: 'يرجى التحقق من البيانات المدخلة',
  DUPLICATE: 'هذا العنصر موجود بالفعل',
  FILE_TOO_LARGE: 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت',
  INVALID_FORMAT: 'صيغة الملف غير مدعومة',

  // أخطاء عامة | General errors
  UNKNOWN: 'حدث خطأ غير متوقع. حاول مرة أخرى',
  RATE_LIMITED: 'طلبات كثيرة جداً. يرجى الانتظار قليلاً',
};

/**
 * تحويل أخطاء API إلى رسائل ودية
 * @param {Error|object} error - كائن الخطأ
 * @returns {string} رسالة خطأ ودية
 */
export function getErrorMessage(error) {
  // أخطاء الشبكة
  if (!error.response) {
    if (error.code === 'ECONNABORTED') return ERROR_MESSAGES.TIMEOUT;
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  const status = error.response?.status;
  const serverMessage = error.response?.data?.message || error.response?.data?.error;

  // أخطاء حسب رمز HTTP
  switch (status) {
    case 400: return serverMessage || ERROR_MESSAGES.VALIDATION_ERROR;
    case 401: return ERROR_MESSAGES.UNAUTHORIZED;
    case 403: return ERROR_MESSAGES.FORBIDDEN;
    case 404: return ERROR_MESSAGES.NOT_FOUND;
    case 409: return ERROR_MESSAGES.DUPLICATE;
    case 413: return ERROR_MESSAGES.FILE_TOO_LARGE;
    case 429: return ERROR_MESSAGES.RATE_LIMITED;
    case 500:
    case 502:
    case 503: return ERROR_MESSAGES.SERVER_ERROR;
    default: return serverMessage || ERROR_MESSAGES.UNKNOWN;
  }
}

export default ERROR_MESSAGES;
