// ============================================
// وسيط الأمان | Security Middleware
// ============================================
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// حماية HTTP headers | Protect HTTP headers
const helmetMiddleware = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

// تحديد عدد الطلبات العامة | General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 200, // 200 طلب لكل IP
  message: {
    error: true,
    message: 'تم تجاوز عدد الطلبات المسموحة. حاول لاحقاً | Too many requests, try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// تحديد أكثر صرامة لمسارات المصادقة | Strict auth rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 محاولات فقط
  message: {
    error: true,
    message: 'محاولات دخول كثيرة. حاول بعد 15 دقيقة | Too many login attempts, try after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// تحديد طلبات الرفع | Upload rate limiting
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 30, // 30 رفع في الساعة
  message: {
    error: true,
    message: 'تم تجاوز عدد مرات الرفع المسموحة | Too many uploads, try again later',
  },
});

module.exports = {
  helmetMiddleware,
  generalLimiter,
  authLimiter,
  uploadLimiter,
};
