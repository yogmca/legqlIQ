# Free AI Chatbot Setup Guide - Google Gemini

## ✅ What's Implemented

The LegalIQ AI Chatbot is now integrated with **Google Gemini AI** - a FREE AI service from Google!

### Features:
- 🤖 Real AI responses about Indian law and IPC codes
- 💰 **100% FREE** - Google Gemini has a generous free tier
- 🧠 Smart contextual understanding
- 📚 Knowledge about Indian legal system
- 🔄 Conversation history for context
- ⚡ Fast responses

## 🆓 Free AI Providers Comparison

| Provider | Free Tier | Requests/Min | Best For |
|----------|-----------|--------------|----------|
| **Google Gemini** ✅ | 60 req/min | 60 | Best choice - generous limits |
| Hugging Face | 1000 req/day | Varies | Open source models |
| Cohere | 100 calls/min | 100 | Good alternative |
| OpenAI | $5 credit | N/A | Paid only after credit |

**Recommendation: Use Google Gemini (FREE & Best)**

## 📝 Step-by-Step Setup

### Step 1: Get Free Google Gemini API Key

1. **Go to Google AI Studio**
   - Visit: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Sign in with Google Account**
   - Use any Gmail account (free)

3. **Create API Key**
   - Click "Create API Key"
   - Select "Create API key in new project" (or use existing)
   - Copy the API key (starts with "AIza...")

4. **Save Your API Key**
   - Keep it secure - don't share publicly
   - You'll need it in the next step

### Step 2: Add API Key to Backend

1. **Open backend .env file**
   ```bash
   cd karnataka-bar-association/backend
   nano .env
   ```

2. **Add this line** (replace with your actual key):
   ```
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. **Save and close** (Ctrl+X, then Y, then Enter)

### Step 3: Restart Backend Server

```bash
# Stop the current backend (Ctrl+C if running)
cd karnataka-bar-association/backend
npm start
```

### Step 4: Test the Chatbot

1. Open your browser to http://localhost:5173
2. Click the chat button in bottom right corner
3. Ask a question like:
   - "What is IPC 420?"
   - "Explain bail in India"
   - "What are fundamental rights?"

## 🎯 Google Gemini Free Tier Limits

- **60 requests per minute** (RPM)
- **1,500 requests per day** (RPD)
- **1 million tokens per minute**
- **100% FREE** - No credit card required!

This is MORE than enough for a small to medium website!

## 🔧 Configuration Options

### Current Setup (backend/controllers/chatbotController.js):

```javascript
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
```

### Available Models:

1. **gemini-pro** (Recommended)
   - Best for text
   - Fast responses
   - Free tier

2. **gemini-pro-vision**
   - For images + text
   - Slightly slower
   - Free tier

## 🚀 Testing

### Test API Connection:

```bash
curl http://localhost:4000/api/chatbot/health
```

Expected response:
```json
{
  "success": true,
  "configured": true,
  "provider": "Google Gemini",
  "model": "gemini-pro"
}
```

### Test Chat:

```bash
curl -X POST http://localhost:4000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is IPC 420?"}'
```

## 📊 Monitoring Usage

Check your API usage at:
https://makersuite.google.com/app/apikey

You can see:
- Requests per day
- Remaining quota
- Usage statistics

## 🔒 Security Best Practices

1. **Never commit API keys to Git**
   - Already in .gitignore
   - Use environment variables only

2. **Rate Limiting** (Optional)
   Add to backend/routes/chatbotRoutes.js:
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const chatLimiter = rateLimit({
     windowMs: 1 * 60 * 1000, // 1 minute
     max: 10 // 10 requests per minute per IP
   });
   
   router.post('/chat', chatLimiter, chatbotController.getChatResponse);
   ```

3. **Input Validation**
   - Already implemented in controller
   - Checks for empty messages
   - Handles errors gracefully

## 🐛 Troubleshooting

### Error: "AI service not configured"
**Solution**: Add GEMINI_API_KEY to backend/.env file

### Error: "API key not valid"
**Solution**: 
1. Check if key is correct (starts with "AIza")
2. Regenerate key at https://makersuite.google.com/app/apikey

### Error: "Quota exceeded"
**Solution**: 
1. Wait for quota to reset (resets every minute/day)
2. Upgrade to paid tier if needed (unlikely)

### Chatbot not responding
**Solution**:
1. Check backend is running: `npm start` in backend folder
2. Check browser console for errors (F12)
3. Test API health endpoint

## 💡 Tips for Best Results

1. **Ask Specific Questions**
   - Good: "What is IPC Section 420 and its punishment?"
   - Bad: "Tell me about law"

2. **Use Context**
   - The AI remembers previous messages in conversation
   - You can ask follow-up questions

3. **Legal Disclaimer**
   - AI provides general information
   - Always recommend consulting a lawyer for specific cases
   - Already built into system prompt

## 📈 Scaling Up

If you need more requests:

### Option 1: Upgrade Gemini (Still Free)
- Request quota increase at Google AI Studio
- Usually approved automatically

### Option 2: Add Caching
- Cache common responses
- Reduce API calls by 50-70%

### Option 3: Multiple API Keys
- Rotate between multiple free accounts
- Load balancing

## 🎉 You're All Set!

Your chatbot is now powered by Google's advanced AI and can answer questions about:
- Indian Penal Code (IPC) sections
- Legal procedures and terminology
- Constitutional rights
- How to use LegalIQ platform
- General legal advice

**Cost: $0.00** ✅

## 📞 Support

If you need help:
1. Check this guide first
2. Test the health endpoint
3. Check backend logs
4. Review Google Gemini documentation: https://ai.google.dev/docs

---

**Last Updated**: February 2026
**Version**: 1.0
**Status**: Production Ready ✅
