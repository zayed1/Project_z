// ============================================
// وسيط ضغط الصور | Image Compression Middleware
// ============================================
const sharp = require('sharp');

// ضغط الصورة قبل الرفع | Compress image before upload
async function compressImage(req, res, next) {
  if (!req.file) return next();

  try {
    const compressed = await sharp(req.file.buffer)
      .resize(800, 800, { fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    req.file.buffer = compressed;
    req.file.mimetype = 'image/webp';
    req.file.originalname = req.file.originalname.replace(/\.\w+$/, '.webp');
    next();
  } catch (err) {
    console.error('خطأ في ضغط الصورة:', err.message);
    // إذا فشل الضغط، نكمل بالصورة الأصلية | Continue with original if compression fails
    next();
  }
}

module.exports = { compressImage };
