// وحدة التحكم بالهدايا - Gift Controller
// إرسال واستقبال الحلقات كهدايا بين المستخدمين - Send and receive episodes as gifts between users

const { supabase } = require('../config/supabase');

/**
 * إرسال حلقة كهدية لمستخدم آخر - Send an episode as a gift to another user
 * المسار: POST /api/gifts/send
 * Route: POST /api/gifts/send
 */
const sendGift = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipient_id, episode_id, message } = req.body;

    // التحقق من البيانات المطلوبة - Validate required fields
    if (!recipient_id || !episode_id) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستلم ومعرف الحلقة مطلوبان - Recipient ID and episode ID are required'
      });
    }

    // منع إرسال هدية للنفس - Prevent sending gift to self
    if (recipient_id === userId) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك إرسال هدية لنفسك - Cannot send a gift to yourself'
      });
    }

    // حفظ الهدية في قاعدة البيانات - Save gift to database
    const { data: gift, error } = await supabase
      .from('episode_gifts')
      .insert({
        sender_id: userId,
        recipient_id,
        episode_id,
        message: message || null,
        is_read: false,
        sent_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // إرجاع بيانات الهدية - Return gift data
    return res.status(201).json({
      success: true,
      message: 'تم إرسال الهدية بنجاح - Gift sent successfully',
      data: gift
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في إرسال الهدية - Gift sending error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

/**
 * جلب الهدايا المستلمة للمستخدم الحالي - Get received gifts for current user
 * المسار: GET /api/gifts/my
 * Route: GET /api/gifts/my
 */
const getMyGifts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    // جلب الهدايا المستلمة - Fetch received gifts
    const { data: gifts, error, count } = await supabase
      .from('episode_gifts')
      .select('*', { count: 'exact' })
      .eq('recipient_id', userId)
      .order('sent_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) throw error;

    // إرجاع قائمة الهدايا - Return gifts list
    return res.status(200).json({
      success: true,
      data: {
        gifts: gifts || [],
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: count || 0
        }
      }
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في جلب الهدايا - Gifts fetch error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

module.exports = {
  sendGift,
  getMyGifts
};
