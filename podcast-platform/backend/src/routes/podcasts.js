// ============================================
// مسارات البودكاست | Podcast Routes
// ============================================
const express = require('express');
const router = express.Router();
const {
  getAllPodcasts,
  getPodcastById,
  createPodcast,
  updatePodcast,
  deletePodcast,
} = require('../controllers/podcastsController');
const { authenticate, verifyPodcastOwner } = require('../middleware/auth');

// جلب جميع البودكاست | Get all podcasts (public)
router.get('/podcasts', getAllPodcasts);

// جلب بودكاست معين مع حلقاته | Get single podcast (public)
router.get('/podcasts/:id', getPodcastById);

// إنشاء بودكاست جديد | Create podcast (protected)
router.post('/podcasts', authenticate, createPodcast);

// تعديل البودكاست | Update podcast (protected + owner only)
router.put('/podcasts/:id', authenticate, verifyPodcastOwner, updatePodcast);

// حذف البودكاست | Delete podcast (protected + owner only)
router.delete('/podcasts/:id', authenticate, verifyPodcastOwner, deletePodcast);

module.exports = router;
