import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import chatService from '../services/chatService';
import authService from '../services/authService';
import './Chat.css';

function Chat() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [otherParticipantName, setOtherParticipantName] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUser = authService.getUser();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadMessages();
    
    // Connect to chat service
    chatService.connect();
    chatService.joinChat(chatId);

    // Listen for new messages
    chatService.onNewMessage((data) => {
      if (data.chatId === chatId) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
        
        // Mark as read if message is from other user
        if (data.message.sender !== (currentUser?.id || currentUser?._id)) {
          chatService.markAsRead(chatId);
        }
      }
    });

    // Listen for typing indicator
    chatService.onUserTyping((data) => {
      if (data.chatId === chatId && data.userId !== (currentUser?.id || currentUser?._id)) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      chatService.leaveChat(chatId);
      chatService.removeAllListeners();
    };
  }, [chatId, navigate, currentUser?.id, currentUser?._id]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await chatService.getChatMessages(chatId);
      setMessages(data.messages || []);
      
      // Get other participant's name
      const currentUserId = currentUser?.id || currentUser?._id;
      const otherParticipantIndex = data.participants.findIndex(
        p => p.toString() !== currentUserId?.toString()
      );
      setOtherParticipantName(data.participantNames[otherParticipantIndex] || 'Unknown');
      
      setError(null);
      scrollToBottom();
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Send via Socket.IO for real-time delivery
      chatService.sendMessage(chatId, messageContent);
      
      // Stop typing indicator
      chatService.sendTyping(chatId, false);
    } catch (err) {
      console.error('Error sending message:', err);
      // Fallback to REST API
      try {
        const message = await chatService.sendMessageREST(chatId, messageContent);
        setMessages(prev => [...prev, message]);
      } catch (restErr) {
        console.error('REST API also failed:', restErr);
        alert('Failed to send message');
        setNewMessage(messageContent); // Restore message
      }
    } finally {
      setSending(false);
      scrollToBottom();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    chatService.sendTyping(chatId, true);

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      chatService.sendTyping(chatId, false);
    }, 2000);
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const shouldShowDateSeparator = (currentMsg, prevMsg) => {
    if (!prevMsg) return true;
    
    const currentDate = new Date(currentMsg.timestamp).toDateString();
    const prevDate = new Date(prevMsg.timestamp).toDateString();
    
    return currentDate !== prevDate;
  };

  if (loading) {
    return (
      <div className="chat-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate('/chats')}>
          ← Back
        </button>
        <div className="chat-header-info">
          <div className="chat-header-avatar">
            {otherParticipantName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2>{otherParticipantName}</h2>
            {isTyping && <span className="typing-indicator">typing...</span>}
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadMessages}>Retry</button>
        </div>
      )}

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.sender === (currentUser?.id || currentUser?._id);
            const showDateSeparator = shouldShowDateSeparator(message, messages[index - 1]);

            return (
              <div key={message._id || index}>
                {showDateSeparator && (
                  <div className="date-separator">
                    <span>{formatMessageDate(message.timestamp)}</span>
                  </div>
                )}
                <div className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}>
                  <div className="message-content">
                    <p>{message.content}</p>
                    <span className="message-time">{formatMessageTime(message.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="message-input"
          disabled={sending}
        />
        <button 
          type="submit" 
          className="send-btn"
          disabled={!newMessage.trim() || sending}
        >
          {sending ? '...' : '➤'}
        </button>
      </form>
    </div>
  );
}

export default Chat;
