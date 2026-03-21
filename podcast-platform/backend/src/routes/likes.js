// ============================================
// مسارات الإعجابات | Likes Routes
// ============================================
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { toggleLike, removeLike, getEpisodeLikes } = require('../controllers/likesController');

// عام | Public
router.get('/episodes/:episodeId/likes', getEpisodeLikes);

// محمي | Protected
router.post('/episodes/:episodeId/like', authenticate, toggleLike);
router.delete('/episodes/:episodeId/like', authenticate, removeLike);

module.exports = router;
