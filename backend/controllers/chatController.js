const Chat = require('../models/Chat');
const User = require('../models/User');

// Get all chats for a user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      participants: userId
    })
    .sort({ lastMessageTime: -1 })
    .lean();

    // Format chats for frontend
    const formattedChats = chats.map(chat => {
      const otherParticipantIndex = chat.participants.findIndex(
        p => p.toString() !== userId.toString()
      );
      
      // Handle unreadCount - it's a Map in Mongoose but becomes an object with .lean()
      const unreadCount = chat.unreadCount instanceof Map
        ? chat.unreadCount.get(userId.toString())
        : (chat.unreadCount?.[userId.toString()] || 0);
      
      return {
        id: chat._id,
        otherParticipantId: chat.participants[otherParticipantIndex],
        otherParticipantName: chat.participantNames[otherParticipantIndex],
        lastMessage: chat.lastMessage,
        lastMessageTime: chat.lastMessageTime,
        unreadCount: unreadCount || 0,
        createdAt: chat.createdAt
      };
    });

    res.json({
      success: true,
      chats: formattedChats
    });
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats'
    });
  }
};

// Get or create a chat between two users
exports.getOrCreateChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    // Validate other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [userId, otherUserId] }
    });

    // Create new chat if it doesn't exist
    if (!chat) {
      const currentUser = await User.findById(userId);
      
      chat = new Chat({
        participants: [userId, otherUserId],
        participantNames: [currentUser.name, otherUser.name],
        messages: [],
        unreadCount: {
          [userId.toString()]: 0,
          [otherUserId.toString()]: 0
        }
      });

      await chat.save();
    }

    res.json({
      success: true,
      chat: {
        id: chat._id,
        participants: chat.participants,
        participantNames: chat.participantNames,
        messages: chat.messages,
        createdAt: chat.createdAt
      }
    });
  } catch (error) {
    console.error('Error getting/creating chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get or create chat'
    });
  }
};

// Get messages for a specific chat
exports.getChatMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user is a participant
    if (!chat.participants.some(p => p.toString() === userId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to chat'
      });
    }

    // Mark messages as read
    chat.messages.forEach(msg => {
      if (msg.sender.toString() !== userId.toString()) {
        msg.read = true;
      }
    });

    // Reset unread count for this user
    chat.unreadCount.set(userId.toString(), 0);
    await chat.save();

    res.json({
      success: true,
      messages: chat.messages,
      participants: chat.participants,
      participantNames: chat.participantNames
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user is a participant
    if (!chat.participants.some(p => p.toString() === userId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to chat'
      });
    }

    const currentUser = await User.findById(userId);

    // Create new message
    const newMessage = {
      sender: userId,
      senderName: currentUser.name,
      content: content.trim(),
      timestamp: new Date(),
      read: false
    };

    chat.messages.push(newMessage);
    chat.lastMessage = content.trim();
    chat.lastMessageTime = new Date();

    // Increment unread count for other participant
    const otherParticipantId = chat.participants.find(
      p => p.toString() !== userId.toString()
    ).toString();
    
    const currentUnread = chat.unreadCount.get(otherParticipantId) || 0;
    chat.unreadCount.set(otherParticipantId, currentUnread + 1);

    await chat.save();

    res.json({
      success: true,
      message: newMessage,
      chat: {
        id: chat._id,
        lastMessage: chat.lastMessage,
        lastMessageTime: chat.lastMessageTime
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Delete a chat
exports.deleteChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user is a participant
    if (!chat.participants.some(p => p.toString() === userId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to chat'
      });
    }

    await Chat.findByIdAndDelete(chatId);

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat'
    });
  }
};
