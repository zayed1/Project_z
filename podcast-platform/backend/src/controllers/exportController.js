// ============================================
// متحكم تصدير البيانات | Data Export Controller
// ============================================
const { supabase } = require('../config/supabase');

// تصدير المستخدمين CSV | Export users as CSV
async function exportUsers(req, res) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const headers = ['ID', 'اسم المستخدم', 'البريد', 'الدور', 'تاريخ التسجيل'];
    const rows = (data || []).map((u) => [u.id, u.username, u.email, u.role, u.created_at]);

    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${(v || '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');

    const bom = '\uFEFF';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(bom + csv);
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل في التصدير' });
  }
}

// تصدير الإحصائيات CSV | Export stats as CSV
async function exportStats(req, res) {
  try {
    const { data: episodes, error } = await supabase
      .from('episodes')
      .select('id, title, play_count, created_at, podcast_id, podcasts:podcast_id(title)')
      .order('play_count', { ascending: false });

    if (error) throw error;

    const headers = ['ID', 'عنوان الحلقة', 'البودكاست', 'مرات التشغيل', 'تاريخ النشر'];
    const rows = (episodes || []).map((e) => [
      e.id, e.title, e.podcasts?.title || '', e.play_count || 0, e.created_at,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${(v || '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');

    const bom = '\uFEFF';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=stats.csv');
    res.send(bom + csv);
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل في التصدير' });
  }
}

module.exports = { exportUsers, exportStats };
