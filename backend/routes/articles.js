const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/approved', articleController.getApprovedArticles);
router.get('/featured', articleController.getFeaturedArticles);

// Admin only routes (must come before generic routes)
router.get('/admin/all', protect, articleController.getAllArticles);
router.get('/admin/pending', protect, articleController.getPendingArticles);
router.put('/admin/:id/approve', protect, articleController.approveArticle);
router.put('/admin/:id/decline', protect, articleController.declineArticle);

// Protected routes (require authentication)
router.get('/user/my-articles', protect, articleController.getMyArticles);
router.post('/', protect, articleController.upload, articleController.createArticle);
router.put('/:id', protect, articleController.upload, articleController.updateArticle);
router.delete('/:id', protect, articleController.deleteArticle);
router.post('/:id/like', protect, articleController.toggleLike);
router.post('/:id/comment', protect, articleController.addComment);

// Public route for single article (must be last to avoid conflicts)
router.get('/:id', articleController.getArticleById);

module.exports = router;
