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
const { getReplies, addReply } = require('./controllers/nestedCommentsController');
const { getEpisodeAnalytics } = require('./controllers/episodeAnalyticsController');
const { createCategory, updateCategory, deleteCategory } = require('./controllers/categoryController');
const { sendBroadcast, getMyNotifications, markNotificationsRead } = require('./controllers/broadcastController');
const { getPublicProfile, updateProfile } = require('./controllers/profileController');
const { createClip, getEpisodeClips, deleteClip } = require('./controllers/clipsController');
const { createPoll, getEpisodePoll, votePoll } = require('./controllers/pollsController');
const { getRecommendations } = require('./controllers/recommendationsController');
const { recordGeoListen, getGeoStats } = require('./controllers/geoAnalyticsController');
const { getEmbedData, getEmbedPage } = require('./controllers/embedController');
const { getScheduledEpisodes, updateSchedule } = require('./controllers/schedulerController');
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

// ردود التعليقات | Nested Replies
app.get('/api/comments/:commentId/replies', getReplies);
app.post('/api/comments/:commentId/replies', authenticate, addReply);

// إحصائيات الحلقة | Episode Analytics
app.get('/api/admin/episodes/:episodeId/analytics', authenticate, requireAdmin, getEpisodeAnalytics);

// إدارة التصنيفات | Category Management
app.post('/api/admin/categories', authenticate, requireAdmin, createCategory);
app.put('/api/admin/categories/:categoryId', authenticate, requireAdmin, updateCategory);
app.delete('/api/admin/categories/:categoryId', authenticate, requireAdmin, deleteCategory);

// الرسائل والإشعارات | Broadcast & Notifications
app.post('/api/admin/broadcast', authenticate, requireAdmin, sendBroadcast);
app.get('/api/me/notifications', authenticate, getMyNotifications);
app.put('/api/me/notifications/read', authenticate, markNotificationsRead);

// الملف الشخصي | Profile
app.get('/api/profile/:username', getPublicProfile);
app.put('/api/me/profile', authenticate, updateProfile);

// المقاطع المميزة | Clips
app.post('/api/clips', authenticate, createClip);
app.get('/api/episodes/:episodeId/clips', getEpisodeClips);
app.delete('/api/clips/:clipId', authenticate, deleteClip);

// الاستطلاعات | Polls
app.post('/api/admin/polls', authenticate, requireAdmin, createPoll);
app.get('/api/episodes/:episodeId/poll', getEpisodePoll);
app.post('/api/polls/:pollId/vote', authenticate, votePoll);

// الاقتراحات الذكية | Smart Recommendations
app.get('/api/me/recommendations', authenticate, getRecommendations);

// الإحصائيات الجغرافية | Geo Analytics
app.post('/api/episodes/:episodeId/geo', recordGeoListen);
app.get('/api/admin/geo-stats', authenticate, requireAdmin, getGeoStats);

// التضمين الخارجي | Embed
app.get('/api/embed/:episodeId', getEmbedData);
app.get('/embed/:episodeId', getEmbedPage);

// الجدولة | Scheduler
app.get('/api/admin/scheduler', authenticate, requireAdmin, getScheduledEpisodes);
app.put('/api/admin/scheduler/:episodeId', authenticate, requireAdmin, updateSchedule);

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
