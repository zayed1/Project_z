// وحدة التحكم بالمنشورات المجدولة - Scheduled Posts Controller
// إنشاء وإدارة الإعلانات والإشعارات المجدولة - Create and manage scheduled announcements and notifications

const { supabase } = require('../config/supabase');

// أنواع المنشورات المتاحة - Available post types
const VALID_POST_TYPES = ['announcement', 'notification'];

/**
 * إنشاء منشور مجدول - Create a scheduled post
 * المسار: POST /api/scheduled-posts
 * Route: POST /api/scheduled-posts
 */
const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, scheduled_at, type } = req.body;

    // التحقق من البيانات المطلوبة - Validate required fields
    if (!title || !content || !scheduled_at || !type) {
      return res.status(400).json({
        success: false,
        message: 'العنوان والمحتوى ووقت الجدولة والنوع مطلوبة - Title, content, scheduled_at, and type are required'
      });
    }

    // التحقق من صحة نوع المنشور - Validate post type
    if (!VALID_POST_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `نوع المنشور غير صالح. القيم المتاحة: ${VALID_POST_TYPES.join(', ')} - Invalid post type. Valid values: ${VALID_POST_TYPES.join(', ')}`
      });
    }

    // التحقق من أن وقت الجدولة في المستقبل - Ensure scheduled time is in the future
    const scheduledDate = new Date(scheduled_at);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'تاريخ الجدولة غير صالح - Invalid scheduled date'
      });
    }

    if (scheduledDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'وقت الجدولة يجب أن يكون في المستقبل - Scheduled time must be in the future'
      });
    }

    // حفظ المنشور المجدول - Save scheduled post
    const { data: post, error } = await supabase
      .from('scheduled_posts')
      .insert({
        title,
        content,
        scheduled_at: scheduledDate.toISOString(),
        type,
        created_by: userId,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // إرجاع المنشور المجدول - Return scheduled post
    return res.status(201).json({
      success: true,
      message: 'تم إنشاء المنشور المجدول بنجاح - Scheduled post created successfully',
      data: post
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في إنشاء المنشور المجدول - Scheduled post creation error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

/**
 * جلب قائمة المنشورات المجدولة - List scheduled posts
 * المسار: GET /api/scheduled-posts
 * Route: GET /api/scheduled-posts
 */
const getPosts = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;

    // حساب الإزاحة - Calculate offset
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // بناء الاستعلام - Build query
    let query = supabase
      .from('scheduled_posts')
      .select('*', { count: 'exact' });

    // تطبيق فلتر الحالة - Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // تطبيق فلتر النوع - Apply type filter
    if (type) {
      query = query.eq('type', type);
    }

    // تطبيق الترتيب والترقيم - Apply ordering and pagination
    const { data: posts, error, count } = await query
      .order('scheduled_at', { ascending: true })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    // حساب معلومات الترقيم - Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limitNum);

    // إرجاع المنشورات - Return posts
    return res.status(200).json({
      success: true,
      data: {
        posts: posts || [],
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
    console.error('خطأ في جلب المنشورات المجدولة - Scheduled posts fetch error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

/**
 * حذف منشور مجدول - Delete a scheduled post
 * المسار: DELETE /api/scheduled-posts/:id
 * Route: DELETE /api/scheduled-posts/:id
 */
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق من وجود المعرف - Validate post ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'معرف المنشور مطلوب - Post ID is required'
      });
    }

    // التحقق من وجود المنشور - Verify post exists
    const { data: existing, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select('id, status')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'المنشور المجدول غير موجود - Scheduled post not found'
        });
      }
      throw fetchError;
    }

    // حذف المنشور - Delete the post
    const { error: deleteError } = await supabase
      .from('scheduled_posts')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // إرجاع نجاح الحذف - Return deletion success
    return res.status(200).json({
      success: true,
      message: 'تم حذف المنشور المجدول بنجاح - Scheduled post deleted successfully'
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في حذف المنشور المجدول - Scheduled post deletion error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  deletePost,
  createScheduledPost: createPost,
  getScheduledPosts: getPosts,
  deleteScheduledPost: deletePost,
};
