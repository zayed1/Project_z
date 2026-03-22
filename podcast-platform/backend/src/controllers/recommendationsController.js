// ============================================
// متحكم الاقتراحات الذكية | Smart Recommendations Controller
// ============================================
const { supabase } = require('../config/supabase');

async function getRecommendations(req, res) {
  try {
    const userId = req.user.id;

    // 1. جلب التصنيفات المفضلة بناءً على المتابعات | Favorite categories from follows
    const { data: follows } = await supabase
      .from('follows')
      .select('podcast_id')
      .eq('user_id', userId);

    const followedIds = (follows || []).map((f) => f.podcast_id);

    let favCategories = [];
    if (followedIds.length > 0) {
      const { data: followedPodcasts } = await supabase
        .from('podcasts')
        .select('category_id')
        .in('id', followedIds)
        .not('category_id', 'is', null);

      favCategories = [...new Set((followedPodcasts || []).map((p) => p.category_id))];
    }

    // 2. جلب الحلقات المستمعة | Listened episodes from activity_logs
    const { data: listenLogs } = await supabase
      .from('activity_logs')
      .select('details')
      .eq('user_id', userId)
      .eq('action', 'listen')
      .order('created_at', { ascending: false })
      .limit(50);

    // استخراج podcast_ids من السجل | Extract podcast IDs from logs
    const listenedPodcastIds = new Set();
    (listenLogs || []).forEach((log) => {
      try {
        const match = log.details?.match(/podcast[_\s]?id[:\s]*([a-f0-9-]+)/i);
        if (match) listenedPodcastIds.add(match[1]);
      } catch {}
    });

    // 3. اقتراح بودكاست من نفس التصنيفات لم يتابعها | Suggest from same categories
    let recommended = [];

    if (favCategories.length > 0) {
      const { data } = await supabase
        .from('podcasts')
        .select('*, category:categories(name), episodes:episodes(count)')
        .in('category_id', favCategories)
        .not('id', 'in', `(${followedIds.join(',')})`)
        .order('created_at', { ascending: false })
        .limit(6);
      recommended = data || [];
    }

    // 4. إذا لم تكفِ، أضف الأكثر شعبية | If not enough, add popular
    if (recommended.length < 6) {
      const excludeIds = [...followedIds, ...recommended.map((r) => r.id)];
      const { data: popular } = await supabase
        .from('podcasts')
        .select('*, category:categories(name)')
        .not('id', 'in', excludeIds.length > 0 ? `(${excludeIds.join(',')})` : '(00000000-0000-0000-0000-000000000000)')
        .order('created_at', { ascending: false })
        .limit(6 - recommended.length);

      recommended = [...recommended, ...(popular || [])];
    }

    res.json({ recommendations: recommended });
  } catch (err) {
    console.error('خطأ في الاقتراحات:', err.message);
    res.status(500).json({ error: true, message: 'فشل في جلب الاقتراحات' });
  }
}

module.exports = { getRecommendations };
