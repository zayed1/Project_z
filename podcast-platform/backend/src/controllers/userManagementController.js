// ============================================
// متحكم إدارة المستخدمين | User Management Controller
// ============================================
const { supabase } = require('../config/supabase');

// جلب جميع المستخدمين | Get all users
async function getUsers(req, res) {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('users')
      .select('id, email, username, role, is_banned, created_at', { count: 'exact' });

    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    res.json({
      users: data || [],
      pagination: { page: pageNum, limit: limitNum, total: count || 0, pages: Math.ceil((count || 0) / limitNum) },
    });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل في جلب المستخدمين' });
  }
}

// حظر/إلغاء حظر مستخدم | Ban/unban user
async function toggleBanUser(req, res) {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) {
      return res.status(400).json({ error: true, message: 'لا يمكنك حظر نفسك' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('is_banned')
      .eq('id', userId)
      .single();

    if (!user) return res.status(404).json({ error: true, message: 'المستخدم غير موجود' });

    const newStatus = !user.is_banned;
    const { error } = await supabase
      .from('users')
      .update({ is_banned: newStatus })
      .eq('id', userId);

    if (error) throw error;

    res.json({ message: newStatus ? 'تم حظر المستخدم' : 'تم إلغاء حظر المستخدم', is_banned: newStatus });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل في تحديث حالة المستخدم' });
  }
}

// ترقية/تخفيض دور المستخدم | Promote/demote user
async function changeUserRole(req, res) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'listener'].includes(role)) {
      return res.status(400).json({ error: true, message: 'الدور غير صالح' });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ error: true, message: 'لا يمكنك تغيير دورك' });
    }

    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;

    res.json({ message: `تم تغيير الدور إلى ${role === 'admin' ? 'مشرف' : 'مستمع'}` });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل في تغيير الدور' });
  }
}

module.exports = { getUsers, toggleBanUser, changeUserRole };
