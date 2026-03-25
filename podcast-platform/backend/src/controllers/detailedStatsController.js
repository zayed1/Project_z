// ============================================
// إحصائيات مفصلة للمشرف | Detailed Admin Stats
// ============================================
const { supabase } = require('../config/supabase');

async function getDetailedStats(req, res) {
  try {
    const { count: totalUsers } = await supabase
      .from('users').select('*', { count: 'exact', head: true });
    const { count: totalPodcasts } = await supabase
      .from('podcasts').select('*', { count: 'exact', head: true });
    const { count: totalEpisodes } = await supabase
      .from('episodes').select('*', { count: 'exact', head: true });
    const { count: totalComments } = await supabase
      .from('comments').select('*', { count: 'exact', head: true });
    const { count: totalLikes } = await supabase
      .from('likes').select('*', { count: 'exact', head: true });
    const { count: totalFollows } = await supabase
      .from('follows').select('*', { count: 'exact', head: true });

    // إحصائيات الاستماع الأسبوعية | Weekly listen stats
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0)).toISOString();
      const dayEnd = new Date(date.setHours(23, 59, 59, 999)).toISOString();

      const { count } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'listen')
        .gte('created_at', dayStart)
        .lte('created_at', dayEnd);

      days.push({
        date: dayStart.split('T')[0],
        day: new Date(dayStart).toLocaleDateString('ar', { weekday: 'short' }),
        listens: count || 0,
      });
    }

    // مستخدمين جدد الأسبوع الماضي | New users last week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo);

    // أكثر التصنيفات استخداماً | Top categories
    const { data: podcasts } = await supabase
      .from('podcasts')
      .select('category_id, categories:category_id (name)');

    const catCounts = {};
    (podcasts || []).forEach((p) => {
      const name = p.categories?.name || 'بدون تصنيف';
      catCounts[name] = (catCounts[name] || 0) + 1;
    });

    const topCategories = Object.entries(catCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      stats: {
        totals: {
          users: totalUsers || 0,
          podcasts: totalPodcasts || 0,
          episodes: totalEpisodes || 0,
          comments: totalComments || 0,
          likes: totalLikes || 0,
          follows: totalFollows || 0,
        },
        weekly_listens: days,
        new_users_this_week: newUsers || 0,
        top_categories: topCategories,
      },
    });
  } catch (err) {
    console.error('خطأ في الإحصائيات المفصلة:', err.message);
    res.status(500).json({ error: true, message: 'فشل في جلب الإحصائيات' });
  }
}

module.exports = { getDetailedStats };
