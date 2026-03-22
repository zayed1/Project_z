// ============================================
// الخادم الرئيسي | Main Server Entry Point
// ============================================
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server: SocketServer } = require('socket.io');
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
const { createPlaylist, getMyPlaylists, getPlaylist, addToPlaylist, removeFromPlaylist, deletePlaylist } = require('./controllers/playlistsController');
const { rateEpisode, getEpisodeRating } = require('./controllers/ratingsController');
const { submitReport, getReports, updateReport } = require('./controllers/reportsController');
const { getChapters, saveChapters } = require('./controllers/chaptersController');
const { savePlaybackPosition, getPlaybackPosition, getAllPositions } = require('./controllers/syncController');
const { createABTest, getVariant, recordClick, getABTests } = require('./controllers/abTestingController');
const { exportUsers, exportStats } = require('./controllers/exportController');
const { addTimedComment, getTimedComments, deleteTimedComment } = require('./controllers/timedCommentsController');
const { setEpisodeMood, getEpisodeMoods, getByMood, getMoodList } = require('./controllers/moodController');
const { savePreferences, getPreferences, getPersonalizedFeed } = require('./controllers/onboardingController');
const { setWelcomeMessage, getWelcomeMessage } = require('./controllers/welcomeController');
const { getBestPublishTimes } = require('./controllers/smartScheduleController');
const { getCreatorStats } = require('./controllers/creatorDashboardController');
const { createWebhook, getWebhooks, deleteWebhook, toggleWebhook, getWebhookLogs } = require('./controllers/webhooksController');
const { getHealth, ping } = require('./controllers/systemHealthController');
const { authLimiter, searchLimiter, uploadLimiter, smartLimiter } = require('./middleware/advancedRateLimit');
const { graphqlHTTP } = require('express-graphql');
const { schema, root } = require('./graphql/schema');
const { saveNote, getNotes, deleteNote, getAllNotes } = require('./controllers/notesController');
const { logAction, getAuditLogs } = require('./controllers/auditController');
const { getSettings, updateSettings } = require('./controllers/siteSettingsController');
const { bulkDeleteComments, getFilteredComments } = require('./controllers/bulkCommentsController');
const { createTemplate, getTemplates, updateTemplate, deleteTemplate } = require('./controllers/messageTemplatesController');
const { getWeeklyReport } = require('./controllers/weeklyReportController');
const { getPrefetchData } = require('./controllers/prefetchController');
const { getOptimizedImage } = require('./controllers/imageController');
const { getWeeklyChallenges, checkAchievement } = require('./controllers/achievementsController');
const { trackMood, getMoodHistory } = require('./controllers/moodTrackController');
const { getLiveStats } = require('./controllers/liveMonitorController');
const { compareEpisodes } = require('./controllers/episodeCompareController');
const { getFilteredRatings, deleteRating } = require('./controllers/ratingsManageController');
const { recordPosition, getHeatmap } = require('./controllers/heatmapController');
const { createRoom, getRooms, getRoom } = require('./controllers/listenRoomController');
const { sendGift, getMyGifts } = require('./controllers/giftController');
const { addFanMessage, getFanMessages, deleteFanMessage } = require('./controllers/fanWallController');
const { createScheduledPost, getScheduledPosts, deleteScheduledPost } = require('./controllers/scheduledPostsController');
const { authenticate } = require('./middleware/auth');
const { requireAdmin } = require('./middleware/admin');

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 3000;

// WebSocket إشعارات حية | Live Notifications
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    if (userId) socket.join(`user:${userId}`);
  });
  socket.on('disconnect', () => {});
});

// دالة لإرسال إشعار حي | Helper to emit live notification
app.set('io', io);

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

