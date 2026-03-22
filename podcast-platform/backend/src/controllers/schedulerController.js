// ============================================
// متحكم الجدولة | Scheduler Controller
// ============================================
const { supabase } = require('../config/supabase');

// جلب الحلقات المجدولة لشهر | Get scheduled episodes for a month
async function getScheduledEpisodes(req, res) {
  try {
    const { year, month } = req.query;
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;

    const startDate = new Date(y, m - 1, 1).toISOString();
    const endDate = new Date(y, m, 0, 23, 59, 59).toISOString();

    const { data: episodes, error } = await supabase
      .from('episodes')
      .select('id, title, scheduled_at, podcast_id, podcasts:podcast_id(title)')
      .not('scheduled_at', 'is', null)
      .gte('scheduled_at', startDate)
      .lte('scheduled_at', endDate)
      .order('scheduled_at', { ascending: true });

    if (error) throw error;

    const result = (episodes || []).map((ep) => ({
      id: ep.id,
      title: ep.title,
      scheduled_at: ep.scheduled_at,
      podcast_id: ep.podcast_id,
      podcast_title: ep.podcasts?.title || '',
    }));

    res.json({ episodes: result });
  } catch (err) {
    console.error('خطأ في جلب الجدول:', err.message);
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// تعديل موعد الجدولة | Update schedule date
async function updateSchedule(req, res) {
  try {
    const { episodeId } = req.params;
    const { scheduled_at } = req.body;

    const { error } = await supabase
      .from('episodes')
      .update({ scheduled_at: scheduled_at || null })
      .eq('id', episodeId);

    if (error) throw error;
    res.json({ message: 'تم تعديل الجدولة' });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

module.exports = { getScheduledEpisodes, updateSchedule };
