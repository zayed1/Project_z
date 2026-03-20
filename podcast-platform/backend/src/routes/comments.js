// ============================================
// مسارات التعليقات | Comment Routes
// ============================================
const express = require('express');
const router = express.Router();
const { getComments, addComment, deleteComment } = require('../controllers/commentsController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

// عام | Public
router.get('/episodes/:episodeId/comments', getComments);

// محمي | Protected
router.post('/episodes/:episodeId/comments', authenticate, addComment);

// مشرف فقط | Admin only
router.delete('/comments/:commentId', authenticate, requireAdmin, deleteComment);

module.exports = router;
