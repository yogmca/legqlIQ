const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// All chat routes require authentication
router.use(protect);

// Get all chats for the logged-in user
router.get('/', chatController.getUserChats);

// Get or create a chat with another user
router.get('/with/:otherUserId', chatController.getOrCreateChat);

// Get messages for a specific chat
router.get('/:chatId/messages', chatController.getChatMessages);

// Send a message in a chat
router.post('/:chatId/messages', chatController.sendMessage);

// Delete a chat
router.delete('/:chatId', chatController.deleteChat);

module.exports = router;
