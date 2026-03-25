// ============================================
// متحكم النسخ الاحتياطي | Backup Controller
// ============================================
const { supabase } = require('../config/supabase');

// تحميل نسخة احتياطية كاملة | Download full backup
async function downloadBackup(req, res) {
  try {
    const [
      { data: podcasts },
      { data: episodes },
      { data: users },
      { data: categories },
      { data: comments },
      { data: activityLogs },
    ] = await Promise.all([
      supabase.from('podcasts').select('*'),
      supabase.from('episodes').select('*'),
      supabase.from('users').select('id, email, username, role, created_at'),
      supabase.from('categories').select('*'),
      supabase.from('comments').select('*'),
      supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(500),
    ]);

    const backup = {
      version: '2.0.0',
      exported_at: new Date().toISOString(),
      data: {
        categories: categories || [],
        users: users || [],
        podcasts: podcasts || [],
        episodes: episodes || [],
        comments: comments || [],
        activity_logs: activityLogs || [],
      },
      summary: {
        total_categories: (categories || []).length,
        total_users: (users || []).length,
        total_podcasts: (podcasts || []).length,
        total_episodes: (episodes || []).length,
        total_comments: (comments || []).length,
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=podcast-backup-${Date.now()}.json`);
    res.json(backup);
  } catch (err) {
    console.error('خطأ في النسخ الاحتياطي:', err.message);
    res.status(500).json({ error: true, message: 'فشل في إنشاء النسخة الاحتياطية' });
  }
}

module.exports = { downloadBackup };
