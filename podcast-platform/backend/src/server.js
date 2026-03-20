// ============================================
// الخادم الرئيسي | Main Server Entry Point
// ============================================
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');

// استيراد الراوترات | Import Routes
const podcastRoutes = require('./routes/podcasts');
const episodeRoutes = require('./routes/episodes');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// الـ Middleware العام | Global Middleware
// ============================================

// إعدادات CORS للسماح بالطلبات من الفرونت إند
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// تسجيل الطلبات | Request Logging
app.use(morgan('dev'));

// تحليل الطلبات | Body Parsing
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// الراوترات | Routes
// ============================================
app.use('/api', userRoutes);
app.use('/api', podcastRoutes);
app.use('/api', episodeRoutes);

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

// معالجة الراوترات غير الموجودة | 404 Handler
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
  console.log(`🎙️  خادم منصة البودكاست يعمل على البورت ${PORT}`);
  console.log(`🎙️  Podcast platform server running on port ${PORT}`);
});
