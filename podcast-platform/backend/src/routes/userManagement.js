// ============================================
// مسارات إدارة المستخدمين | User Management Routes
// ============================================
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { getUsers, toggleBanUser, changeUserRole } = require('../controllers/userManagementController');

router.get('/admin/users', authenticate, requireAdmin, getUsers);
router.put('/admin/users/:userId/ban', authenticate, requireAdmin, toggleBanUser);
router.put('/admin/users/:userId/role', authenticate, requireAdmin, changeUserRole);

module.exports = router;
