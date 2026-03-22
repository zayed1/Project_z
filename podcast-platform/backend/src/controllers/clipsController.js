// ============================================
// متحكم المقاطع المميزة | Clips Controller
// ============================================
const { supabase } = require('../config/supabase');

// إنشاء مقطع | Create clip
async function createClip(req, res) {
  try {
    const userId = req.user.id;
    const { episode_id, start_time, end_time, title } = req.body;

    if (!episode_id || start_time === undefined || end_time === undefined) {
      return res.status(400).json({ error: true, message: 'بيانات المقطع غير مكتملة' });
    }

    const duration = end_time - start_time;
    if (duration < 5 || duration > 120) {
      return res.status(400).json({ error: true, message: 'مدة المقطع يجب أن تكون بين 5 و 120 ثانية' });
    }

    const { data: clip, error } = await supabase
      .from('clips')
      .insert({
        user_id: userId,
        episode_id,
        start_time,
        end_time,
        title: title?.trim() || `مقطع ${Math.floor(start_time / 60)}:${String(Math.floor(start_time % 60)).padStart(2, '0')}`,
      })
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json({ clip, message: 'تم إنشاء المقطع بنجاح' });
  } catch (err) {
    console.error('خطأ في إنشاء المقطع:', err.message);
    res.status(500).json({ error: true, message: 'فشل في إنشاء المقطع' });
  }
}

// جلب مقاطع حلقة | Get clips for episode
async function getEpisodeClips(req, res) {
  try {
    const { episodeId } = req.params;

    const { data: clips, error } = await supabase
      .from('clips')
      .select('*, users:user_id (id, username)')
      .eq('episode_id', episodeId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const result = (clips || []).map((c) => ({
      ...c, user: c.users, users: undefined,
    }));

    res.json({ clips: result });
  } catch (err) {
    console.error('خطأ في جلب المقاطع:', err.message);
    res.status(500).json({ error: true, message: 'فشل في جلب المقاطع' });
  }
}

// حذف مقطع | Delete clip
async function deleteClip(req, res) {
  try {
    const { clipId } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('clips')
      .delete()
      .eq('id', clipId)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ message: 'تم حذف المقطع' });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل في حذف المقطع' });
  }
}

module.exports = { createClip, getEpisodeClips, deleteClip };
