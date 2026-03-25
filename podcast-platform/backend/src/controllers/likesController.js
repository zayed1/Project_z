// ============================================
// متحكم الإعجابات | Likes Controller
// ============================================
const { supabase } = require('../config/supabase');

async function toggleLike(req, res) {
  try {
    const { episodeId } = req.params;
    const { type } = req.body; // 'like' or 'dislike'
    const userId = req.user.id;

    // حذف الإعجاب السابق | Remove previous
    await supabase.from('likes').delete().eq('episode_id', episodeId).eq('user_id', userId);

    // إضافة جديد | Add new
    const { error } = await supabase.from('likes').insert({ episode_id: episodeId, user_id: userId, type });
    if (error) throw error;

    const counts = await getLikeCounts(episodeId);
    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

async function removeLike(req, res) {
  try {
    const { episodeId } = req.params;
    const userId = req.user.id;
    await supabase.from('likes').delete().eq('episode_id', episodeId).eq('user_id', userId);
    const counts = await getLikeCounts(episodeId);
    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

async function getEpisodeLikes(req, res) {
  try {
    const { episodeId } = req.params;
    const counts = await getLikeCounts(episodeId);
    // إذا المستخدم مسجل، جلب حالته | If user logged in, get their state
    let userLike = null;
    if (req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { data } = await supabase.from('likes').select('type').eq('episode_id', episodeId).eq('user_id', decoded.id).single();
        if (data) userLike = data.type;
      } catch {}
    }
    res.json({ ...counts, userLike });
  } catch (err) {
    res.status(500).json({ likes: 0, dislikes: 0, userLike: null });
  }
}

async function getLikeCounts(episodeId) {
  const { count: likes } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('episode_id', episodeId).eq('type', 'like');
  const { count: dislikes } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('episode_id', episodeId).eq('type', 'dislike');
  return { likes: likes || 0, dislikes: dislikes || 0 };
}

module.exports = { toggleLike, removeLike, getEpisodeLikes };
