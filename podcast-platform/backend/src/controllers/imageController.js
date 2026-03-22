// وحدة التحكم بالصور - Image Controller
// توليد بيانات وصفية للصور المحسنة - Generate metadata for optimized images

const { supabase } = require('../config/supabase');

// أحجام الصور المدعومة - Supported image sizes
const IMAGE_SIZES = {
  thumbnail: 150,
  medium: 400,
  large: 800
};

/**
 * الحصول على بيانات وصفية للصورة المحسنة - Get optimized image metadata with srcset URLs
 * المسار: GET /api/images/optimize?url=...&width=...&quality=...
 * Route: GET /api/images/optimize?url=...&width=...&quality=...
 * ملاحظة: يولد بيانات وصفية فقط، لا معالجة فعلية للصور - Note: generates metadata only, no actual image processing
 */
const getOptimizedImage = async (req, res) => {
  try {
    const { url, width, quality } = req.query;

    // التحقق من وجود رابط الصورة - Validate image URL
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'رابط الصورة مطلوب - Image URL is required'
      });
    }

    // التحقق من صحة العرض إن وُجد - Validate width if provided
    const requestedWidth = width ? parseInt(width, 10) : null;
    if (width && (isNaN(requestedWidth) || requestedWidth <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'قيمة العرض غير صالحة - Invalid width value'
      });
    }

    // التحقق من صحة الجودة إن وُجدت - Validate quality if provided
    const requestedQuality = quality ? parseInt(quality, 10) : 80;
    if (quality && (isNaN(requestedQuality) || requestedQuality < 1 || requestedQuality > 100)) {
      return res.status(400).json({
        success: false,
        message: 'قيمة الجودة يجب أن تكون بين 1 و 100 - Quality must be between 1 and 100'
      });
    }

    // توليد روابط srcset لكل حجم - Generate srcset URLs for each size
    const srcset = {};
    for (const [sizeName, sizeWidth] of Object.entries(IMAGE_SIZES)) {
      srcset[sizeName] = {
        url: `${url}?w=${sizeWidth}&q=${requestedQuality}`,
        width: sizeWidth,
        quality: requestedQuality
      };
    }

    // بناء سلسلة srcset بتنسيق HTML - Build srcset string in HTML format
    const srcsetString = Object.values(srcset)
      .map(s => `${s.url} ${s.width}w`)
      .join(', ');

    // إرجاع البيانات الوصفية - Return image metadata
    return res.status(200).json({
      success: true,
      data: {
        original_url: url,
        requested_width: requestedWidth,
        quality: requestedQuality,
        sizes: srcset,
        srcset: srcsetString
      }
    });
  } catch (error) {
    // خطأ في الخادم - Server error
    console.error('خطأ في معالجة بيانات الصورة - Image metadata error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم - Internal server error'
    });
  }
};

module.exports = {
  getOptimizedImage
};
