// وحدة التحكم بمقارنة الحلقات - Episode Compare Controller
// مقارنة إحصائيات عدة حلقات جنباً إلى جنب - Compare multiple episode statistics side by side

const { supabase } = require('../config/supabase');

/**
 * مقارنة عدة حلقات - Compare multiple episodes
 * المسار: POST /api/episodes/compare
 * Route: POST /api/episodes/compare
 * يقبل مصفوفة من معرفات الحلقات ويعيد بيانات المقارنة - Accepts array of episode IDs and returns comparison data
 */
const compareEpisodes = async (req, res) => {
  try {
    const { episode_ids } = req.body;

    // التحقق من وجود مصفوفة المعرفات - Validate episode_ids array
    if (!episode_ids || !Array.isArray(episode_ids) || episode_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'مصفوفة معرفات الحلقات مطلوبة - Array of episode IDs is required'
      });
    }

    // الحد الأقصى لعدد الحلقات للمقارنة - Maximum episodes to compare
    if (episode_ids.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'الحد الأقصى 10 حلقات للمقارنة - Maximum 10 episodes for comparison'
      });
    }

    // جلب بيانات الحلقات الأساسية - Fetch base episode data
    const { data: episodes, error: episodesError } = await supabase
      .from('episodes')
      .select('id, title, listen_count, likes_count, comments_count, rating_avg')
      .in('id', episode_ids);

    if (episodesError) throw episodesError;

    // التحقق من العثور على جميع الحلقات - Check if all episodes were found
    if (!episodes || episodes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على أي حلقات - No episodes found'
      });
    }

    // تنسيق بيانات المقارنة - Format comparison data
    const comparison = episodes.map(episode => ({
      id: episode.id,
      title: episode.title,
      stats: {
        listens: episode.listen_count || 0,
        likes: episode.likes_count || 0,
        comments: episode.comments_count || 0,
        rating_avg: episode.rating_avg || 0
      }
    }));

    // حساب ملخص المقارنة - Calculate comparison summary
    const summary = {
      most_listened: comparison.reduce((max, ep) => ep.stats.listens > max.stats.listens ? ep : max, comparison[0]),
      most_liked: comparison.reduce((max, ep) => ep.stats.likes > max.stats.likes ? ep : max, comparison[0]),
      most_commented: comparison.reduce((max, ep) => ep.stats.comments > max.stats.comments ? ep : max, comparison[0]),
      highest_rated: comparison.reduce((max, ep) => ep.stats.rating_avg > max.stats.rating_avg ? ep : max, comparison[0])
    };

    // إرجاع بيانات المقارنة - Return comparison data
    return res.status(200).json({
      success: true,
      data: {
        episodes: comparison,
        summary,
        compared_count: comparison.length
      }
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في مقارنة الحلقات - Episode comparison error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

module.exports = {
  compareEpisodes
};
