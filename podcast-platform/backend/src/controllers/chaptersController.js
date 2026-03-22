// ============================================
// متحكم علامات الفصول | Chapter Markers Controller
// ============================================
const { supabase } = require('../config/supabase');

// جلب فصول حلقة | Get episode chapters
async function getChapters(req, res) {
  try {
    const { episodeId } = req.params;
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('episode_id', episodeId)
      .order('start_time', { ascending: true });

    if (error) throw error;
    res.json({ chapters: data || [] });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// إضافة/تعديل فصول (مشرف) | Save chapters (admin)
async function saveChapters(req, res) {
  try {
    const { episodeId } = req.params;
    const { chapters } = req.body;

    if (!Array.isArray(chapters)) {
      return res.status(400).json({ error: true, message: 'بيانات غير صالحة' });
    }

    // حذف الفصول القديمة | Delete old chapters
    await supabase.from('chapters').delete().eq('episode_id', episodeId);

    // إضافة الجديدة | Insert new
    if (chapters.length > 0) {
      const rows = chapters.map((ch, i) => ({
        episode_id: episodeId,
        title: ch.title?.trim() || `فصل ${i + 1}`,
        start_time: ch.start_time || 0,
        end_time: ch.end_time || null,
      }));

      const { error } = await supabase.from('chapters').insert(rows);
      if (error) throw error;
    }

    res.json({ message: 'تم حفظ الفصول' });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

module.exports = { getChapters, saveChapters };
