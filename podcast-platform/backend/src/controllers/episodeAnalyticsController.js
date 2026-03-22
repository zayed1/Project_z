// ============================================
// إحصائيات الحلقة التفصيلية | Episode Analytics Controller
// ============================================
const { supabase } = require('../config/supabase');

async function getEpisodeAnalytics(req, res) {
  try {
    const { episodeId } = req.params;

    // معلومات الحلقة | Episode info
    const { data: episode } = await supabase
      .from('episodes')
      .select('id, title, listen_count, created_at')
      .eq('id', episodeId)
      .single();

    if (!episode) {
      return res.status(404).json({ error: true, message: 'الحلقة غير موجودة' });
    }

    // استماعات يومية آخر 14 يوم | Daily listens last 14 days
    const dailyListens = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString();

      const { count } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'listen')
        .gte('created_at', dayStart)
        .lt('created_at', dayEnd)
        .like('details', `%${episodeId}%`);

      dailyListens.push({
        date: dayStart.split('T')[0],
        count: count || 0,
      });
    }

    // إجمالي التعليقات والإعجابات | Total comments and likes
    const [commentsRes, likesRes] = await Promise.all([
      supabase.from('comments').select('*', { count: 'exact', head: true }).eq('episode_id', episodeId),
      supabase.from('likes').select('*', { count: 'exact', head: true }).eq('episode_id', episodeId).eq('type', 'like'),
    ]);

    res.json({
      episode: {
        id: episode.id,
        title: episode.title,
        totalListens: episode.listen_count || 0,
        totalComments: commentsRes.count || 0,
        totalLikes: likesRes.count || 0,
        createdAt: episode.created_at,
      },
      dailyListens,
    });
  } catch (err) {
    console.error('خطأ في إحصائيات الحلقة:', err.message);
    res.status(500).json({ error: true, message: 'فشل في جلب الإحصائيات' });
  }
}

module.exports = { getEpisodeAnalytics };
