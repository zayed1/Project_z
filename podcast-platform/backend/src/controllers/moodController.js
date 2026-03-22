// ============================================
// تصنيف المزاج | Mood Tags Controller
// ============================================
const { supabase } = require('../config/supabase');

const MOODS = ['تحفيزي', 'تعليمي', 'مريح', 'ترفيهي', 'إخباري', 'حواري', 'قصصي', 'تقني'];

// تعيين مزاج لحلقة | Set episode mood
async function setEpisodeMood(req, res) {
  try {
    const { episodeId } = req.params;
    const { moods } = req.body;

    if (!Array.isArray(moods)) return res.status(400).json({ error: true, message: 'بيانات غير صالحة' });
    const valid = moods.filter((m) => MOODS.includes(m));

    await supabase.from('episode_moods').delete().eq('episode_id', episodeId);

    if (valid.length > 0) {
      const rows = valid.map((mood) => ({ episode_id: episodeId, mood }));
      const { error } = await supabase.from('episode_moods').insert(rows);
      if (error) throw error;
    }

    res.json({ moods: valid });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// جلب مزاج حلقة | Get episode moods
async function getEpisodeMoods(req, res) {
  try {
    const { episodeId } = req.params;
    const { data } = await supabase.from('episode_moods').select('mood').eq('episode_id', episodeId);
    res.json({ moods: (data || []).map((d) => d.mood) });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// بحث حسب المزاج | Search by mood
async function getByMood(req, res) {
  try {
    const { mood } = req.params;
    const { data } = await supabase
      .from('episode_moods')
      .select('episode_id, episodes:episode_id(id, title, audio_file_url, duration, podcast_id, podcasts:podcast_id(title, cover_image_url))')
      .eq('mood', mood)
      .limit(20);

    const episodes = (data || []).map((d) => ({ ...d.episodes, podcast: d.episodes?.podcasts })).filter(Boolean);
    res.json({ episodes, mood });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// قائمة الأمزجة المتاحة | Get available moods
function getMoodList(req, res) {
  res.json({ moods: MOODS });
}

module.exports = { setEpisodeMood, getEpisodeMoods, getByMood, getMoodList };
