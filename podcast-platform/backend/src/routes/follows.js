// ============================================
// مسارات المتابعة | Follow Routes
// ============================================
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { toggleFollow, getMyFollows, checkFollow, getFollowersCount } = require('../controllers/followController');

// عام | Public
router.get('/podcasts/:podcastId/followers/count', getFollowersCount);

// محمي | Protected
router.post('/podcasts/:podcastId/follow', authenticate, toggleFollow);
router.get('/me/follows', authenticate, getMyFollows);
router.get('/podcasts/:podcastId/follow/check', authenticate, checkFollow);

module.exports = router;
