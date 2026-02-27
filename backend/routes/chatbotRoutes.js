const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Chat endpoint
router.post('/chat', chatbotController.getChatResponse);

// Health check endpoint
router.get('/health', chatbotController.healthCheck);

module.exports = router;