// قوائم التشغيل | Playlists
app.post('/api/playlists', authenticate, createPlaylist);
app.get('/api/me/playlists', authenticate, getMyPlaylists);
app.get('/api/playlists/:playlistId', getPlaylist);
app.post('/api/playlists/:playlistId/items', authenticate, addToPlaylist);
app.delete('/api/playlists/:playlistId/items/:itemId', authenticate, removeFromPlaylist);
app.delete('/api/playlists/:playlistId', authenticate, deletePlaylist);

// التقييمات | Ratings
app.post('/api/episodes/:episodeId/rate', authenticate, rateEpisode);
app.get('/api/episodes/:episodeId/rating', getEpisodeRating);

// البلاغات | Reports
app.post('/api/reports', authenticate, submitReport);
app.get('/api/admin/reports', authenticate, requireAdmin, getReports);
app.put('/api/admin/reports/:reportId', authenticate, requireAdmin, updateReport);

// الفصول | Chapters
app.get('/api/episodes/:episodeId/chapters', getChapters);
app.put('/api/admin/episodes/:episodeId/chapters', authenticate, requireAdmin, saveChapters);

// المزامنة | Sync
app.post('/api/me/sync', authenticate, savePlaybackPosition);
app.get('/api/me/sync/:episodeId', authenticate, getPlaybackPosition);
app.get('/api/me/sync', authenticate, getAllPositions);

// A/B Testing
app.post('/api/admin/ab-tests', authenticate, requireAdmin, createABTest);
app.get('/api/admin/ab-tests', authenticate, requireAdmin, getABTests);
app.get('/api/episodes/:episodeId/variant', getVariant);
app.post('/api/ab-tests/:testId/click', recordClick);

// التصدير | Export
app.get('/api/admin/export/users', authenticate, requireAdmin, exportUsers);
app.get('/api/admin/export/stats', authenticate, requireAdmin, exportStats);

// التعليقات الموقّتة | Timed Comments
app.post('/api/timed-comments', authenticate, addTimedComment);
app.get('/api/episodes/:episodeId/timed-comments', getTimedComments);
app.delete('/api/timed-comments/:commentId', authenticate, deleteTimedComment);

// المزاج | Mood Tags
app.get('/api/moods', getMoodList);
app.get('/api/moods/:mood/episodes', getByMood);
app.get('/api/episodes/:episodeId/moods', getEpisodeMoods);
app.put('/api/admin/episodes/:episodeId/moods', authenticate, requireAdmin, setEpisodeMood);

// Onboarding وتفضيلات المستخدم | Onboarding & Preferences
app.post('/api/me/preferences', authenticate, savePreferences);
app.get('/api/me/preferences', authenticate, getPreferences);
app.get('/api/me/personalized-feed', authenticate, getPersonalizedFeed);

// رسالة ترحيب | Welcome Messages
app.put('/api/podcasts/:podcastId/welcome', authenticate, setWelcomeMessage);
app.get('/api/podcasts/:podcastId/welcome', getWelcomeMessage);

// جدول نشر ذكي | Smart Schedule
app.get('/api/podcasts/:podcastId/best-times', authenticate, getBestPublishTimes);

// لوحة صانع المحتوى | Creator Dashboard
app.get('/api/me/creator-stats', authenticate, getCreatorStats);

// Webhooks (مشرف) | Webhooks (admin)
app.post('/api/admin/webhooks', authenticate, requireAdmin, createWebhook);
app.get('/api/admin/webhooks', authenticate, requireAdmin, getWebhooks);
app.delete('/api/admin/webhooks/:webhookId', authenticate, requireAdmin, deleteWebhook);
app.put('/api/admin/webhooks/:webhookId/toggle', authenticate, requireAdmin, toggleWebhook);
app.get('/api/admin/webhook-logs', authenticate, requireAdmin, getWebhookLogs);

// صحة النظام | System Health
app.get('/api/admin/system-health', authenticate, requireAdmin, getHealth);
app.get('/api/ping', ping);

