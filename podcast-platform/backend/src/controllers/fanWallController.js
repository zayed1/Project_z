// وحدة التحكم بحائط المعجبين - Fan Wall Controller
// إدارة رسائل المعجبين على حائط البودكاست - Manage fan messages on podcast wall

const { supabase } = require('../config/supabase');

/**
 * إضافة رسالة على حائط المعجبين - Add a fan message to a podcast's wall
 * المسار: POST /api/fan-wall/:podcast_id/messages
 * Route: POST /api/fan-wall/:podcast_id/messages
 */
const addMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { podcast_id } = req.params;
    const { message } = req.body;

    // التحقق من البيانات المطلوبة - Validate required fields
    if (!podcast_id) {
      return res.status(400).json({
        success: false,
        message: 'معرف البودكاست مطلوب - Podcast ID is required'
      });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'الرسالة مطلوبة - Message is required'
      });
    }

    // حفظ الرسالة في قاعدة البيانات - Save message to database
    const { data, error } = await supabase
      .from('fan_wall')
      .insert({
        podcast_id,
        user_id: userId,
        message: message.trim(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // إرجاع الرسالة المضافة - Return added message
    return res.status(201).json({
      success: true,
      message: 'تمت إضافة الرسالة بنجاح - Message added successfully',
      data
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في إضافة رسالة - Message add error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

/**
 * جلب رسائل حائط المعجبين مع ترقيم الصفحات - Get fan wall messages with pagination
 * المسار: GET /api/fan-wall/:podcast_id/messages
 * Route: GET /api/fan-wall/:podcast_id/messages
 */
const getMessages = async (req, res) => {
  try {
    const { podcast_id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // التحقق من وجود معرف البودكاست - Validate podcast ID
    if (!podcast_id) {
      return res.status(400).json({
        success: false,
        message: 'معرف البودكاست مطلوب - Podcast ID is required'
      });
    }

    // حساب الإزاحة - Calculate offset
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // جلب الرسائل مع ترقيم الصفحات - Fetch messages with pagination
    const { data: messages, error, count } = await supabase
      .from('fan_wall')
      .select('*', { count: 'exact' })
      .eq('podcast_id', podcast_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    // حساب معلومات الترقيم - Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limitNum);

    // إرجاع الرسائل - Return messages
    return res.status(200).json({
      success: true,
      data: {
        messages: messages || [],
        pagination: {
          current_page: pageNum,
          per_page: limitNum,
          total_items: count || 0,
          total_pages: totalPages,
          has_next: pageNum < totalPages,
          has_prev: pageNum > 1
        }
      }
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في جلب الرسائل - Messages fetch error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

/**
 * حذف رسالة (صاحب الرسالة أو المشرف) - Delete a message (own message or admin)
 * المسار: DELETE /api/fan-wall/messages/:id
 * Route: DELETE /api/fan-wall/messages/:id
 */
const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // التحقق من وجود المعرف - Validate message ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'معرف الرسالة مطلوب - Message ID is required'
      });
    }

    // جلب الرسالة للتحقق من الملكية - Fetch message to verify ownership
    const { data: existingMessage, error: fetchError } = await supabase
      .from('fan_wall')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'الرسالة غير موجودة - Message not found'
        });
      }
      throw fetchError;
    }

    // التحقق من الصلاحية: صاحب الرسالة أو المشرف - Check permission: message owner or admin
    const isOwner = existingMessage.user_id === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لحذف هذه الرسالة - You do not have permission to delete this message'
      });
    }

    // حذف الرسالة - Delete the message
    const { error: deleteError } = await supabase
      .from('fan_wall')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // إرجاع نجاح الحذف - Return deletion success
    return res.status(200).json({
      success: true,
      message: 'تم حذف الرسالة بنجاح - Message deleted successfully'
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في حذف الرسالة - Message deletion error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

module.exports = {
  addMessage,
  getMessages,
  deleteMessage
};
