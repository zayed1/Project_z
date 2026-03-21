// ============================================
// متحكم المتابعة | Follow Controller
// ============================================
const { supabase } = require('../config/supabase');

// متابعة/إلغاء متابعة بودكاست | Follow/unfollow podcast
async function toggleFollow(req, res) {
  try {
    const { podcastId } = req.params;
    const userId = req.user.id;

    const { data: existing } = await supabase
      .from('follows')
      .select('id')
      .eq('podcast_id', podcastId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase.from('follows').delete().eq('id', existing.id);
      return res.json({ following: false, message: 'تم إلغاء المتابعة' });
    }

    const { error } = await supabase
      .from('follows')
      .insert({ podcast_id: podcastId, user_id: userId });

    if (error) throw error;
    res.json({ following: true, message: 'تم المتابعة بنجاح' });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل في تحديث المتابعة' });
  }
}

// جلب متابعات المستخدم | Get user follows
async function getMyFollows(req, res) {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('follows')
      .select(`
        id, created_at,
        podcasts:podcast_id (id, title, cover_image_url, description, categories:category_id (name))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const follows = (data || []).map((f) => ({
      ...f.podcasts,
      category: f.podcasts?.categories,
      categories: undefined,
      followed_at: f.created_at,
    }));

    res.json({ podcasts: follows });
  } catch (err) {
    res.status(500).json({ podcasts: [] });
  }
}

// التحقق من المتابعة | Check follow status
async function checkFollow(req, res) {
  try {
    const { podcastId } = req.params;
    const userId = req.user.id;

    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('podcast_id', podcastId)
      .eq('user_id', userId)
      .single();

    res.json({ following: !!data });
  } catch {
    res.json({ following: false });
  }
}

// عدد المتابعين | Followers count
async function getFollowersCount(req, res) {
  try {
    const { podcastId } = req.params;
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('podcast_id', podcastId);

    res.json({ count: count || 0 });
  } catch {
    res.json({ count: 0 });
  }
}

module.exports = { toggleFollow, getMyFollows, checkFollow, getFollowersCount };
