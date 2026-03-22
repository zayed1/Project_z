// ============================================
// ملاحظات الحلقات | Episode Notes Controller
// ============================================
const { supabase } = require('../config/supabase');

// حفظ ملاحظة | Save note
async function saveNote(req, res) {
  try {
    const userId = req.user.id;
    const { episode_id, content, timestamp } = req.body;
    if (!episode_id || !content?.trim()) return res.status(400).json({ error: true, message: 'بيانات غير مكتملة' });

    const { data, error } = await supabase
      .from('episode_notes')
      .insert({ user_id: userId, episode_id, content: content.trim(), timestamp: timestamp || null })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ note: data });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// جلب ملاحظات المستخدم لحلقة | Get user notes for episode
async function getNotes(req, res) {
  try {
    const userId = req.user.id;
    const { episodeId } = req.params;
    const { data } = await supabase
      .from('episode_notes')
      .select('*')
      .eq('user_id', userId)
      .eq('episode_id', episodeId)
      .order('created_at', { ascending: true });

    res.json({ notes: data || [] });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// حذف ملاحظة | Delete note
async function deleteNote(req, res) {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;
    await supabase.from('episode_notes').delete().eq('id', noteId).eq('user_id', userId);
    res.json({ message: 'تم الحذف' });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// جلب كل ملاحظات المستخدم | Get all user notes
async function getAllNotes(req, res) {
  try {
    const userId = req.user.id;
    const { data } = await supabase
      .from('episode_notes')
      .select('*, episodes:episode_id(id, title, podcast_id)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    res.json({ notes: data || [] });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

module.exports = { saveNote, getNotes, deleteNote, getAllNotes };
