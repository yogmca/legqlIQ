const Chat = require('../models/Chat');
const User = require('../models/User');

class ChatService {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // Map userId to socketId
  }

  initialize() {
    // Create a separate namespace for chat
    this.chatNamespace = this.io.of('/chat');

    this.chatNamespace.on('connection', (socket) => {
      console.log('💬 User connected to chat:', socket.id);

      // Handle user joining chat
      socket.on('join', (userId) => {
        console.log(`User ${userId} joined chat with socket ${socket.id}`);
        this.userSockets.set(userId, socket.id);
        socket.userId = userId;
        
        // Join user to their own room for private messages
        socket.join(`user:${userId}`);
      });

      // Handle joining a specific chat room
      socket.on('join-chat', (chatId) => {
        console.log(`Socket ${socket.id} joined chat room: ${chatId}`);
        socket.join(`chat:${chatId}`);
      });

      // Handle leaving a chat room
      socket.on('leave-chat', (chatId) => {
        console.log(`Socket ${socket.id} left chat room: ${chatId}`);
        socket.leave(`chat:${chatId}`);
      });

      // Handle sending a message
      socket.on('send-message', async (data) => {
        try {
          const { chatId, senderId, content } = data;

          // Find the chat
          const chat = await Chat.findById(chatId);
          if (!chat) {
            socket.emit('error', { message: 'Chat not found' });
            return;
          }

          // Verify sender is a participant
          if (!chat.participants.some(p => p.toString() === senderId)) {
            socket.emit('error', { message: 'Unauthorized' });
            return;
          }

          // Get sender info
          const sender = await User.findById(senderId);
          if (!sender) {
            socket.emit('error', { message: 'Sender not found' });
            return;
          }

          // Create message
          const newMessage = {
            sender: senderId,
            senderName: sender.name,
            content: content.trim(),
            timestamp: new Date(),
            read: false
          };

          // Add message to chat
          chat.messages.push(newMessage);
          chat.lastMessage = content.trim();
          chat.lastMessageTime = new Date();

          // Increment unread count for other participant
          const otherParticipantId = chat.participants.find(
            p => p.toString() !== senderId
          ).toString();
          
          const currentUnread = chat.unreadCount.get(otherParticipantId) || 0;
          chat.unreadCount.set(otherParticipantId, currentUnread + 1);

          await chat.save();

          // Emit message to all users in the chat room
          this.chatNamespace.to(`chat:${chatId}`).emit('new-message', {
            chatId,
            message: newMessage,
            lastMessage: chat.lastMessage,
            lastMessageTime: chat.lastMessageTime
          });

          // Also emit to the other participant's user room for notifications
          this.chatNamespace.to(`user:${otherParticipantId}`).emit('chat-updated', {
            chatId,
            lastMessage: chat.lastMessage,
            lastMessageTime: chat.lastMessageTime,
            unreadCount: chat.unreadCount.get(otherParticipantId)
          });

        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicator
      socket.on('typing', (data) => {
        const { chatId, userId, isTyping } = data;
        socket.to(`chat:${chatId}`).emit('user-typing', {
          chatId,
          userId,
          isTyping
        });
      });

      // Handle marking messages as read
      socket.on('mark-read', async (data) => {
        try {
          const { chatId, userId } = data;

          const chat = await Chat.findById(chatId);
          if (!chat) return;

          // Mark all messages from other users as read
          chat.messages.forEach(msg => {
            if (msg.sender.toString() !== userId) {
              msg.read = true;
            }
          });

          // Reset unread count
          chat.unreadCount.set(userId, 0);
          await chat.save();

          // Notify other participant that messages were read
          const otherParticipantId = chat.participants.find(
            p => p.toString() !== userId
          ).toString();

          this.chatNamespace.to(`user:${otherParticipantId}`).emit('messages-read', {
            chatId
          });

        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('💬 User disconnected from chat:', socket.id);
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
        }
      });
    });

    console.log('✅ Chat Service initialized with Socket.IO');
  }

  // Helper method to check if user is online
  isUserOnline(userId) {
    return this.userSockets.has(userId);
  }

  // Helper method to get user's socket
  getUserSocket(userId) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      return this.chatNamespace.sockets.get(socketId);
    }
    return null;
  }
}

module.exports = ChatService;
