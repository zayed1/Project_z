// ============================================
// متحكم التقييمات | Ratings Controller
// ============================================
const { supabase } = require('../config/supabase');

// تقييم حلقة | Rate episode
async function rateEpisode(req, res) {
  try {
    const { episodeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: true, message: 'التقييم يجب أن يكون بين 1 و 5' });
    }

    const { data: existing } = await supabase
      .from('ratings')
      .select('id')
      .eq('episode_id', episodeId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase.from('ratings').update({ rating }).eq('id', existing.id);
    } else {
      await supabase.from('ratings').insert({ episode_id: episodeId, user_id: userId, rating });
    }

    // حساب المتوسط | Calculate average
    const { data: allRatings } = await supabase
      .from('ratings')
      .select('rating')
      .eq('episode_id', episodeId);

    const avg = allRatings && allRatings.length > 0
      ? (allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length).toFixed(1)
      : 0;

    res.json({ average: parseFloat(avg), count: allRatings?.length || 0, userRating: rating });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل في التقييم' });
  }
}

// جلب تقييم حلقة | Get episode rating
async function getEpisodeRating(req, res) {
  try {
    const { episodeId } = req.params;
    const userId = req.query.userId;

    const { data: allRatings } = await supabase
      .from('ratings')
      .select('rating')
      .eq('episode_id', episodeId);

    const avg = allRatings && allRatings.length > 0
      ? (allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length).toFixed(1)
      : 0;

    let userRating = null;
    if (userId) {
      const { data } = await supabase
        .from('ratings')
        .select('rating')
        .eq('episode_id', episodeId)
        .eq('user_id', userId)
        .single();
      userRating = data?.rating || null;
    }

    res.json({ average: parseFloat(avg), count: allRatings?.length || 0, userRating });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

module.exports = { rateEpisode, getEpisodeRating };
