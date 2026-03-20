// ============================================
// متحكم سجل النشاطات | Activity Log Controller
// ============================================
const { supabase } = require('../config/supabase');

// تسجيل نشاط | Log an activity
async function logActivity(userId, action, details = '') {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action,
      details,
    });
  } catch (err) {
    console.error('خطأ في تسجيل النشاط:', err.message);
  }
}

// جلب سجل النشاطات | Get activity logs
async function getActivityLogs(req, res) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;

    const { data: logs, error, count } = await supabase
      .from('activity_logs')
      .select(`*, users:user_id (id, username)`, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    const result = (logs || []).map((l) => ({
      ...l,
      user: l.users,
      users: undefined,
    }));

    res.json({
      logs: result,
      pagination: {
        page: pageNum,
        total: count || 0,
        pages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (err) {
    console.error('خطأ في جلب السجل:', err.message);
    res.status(500).json({ error: true, message: 'فشل في جلب سجل النشاطات' });
  }
}

module.exports = { logActivity, getActivityLogs };
