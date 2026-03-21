// ============================================
// الخادم الرئيسي | Main Server Entry Point
// ============================================
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { helmetMiddleware, generalLimiter } = require('./middleware/security');

// استيراد الراوترات | Import Routes
const podcastRoutes = require('./routes/podcasts');
const episodeRoutes = require('./routes/episodes');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');
const likesRoutes = require('./routes/likes');
const discoverRoutes = require('./routes/discover');
const userManagementRoutes = require('./routes/userManagement');
const followRoutes = require('./routes/follows');
const rssRoutes = require('./routes/rss');
const sitemapRoutes = require('./routes/sitemap');
const { downloadBackup } = require('./controllers/backupController');
const { importFromRSS } = require('./controllers/rssImportController');
const { getUserBadges } = require('./controllers/badgesController');
const { getDetailedStats } = require('./controllers/detailedStatsController');
const { authenticate } = require('./middleware/auth');
const { requireAdmin } = require('./middleware/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// الأمان | Security
// ============================================
app.use(helmetMiddleware);
app.use(generalLimiter);

// ============================================
// الـ Middleware العام | Global Middleware
// ============================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// الراوترات | Routes
// ============================================
app.use('/api', userRoutes);
app.use('/api', podcastRoutes);
app.use('/api', episodeRoutes);
app.use('/api', commentRoutes);
app.use('/api', adminRoutes);
app.use('/api', likesRoutes);
app.use('/api', discoverRoutes);
app.use('/api', userManagementRoutes);
app.use('/api', followRoutes);
app.get('/api/admin/backup', authenticate, requireAdmin, downloadBackup);
app.post('/api/admin/import-rss', authenticate, requireAdmin, importFromRSS);
app.get('/api/me/badges', authenticate, getUserBadges);
app.get('/api/admin/detailed-stats', authenticate, requireAdmin, getDetailedStats);
app.use('/rss', rssRoutes);
app.use(sitemapRoutes);

// نقطة فحص صحة الخادم | Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'منصة البودكاست تعمل بنجاح | Podcast platform is running',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// معالجة الأخطاء العامة | Global Error Handler
// ============================================
app.use((err, req, res, _next) => {
  console.error('خطأ في الخادم | Server Error:', err.message);
  res.status(err.status || 500).json({
    error: true,
    message: process.env.NODE_ENV === 'production'
      ? 'حدث خطأ في الخادم | Internal server error'
      : err.message,
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'المسار غير موجود | Route not found',
  });
});

// ============================================
// تشغيل الخادم | Start Server
// ============================================
app.listen(PORT, () => {
  console.log(`خادم منصة البودكاست يعمل على البورت ${PORT}`);
});
