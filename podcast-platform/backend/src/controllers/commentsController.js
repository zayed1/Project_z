// ============================================
// متحكم التعليقات | Comments Controller
// ============================================
const { supabase } = require('../config/supabase');

// جلب تعليقات حلقة | Get comments for an episode
async function getComments(req, res) {
  try {
    const { episodeId } = req.params;

    const { data: comments, error } = await supabase
      .from('comments')
      .select(`*, users:user_id (id, username)`)
      .eq('episode_id', episodeId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const result = (comments || []).map((c) => ({
      ...c,
      user: c.users,
      users: undefined,
    }));

    res.json({ comments: result });
  } catch (err) {
    console.error('خطأ في جلب التعليقات:', err.message);
    res.status(500).json({ error: true, message: 'فشل في جلب التعليقات' });
  }
}

// إضافة تعليق | Add comment
async function addComment(req, res) {
  try {
    const { episodeId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: true, message: 'محتوى التعليق مطلوب' });
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        episode_id: episodeId,
        user_id: userId,
        content: content.trim(),
      })
      .select(`*, users:user_id (id, username)`)
      .single();

    if (error) throw error;

    res.status(201).json({
      comment: { ...comment, user: comment.users, users: undefined },
    });
  } catch (err) {
    console.error('خطأ في إضافة التعليق:', err.message);
    res.status(500).json({ error: true, message: 'فشل في إضافة التعليق' });
  }
}

// حذف تعليق | Delete comment (admin or owner)
async function deleteComment(req, res) {
  try {
    const { commentId } = req.params;

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    res.json({ message: 'تم حذف التعليق' });
  } catch (err) {
    console.error('خطأ في حذف التعليق:', err.message);
    res.status(500).json({ error: true, message: 'فشل في حذف التعليق' });
  }
}

module.exports = { getComments, addComment, deleteComment };
