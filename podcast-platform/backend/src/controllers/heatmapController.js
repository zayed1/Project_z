// وحدة التحكم بالخريطة الحرارية - Heatmap Controller
// تسجيل وتحليل مواقع الاستماع في الحلقات - Record and analyze listening positions in episodes

const { supabase } = require('../config/supabase');

// حجم المجموعة بالثواني - Bucket size in seconds
const BUCKET_SIZE = 10;

/**
 * تسجيل موقع الاستماع للخريطة الحرارية - Record listening position for heatmap
 * المسار: POST /api/heatmap/record
 * Route: POST /api/heatmap/record
 */
const recordPosition = async (req, res) => {
  try {
    const userId = req.user.id;
    const { episode_id, position_seconds } = req.body;

    // التحقق من البيانات المطلوبة - Validate required fields
    if (!episode_id || position_seconds === undefined || position_seconds === null) {
      return res.status(400).json({
        success: false,
        message: 'معرف الحلقة وموقع الاستماع مطلوبان - Episode ID and position are required'
      });
    }

    // التحقق من صحة موقع الاستماع - Validate position value
    const position = parseFloat(position_seconds);
    if (isNaN(position) || position < 0) {
      return res.status(400).json({
        success: false,
        message: 'موقع الاستماع يجب أن يكون رقماً موجباً - Position must be a positive number'
      });
    }

    // حفظ موقع الاستماع في قاعدة البيانات - Save position to database
    const { data, error } = await supabase
      .from('listen_heatmap')
      .insert({
        user_id: userId,
        episode_id,
        position_seconds: position,
        recorded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // إرجاع التأكيد - Return confirmation
    return res.status(201).json({
      success: true,
      message: 'تم تسجيل الموقع بنجاح - Position recorded successfully',
      data
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في تسجيل الموقع - Position recording error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

/**
 * جلب الخريطة الحرارية لحلقة - Get heatmap data for an episode
 * المسار: GET /api/heatmap/:episode_id
 * Route: GET /api/heatmap/:episode_id
 * يعيد بيانات مجمعة في مجموعات كل 10 ثوانٍ - Returns aggregated data in 10-second buckets
 */
const getHeatmap = async (req, res) => {
  try {
    const { episode_id } = req.params;

    // التحقق من وجود معرف الحلقة - Validate episode ID
    if (!episode_id) {
      return res.status(400).json({
        success: false,
        message: 'معرف الحلقة مطلوب - Episode ID is required'
      });
    }

    // جلب جميع مواقع الاستماع للحلقة - Fetch all listening positions for the episode
    const { data: positions, error } = await supabase
      .from('listen_heatmap')
      .select('position_seconds')
      .eq('episode_id', episode_id);

    if (error) throw error;

    // تجميع البيانات في مجموعات كل 10 ثوانٍ - Aggregate data into 10-second buckets
    const buckets = {};

    if (positions && positions.length > 0) {
      positions.forEach(pos => {
        // حساب رقم المجموعة - Calculate bucket number
        const bucketStart = Math.floor(pos.position_seconds / BUCKET_SIZE) * BUCKET_SIZE;
        const bucketKey = `${bucketStart}-${bucketStart + BUCKET_SIZE}`;

        if (!buckets[bucketKey]) {
          buckets[bucketKey] = {
            start: bucketStart,
            end: bucketStart + BUCKET_SIZE,
            count: 0
          };
        }
        buckets[bucketKey].count++;
      });
    }

    // تحويل إلى مصفوفة مرتبة - Convert to sorted array
    const heatmapData = Object.values(buckets).sort((a, b) => a.start - b.start);

    // إرجاع بيانات الخريطة الحرارية - Return heatmap data
    return res.status(200).json({
      success: true,
      data: {
        episode_id,
        bucket_size_seconds: BUCKET_SIZE,
        total_data_points: positions ? positions.length : 0,
        heatmap: heatmapData
      }
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في جلب الخريطة الحرارية - Heatmap fetch error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

module.exports = {
  recordPosition,
  getHeatmap
};
