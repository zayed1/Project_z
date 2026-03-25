// ============================================
// Rate Limiting ذكي | Advanced Rate Limiting Middleware
// ============================================
const rateLimit = require('express-rate-limit');

// مخزن في الذاكرة مع عدادات لكل مستخدم | In-memory store with per-user counters
const userCounters = new Map();

// تنظيف دوري | Periodic cleanup
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of userCounters) {
    if (now - val.resetAt > 3600000) userCounters.delete(key);
  }
}, 600000);

// Rate limit عام | General rate limit
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: true, message: 'طلبات كثيرة، حاول لاحقاً' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit للمصادقة | Auth rate limit (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: true, message: 'محاولات كثيرة، انتظر 15 دقيقة' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit للبحث | Search rate limit
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: true, message: 'بحث كثير، حاول لاحقاً' },
});

// Rate limit للتحميل | Upload rate limit
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: true, message: 'رفع ملفات كثير، حاول بعد ساعة' },
});

// Rate limit للـ API العام | Public API rate limit
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: true, message: 'تجاوزت حد الطلبات' },
});

// Rate limit ذكي حسب المستخدم | Smart per-user limiter
function smartLimiter(options = {}) {
  const { maxPerMinute = 60, maxPerHour = 500 } = options;

  return (req, res, next) => {
    const key = req.user?.id || req.ip;
    const now = Date.now();

    if (!userCounters.has(key)) {
      userCounters.set(key, { minute: 1, hour: 1, minuteReset: now + 60000, hourReset: now + 3600000, resetAt: now });
    }

    const counter = userCounters.get(key);

    // إعادة تعيين العدادات | Reset counters
    if (now > counter.minuteReset) {
      counter.minute = 0;
      counter.minuteReset = now + 60000;
    }
    if (now > counter.hourReset) {
      counter.hour = 0;
      counter.hourReset = now + 3600000;
    }

    counter.minute++;
    counter.hour++;
    counter.resetAt = now;

    if (counter.minute > maxPerMinute || counter.hour > maxPerHour) {
      return res.status(429).json({ error: true, message: 'طلبات كثيرة جداً' });
    }

    // إضافة headers | Add rate limit headers
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxPerMinute - counter.minute));
    res.setHeader('X-RateLimit-Reset', Math.ceil(counter.minuteReset / 1000));

    next();
  };
}

module.exports = { generalLimiter, authLimiter, searchLimiter, uploadLimiter, apiLimiter, smartLimiter };