// ملاحظات الحلقات | Episode Notes
app.post('/api/me/notes', authenticate, saveNote);
app.get('/api/me/notes', authenticate, getAllNotes);
app.get('/api/me/notes/:episodeId', authenticate, getNotes);
app.delete('/api/me/notes/:noteId', authenticate, deleteNote);

// سجل التعديلات | Audit Logs
app.get('/api/admin/audit-logs', authenticate, requireAdmin, getAuditLogs);

// إعدادات الموقع | Site Settings
app.get('/api/settings', getSettings);
app.put('/api/admin/settings', authenticate, requireAdmin, updateSettings);

// إدارة التعليقات المجمّعة | Bulk Comments
app.get('/api/admin/comments', authenticate, requireAdmin, getFilteredComments);
app.post('/api/admin/comments/bulk-delete', authenticate, requireAdmin, bulkDeleteComments);

// قوالب الرسائل | Message Templates
app.post('/api/admin/templates', authenticate, requireAdmin, createTemplate);
app.get('/api/admin/templates', authenticate, requireAdmin, getTemplates);
app.put('/api/admin/templates/:templateId', authenticate, requireAdmin, updateTemplate);
app.delete('/api/admin/templates/:templateId', authenticate, requireAdmin, deleteTemplate);

// التقرير الأسبوعي | Weekly Report
app.get('/api/admin/weekly-report', authenticate, requireAdmin, getWeeklyReport);

// البيانات المسبقة | Prefetch
app.get('/api/podcasts/:id/prefetch', getPrefetchData);

// الصور المحسّنة | Optimized Images
app.get('/api/images/optimize', getOptimizedImage);

// التحديات الأسبوعية | Weekly Challenges
app.get('/api/me/challenges', authenticate, getWeeklyChallenges);
app.post('/api/me/achievements/check', authenticate, checkAchievement);

// تتبع المزاج | Mood Tracking
app.post('/api/me/mood-track', authenticate, trackMood);
app.get('/api/me/mood-history', authenticate, getMoodHistory);

// المراقبة الحية | Live Monitor
app.get('/api/admin/live-stats', authenticate, requireAdmin, getLiveStats);

// مقارنة الحلقات | Episode Compare
app.post('/api/admin/episodes/compare', authenticate, requireAdmin, compareEpisodes);

// إدارة التقييمات | Ratings Management
app.get('/api/admin/ratings', authenticate, requireAdmin, getFilteredRatings);
app.delete('/api/admin/ratings/:ratingId', authenticate, requireAdmin, deleteRating);

// خريطة الاستماع الحرارية | Listen Heatmap
app.post('/api/episodes/:episodeId/heatmap', recordPosition);
app.get('/api/episodes/:episodeId/heatmap', getHeatmap);

// غرف الاستماع | Listen Rooms
app.post('/api/listen-rooms', authenticate, createRoom);
app.get('/api/listen-rooms', getRooms);
app.get('/api/listen-rooms/:roomId', getRoom);

// الهدايا | Gifts
app.post('/api/gifts', authenticate, sendGift);
app.get('/api/me/gifts', authenticate, getMyGifts);

// جدار المعجبين | Fan Wall
app.post('/api/podcasts/:podcastId/fan-wall', authenticate, addFanMessage);
app.get('/api/podcasts/:podcastId/fan-wall', getFanMessages);
app.delete('/api/fan-wall/:messageId', authenticate, deleteFanMessage);

// المنشورات المجدولة | Scheduled Posts
app.post('/api/admin/scheduled-posts', authenticate, requireAdmin, createScheduledPost);
app.get('/api/admin/scheduled-posts', authenticate, requireAdmin, getScheduledPosts);
app.delete('/api/admin/scheduled-posts/:postId', authenticate, requireAdmin, deleteScheduledPost);

// GraphQL
app.use('/graphql', graphqlHTTP({ schema, rootValue: root, graphiql: process.env.NODE_ENV !== 'production' }));

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
server.listen(PORT, () => {
  console.log(`خادم منصة البودكاست يعمل على البورت ${PORT}`);
});
