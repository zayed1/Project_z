// ============================================
// إحصائيات جغرافية | Geo Analytics Controller
// ============================================
const { supabase } = require('../config/supabase');

// تسجيل الموقع مع الاستماع | Record geo with listen
async function recordGeoListen(req, res) {
  try {
    const { episodeId } = req.params;
    const { country, city } = req.body;

    if (country) {
      await supabase.from('geo_listens').insert({
        episode_id: episodeId,
        user_id: req.user?.id || null,
        country: country.trim(),
        city: city?.trim() || null,
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

// إحصائيات جغرافية للمشرف | Geo stats for admin
async function getGeoStats(req, res) {
  try {
    const { data: geoData, error } = await supabase
      .from('geo_listens')
      .select('country');

    if (error) throw error;

    // تجميع حسب الدولة | Aggregate by country
    const countryMap = {};
    (geoData || []).forEach((g) => {
      if (g.country) {
        countryMap[g.country] = (countryMap[g.country] || 0) + 1;
      }
    });

    const countries = Object.entries(countryMap)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const total = (geoData || []).length;

    res.json({ countries, total });
  } catch (err) {
    console.error('خطأ في الإحصائيات الجغرافية:', err.message);
    res.status(500).json({ error: true, message: 'فشل' });
  }
}

module.exports = { recordGeoListen, getGeoStats };
