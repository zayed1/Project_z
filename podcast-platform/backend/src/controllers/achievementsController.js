// وحدة التحكم بالإنجازات - Achievements Controller
// إدارة التحديات الأسبوعية والإنجازات - Manage weekly challenges and achievements

const { supabase } = require('../config/supabase');

// التحديات الأسبوعية المتاحة - Available weekly challenges
const WEEKLY_CHALLENGES = [
  {
    id: 'listen_5_hours',
    title: 'استمع لـ 5 ساعات - Listen for 5 hours',
    description: 'استمع إلى 5 ساعات من البودكاست هذا الأسبوع - Listen to 5 hours of podcasts this week',
    target: 300, // بالدقائق - in minutes
    type: 'listen_time'
  },
  {
    id: 'try_3_new_podcasts',
    title: 'جرب 3 بودكاست جديدة - Try 3 new podcasts',
    description: 'استمع لـ 3 بودكاست لم تستمع لها من قبل - Listen to 3 podcasts you haven\'t heard before',
    target: 3,
    type: 'new_podcasts'
  },
  {
    id: 'comment_5_episodes',
    title: 'علق على 5 حلقات - Comment on 5 episodes',
    description: 'اترك تعليقاً على 5 حلقات مختلفة - Leave a comment on 5 different episodes',
    target: 5,
    type: 'comments'
  }
];

/**
 * جلب التحديات الأسبوعية مع تقدم المستخدم - Get weekly challenges with user progress
 * المسار: GET /api/achievements/weekly
 * Route: GET /api/achievements/weekly
 */
const getWeeklyChallenges = async (req, res) => {
  try {
    const userId = req.user.id;

    // حساب بداية الأسبوع الحالي - Calculate start of current week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const weekStart = startOfWeek.toISOString();

    // جلب تقدم المستخدم من قاعدة البيانات - Fetch user progress from DB
    const { data: progress, error } = await supabase
      .from('user_badges')
      .select('challenge_id, current_progress, completed')
      .eq('user_id', userId)
      .gte('created_at', weekStart);

    if (error) throw error;

    // تحويل التقدم إلى خريطة للوصول السريع - Map progress for quick lookup
    const progressMap = {};
    if (progress) {
      progress.forEach(p => {
        progressMap[p.challenge_id] = {
          current: p.current_progress,
          completed: p.completed
        };
      });
    }

    // دمج التحديات مع التقدم - Merge challenges with progress
    const challengesWithProgress = WEEKLY_CHALLENGES.map(challenge => ({
      ...challenge,
      current_progress: progressMap[challenge.id]?.current || 0,
      completed: progressMap[challenge.id]?.completed || false
    }));

    // إرجاع التحديات مع التقدم - Return challenges with progress
    return res.status(200).json({
      success: true,
      data: {
        week_start: weekStart,
        challenges: challengesWithProgress
      }
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في جلب التحديات - Challenges fetch error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

/**
 * التحقق من الإنجاز وفتحه - Check and unlock achievement
 * المسار: POST /api/achievements/check
 * Route: POST /api/achievements/check
 */
const checkAchievement = async (req, res) => {
  try {
    const userId = req.user.id;
    const { challenge_id, progress_increment } = req.body;

    // التحقق من البيانات المطلوبة - Validate required fields
    if (!challenge_id) {
      return res.status(400).json({
        success: false,
        message: 'معرف التحدي مطلوب - Challenge ID is required'
      });
    }

    // البحث عن التحدي - Find the challenge definition
    const challenge = WEEKLY_CHALLENGES.find(c => c.id === challenge_id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'التحدي غير موجود - Challenge not found'
      });
    }

    // حساب بداية الأسبوع الحالي - Calculate start of current week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // جلب التقدم الحالي أو إنشاء سجل جديد - Get current progress or create new record
    const { data: existing, error: fetchError } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challenge_id)
      .gte('created_at', startOfWeek.toISOString())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const increment = progress_increment || 1;
    let newProgress;
    let unlocked = false;

    if (existing) {
      // إذا كان مكتملاً بالفعل - If already completed
      if (existing.completed) {
        return res.status(200).json({
          success: true,
          message: 'الإنجاز مكتمل بالفعل - Achievement already completed',
          data: {
            challenge_id,
            current_progress: existing.current_progress,
            target: challenge.target,
            completed: true,
            newly_unlocked: false
          }
        });
      }

      // تحديث التقدم - Update progress
      newProgress = existing.current_progress + increment;
      const completed = newProgress >= challenge.target;
      unlocked = completed;

      const { error: updateError } = await supabase
        .from('user_badges')
        .update({
          current_progress: newProgress,
          completed,
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;
    } else {
      // إنشاء سجل جديد - Create new record
      newProgress = increment;
      const completed = newProgress >= challenge.target;
      unlocked = completed;

      const { error: insertError } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          challenge_id,
          current_progress: newProgress,
          completed,
          completed_at: completed ? new Date().toISOString() : null
        });

      if (insertError) throw insertError;
    }

    // إرجاع حالة الإنجاز - Return achievement status
    return res.status(200).json({
      success: true,
      message: unlocked
        ? 'تم فتح الإنجاز! - Achievement unlocked!'
        : 'تم تحديث التقدم - Progress updated',
      data: {
        challenge_id,
        current_progress: newProgress,
        target: challenge.target,
        completed: newProgress >= challenge.target,
        newly_unlocked: unlocked
      }
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في التحقق من الإنجاز - Achievement check error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

module.exports = {
  getWeeklyChallenges,
  checkAchievement
};
