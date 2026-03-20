// ============================================
// متحكم البودكاست | Podcasts Controller
// ============================================
const { supabase } = require('../config/supabase');

// جلب جميع البودكاست | Get all podcasts
async function getAllPodcasts(req, res) {
  try {
    const { data: podcasts, error } = await supabase
      .from('podcasts')
      .select(`
        *,
        users:creator_id (id, username),
        episodes:episodes (id)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // إضافة عدد الحلقات | Add episode count
    const result = podcasts.map((podcast) => ({
      ...podcast,
      creator: podcast.users,
      episode_count: podcast.episodes ? podcast.episodes.length : 0,
      users: undefined,
      episodes: undefined,
    }));

    res.json({ podcasts: result });
  } catch (err) {
    console.error('خطأ في جلب البودكاست | Fetch podcasts error:', err.message);
    res.status(500).json({
      error: true,
      message: 'حدث خطأ في جلب البودكاست | Failed to fetch podcasts',
    });
  }
}

// جلب بودكاست معين مع حلقاته | Get single podcast with episodes
async function getPodcastById(req, res) {
  try {
    const { id } = req.params;

    const { data: podcast, error } = await supabase
      .from('podcasts')
      .select(`
        *,
        users:creator_id (id, username, email),
        episodes (*)
      `)
      .eq('id', id)
      .single();

    if (error || !podcast) {
      return res.status(404).json({
        error: true,
        message: 'البودكاست غير موجود | Podcast not found',
      });
    }

    // ترتيب الحلقات حسب رقم الحلقة | Sort episodes by number
    if (podcast.episodes) {
      podcast.episodes.sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));
    }

    res.json({
      podcast: {
        ...podcast,
        creator: podcast.users,
        users: undefined,
      },
    });
  } catch (err) {
    console.error('خطأ في جلب البودكاست | Fetch podcast error:', err.message);
    res.status(500).json({
      error: true,
      message: 'حدث خطأ في جلب البودكاست | Failed to fetch podcast',
    });
  }
}

// إنشاء بودكاست جديد | Create new podcast
async function createPodcast(req, res) {
  try {
    const { title, description, cover_image_url } = req.body;
    const creatorId = req.user.id;

    if (!title) {
      return res.status(400).json({
        error: true,
        message: 'عنوان البودكاست مطلوب | Podcast title is required',
      });
    }

    const { data: podcast, error } = await supabase
      .from('podcasts')
      .insert({
        title,
        description: description || null,
        cover_image_url: cover_image_url || null,
        creator_id: creatorId,
      })
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'تم إنشاء البودكاست بنجاح | Podcast created successfully',
      podcast,
    });
  } catch (err) {
    console.error('خطأ في إنشاء البودكاست | Create podcast error:', err.message);
    res.status(500).json({
      error: true,
      message: 'حدث خطأ في إنشاء البودكاست | Failed to create podcast',
    });
  }
}

// تعديل البودكاست | Update podcast
async function updatePodcast(req, res) {
  try {
    const { id } = req.params;
    const { title, description, cover_image_url } = req.body;

    const updateData = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (cover_image_url !== undefined) updateData.cover_image_url = cover_image_url;

    const { data: podcast, error } = await supabase
      .from('podcasts')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    res.json({
      message: 'تم تعديل البودكاست بنجاح | Podcast updated successfully',
      podcast,
    });
  } catch (err) {
    console.error('خطأ في تعديل البودكاست | Update podcast error:', err.message);
    res.status(500).json({
      error: true,
      message: 'حدث خطأ في تعديل البودكاست | Failed to update podcast',
    });
  }
}

// حذف البودكاست | Delete podcast
async function deletePodcast(req, res) {
  try {
    const { id } = req.params;

    // حذف جميع حلقات البودكاست أولاً | Delete episodes first
    await supabase
      .from('episodes')
      .delete()
      .eq('podcast_id', id);

    const { error } = await supabase
      .from('podcasts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      message: 'تم حذف البودكاست بنجاح | Podcast deleted successfully',
    });
  } catch (err) {
    console.error('خطأ في حذف البودكاست | Delete podcast error:', err.message);
    res.status(500).json({
      error: true,
      message: 'حدث خطأ في حذف البودكاست | Failed to delete podcast',
    });
  }
}

module.exports = {
  getAllPodcasts,
  getPodcastById,
  createPodcast,
  updatePodcast,
  deletePodcast,
};
