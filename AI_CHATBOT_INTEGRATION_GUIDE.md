# AI Legal Chatbot - Public Data Integration Guide

## Overview
This guide explains how to integrate the LegalIQ chatbot with public data sources for Indian law, IPC codes, and legal information.

## Current Implementation
The chatbot currently uses a **built-in knowledge base** with common IPC sections and legal concepts. This provides:
- ✅ Fast responses (no API calls)
- ✅ Works offline
- ✅ No external dependencies
- ❌ Limited to pre-programmed knowledge

## Recommended Public Data Sources

### 1. **India Code API** (Government of India)
- **URL**: https://www.indiacode.nic.in/
- **Description**: Official repository of Central and State Acts
- **Access**: Free, public access
- **Coverage**: All Indian laws, acts, and amendments

### 2. **Indian Kanoon API**
- **URL**: https://indiankanoon.org/
- **Description**: Free law search engine with case laws and statutes
- **API**: Available for developers
- **Coverage**: Supreme Court, High Courts, IPC sections

### 3. **OpenAI GPT API** (Recommended for AI responses)
- **URL**: https://platform.openai.com/
- **Description**: Advanced AI that can answer legal queries
- **Cost**: Pay-per-use (affordable for small scale)
- **Benefits**: 
  - Natural language understanding
  - Can explain complex legal concepts
  - Contextual responses
  - Up-to-date information

### 4. **Google Gemini API** (Alternative)
- **URL**: https://ai.google.dev/
- **Description**: Google's AI model
- **Cost**: Free tier available
- **Benefits**: Similar to OpenAI but with free tier

## Implementation Options

### Option 1: OpenAI Integration (Recommended)

#### Step 1: Install OpenAI SDK
```bash
npm install openai
```

#### Step 2: Create Backend API Endpoint
Create `backend/controllers/chatbotController.js`:

```javascript
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.getChatResponse = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    const systemPrompt = `You are a legal assistant for LegalIQ, specializing in Indian law. 
    You have expertise in:
    - Indian Penal Code (IPC) sections
    - Indian legal system and procedures
    - Constitutional law
    - How to use the LegalIQ platform
    
    Provide accurate, helpful responses. If you're unsure, recommend consulting a lawyer on LegalIQ.
    Keep responses concise and easy to understand.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7
    });

    res.json({
      success: true,
      response: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get response'
    });
  }
};
```

#### Step 3: Add Route
In `backend/routes/chatbotRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

router.post('/chat', chatbotController.getChatResponse);

module.exports = router;
```

#### Step 4: Update server.js
```javascript
const chatbotRoutes = require('./routes/chatbotRoutes');
app.use('/api/chatbot', chatbotRoutes);
```

#### Step 5: Update Frontend Chatbot Component
Modify `getResponse` function to call API:

```javascript
const getResponse = async (userMessage) => {
  try {
    const response = await fetch(`${API_URL}/chatbot/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: userMessage,
        conversationHistory: messages.map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      })
    });

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error getting response:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
};
```

### Option 2: Indian Kanoon Integration

#### Create a scraper/API wrapper:
```javascript
const axios = require('axios');
const cheerio = require('cheerio');

exports.searchIPCSection = async (sectionNumber) => {
  try {
    const url = `https://indiankanoon.org/search/?formInput=ipc%20${sectionNumber}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Parse the results
    const results = [];
    $('.result').each((i, elem) => {
      results.push({
        title: $(elem).find('.result_title').text(),
        snippet: $(elem).find('.snippet').text()
      });
    });
    
    return results[0]; // Return first result
  } catch (error) {
    console.error('Error fetching IPC data:', error);
    return null;
  }
};
```

### Option 3: Hybrid Approach (Best)

Combine built-in knowledge base with AI:
1. Use built-in KB for common queries (fast)
2. Fall back to AI API for complex questions
3. Cache AI responses for frequently asked questions

```javascript
const getResponse = async (userMessage) => {
  // First, try built-in knowledge base
  const quickResponse = checkKnowledgeBase(userMessage);
  if (quickResponse) {
    return quickResponse;
  }
  
  // If no match, use AI API
  return await getAIResponse(userMessage);
};
```

## Cost Considerations

### OpenAI GPT-3.5-turbo Pricing:
- **Input**: $0.0015 per 1K tokens
- **Output**: $0.002 per 1K tokens
- **Average query**: ~$0.001 per conversation
- **1000 conversations**: ~$1

### Free Alternatives:
1. **Google Gemini**: Free tier with 60 requests/minute
2. **Hugging Face**: Free inference API
3. **Local LLM**: Run Llama 2 locally (requires GPU)

## Environment Variables

Add to `.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

## Security Best Practices

1. **Rate Limiting**: Limit API calls per user
2. **Input Validation**: Sanitize user inputs
3. **API Key Protection**: Never expose keys in frontend
4. **Caching**: Cache common responses
5. **Monitoring**: Track API usage and costs

## Testing

Test the chatbot with:
- IPC section queries: "What is IPC 420?"
- Legal concepts: "Explain bail in India"
- Platform help: "How do I book a consultation?"
- Complex questions: "What are my rights if arrested?"

## Next Steps

1. Choose integration option (OpenAI recommended)
2. Set up API keys
3. Implement backend endpoint
4. Update frontend component
5. Test thoroughly
6. Deploy to production

## Support

For questions or issues:
- Email: support@legaliq.in
- Documentation: https://legaliq.in/docs
