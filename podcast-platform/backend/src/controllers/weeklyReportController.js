// ============================================
// التقرير الأسبوعي | Weekly Report Controller
// ============================================
const { supabase } = require('../config/supabase');

async function getWeeklyReport(req, res) {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weekStr = oneWeekAgo.toISOString();

    // حلقات جديدة هذا الأسبوع | New episodes this week
    const { data: newEpisodes, count: episodeCount } = await supabase
      .from('episodes')
      .select('id, title, play_count, podcast_id, podcasts:podcast_id(title)', { count: 'exact' })
      .gte('created_at', weekStr)
      .order('play_count', { ascending: false });

    // مستخدمين جدد | New users
    const { count: newUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .gte('created_at', weekStr);

    // تعليقات جديدة | New comments
    const { count: newComments } = await supabase
      .from('comments')
      .select('id', { count: 'exact' })
      .gte('created_at', weekStr);

    // أعلى 5 حلقات | Top 5 episodes overall
    const { data: topEpisodes } = await supabase
      .from('episodes')
      .select('id, title, play_count, podcasts:podcast_id(title)')
      .order('play_count', { ascending: false })
      .limit(5);

    // إجمالي التشغيل | Total plays
    const { data: allEps } = await supabase.from('episodes').select('play_count');
    const totalPlays = (allEps || []).reduce((s, e) => s + (e.play_count || 0), 0);

    // بودكاست جديدة | New podcasts
    const { count: newPodcasts } = await supabase
      .from('podcasts')
      .select('id', { count: 'exact' })
      .gte('created_at', weekStr);

    res.json({
      period: { from: weekStr, to: new Date().toISOString() },
      newEpisodes: episodeCount || 0,
      newUsers: newUsers || 0,
      newComments: newComments || 0,
      newPodcasts: newPodcasts || 0,
      totalPlays,
      topEpisodes: (topEpisodes || []).map((e) => ({ ...e, podcast: e.podcasts, podcasts: undefined })),
      recentEpisodes: (newEpisodes || []).slice(0, 10).map((e) => ({ ...e, podcast: e.podcasts, podcasts: undefined })),
    });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل في إنشاء التقرير' });
  }
}

module.exports = { getWeeklyReport };
