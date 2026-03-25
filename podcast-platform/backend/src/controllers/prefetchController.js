// وحدة التحكم بالتحميل المسبق - Prefetch Controller
// جلب بيانات مصغرة للبودكاست عند التمرير - Fetch minimal podcast data on hover

const { supabase } = require('../config/supabase');

/**
 * جلب بيانات التحميل المسبق للبودكاست - Get prefetch data for quick preview on hover
 * المسار: GET /api/podcasts/:id/prefetch
 * Route: GET /api/podcasts/:id/prefetch
 */
const getPrefetchData = async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق من وجود المعرف - Validate podcast ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'معرف البودكاست مطلوب - Podcast ID is required'
      });
    }

    // جلب البيانات الأساسية فقط للعرض السريع - Fetch only essential fields for quick preview
    const { data: podcast, error } = await supabase
      .from('podcasts')
      .select('id, title, cover_image_url, episodes_count')
      .eq('id', id)
      .single();

    if (error) {
      // إذا لم يتم العثور على البودكاست - If podcast not found
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'البودكاست غير موجود - Podcast not found'
        });
      }
      throw error;
    }

    // إرجاع البيانات المصغرة - Return minimal data
    return res.status(200).json({
      success: true,
      data: podcast
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في التحميل المسبق - Prefetch error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

module.exports = {
  getPrefetchData
};
