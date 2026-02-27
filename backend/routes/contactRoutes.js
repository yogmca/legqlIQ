const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

// Public route - anyone can submit contact form
router.post('/', contactController.submitContactForm);

// Protected route - only authenticated users can update contact email
router.put('/update-email', protect, contactController.updateContactEmail);

module.exports = router;
