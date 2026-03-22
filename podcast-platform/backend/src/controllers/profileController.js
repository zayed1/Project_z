// ============================================
// متحكم الملف الشخصي | Profile Controller
// ============================================
const { supabase } = require('../config/supabase');

// جلب الملف الشخصي العام | Get public profile
async function getPublicProfile(req, res) {
  try {
    const { username } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, avatar_url, bio, created_at')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: true, message: 'المستخدم غير موجود' });
    }

    // إحصائيات عامة | Public stats
    const [followsRes, commentsRes, likesRes] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('likes').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('type', 'like'),
    ]);

    // شارات | Badges
    const { data: badges } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', user.id);

    res.json({
      profile: {
        ...user,
        stats: {
          follows: followsRes.count || 0,
          comments: commentsRes.count || 0,
          likes: likesRes.count || 0,
        },
        badges: badges || [],
      },
    });
  } catch (err) {
    console.error('خطأ في جلب الملف الشخصي:', err.message);
    res.status(500).json({ error: true, message: 'فشل في جلب الملف الشخصي' });
  }
}

// تعديل الملف الشخصي | Update profile
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { username, bio, avatar_url } = req.body;

    const updates = {};
    if (username) updates.username = username.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: true, message: 'لا توجد بيانات للتعديل' });
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, username, email, avatar_url, bio, role')
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: true, message: 'اسم المستخدم مستخدم بالفعل' });
      }
      throw error;
    }

    res.json({ user: data, message: 'تم تعديل الملف الشخصي' });
  } catch (err) {
    console.error('خطأ في تعديل الملف الشخصي:', err.message);
    res.status(500).json({ error: true, message: 'فشل في تعديل الملف الشخصي' });
  }
}

module.exports = { getPublicProfile, updateProfile };
