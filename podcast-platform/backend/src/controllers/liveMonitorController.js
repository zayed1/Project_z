// وحدة التحكم بالمراقبة المباشرة - Live Monitor Controller
// إحصائيات الاستماع الحية واللحظية - Real-time listening statistics

const { supabase } = require('../config/supabase');

/**
 * جلب الإحصائيات الحية - Get live statistics
 * المسار: GET /api/monitor/live
 * Route: GET /api/monitor/live
 * يعرض: المستمعين النشطين، الحلقات النشطة، إجمالي الاستماع اليوم
 * Shows: active listeners, active episodes, total listens today
 */
const getLiveStats = async (req, res) => {
  try {
    const now = new Date();

    // حساب 5 دقائق مضت للمستمعين النشطين - Calculate 5 minutes ago for active listeners
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

    // حساب بداية اليوم - Calculate start of today
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const todayStart = startOfToday.toISOString();

    // جلب عدد المستمعين النشطين (أحداث استماع في آخر 5 دقائق) - Get active listeners count (listen events in last 5 mins)
    const { count: activeListeners, error: listenersError } = await supabase
      .from('episodes')
      .select('*', { count: 'exact', head: true })
      .gte('last_listen_at', fiveMinutesAgo);

    if (listenersError) throw listenersError;

    // جلب الحلقات النشطة حالياً - Get currently active episodes
    const { data: activeEpisodes, error: episodesError } = await supabase
      .from('episodes')
      .select('id, title, listen_count')
      .gte('last_listen_at', fiveMinutesAgo)
      .order('listen_count', { ascending: false });

    if (episodesError) throw episodesError;

    // جلب إجمالي الاستماع اليوم - Get total listens today
    const { count: totalListensToday, error: todayError } = await supabase
      .from('episodes')
      .select('*', { count: 'exact', head: true })
      .gte('last_listen_at', todayStart);

    if (todayError) throw todayError;

    // إرجاع الإحصائيات الحية - Return live statistics
    return res.status(200).json({
      success: true,
      data: {
        active_listeners: activeListeners || 0,
        active_episodes: activeEpisodes || [],
        active_episodes_count: activeEpisodes ? activeEpisodes.length : 0,
        total_listens_today: totalListensToday || 0,
        timestamp: now.toISOString()
      }
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في جلب الإحصائيات الحية - Live stats error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

module.exports = {
  getLiveStats
};
