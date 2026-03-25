// ============================================
// جدول نشر ذكي | Smart Publish Schedule Controller
// ============================================
const { supabase } = require('../config/supabase');

// تحليل أفضل أوقات النشر | Analyze best publish times
async function getBestPublishTimes(req, res) {
  try {
    const { podcastId } = req.params;

    // جلب بيانات التشغيل مع أوقات النشر | Get play data with publish times
    const { data: episodes } = await supabase
      .from('episodes')
      .select('id, title, play_count, created_at')
      .eq('podcast_id', podcastId)
      .order('play_count', { ascending: false });

    if (!episodes || episodes.length === 0) {
      return res.json({ suggestion: null, analysis: [] });
    }

    // تحليل أوقات النشر الأفضل | Analyze best days/hours
    const dayStats = {};
    const hourStats = {};

    episodes.forEach((ep) => {
      const date = new Date(ep.created_at);
      const day = date.toLocaleDateString('ar', { weekday: 'long' });
      const hour = date.getHours();

      if (!dayStats[day]) dayStats[day] = { total: 0, count: 0 };
      dayStats[day].total += ep.play_count || 0;
      dayStats[day].count++;

      if (!hourStats[hour]) hourStats[hour] = { total: 0, count: 0 };
      hourStats[hour].total += ep.play_count || 0;
      hourStats[hour].count++;
    });

    // ترتيب حسب المتوسط | Sort by average
    const bestDays = Object.entries(dayStats)
      .map(([day, s]) => ({ day, avg: Math.round(s.total / s.count) }))
      .sort((a, b) => b.avg - a.avg);

    const bestHours = Object.entries(hourStats)
      .map(([hour, s]) => ({ hour: parseInt(hour), avg: Math.round(s.total / s.count) }))
      .sort((a, b) => b.avg - a.avg);

    const suggestion = bestDays.length > 0 && bestHours.length > 0
      ? { day: bestDays[0].day, hour: bestHours[0].hour, avgPlays: bestDays[0].avg }
      : null;

    res.json({ suggestion, bestDays: bestDays.slice(0, 3), bestHours: bestHours.slice(0, 5), totalEpisodes: episodes.length });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل في التحليل' });
  }
}

module.exports = { getBestPublishTimes };
