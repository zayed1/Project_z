// ============================================
// إدارة التعليقات المجمّعة | Bulk Comments Controller
// ============================================
const { supabase } = require('../config/supabase');

// حذف تعليقات مجمّعة | Bulk delete comments
async function bulkDeleteComments(req, res) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: true, message: 'لا توجد تعليقات محددة' });
    }

    const { error } = await supabase.from('comments').delete().in('id', ids);
    if (error) throw error;

    res.json({ message: `تم حذف ${ids.length} تعليق`, deleted: ids.length });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// جلب تعليقات مع فلاتر | Get comments with filters
async function getFilteredComments(req, res) {
  try {
    const { page = 0, limit = 30, sort = 'newest', episodeId } = req.query;

    let query = supabase
      .from('comments')
      .select('*, users:user_id(id, username, avatar_url), episodes:episode_id(id, title)')
      .range(page * limit, (page + 1) * limit - 1);

    if (episodeId) query = query.eq('episode_id', episodeId);

    if (sort === 'newest') query = query.order('created_at', { ascending: false });
    else if (sort === 'oldest') query = query.order('created_at', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    res.json({
      comments: (data || []).map((c) => ({ ...c, user: c.users, episode: c.episodes, users: undefined, episodes: undefined })),
    });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

module.exports = { bulkDeleteComments, getFilteredComments };
