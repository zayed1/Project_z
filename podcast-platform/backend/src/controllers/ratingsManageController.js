// وحدة التحكم بإدارة التقييمات - Ratings Management Controller
// واجهة المشرف لتصفية وإدارة التقييمات - Admin interface for filtering and managing ratings

const { supabase } = require('../config/supabase');

/**
 * جلب التقييمات مع فلاتر وترقيم صفحات - Get filtered ratings with pagination (admin)
 * المسار: GET /api/admin/ratings
 * Route: GET /api/admin/ratings
 * الفلاتر: min_rating, max_rating, episode_id, user_id - Filters: min_rating, max_rating, episode_id, user_id
 */
const getFilteredRatings = async (req, res) => {
  try {
    const {
      min_rating,
      max_rating,
      episode_id,
      user_id,
      page = 1,
      limit = 20
    } = req.query;

    // حساب الإزاحة للترقيم - Calculate offset for pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // بناء الاستعلام مع الفلاتر - Build query with filters
    let query = supabase
      .from('ratings')
      .select('*', { count: 'exact' });

    // تطبيق فلتر الحد الأدنى للتقييم - Apply minimum rating filter
    if (min_rating) {
      query = query.gte('rating', parseFloat(min_rating));
    }

    // تطبيق فلتر الحد الأقصى للتقييم - Apply maximum rating filter
    if (max_rating) {
      query = query.lte('rating', parseFloat(max_rating));
    }

    // تطبيق فلتر الحلقة - Apply episode filter
    if (episode_id) {
      query = query.eq('episode_id', episode_id);
    }

    // تطبيق فلتر المستخدم - Apply user filter
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    // تطبيق الترتيب والترقيم - Apply ordering and pagination
    const { data: ratings, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    // حساب معلومات الترقيم - Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limitNum);

    // إرجاع التقييمات مع معلومات الترقيم - Return ratings with pagination info
    return res.status(200).json({
      success: true,
      data: {
        ratings: ratings || [],
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
    console.error('خطأ في جلب التقييمات - Ratings fetch error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

/**
 * حذف تقييم بواسطة المشرف - Delete a rating by admin
 * المسار: DELETE /api/admin/ratings/:id
 * Route: DELETE /api/admin/ratings/:id
 */
const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق من وجود المعرف - Validate rating ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'معرف التقييم مطلوب - Rating ID is required'
      });
    }

    // التحقق من وجود التقييم قبل الحذف - Verify rating exists before deletion
    const { data: existing, error: fetchError } = await supabase
      .from('ratings')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'التقييم غير موجود - Rating not found'
        });
      }
      throw fetchError;
    }

    // حذف التقييم - Delete the rating
    const { error: deleteError } = await supabase
      .from('ratings')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // إرجاع نجاح الحذف - Return deletion success
    return res.status(200).json({
      success: true,
      message: 'تم حذف التقييم بنجاح - Rating deleted successfully'
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في حذف التقييم - Rating deletion error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

module.exports = {
  getFilteredRatings,
  deleteRating
};
