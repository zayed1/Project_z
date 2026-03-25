// ============================================
// لوحة تحكم صانع المحتوى | Creator Dashboard Controller
// ============================================
const { supabase } = require('../config/supabase');

// إحصائيات صانع المحتوى | Creator stats
async function getCreatorStats(req, res) {
  try {
    const userId = req.user.id;

    // بودكاستات المستخدم | User's podcasts
    const { data: podcasts } = await supabase
      .from('podcasts')
      .select('id, title, cover_image_url, created_at')
      .eq('user_id', userId);

    if (!podcasts || podcasts.length === 0) {
      return res.json({ podcasts: [], totalPlays: 0, totalEpisodes: 0, totalFollowers: 0, recentListeners: [] });
    }

    const podcastIds = podcasts.map((p) => p.id);

    // إحصائيات الحلقات | Episode stats
    const { data: episodes } = await supabase
      .from('episodes')
      .select('id, title, play_count, created_at, podcast_id')
      .in('podcast_id', podcastIds)
      .order('created_at', { ascending: false });

    const totalPlays = (episodes || []).reduce((sum, ep) => sum + (ep.play_count || 0), 0);

    // عدد المتابعين | Follower count
    const { count: totalFollowers } = await supabase
      .from('follows')
      .select('id', { count: 'exact' })
      .in('podcast_id', podcastIds);

    // أفضل الحلقات | Top episodes
    const topEpisodes = [...(episodes || [])]
      .sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
      .slice(0, 5);

    // تعليقات حديثة | Recent comments
    const { data: recentComments } = await supabase
      .from('comments')
      .select('id, content, created_at, episode_id, users:user_id(username)')
      .in('episode_id', (episodes || []).map((e) => e.id))
      .order('created_at', { ascending: false })
      .limit(10);

    // نمو أسبوعي | Weekly growth
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyEpisodes = (episodes || []).filter((e) => new Date(e.created_at) >= oneWeekAgo);

    res.json({
      podcasts,
      totalEpisodes: (episodes || []).length,
      totalPlays,
      totalFollowers: totalFollowers || 0,
      topEpisodes,
      recentComments: (recentComments || []).map((c) => ({ ...c, user: c.users, users: undefined })),
      weeklyNewEpisodes: weeklyEpisodes.length,
    });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل في جلب الإحصائيات' });
  }
}

module.exports = { getCreatorStats };
