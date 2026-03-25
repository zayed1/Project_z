// ============================================
// متحكم البودكاست | Podcasts Controller
// ============================================
const { supabase, uploadImageFile, deleteImageFile } = require('../config/supabase');

// جلب جميع البودكاست مع بحث وتصنيف وتقسيم صفحات
// Get all podcasts with search, category filter, pagination
async function getAllPodcasts(req, res) {
  try {
    const {
      search,
      category,
      page = 1,
      limit = 12,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('podcasts')
      .select(`
        *,
        users:creator_id (id, username),
        categories:category_id (id, name, slug),
        episodes:episodes (id)
      `, { count: 'exact' });

    // البحث | Search
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // تصفية بالتصنيف | Category filter
    if (category) {
      query = query.eq('category_id', category);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    const { data: podcasts, error, count } = await query;
    if (error) throw error;

    const result = (podcasts || []).map((podcast) => ({
      ...podcast,
      creator: podcast.users,
      category: podcast.categories,
      episode_count: podcast.episodes ? podcast.episodes.length : 0,
      users: undefined,
      categories: undefined,
      episodes: undefined,
    }));

    res.json({
      podcasts: result,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        pages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (err) {
    console.error('خطأ في جلب البودكاست | Fetch podcasts error:', err.message);
    res.status(500).json({ error: true, message: 'حدث خطأ في جلب البودكاست' });
  }
}

// جلب جميع التصنيفات | Get all categories
async function getCategories(req, res) {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json({ categories: categories || [] });
  } catch (err) {
    console.error('خطأ في جلب التصنيفات:', err.message);
    res.status(500).json({ error: true, message: 'فشل في جلب التصنيفات' });
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
        categories:category_id (id, name, slug),
        episodes (*)
      `)
      .eq('id', id)
      .single();

    if (error || !podcast) {
      return res.status(404).json({ error: true, message: 'البودكاست غير موجود' });
    }

    // فلترة الحلقات المجدولة للمستقبل (للعامة فقط)
    // Filter out future scheduled episodes for public
    if (podcast.episodes) {
      const now = new Date().toISOString();
      podcast.episodes = podcast.episodes.filter((ep) => {
        if (!ep.scheduled_at) return true;
        return ep.scheduled_at <= now;
      });
      podcast.episodes.sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));
    }

    res.json({
      podcast: {
        ...podcast,
        creator: podcast.users,
        category: podcast.categories,
        users: undefined,
        categories: undefined,
      },
    });
  } catch (err) {
    console.error('خطأ في جلب البودكاست:', err.message);
    res.status(500).json({ error: true, message: 'حدث خطأ في جلب البودكاست' });
  }
}

// إنشاء بودكاست جديد | Create new podcast
async function createPodcast(req, res) {
  try {
    const { title, description, cover_image_url, category_id } = req.body;
    const creatorId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: true, message: 'عنوان البودكاست مطلوب' });
    }

    const { data: podcast, error } = await supabase
      .from('podcasts')
      .insert({
        title,
        description: description || null,
        cover_image_url: cover_image_url || null,
        category_id: category_id || null,
        creator_id: creatorId,
      })
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'تم إنشاء البودكاست بنجاح', podcast });
  } catch (err) {
    console.error('خطأ في إنشاء البودكاست:', err.message);
    res.status(500).json({ error: true, message: 'حدث خطأ في إنشاء البودكاست' });
  }
}

// تعديل البودكاست | Update podcast
async function updatePodcast(req, res) {
  try {
    const { id } = req.params;
    const { title, description, cover_image_url, category_id } = req.body;

    const updateData = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (cover_image_url !== undefined) updateData.cover_image_url = cover_image_url;
    if (category_id !== undefined) updateData.category_id = category_id;

    const { data: podcast, error } = await supabase
      .from('podcasts')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    res.json({ message: 'تم تعديل البودكاست بنجاح', podcast });
  } catch (err) {
    console.error('خطأ في تعديل البودكاست:', err.message);
    res.status(500).json({ error: true, message: 'حدث خطأ في تعديل البودكاست' });
  }
}

// رفع صورة غلاف | Upload cover image
async function uploadCoverImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: true, message: 'الصورة مطلوبة' });
    }

    const imageUrl = await uploadImageFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.json({ message: 'تم رفع الصورة بنجاح', url: imageUrl });
  } catch (err) {
    console.error('خطأ في رفع الصورة:', err.message);
    res.status(500).json({ error: true, message: 'حدث خطأ في رفع الصورة' });
  }
}

// حذف البودكاست | Delete podcast
async function deletePodcast(req, res) {
  try {
    const { id } = req.params;

    await supabase.from('episodes').delete().eq('podcast_id', id);
    const { error } = await supabase.from('podcasts').delete().eq('id', id);
    if (error) throw error;

    res.json({ message: 'تم حذف البودكاست بنجاح' });
  } catch (err) {
    console.error('خطأ في حذف البودكاست:', err.message);
    res.status(500).json({ error: true, message: 'حدث خطأ في حذف البودكاست' });
  }
}

// إحصائيات المنصة | Platform stats
async function getStats(req, res) {
  try {
    const { count: podcastCount } = await supabase
      .from('podcasts').select('*', { count: 'exact', head: true });
    const { count: episodeCount } = await supabase
      .from('episodes').select('*', { count: 'exact', head: true });
    const { data: topPodcasts } = await supabase
      .from('podcasts')
      .select(`
        id, title,
        episodes:episodes (listen_count)
      `)
      .limit(5);

    // حساب مجموع الاستماع لكل بودكاست | Calculate total listens per podcast
    const podcastsWithListens = (topPodcasts || []).map((p) => ({
      id: p.id,
      title: p.title,
      total_listens: (p.episodes || []).reduce((sum, ep) => sum + (ep.listen_count || 0), 0),
    }));
    podcastsWithListens.sort((a, b) => b.total_listens - a.total_listens);

    res.json({
      stats: {
        total_podcasts: podcastCount || 0,
        total_episodes: episodeCount || 0,
        top_podcasts: podcastsWithListens.slice(0, 5),
      },
    });
  } catch (err) {
    console.error('خطأ في جلب الإحصائيات:', err.message);
    res.status(500).json({ error: true, message: 'فشل في جلب الإحصائيات' });
  }
}

// بحث تلقائي | Autocomplete search
async function autocompleteSearch(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ suggestions: [] });

    const { data, error } = await supabase
      .from('podcasts')
      .select('id, title, cover_image_url')
      .ilike('title', `%${q}%`)
      .limit(5);

    if (error) throw error;
    res.json({ suggestions: data || [] });
  } catch (err) {
    res.status(500).json({ suggestions: [] });
  }
}

module.exports = {
  getAllPodcasts,
  getCategories,
  getPodcastById,
  createPodcast,
  updatePodcast,
  uploadCoverImage,
  deletePodcast,
  getStats,
  autocompleteSearch,
};
