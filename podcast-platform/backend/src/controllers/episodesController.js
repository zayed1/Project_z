// ============================================
// متحكم الحلقات | Episodes Controller
// ============================================
const { supabase, uploadAudioFile, deleteAudioFile } = require('../config/supabase');

// إضافة حلقة جديدة مع رفع ملف صوتي | Create episode with audio upload
async function createEpisode(req, res) {
  try {
    const { podcastId } = req.params;
    const { title, description, episode_number, scheduled_at } = req.body;

    if (!title) {
      return res.status(400).json({ error: true, message: 'عنوان الحلقة مطلوب' });
    }

    if (!req.file) {
      return res.status(400).json({ error: true, message: 'الملف الصوتي مطلوب' });
    }

    const audioUrl = await uploadAudioFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    const insertData = {
      podcast_id: podcastId,
      title,
      description: description || null,
      audio_file_url: audioUrl,
      episode_number: episode_number ? parseInt(episode_number, 10) : null,
    };

    // جدولة النشر أو النشر الفوري | Schedule or publish immediately
    if (scheduled_at) {
      insertData.scheduled_at = scheduled_at;
    } else {
      insertData.published_at = new Date().toISOString();
    }

    const { data: episode, error } = await supabase
      .from('episodes')
      .insert(insertData)
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'تم إضافة الحلقة بنجاح', episode });
  } catch (err) {
    console.error('خطأ في إنشاء الحلقة:', err.message);
    res.status(500).json({ error: true, message: 'حدث خطأ في إنشاء الحلقة' });
  }
}

// جلب جميع حلقات بودكاست | Get all episodes for a podcast
async function getEpisodes(req, res) {
  try {
    const { podcastId } = req.params;

    const { data: episodes, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('podcast_id', podcastId)
      .order('episode_number', { ascending: true });

    if (error) throw error;
    res.json({ episodes: episodes || [] });
  } catch (err) {
    console.error('خطأ في جلب الحلقات:', err.message);
    res.status(500).json({ error: true, message: 'حدث خطأ في جلب الحلقات' });
  }
}

// تعديل معلومات الحلقة | Update episode
async function updateEpisode(req, res) {
  try {
    const { episodeId } = req.params;
    const { title, description, episode_number, scheduled_at } = req.body;

    const updateData = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (episode_number !== undefined) updateData.episode_number = parseInt(episode_number, 10);
    if (scheduled_at !== undefined) updateData.scheduled_at = scheduled_at;

    const { data: episode, error } = await supabase
      .from('episodes')
      .update(updateData)
      .eq('id', episodeId)
      .select('*')
      .single();

    if (error) throw error;

    res.json({ message: 'تم تعديل الحلقة بنجاح', episode });
  } catch (err) {
    console.error('خطأ في تعديل الحلقة:', err.message);
    res.status(500).json({ error: true, message: 'حدث خطأ في تعديل الحلقة' });
  }
}

// تسجيل استماع | Record listen
async function recordListen(req, res) {
  try {
    const { episodeId } = req.params;

    const { data: episode } = await supabase
      .from('episodes')
      .select('listen_count')
      .eq('id', episodeId)
      .single();

    if (!episode) {
      return res.status(404).json({ error: true, message: 'الحلقة غير موجودة' });
    }

    await supabase
      .from('episodes')
      .update({ listen_count: (episode.listen_count || 0) + 1 })
      .eq('id', episodeId);

    res.json({ message: 'ok' });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// حذف الحلقة | Delete episode
async function deleteEpisode(req, res) {
  try {
    const { episodeId } = req.params;

    const { data: episode } = await supabase
      .from('episodes')
      .select('audio_file_url')
      .eq('id', episodeId)
      .single();

    if (episode && episode.audio_file_url) {
      await deleteAudioFile(episode.audio_file_url);
    }

    const { error } = await supabase
      .from('episodes')
      .delete()
      .eq('id', episodeId);

    if (error) throw error;

    res.json({ message: 'تم حذف الحلقة بنجاح' });
  } catch (err) {
    console.error('خطأ في حذف الحلقة:', err.message);
    res.status(500).json({ error: true, message: 'حدث خطأ في حذف الحلقة' });
  }
}

module.exports = {
  createEpisode,
  getEpisodes,
  updateEpisode,
  recordListen,
  deleteEpisode,
};
