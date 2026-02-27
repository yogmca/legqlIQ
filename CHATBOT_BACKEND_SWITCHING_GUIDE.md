# Chatbot Backend Switching Guide

## Overview

The LegalIQ chatbot now supports multiple backends that can be easily switched by changing a single configuration value. The web scraper service is now fully integrated with the chatbot interface.

## Available Backends

### 1. **Web Scraper** (Currently Active) ✅
- **Endpoint**: `/api/scraper/chat`
- **Features**:
  - IPC Sections with official India Code links
  - Legal Procedures (FIR, Bail, Divorce)
  - Fundamental Rights
  - Acts and Amendments
  - Case Law Information
- **Advantages**:
  - Official government sources
  - Comprehensive legal information
  - 24-hour caching for performance
  - Graceful fallback system

### 2. **Built-in Knowledge Base**
- **Endpoint**: `/api/chatbot/chat`
- **Features**:
  - Fast responses
  - No external dependencies
  - Common IPC sections
  - Basic legal procedures
- **Advantages**:
  - Very fast
  - Always available
  - No network dependencies

### 3. **AI API** (Future)
- **Endpoint**: `/api/ai/chat`
- **Features**:
  - Advanced natural language understanding
  - Contextual responses
  - Multi-turn conversations
- **Status**: Ready for integration when needed

## How to Switch Backends

### Method 1: Configuration File (Recommended)

Edit [`src/config/chatbotConfig.js`](karnataka-bar-association/src/config/chatbotConfig.js):

```javascript
// Change this line to switch backends
export const ACTIVE_BACKEND = CHATBOT_BACKENDS.SCRAPER; // Current

// Options:
// CHATBOT_BACKENDS.SCRAPER    - Web Scraper (recommended)
// CHATBOT_BACKENDS.BUILTIN    - Built-in Knowledge Base
// CHATBOT_BACKENDS.AI_API     - AI API (future)
```

### Method 2: Direct Component Edit

Edit [`src/components/LegalChatbot.jsx`](karnataka-bar-association/src/components/LegalChatbot.jsx):

```javascript
// Line 37: Change the endpoint
const response = await fetch(`${API_URL}/scraper/chat`, {  // Web Scraper
// const response = await fetch(`${API_URL}/chatbot/chat`, { // Built-in
// const response = await fetch(`${API_URL}/ai/chat`, {      // AI API
```

## Testing the Integration

### Test in Browser

1. Open your application: `http://localhost:5173`
2. Click the chatbot icon in the bottom right
3. Try these test queries:

```
- "What is IPC 420?"
- "How to file FIR?"
- "What are fundamental rights?"
- "Explain bail procedure"
```

### Test with cURL

```bash
# Test web scraper backend
curl -X POST http://localhost:4000/api/scraper/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is IPC 420?"}'

# Test built-in backend
curl -X POST http://localhost:4000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is IPC 420?"}'
```

## Current Integration Status

✅ **Web Scraper Service**: Fully integrated and active
✅ **Backend Configuration**: Centralized in config file
✅ **Easy Switching**: Change one line to switch backends
✅ **Hot Module Replacement**: Changes apply instantly during development
✅ **Production Ready**: All error handling and fallbacks in place

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │         LegalChatbot.jsx Component                 │ │
│  │                                                     │ │
│  │  Uses: chatbotConfig.js                           │ │
│  │  - getChatbotEndpoint()                           │ │
│  │  - getCurrentBackend()                            │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
└──────────────────────────┼───────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend (Express)                       │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   /scraper   │  │  /chatbot    │  │    /ai       │  │
│  │   (Active)   │  │  (Available) │  │  (Future)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         ▼                  ▼                  ▼          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Web Scraper  │  │   Built-in   │  │   AI API     │  │
│  │   Service    │  │  Knowledge   │  │  Integration │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Features of Current Integration

### 1. **Seamless User Experience**
- Users see no difference when backend is switched
- Same chatbot interface
- Consistent response format

### 2. **Smart Response Formatting**
- Markdown support for rich text
- Clickable links to official sources
- Structured information display

### 3. **Error Handling**
- Graceful fallback if scraping fails
- User-friendly error messages
- Automatic retry logic

### 4. **Performance Optimization**
- 24-hour caching
- Fast response times
- Reduced server load

## Comparison Table

| Feature | Web Scraper | Built-in | AI API |
|---------|-------------|----------|--------|
| **Speed** | Fast (cached) | Very Fast | Medium |
| **Accuracy** | High (official sources) | Good | Very High |
| **Coverage** | Comprehensive | Basic | Extensive |
| **Dependencies** | None (has fallback) | None | External API |
| **Cost** | Free | Free | Paid |
| **Maintenance** | Low | Very Low | Low |
| **Recommended For** | Production | Development | Advanced Features |

## Troubleshooting

### Issue: Chatbot not responding
**Solution**: Check browser console for errors. Verify backend is running on port 4000.

### Issue: Getting generic responses
**Solution**: This is normal for IPC sections not in the fallback database. The scraper provides a helpful response with links to official sources.

### Issue: Want to add more IPC sections
**Solution**: Edit [`backend/services/webScraperService.js`](karnataka-bar-association/backend/services/webScraperService.js) and add sections to the `fallbackKnowledge.ipc` object.

## Adding New IPC Sections

To add more IPC sections to the fallback knowledge base:

```javascript
// In backend/services/webScraperService.js
initializeFallbackKnowledge() {
  return {
    ipc: {
      // Add new section here
      '320': {
        title: 'IPC Section 320 - Grievous Hurt',
        description: 'Description here...',
        punishment: 'Punishment details...',
        bailable: 'Bailable/Non-bailable',
        cognizable: 'Cognizable/Non-cognizable',
        triable: 'Court type',
        link: 'https://www.indiacode.nic.in/...'
      }
    }
  }
}
```

## Future Enhancements

1. **AI Integration**: Connect to OpenAI, Google Gemini, or other AI APIs
2. **Hybrid Mode**: Combine scraper + AI for best results
3. **User Preferences**: Let users choose their preferred backend
4. **Analytics**: Track which backend performs better
5. **A/B Testing**: Test different backends with different users

## Support

For issues or questions:
- Check the [Web Scraper Service Guide](WEB_SCRAPER_SERVICE_GUIDE.md)
- Review console logs for detailed error messages
- Verify all services are running (frontend on 5173, backend on 4000)

## Summary

✅ Web scraper is now fully integrated with the chatbot
✅ Easy backend switching via configuration file
✅ Production-ready with error handling and fallbacks
✅ Comprehensive documentation provided
✅ Ready for future AI integration

The chatbot now uses the web scraper service by default, providing users with accurate legal information from official Indian government sources!
