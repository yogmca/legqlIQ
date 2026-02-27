const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const { protect } = require('../middleware/authMiddleware');

// All consultation routes require authentication
router.use(protect);

// Payment routes for video consultations
router.post('/create-order', consultationController.createRazorpayOrder);
router.post('/verify-payment', consultationController.verifyPayment);

// Create new consultation
router.post('/', consultationController.createConsultation);

// Get all consultations for authenticated user
router.get('/', consultationController.getUserConsultations);

// Get consultation statistics
router.get('/stats', consultationController.getConsultationStats);

// Get specific consultation by ID
router.get('/:id', consultationController.getConsultationById);

// Update consultation status
router.patch('/:id', consultationController.updateConsultationStatus);

// Cancel consultation
router.delete('/:id', consultationController.cancelConsultation);

// Add review to consultation
router.post('/:id/review', consultationController.addReview);

module.exports = router;
