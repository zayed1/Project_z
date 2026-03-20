// ============================================
// متحكم الحلقات | Episodes Controller
// ============================================
const { supabase, uploadAudioFile, deleteAudioFile } = require('../config/supabase');

// إضافة حلقة جديدة مع رفع ملف صوتي | Create episode with audio upload
async function createEpisode(req, res) {
  try {
    const { podcastId } = req.params;
    const { title, description, episode_number } = req.body;

    if (!title) {
      return res.status(400).json({
        error: true,
        message: 'عنوان الحلقة مطلوب | Episode title is required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: true,
        message: 'الملف الصوتي مطلوب | Audio file is required',
      });
    }

    // رفع الملف الصوتي إلى Supabase Storage | Upload audio to storage
    const audioUrl = await uploadAudioFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // إنشاء الحلقة في قاعدة البيانات | Create episode in DB
    const { data: episode, error } = await supabase
      .from('episodes')
      .insert({
        podcast_id: podcastId,
        title,
        description: description || null,
        audio_file_url: audioUrl,
        episode_number: episode_number ? parseInt(episode_number, 10) : null,
        published_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'تم إضافة الحلقة بنجاح | Episode created successfully',
      episode,
    });
  } catch (err) {
    console.error('خطأ في إنشاء الحلقة | Create episode error:', err.message);
    res.status(500).json({
      error: true,
      message: 'حدث خطأ في إنشاء الحلقة | Failed to create episode',
    });
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
    console.error('خطأ في جلب الحلقات | Fetch episodes error:', err.message);
    res.status(500).json({
      error: true,
      message: 'حدث خطأ في جلب الحلقات | Failed to fetch episodes',
    });
  }
}

// تعديل معلومات الحلقة | Update episode
async function updateEpisode(req, res) {
  try {
    const { episodeId } = req.params;
    const { title, description, episode_number } = req.body;

    const updateData = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (episode_number !== undefined) updateData.episode_number = parseInt(episode_number, 10);

    const { data: episode, error } = await supabase
      .from('episodes')
      .update(updateData)
      .eq('id', episodeId)
      .select('*')
      .single();

    if (error) throw error;

    res.json({
      message: 'تم تعديل الحلقة بنجاح | Episode updated successfully',
      episode,
    });
  } catch (err) {
    console.error('خطأ في تعديل الحلقة | Update episode error:', err.message);
    res.status(500).json({
      error: true,
      message: 'حدث خطأ في تعديل الحلقة | Failed to update episode',
    });
  }
}

// حذف الحلقة | Delete episode
async function deleteEpisode(req, res) {
  try {
    const { episodeId } = req.params;

    // جلب بيانات الحلقة للحصول على رابط الملف | Get episode data for file URL
    const { data: episode } = await supabase
      .from('episodes')
      .select('audio_file_url')
      .eq('id', episodeId)
      .single();

    // حذف الملف الصوتي من Storage | Delete audio file
    if (episode && episode.audio_file_url) {
      await deleteAudioFile(episode.audio_file_url);
    }

    // حذف الحلقة من قاعدة البيانات | Delete from DB
    const { error } = await supabase
      .from('episodes')
      .delete()
      .eq('id', episodeId);

    if (error) throw error;

    res.json({
      message: 'تم حذف الحلقة بنجاح | Episode deleted successfully',
    });
  } catch (err) {
    console.error('خطأ في حذف الحلقة | Delete episode error:', err.message);
    res.status(500).json({
      error: true,
      message: 'حدث خطأ في حذف الحلقة | Failed to delete episode',
    });
  }
}

module.exports = {
  createEpisode,
  getEpisodes,
  updateEpisode,
  deleteEpisode,
};
