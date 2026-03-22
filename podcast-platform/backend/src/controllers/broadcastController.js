// ============================================
// متحكم الرسائل الجماعية والإشعارات | Broadcast & Notifications Controller
// ============================================
const { supabase } = require('../config/supabase');

// إرسال رسالة جماعية | Send broadcast message
async function sendBroadcast(req, res) {
  try {
    const { title, message, podcastId } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: true, message: 'العنوان والرسالة مطلوبان' });
    }

    // إذا حدد بودكاست → أرسل لمتابعيه فقط | If podcast specified, notify followers only
    let targetUsers = [];
    if (podcastId) {
      const { data: followers } = await supabase
        .from('follows')
        .select('user_id')
        .eq('podcast_id', podcastId);
      targetUsers = (followers || []).map((f) => f.user_id);
    } else {
      const { data: users } = await supabase
        .from('users')
        .select('id');
      targetUsers = (users || []).map((u) => u.id);
    }

    if (targetUsers.length === 0) {
      return res.json({ message: 'لا يوجد مستخدمين لإرسال الإشعار لهم', sent: 0 });
    }

    // إنشاء إشعارات | Create notifications
    const notifications = targetUsers.map((userId) => ({
      user_id: userId,
      title,
      message,
      podcast_id: podcastId || null,
      is_read: false,
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) throw error;

    res.json({ message: `تم إرسال الإشعار لـ ${targetUsers.length} مستخدم`, sent: targetUsers.length });
  } catch (err) {
    console.error('خطأ في إرسال الرسالة:', err.message);
    res.status(500).json({ error: true, message: 'فشل في إرسال الرسالة الجماعية' });
  }
}

// جلب إشعارات المستخدم | Get user notifications
async function getMyNotifications(req, res) {
  try {
    const userId = req.user.id;

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;

    const unreadCount = (notifications || []).filter((n) => !n.is_read).length;

    res.json({ notifications: notifications || [], unreadCount });
  } catch (err) {
    console.error('خطأ في جلب الإشعارات:', err.message);
    res.status(500).json({ error: true, message: 'فشل في جلب الإشعارات' });
  }
}

// تحديث كمقروء | Mark as read
async function markNotificationsRead(req, res) {
  try {
    const userId = req.user.id;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    res.json({ message: 'تم تحديث الإشعارات' });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

module.exports = { sendBroadcast, getMyNotifications, markNotificationsRead };
