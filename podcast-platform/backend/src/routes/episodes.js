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
  recordListen,
  deleteEpisode,
} = require('../controllers/episodesController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { uploadLimiter } = require('../middleware/security');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/x-m4a'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('نوع الملف غير مدعوم. يرجى رفع ملف صوتي'));
  },
});

// عام | Public
router.get('/podcasts/:podcastId/episodes', getEpisodes);
router.post('/episodes/:episodeId/listen', recordListen);

// محمي - مشرف فقط | Protected - Admin only
router.post(
  '/podcasts/:podcastId/episodes',
  authenticate, requireAdmin, uploadLimiter,
  upload.single('audio'),
  createEpisode
);
router.put('/episodes/:episodeId', authenticate, requireAdmin, updateEpisode);
router.delete('/episodes/:episodeId', authenticate, requireAdmin, deleteEpisode);

module.exports = router;
