// ============================================
// مسارات المشرف الإضافية | Admin Extra Routes
// ============================================
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { getActivityLogs } = require('../controllers/activityLogController');
const { exportData } = require('../controllers/exportController');

// سجل النشاطات | Activity logs
router.get('/admin/activity-logs', authenticate, requireAdmin, getActivityLogs);

// تصدير البيانات | Export data
router.get('/admin/export', authenticate, requireAdmin, exportData);

module.exports = router;
