// ============================================
// متحكم الاكتشاف | Discover Controller
// البودكاست المقترحة + الأكثر استماعاً + الرائجة
// ============================================
const { supabase } = require('../config/supabase');

// بودكاست مقترحة (نفس التصنيف) | Suggested podcasts
async function getSuggestedPodcasts(req, res) {
  try {
    const { podcastId } = req.params;
    const { data: current } = await supabase
      .from('podcasts')
      .select('category_id')
      .eq('id', podcastId)
      .single();

    let query = supabase
      .from('podcasts')
      .select('id, title, cover_image_url, categories:category_id (name)')
      .neq('id', podcastId)
      .limit(4);

    if (current?.category_id) {
      query = query.eq('category_id', current.category_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    const result = (data || []).map((p) => ({
      ...p, category: p.categories, categories: undefined,
    }));

    res.json({ podcasts: result });
  } catch (err) {
    res.status(500).json({ podcasts: [] });
  }
}

// الحلقات الأكثر استماعاً | Popular episodes
async function getPopularEpisodes(req, res) {
  try {
    const { data, error } = await supabase
      .from('episodes')
      .select('id, title, listen_count, podcast_id, podcasts:podcast_id (id, title, cover_image_url)')
      .gt('listen_count', 0)
      .order('listen_count', { ascending: false })
      .limit(10);

    if (error) throw error;

    const result = (data || []).map((ep) => ({
      ...ep, podcast: ep.podcasts, podcasts: undefined,
    }));

    res.json({ episodes: result });
  } catch (err) {
    res.status(500).json({ episodes: [] });
  }
}

// البودكاست الرائجة (الأكثر حلقات جديدة مؤخراً) | Trending podcasts
async function getTrendingPodcasts(req, res) {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: recentEpisodes } = await supabase
      .from('episodes')
      .select('podcast_id')
      .gte('created_at', weekAgo);

    const podcastCounts = {};
    (recentEpisodes || []).forEach((ep) => {
      podcastCounts[ep.podcast_id] = (podcastCounts[ep.podcast_id] || 0) + 1;
    });

    const topIds = Object.entries(podcastCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id]) => id);

    if (topIds.length === 0) {
      const { data: fallback } = await supabase
        .from('podcasts')
        .select('id, title, cover_image_url, categories:category_id (name)')
        .order('created_at', { ascending: false })
        .limit(6);

      return res.json({
        podcasts: (fallback || []).map((p) => ({
          ...p, category: p.categories, categories: undefined, recent_episodes: 0,
        })),
      });
    }

    const { data: podcasts } = await supabase
      .from('podcasts')
      .select('id, title, cover_image_url, categories:category_id (name)')
      .in('id', topIds);

    const result = (podcasts || []).map((p) => ({
      ...p,
      category: p.categories,
      categories: undefined,
      recent_episodes: podcastCounts[p.id] || 0,
    }));
    result.sort((a, b) => b.recent_episodes - a.recent_episodes);

    res.json({ podcasts: result });
  } catch (err) {
    res.status(500).json({ podcasts: [] });
  }
}

// بحث في حلقات بودكاست معين | Search episodes within a podcast
async function searchEpisodes(req, res) {
  try {
    const { podcastId } = req.params;
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ episodes: [] });

    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('podcast_id', podcastId)
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .order('episode_number', { ascending: true })
      .limit(20);

    if (error) throw error;
    res.json({ episodes: data || [] });
  } catch (err) {
    res.status(500).json({ episodes: [] });
  }
}

module.exports = {
  getSuggestedPodcasts,
  getPopularEpisodes,
  getTrendingPodcasts,
  searchEpisodes,
};
