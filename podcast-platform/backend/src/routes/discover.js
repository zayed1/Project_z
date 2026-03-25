// ============================================
// مسارات الاكتشاف | Discover Routes
// ============================================
const express = require('express');
const router = express.Router();
const {
  getSuggestedPodcasts,
  getPopularEpisodes,
  getTrendingPodcasts,
  searchEpisodes,
} = require('../controllers/discoverController');

router.get('/discover/suggested/:podcastId', getSuggestedPodcasts);
router.get('/discover/popular', getPopularEpisodes);
router.get('/discover/trending', getTrendingPodcasts);
router.get('/podcasts/:podcastId/episodes/search', searchEpisodes);

module.exports = router;
