// ============================================
// متحكم الردود المتداخلة | Nested Replies Controller
// ============================================
const { supabase } = require('../config/supabase');

// جلب ردود تعليق | Get replies for a comment
async function getReplies(req, res) {
  try {
    const { commentId } = req.params;

    const { data: replies, error } = await supabase
      .from('comments')
      .select(`*, users:user_id (id, username)`)
      .eq('parent_id', commentId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const result = (replies || []).map((c) => ({
      ...c,
      user: c.users,
      users: undefined,
    }));

    res.json({ replies: result });
  } catch (err) {
    console.error('خطأ في جلب الردود:', err.message);
    res.status(500).json({ error: true, message: 'فشل في جلب الردود' });
  }
}

// إضافة رد | Add reply to a comment
async function addReply(req, res) {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: true, message: 'محتوى الرد مطلوب' });
    }

    // Get parent comment to get episode_id
    const { data: parent } = await supabase
      .from('comments')
      .select('episode_id')
      .eq('id', commentId)
      .single();

    if (!parent) {
      return res.status(404).json({ error: true, message: 'التعليق غير موجود' });
    }

    const { data: reply, error } = await supabase
      .from('comments')
      .insert({
        episode_id: parent.episode_id,
        user_id: userId,
        content: content.trim(),
        parent_id: commentId,
      })
      .select(`*, users:user_id (id, username)`)
      .single();

    if (error) throw error;

    res.status(201).json({
      reply: { ...reply, user: reply.users, users: undefined },
    });
  } catch (err) {
    console.error('خطأ في إضافة الرد:', err.message);
    res.status(500).json({ error: true, message: 'فشل في إضافة الرد' });
  }
}

module.exports = { getReplies, addReply };
