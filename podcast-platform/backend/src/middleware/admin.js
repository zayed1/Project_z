// ============================================
// وسيط التحقق من المشرف | Admin Verification Middleware
// ============================================

// التحقق أن المستخدم مشرف | Verify user is admin
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: true,
      message: 'غير مصرح - صلاحيات المشرف مطلوبة | Forbidden - Admin access required',
    });
  }
  next();
}

module.exports = { requireAdmin };
