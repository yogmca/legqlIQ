import io from 'socket.io-client';
import authService from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

class ChatService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // Initialize socket connection
  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    const user = authService.getUser();
    if (!user) {
      console.error('Cannot connect to chat: User not authenticated');
      return null;
    }

    this.socket = io(`${SOCKET_URL}/chat`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('💬 Connected to chat service');
      // Join with user ID
      this.socket.emit('join', user.id || user._id);
    });

    this.socket.on('disconnect', () => {
      console.log('💬 Disconnected from chat service');
    });

    this.socket.on('error', (error) => {
      console.error('Chat socket error:', error);
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a specific chat room
  joinChat(chatId) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.emit('join-chat', chatId);
  }

  // Leave a specific chat room
  leaveChat(chatId) {
    this.socket?.emit('leave-chat', chatId);
  }

  // Send a message
  sendMessage(chatId, content) {
    const user = authService.getUser();
    if (!this.socket || !user) {
      console.error('Cannot send message: Not connected or not authenticated');
      return;
    }

    this.socket.emit('send-message', {
      chatId,
      senderId: user.id || user._id,
      content
    });
  }

  // Send typing indicator
  sendTyping(chatId, isTyping) {
    const user = authService.getUser();
    if (!this.socket || !user) return;

    this.socket.emit('typing', {
      chatId,
      userId: user.id || user._id,
      isTyping
    });
  }

  // Mark messages as read
  markAsRead(chatId) {
    const user = authService.getUser();
    if (!this.socket || !user) return;

    this.socket.emit('mark-read', {
      chatId,
      userId: user.id || user._id
    });
  }

  // Listen for new messages
  onNewMessage(callback) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on('new-message', callback);
    this.listeners.set('new-message', callback);
  }

  // Listen for chat updates
  onChatUpdated(callback) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on('chat-updated', callback);
    this.listeners.set('chat-updated', callback);
  }

  // Listen for typing indicator
  onUserTyping(callback) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on('user-typing', callback);
    this.listeners.set('user-typing', callback);
  }

  // Listen for messages read
  onMessagesRead(callback) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on('messages-read', callback);
    this.listeners.set('messages-read', callback);
  }

  // Remove all listeners
  removeAllListeners() {
    this.listeners.forEach((callback, event) => {
      this.socket?.off(event, callback);
    });
    this.listeners.clear();
  }

  // REST API methods

  // Get all chats for the current user
  async getUserChats() {
    try {
      const response = await fetch(`${API_URL}/chats`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const data = await response.json();
      return data.chats || [];
    } catch (error) {
      console.error('Error fetching user chats:', error);
      throw error;
    }
  }

  // Get or create a chat with another user
  async getOrCreateChat(otherUserId) {
    try {
      const response = await fetch(`${API_URL}/chats/with/${otherUserId}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get or create chat');
      }

      const data = await response.json();
      return data.chat;
    } catch (error) {
      console.error('Error getting/creating chat:', error);
      throw error;
    }
  }

  // Get messages for a specific chat
  async getChatMessages(chatId) {
    try {
      const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  }

  // Send a message via REST API (fallback)
  async sendMessageREST(chatId, content) {
    try {
      const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Delete a chat
  async deleteChat(chatId) {
    try {
      const response = await fetch(`${API_URL}/chats/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  }
}

// Create singleton instance
const chatService = new ChatService();

export default chatService;
