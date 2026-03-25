// ============================================
// متحكم الشارات والإنجازات | Badges Controller
// ============================================
const { supabase } = require('../config/supabase');

// الشارات المتاحة | Available badges
const BADGE_DEFINITIONS = [
  { id: 'first_listen', name: 'أول استماع', description: 'استمعت لأول حلقة', icon: '🎧', condition: (stats) => stats.listens >= 1 },
  { id: 'listener_10', name: 'مستمع نشط', description: 'استمعت لـ 10 حلقات', icon: '🔥', condition: (stats) => stats.listens >= 10 },
  { id: 'listener_50', name: 'مستمع متمرس', description: 'استمعت لـ 50 حلقة', icon: '⭐', condition: (stats) => stats.listens >= 50 },
  { id: 'first_comment', name: 'أول تعليق', description: 'كتبت أول تعليق', icon: '💬', condition: (stats) => stats.comments >= 1 },
  { id: 'commenter_10', name: 'معلّق نشط', description: 'كتبت 10 تعليقات', icon: '📝', condition: (stats) => stats.comments >= 10 },
  { id: 'first_like', name: 'أول إعجاب', description: 'أعجبت بأول حلقة', icon: '👍', condition: (stats) => stats.likes >= 1 },
  { id: 'follower_5', name: 'متابع', description: 'تابعت 5 بودكاست', icon: '📌', condition: (stats) => stats.follows >= 5 },
  { id: 'early_bird', name: 'من الأوائل', description: 'انضممت في الشهر الأول', icon: '🐦', condition: (stats) => stats.isEarlyBird },
];

// جلب شارات المستخدم | Get user badges
async function getUserBadges(req, res) {
  try {
    const userId = req.user.id;

    // جمع الإحصائيات | Gather stats
    const [
      { count: listens },
      { count: comments },
      { count: likes },
      { count: follows },
      { data: userData },
    ] = await Promise.all([
      supabase.from('activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('action', 'listen'),
      supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('likes').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('users').select('created_at').eq('id', userId).single(),
    ]);

    const createdAt = userData?.created_at ? new Date(userData.created_at) : new Date();
    const platformAge = Date.now() - new Date('2024-01-01').getTime();
    const userAge = Date.now() - createdAt.getTime();
    const isEarlyBird = userAge > platformAge - 30 * 24 * 60 * 60 * 1000;

    const stats = {
      listens: listens || 0,
      comments: comments || 0,
      likes: likes || 0,
      follows: follows || 0,
      isEarlyBird,
    };

    const badges = BADGE_DEFINITIONS.map((badge) => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      earned: badge.condition(stats),
    }));

    res.json({ badges, stats });
  } catch (err) {
    res.status(500).json({ badges: [], stats: {} });
  }
}

module.exports = { getUserBadges };
