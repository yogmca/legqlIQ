// Chatbot Configuration
// Switch between different chatbot backends easily

export const CHATBOT_BACKENDS = {
  SCRAPER: 'scraper',
  BUILTIN: 'chatbot',
  AI_API: 'ai' // For future AI integration
};

// Current active backend
export const ACTIVE_BACKEND = CHATBOT_BACKENDS.SCRAPER;

// Backend configurations
export const BACKEND_CONFIG = {
  [CHATBOT_BACKENDS.SCRAPER]: {
    endpoint: '/scraper/chat',
    name: 'Web Scraper',
    description: 'Scrapes legal information from official Indian law websites',
    features: [
      'IPC Sections with official links',
      'Legal Procedures (FIR, Bail, Divorce)',
      'Fundamental Rights',
      'Acts and Amendments',
      'Case Law Information'
    ],
    welcomeMessage: 'Hello! I\'m LegalIQ AI Assistant powered by Web Scraper. I can help you with:\n\n• Indian Penal Code (IPC) Sections\n• Legal Procedures (FIR, Bail, Divorce)\n• Fundamental Rights\n• Acts and Amendments\n• Case Law Information\n\nAsk me anything about Indian law!'
  },
  [CHATBOT_BACKENDS.BUILTIN]: {
    endpoint: '/chatbot/chat',
    name: 'Built-in Knowledge Base',
    description: 'Uses pre-configured legal knowledge base',
    features: [
      'Fast responses',
      'No external dependencies',
      'Common IPC sections',
      'Basic legal procedures',
      'Fundamental rights'
    ],
    welcomeMessage: 'Hello! I\'m LegalIQ AI Assistant with built-in legal knowledge. I can help you with:\n\n• Indian Law & Legal System\n• IPC Penal Codes & Explanations\n• Legal Procedures & Rights\n• How to use LegalIQ Platform\n\nAsk me anything about Indian law!'
  },
  [CHATBOT_BACKENDS.AI_API]: {
    endpoint: '/ai/chat',
    name: 'AI API (Future)',
    description: 'Uses external AI API for advanced responses',
    features: [
      'Advanced natural language understanding',
      'Contextual responses',
      'Multi-turn conversations',
      'Comprehensive legal analysis'
    ],
    welcomeMessage: 'Hello! I\'m LegalIQ AI Assistant powered by advanced AI. I can help you with comprehensive legal information and analysis. Ask me anything about Indian law!'
  }
};

// Get current backend configuration
export const getCurrentBackend = () => {
  return BACKEND_CONFIG[ACTIVE_BACKEND];
};

// Get API endpoint for current backend
export const getChatbotEndpoint = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  return `${API_URL}${getCurrentBackend().endpoint}`;
};

export default {
  CHATBOT_BACKENDS,
  ACTIVE_BACKEND,
  BACKEND_CONFIG,
  getCurrentBackend,
  getChatbotEndpoint
};
