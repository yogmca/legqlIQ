import { useState, useRef, useEffect } from 'react';
import './LegalChatbot.css';

const LegalChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hello! I\'m LegalIQ Assistant. I can help you with:\n\n• Indian Law & Legal System\n• IPC Penal Codes\n• How to use LegalIQ\n• General Legal Advice\n\nHow can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Knowledge base for Indian Law
  const knowledgeBase = {
    // IPC Codes
    ipc: {
      '302': 'IPC Section 302: Punishment for murder - Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.',
      '304': 'IPC Section 304: Punishment for culpable homicide not amounting to murder.',
      '307': 'IPC Section 307: Attempt to murder - Whoever does any act with such intention or knowledge, and under such circumstances that, if he by that act caused death, he would be guilty of murder.',
      '376': 'IPC Section 376: Punishment for rape - Rigorous imprisonment for a term which shall not be less than 10 years but which may extend to imprisonment for life.',
      '420': 'IPC Section 420: Cheating and dishonestly inducing delivery of property - Imprisonment up to 7 years and fine.',
      '498a': 'IPC Section 498A: Husband or relative of husband of a woman subjecting her to cruelty - Imprisonment up to 3 years and fine.',
      '506': 'IPC Section 506: Punishment for criminal intimidation - Imprisonment up to 2 years or fine or both.',
      '354': 'IPC Section 354: Assault or criminal force to woman with intent to outrage her modesty.',
      '323': 'IPC Section 323: Punishment for voluntarily causing hurt - Imprisonment up to 1 year or fine up to Rs. 1000 or both.',
      '379': 'IPC Section 379: Punishment for theft - Imprisonment up to 3 years or fine or both.'
    },
    
    // Legal concepts
    concepts: {
      'bail': 'Bail is the temporary release of an accused person awaiting trial, sometimes on condition that a sum of money is lodged to guarantee their appearance in court. In India, bail can be regular bail, anticipatory bail, or interim bail.',
      'fir': 'FIR (First Information Report) is a written document prepared by police when they receive information about a cognizable offense. It is the first step in criminal proceedings.',
      'pil': 'PIL (Public Interest Litigation) is a legal action initiated in a court of law for the protection of public interest or general interest of the public.',
      'cognizable': 'A cognizable offense is one where police can arrest without a warrant and start investigation without court permission. Examples include murder, rape, theft, etc.',
      'non-cognizable': 'A non-cognizable offense is one where police cannot arrest without a warrant and cannot investigate without court permission. Examples include assault, defamation, etc.',
      'bailable': 'A bailable offense is one where the accused has a right to be released on bail. The police or court must grant bail.',
      'non-bailable': 'A non-bailable offense is one where bail is not a matter of right. The court has discretion to grant or refuse bail.',
      'advocate': 'An advocate is a person who is qualified to represent clients in a court of law. In India, advocates are enrolled with the Bar Council.',
      'plaintiff': 'A plaintiff is a person who brings a case against another in a court of law (in civil cases).',
      'defendant': 'A defendant is an individual, company, or institution sued or accused in a court of law.',
      'appeal': 'An appeal is an application to a higher court for a decision to be reversed. It must be filed within the limitation period.',
      'jurisdiction': 'Jurisdiction is the official power to make legal decisions and judgments. Courts have territorial and subject matter jurisdiction.'
    },
    
    // LegalIQ platform help
    platform: {
      'register': 'To register on LegalIQ:\n1. Click "Register" button\n2. Choose "Client" or "Lawyer"\n3. Fill in your details\n4. Verify your email/phone\n5. Complete your profile',
      'find lawyer': 'To find a lawyer:\n1. Use the search bar on homepage\n2. Filter by specialization, location, or court\n3. View lawyer profiles and ratings\n4. Click "Book Consultation" to connect',
      'book consultation': 'To book a consultation:\n1. Select a lawyer\n2. Click "Book Consultation"\n3. Choose date and time\n4. Make payment\n5. Join video call at scheduled time',
      'video consultation': 'Video consultations allow you to meet lawyers online. You need a stable internet connection and camera/microphone access.',
      'payment': 'LegalIQ accepts payments via UPI, credit/debit cards, and net banking. All transactions are secure and encrypted.',
      'appointment': 'View your appointments in the "Appointments" section. You can reschedule or cancel up to 24 hours before the scheduled time.'
    }
  };

  const getResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Check for IPC codes
    const ipcMatch = message.match(/\b(ipc|section)\s*(\d+[a-z]?)\b/i);
    if (ipcMatch) {
      const code = ipcMatch[2];
      if (knowledgeBase.ipc[code]) {
        return knowledgeBase.ipc[code];
      }
      return `I don't have specific information about IPC Section ${code}. Common IPC sections I can help with include: 302 (Murder), 307 (Attempt to Murder), 376 (Rape), 420 (Cheating), 498A (Cruelty), 323 (Hurt), 379 (Theft), 354 (Outraging Modesty), 506 (Criminal Intimidation).`;
    }
    
    // Check for legal concepts
    for (const [key, value] of Object.entries(knowledgeBase.concepts)) {
      if (message.includes(key)) {
        return value;
      }
    }
    
    // Check for platform help
    for (const [key, value] of Object.entries(knowledgeBase.platform)) {
      if (message.includes(key)) {
        return value;
      }
    }
    
    // Greetings
    if (message.match(/\b(hi|hello|hey|namaste)\b/)) {
      return 'Hello! How can I assist you with legal matters today? You can ask me about IPC sections, legal concepts, or how to use LegalIQ.';
    }
    
    // Thanks
    if (message.match(/\b(thank|thanks|appreciate)\b/)) {
      return 'You\'re welcome! Feel free to ask if you have any more questions about Indian law or LegalIQ.';
    }
    
    // Lawyer related
    if (message.includes('lawyer') || message.includes('advocate')) {
      return 'LegalIQ connects you with verified lawyers across India. You can:\n• Search by specialization (Criminal, Civil, Family, etc.)\n• Filter by location and court\n• View ratings and experience\n• Book video consultations\n\nWould you like help finding a lawyer?';
    }
    
    // Legal advice
    if (message.includes('legal advice') || message.includes('legal help')) {
      return 'For personalized legal advice, I recommend:\n1. Book a consultation with a verified lawyer on LegalIQ\n2. Explain your situation in detail\n3. Get expert guidance specific to your case\n\nI can provide general information, but a lawyer can give you specific advice for your situation.';
    }
    
    // Court related
    if (message.includes('court') || message.includes('case')) {
      return 'Indian courts are organized in a hierarchy:\n• Supreme Court (Apex court)\n• High Courts (State level)\n• District Courts (District level)\n• Subordinate Courts\n\nLegalIQ has lawyers practicing in all major courts. Would you like to find a lawyer for a specific court?';
    }
    
    // Rights
    if (message.includes('rights') || message.includes('fundamental right')) {
      return 'Indian Constitution guarantees Fundamental Rights:\n• Right to Equality (Articles 14-18)\n• Right to Freedom (Articles 19-22)\n• Right against Exploitation (Articles 23-24)\n• Right to Freedom of Religion (Articles 25-28)\n• Cultural and Educational Rights (Articles 29-30)\n• Right to Constitutional Remedies (Article 32)\n\nWould you like details on any specific right?';
    }
    
    // Default response
    return 'I can help you with:\n\n📚 IPC Sections - Ask about specific sections (e.g., "What is IPC 420?")\n⚖️ Legal Concepts - Bail, FIR, PIL, etc.\n💼 Finding Lawyers - How to search and book consultations\n📱 Using LegalIQ - Platform features and help\n\nWhat would you like to know?';
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMsg = {
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot thinking and respond
    setTimeout(() => {
      const botResponse = getResponse(inputMessage);
      const botMsg = {
        type: 'bot',
        text: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    'What is IPC 420?',
    'How to register?',
    'Find a lawyer',
    'What is bail?',
    'Book consultation'
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button 
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Legal Assistant"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-avatar">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <h3>LegalIQ Assistant</h3>
                <p>Online • Ready to help</p>
              </div>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                <div className="message-content">
                  <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot">
                <div className="message-content typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="quick-questions">
              <p>Quick questions:</p>
              <div className="quick-questions-grid">
                {quickQuestions.map((q, index) => (
                  <button 
                    key={index}
                    onClick={() => handleQuickQuestion(q)}
                    className="quick-question-btn"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="chatbot-input">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about Indian law, IPC codes, or how to use LegalIQ..."
              rows="1"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="send-button"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LegalChatbot;
