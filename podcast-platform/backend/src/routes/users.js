// ============================================
// مسارات المستخدمين | User Routes
// ============================================
const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/usersController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');

// تسجيل مستخدم جديد | Register
router.post('/auth/register', authLimiter, register);

// تسجيل الدخول | Login
router.post('/auth/login', authLimiter, login);

// جلب بيانات المستخدم الحالي | Get current user profile (protected)
router.get('/users/profile', authenticate, getProfile);

module.exports = router;
