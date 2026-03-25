// ============================================
// تهيئة Supabase Client | Supabase Configuration
// ============================================
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// التحقق من وجود المتغيرات البيئية | Validate env vars
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('خطأ: متغيرات Supabase البيئية مفقودة | Missing Supabase env vars');
  console.error('SUPABASE_URL و SUPABASE_ANON_KEY مطلوبة | Required: SUPABASE_URL and SUPABASE_ANON_KEY');
}

// العميل العام (للعمليات العادية) | Public client
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// عميل الخدمة (للعمليات الإدارية) | Service role client
const supabaseAdmin = supabaseServiceKey && supabaseUrl
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;

// ============================================
// وظائف مساعدة | Helper Functions
// ============================================

// رفع ملف صوتي إلى Supabase Storage | Upload audio file
async function uploadAudioFile(fileBuffer, fileName, mimeType) {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'podcast-audio';
  const filePath = `episodes/${Date.now()}-${fileName}`;

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw new Error(`فشل رفع الملف | Upload failed: ${error.message}`);

  // الحصول على الرابط العام | Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

// حذف ملف صوتي من Storage | Delete audio file
async function deleteAudioFile(fileUrl) {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'podcast-audio';

  // استخراج مسار الملف من الرابط | Extract file path from URL
  const urlParts = fileUrl.split(`${bucket}/`);
  if (urlParts.length < 2) return;

  const filePath = urlParts[1];
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    console.error('خطأ في حذف الملف | File deletion error:', error.message);
  }
}

// رفع صورة غلاف إلى Supabase Storage | Upload cover image
async function uploadImageFile(fileBuffer, fileName, mimeType) {
  const bucket = 'podcast-covers';
  const filePath = `covers/${Date.now()}-${fileName}`;

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw new Error(`فشل رفع الصورة: ${error.message}`);

  const { data: urlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

// حذف صورة غلاف | Delete cover image
async function deleteImageFile(fileUrl) {
  const bucket = 'podcast-covers';
  const urlParts = fileUrl.split(`${bucket}/`);
  if (urlParts.length < 2) return;

  await supabaseAdmin.storage.from(bucket).remove([urlParts[1]]);
}

module.exports = {
  supabase,
  supabaseAdmin,
  uploadAudioFile,
  deleteAudioFile,
  uploadImageFile,
  deleteImageFile,
};
