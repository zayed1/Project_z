// ============================================
// متحكم التصدير | Export Controller
// ============================================
const { supabase } = require('../config/supabase');

// تصدير بيانات الإحصائيات كـ JSON أو CSV
async function exportData(req, res) {
  try {
    const { format = 'json' } = req.query;

    // جلب كل البودكاست مع حلقاتها | Get all podcasts with episodes
    const { data: podcasts } = await supabase
      .from('podcasts')
      .select(`
        id, title, created_at,
        episodes (id, title, listen_count, episode_number, published_at, created_at)
      `)
      .order('created_at', { ascending: false });

    const exportRows = [];
    for (const p of (podcasts || [])) {
      for (const ep of (p.episodes || [])) {
        exportRows.push({
          podcast_title: p.title,
          episode_title: ep.title,
          episode_number: ep.episode_number || '',
          listen_count: ep.listen_count || 0,
          published_at: ep.published_at || '',
          created_at: ep.created_at || '',
        });
      }
    }

    if (format === 'csv') {
      const headers = 'podcast_title,episode_title,episode_number,listen_count,published_at,created_at';
      const rows = exportRows.map((r) =>
        `"${r.podcast_title}","${r.episode_title}",${r.episode_number},${r.listen_count},"${r.published_at}","${r.created_at}"`
      );
      const csv = [headers, ...rows].join('\n');

      res.set('Content-Type', 'text/csv; charset=utf-8');
      res.set('Content-Disposition', `attachment; filename=podcast-stats-${Date.now()}.csv`);
      return res.send('\uFEFF' + csv); // BOM for Arabic support in Excel
    }

    // JSON format
    res.set('Content-Disposition', `attachment; filename=podcast-stats-${Date.now()}.json`);
    res.json({ export_date: new Date().toISOString(), data: exportRows });
  } catch (err) {
    console.error('خطأ في التصدير:', err.message);
    res.status(500).json({ error: true, message: 'فشل في تصدير البيانات' });
  }
}

module.exports = { exportData };
