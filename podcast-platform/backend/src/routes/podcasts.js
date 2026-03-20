// ============================================
// مسارات البودكاست | Podcast Routes
// ============================================
const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getAllPodcasts,
  getCategories,
  getPodcastById,
  createPodcast,
  updatePodcast,
  uploadCoverImage,
  deletePodcast,
  getStats,
} = require('../controllers/podcastsController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

// إعداد Multer لرفع الصور | Configure Multer for image uploads
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('نوع الصورة غير مدعوم'));
  },
});

// عام | Public
router.get('/podcasts', getAllPodcasts);
router.get('/categories', getCategories);
router.get('/podcasts/:id', getPodcastById);

// محمي - مشرف فقط | Protected - Admin only
router.post('/podcasts', authenticate, requireAdmin, createPodcast);
router.put('/podcasts/:id', authenticate, requireAdmin, updatePodcast);
router.delete('/podcasts/:id', authenticate, requireAdmin, deletePodcast);
router.post('/upload/cover', authenticate, requireAdmin, imageUpload.single('image'), uploadCoverImage);
router.get('/admin/stats', authenticate, requireAdmin, getStats);

module.exports = router;
