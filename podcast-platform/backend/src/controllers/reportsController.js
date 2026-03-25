// ============================================
// متحكم البلاغات | Reports Controller
// ============================================
const { supabase } = require('../config/supabase');

// إرسال بلاغ | Submit report
async function submitReport(req, res) {
  try {
    const userId = req.user.id;
    const { type, target_id, reason } = req.body;

    if (!type || !target_id || !reason?.trim()) {
      return res.status(400).json({ error: true, message: 'بيانات البلاغ غير مكتملة' });
    }

    const { error } = await supabase
      .from('reports')
      .insert({ user_id: userId, type, target_id, reason: reason.trim(), status: 'pending' });

    if (error) throw error;
    res.status(201).json({ message: 'تم إرسال البلاغ' });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل في إرسال البلاغ' });
  }
}

// جلب البلاغات (مشرف) | Get reports (admin)
async function getReports(req, res) {
  try {
    const { status } = req.query;
    let query = supabase
      .from('reports')
      .select('*, users:user_id(id, username)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ reports: (data || []).map((r) => ({ ...r, user: r.users, users: undefined })) });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// تعديل حالة بلاغ | Update report status
async function updateReport(req, res) {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: true, message: 'حالة غير صالحة' });
    }

    const { error } = await supabase
      .from('reports')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', reportId);

    if (error) throw error;
    res.json({ message: 'تم تعديل البلاغ' });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

module.exports = { submitReport, getReports, updateReport };
