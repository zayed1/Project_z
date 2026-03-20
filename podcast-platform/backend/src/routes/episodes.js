// ============================================
// مسارات الحلقات | Episode Routes
// ============================================
const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createEpisode,
  getEpisodes,
  updateEpisode,
  deleteEpisode,
} = require('../controllers/episodesController');
const { authenticate, verifyPodcastOwner } = require('../middleware/auth');

// إعداد Multer لرفع الملفات الصوتية | Configure Multer for audio uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB حد أقصى | max file size
  },
  fileFilter: (req, file, cb) => {
    // السماح فقط بالملفات الصوتية | Allow only audio files
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/x-m4a'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. يرجى رفع ملف صوتي | Unsupported file type. Please upload an audio file'));
    }
  },
});

// إضافة حلقة جديدة مع رفع ملف صوتي | Create episode with audio (protected + owner)
router.post(
  '/podcasts/:podcastId/episodes',
  authenticate,
  verifyPodcastOwner,
  upload.single('audio'),
  createEpisode
);

// جلب جميع حلقات بودكاست | Get all episodes for a podcast (public)
router.get('/podcasts/:podcastId/episodes', getEpisodes);

// تعديل معلومات الحلقة | Update episode (protected)
router.put('/episodes/:episodeId', authenticate, updateEpisode);

// حذف الحلقة | Delete episode (protected)
router.delete('/episodes/:episodeId', authenticate, deleteEpisode);

module.exports = router;
