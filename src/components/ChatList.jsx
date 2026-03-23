import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import chatService from '../services/chatService';
import authService from '../services/authService';
import './ChatList.css';

function ChatList() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const user = authService.getUser();

  useEffect(() => {
    // Check authentication
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadChats();
    
    // Connect to chat service
    chatService.connect();

    // Listen for chat updates
    chatService.onChatUpdated((data) => {
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === data.chatId) {
            return {
              ...chat,
              lastMessage: data.lastMessage,
              lastMessageTime: data.lastMessageTime,
              unreadCount: data.unreadCount || 0
            };
          }
          return chat;
        }).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
      });
    });

    return () => {
      chatService.removeAllListeners();
    };
  }, [navigate]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const userChats = await chatService.getUserChats();
      setChats(userChats);
      setError(null);
    } catch (err) {
      console.error('Error loading chats:', err);
      setError('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    try {
      await chatService.deleteChat(chatId);
      setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    } catch (err) {
      console.error('Error deleting chat:', err);
      alert('Failed to delete chat');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="chat-list-container">
        <div className="chat-list-header">
          <h1>Messages</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h1>Messages</h1>
        <button className="back-btn" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadChats}>Try Again</button>
        </div>
      )}

      {chats.length === 0 ? (
        <div className="no-chats">
          <div className="no-chats-icon">💬</div>
          <h3>No Messages Yet</h3>
          {user && (user.role === 'lawyer' || user.role === 'tax-consultant' || user.role === 'auditor') ? (
            <p>Your clients will be able to message you here once they start a conversation</p>
          ) : (
            <>
              <p>Start a conversation with a lawyer or professional</p>
              <button className="browse-btn" onClick={() => navigate('/lawyers')}>
                Browse Lawyers
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="chat-list">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${chat.unreadCount > 0 ? 'unread' : ''}`}
              onClick={() => handleChatClick(chat.id)}
            >
              <div className="chat-avatar">
                {chat.otherParticipantName?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="chat-info">
                <div className="chat-header-row">
                  <h3 className="chat-name">{chat.otherParticipantName}</h3>
                  <span className="chat-time">{formatTime(chat.lastMessageTime)}</span>
                </div>
                <div className="chat-preview-row">
                  <p className="chat-preview">
                    {chat.lastMessage || 'No messages yet'}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className="unread-badge">{chat.unreadCount}</span>
                  )}
                </div>
              </div>
              <button
                className="delete-chat-btn"
                onClick={(e) => handleDeleteChat(chat.id, e)}
                title="Delete chat"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatList;
