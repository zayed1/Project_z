// ============================================
// وسيط المصادقة | Authentication Middleware
// ============================================
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

// التحقق من الـ JWT Token | Verify JWT Token
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: true,
      message: 'غير مصرح - يرجى تسجيل الدخول | Unauthorized - Please login',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: true,
      message: 'رمز المصادقة غير صالح أو منتهي | Invalid or expired token',
    });
  }
}

// التحقق من ملكية البودكاست | Verify podcast ownership
async function verifyPodcastOwner(req, res, next) {
  const podcastId = req.params.id || req.params.podcastId;
  const userId = req.user.id;

  const { data: podcast, error } = await supabase
    .from('podcasts')
    .select('creator_id')
    .eq('id', podcastId)
    .single();

  if (error || !podcast) {
    return res.status(404).json({
      error: true,
      message: 'البودكاست غير موجود | Podcast not found',
    });
  }

  if (podcast.creator_id !== userId) {
    return res.status(403).json({
      error: true,
      message: 'غير مصرح - أنت لست مالك هذا البودكاست | Forbidden - Not the owner',
    });
  }

  next();
}

module.exports = { authenticate, verifyPodcastOwner };
