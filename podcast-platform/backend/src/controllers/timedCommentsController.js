// ============================================
// تعليقات موقّتة | Timed Comments Controller
// ============================================
const { supabase } = require('../config/supabase');

// إضافة تعليق موقّت | Add timed comment
async function addTimedComment(req, res) {
  try {
    const userId = req.user.id;
    const { episode_id, content, timestamp } = req.body;
    if (!episode_id || !content?.trim() || timestamp === undefined) {
      return res.status(400).json({ error: true, message: 'بيانات غير مكتملة' });
    }

    const { data, error } = await supabase
      .from('timed_comments')
      .insert({ user_id: userId, episode_id, content: content.trim(), timestamp: parseFloat(timestamp) })
      .select('*, users:user_id(id, username, avatar_url)')
      .single();

    if (error) throw error;
    res.status(201).json({ comment: { ...data, user: data.users, users: undefined } });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// جلب التعليقات الموقّتة لحلقة | Get timed comments for episode
async function getTimedComments(req, res) {
  try {
    const { episodeId } = req.params;
    const { data, error } = await supabase
      .from('timed_comments')
      .select('*, users:user_id(id, username, avatar_url)')
      .eq('episode_id', episodeId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    res.json({ comments: (data || []).map((c) => ({ ...c, user: c.users, users: undefined })) });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// حذف تعليق موقّت | Delete timed comment
async function deleteTimedComment(req, res) {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const { error } = await supabase
      .from('timed_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ message: 'تم الحذف' });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

module.exports = { addTimedComment, getTimedComments, deleteTimedComment };
