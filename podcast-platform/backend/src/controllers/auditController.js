// ============================================
// سجل التعديلات | Audit Trail Controller
// ============================================
const { supabase } = require('../config/supabase');

// تسجيل حدث | Log an action
async function logAction(userId, action, target_type, target_id, details = {}) {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      target_type,
      target_id,
      details,
    });
  } catch {}
}

// جلب السجل | Get audit logs
async function getAuditLogs(req, res) {
  try {
    const { page = 0, limit = 30, action, target_type } = req.query;
    let query = supabase
      .from('audit_logs')
      .select('*, users:user_id(id, username)')
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (action) query = query.eq('action', action);
    if (target_type) query = query.eq('target_type', target_type);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ logs: (data || []).map((l) => ({ ...l, user: l.users, users: undefined })) });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

module.exports = { logAction, getAuditLogs };
