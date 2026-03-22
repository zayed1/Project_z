// وحدة التحكم بتتبع المزاج - Mood Tracking Controller
// تسجيل وتحليل مزاج المستخدم بعد الاستماع - Record and analyze user mood after listening

const { supabase } = require('../config/supabase');

// المزاجات المتاحة - Available moods
const VALID_MOODS = ['happy', 'sad', 'inspired', 'relaxed', 'energized'];

/**
 * تسجيل مزاج المستخدم بعد حلقة - Track user mood after an episode
 * المسار: POST /api/mood/track
 * Route: POST /api/mood/track
 */
const trackMood = async (req, res) => {
  try {
    const userId = req.user.id;
    const { episode_id, mood } = req.body;

    // التحقق من البيانات المطلوبة - Validate required fields
    if (!episode_id || !mood) {
      return res.status(400).json({
        success: false,
        message: 'معرف الحلقة والمزاج مطلوبان - Episode ID and mood are required'
      });
    }

    // التحقق من صحة المزاج - Validate mood value
    if (!VALID_MOODS.includes(mood)) {
      return res.status(400).json({
        success: false,
        message: `المزاج غير صالح. القيم المتاحة: ${VALID_MOODS.join(', ')} - Invalid mood. Valid values: ${VALID_MOODS.join(', ')}`
      });
    }

    // حفظ المزاج في قاعدة البيانات - Save mood to database
    const { data, error } = await supabase
      .from('mood_tracking')
      .insert({
        user_id: userId,
        episode_id,
        mood,
        tracked_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // إرجاع المزاج المسجل - Return tracked mood
    return res.status(201).json({
      success: true,
      message: 'تم تسجيل المزاج بنجاح - Mood tracked successfully',
      data
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في تسجيل المزاج - Mood tracking error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

/**
 * جلب سجل المزاج مع الأنماط - Get mood history with patterns
 * المسار: GET /api/mood/history
 * Route: GET /api/mood/history
 */
const getMoodHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    // جلب سجل المزاج - Fetch mood history
    const { data: history, error, count } = await supabase
      .from('mood_tracking')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('tracked_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) throw error;

    // تحليل أنماط المزاج - Analyze mood patterns
    const moodCounts = {};
    VALID_MOODS.forEach(m => { moodCounts[m] = 0; });

    if (history) {
      history.forEach(entry => {
        if (moodCounts[entry.mood] !== undefined) {
          moodCounts[entry.mood]++;
        }
      });
    }

    // حساب المزاج الأكثر شيوعاً - Calculate most common mood
    const totalEntries = history ? history.length : 0;
    const dominantMood = totalEntries > 0
      ? Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null;

    // إرجاع السجل مع الأنماط - Return history with patterns
    return res.status(200).json({
      success: true,
      data: {
        history,
        patterns: {
          mood_counts: moodCounts,
          dominant_mood: dominantMood,
          total_entries: count
        },
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: count
        }
      }
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في جلب سجل المزاج - Mood history error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

module.exports = {
  trackMood,
  getMoodHistory
};
