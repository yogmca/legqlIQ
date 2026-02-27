# Web Scraper Service for Legal Chatbot

## Overview

The Web Scraper Service is a standalone module that scrapes Indian law websites (primarily Indian Kanoon) to provide real-time legal information for chatbot queries. This service is completely independent from the existing chatbot controller, allowing you to easily switch between different chatbot backends (built-in knowledge base, web scraper, or AI API).

## Features

- **IPC Section Scraping**: Automatically scrapes information about Indian Penal Code sections
- **Act Information**: Retrieves details about various Indian legal acts
- **Case Law Search**: Finds relevant case law and judgments
- **Legal Procedures**: Scrapes information about legal procedures
- **General Legal Information**: Handles general legal queries
- **Intelligent Caching**: Caches scraped data for 24 hours to reduce load and improve response time
- **Fallback Handling**: Gracefully handles errors and provides fallback responses

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Web Scraper Service                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │  Scraper Routes  │─────▶│ Scraper Controller│            │
│  └──────────────────┘      └──────────────────┘            │
│                                      │                       │
│                                      ▼                       │
│                          ┌──────────────────────┐           │
│                          │ WebScraperService    │           │
│                          │  - searchLegalInfo() │           │
│                          │  - scrapeIPCSection()│           │
│                          │  - scrapeCaseLaw()   │           │
│                          │  - clearCache()      │           │
│                          └──────────────────────┘           │
│                                      │                       │
│                                      ▼                       │
│                          ┌──────────────────────┐           │
│                          │   NodeCache (24h)    │           │
│                          └──────────────────────┘           │
│                                      │                       │
│                                      ▼                       │
│                          ┌──────────────────────┐           │
│                          │   Indian Kanoon      │           │
│                          │   (indiankanoon.org) │           │
│                          └──────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Installation

The required dependencies are already installed:

```bash
npm install axios cheerio node-cache
```

## API Endpoints

### 1. Search Legal Information
**Endpoint**: `POST /api/scraper/search`

**Description**: Search for legal information using web scraper

**Request Body**:
```json
{
  "query": "IPC 420"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "queryType": "ipc",
    "section": "420",
    "results": [
      {
        "title": "Section 420 in The Indian Penal Code",
        "snippet": "Whoever cheats and thereby dishonestly induces...",
        "link": "https://indiankanoon.org/doc/1713493/"
      }
    ],
    "source": "Indian Kanoon",
    "timestamp": "2026-02-27T13:52:00.000Z"
  }
}
```

### 2. Get Chatbot Response
**Endpoint**: `POST /api/scraper/chat`

**Description**: Get formatted chatbot response using web scraper

**Request Body**:
```json
{
  "message": "What is IPC 420?"
}
```

**Response**:
```json
{
  "success": true,
  "response": "**IPC Section 420 - Legal Information**\n\nHere's what I found:\n\n1. **Section 420 in The Indian Penal Code**\n   Whoever cheats and thereby dishonestly induces...\n   [Read more](https://indiankanoon.org/doc/1713493/)\n\n---\n*Information sourced from Indian Kanoon. For personalized legal advice, consult a verified lawyer on LegalIQ.*",
  "rawData": { ... }
}
```

### 3. Clear Cache
**Endpoint**: `DELETE /api/scraper/cache`

**Description**: Clear scraper cache (all or specific query)

**Request Body** (optional):
```json
{
  "query": "IPC 420"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Cache cleared for: IPC 420"
}
```

### 4. Get Cache Statistics
**Endpoint**: `GET /api/scraper/cache/stats`

**Description**: Get cache statistics

**Response**:
```json
{
  "success": true,
  "stats": {
    "keys": 15,
    "stats": {
      "hits": 45,
      "misses": 15,
      "keys": 15,
      "ksize": 1024,
      "vsize": 51200
    }
  }
}
```

### 5. Health Check
**Endpoint**: `GET /api/scraper/health`

**Description**: Health check for scraper service

**Response**:
```json
{
  "success": true,
  "service": "Web Scraper Service",
  "status": "operational",
  "features": [
    "IPC Section Scraping",
    "Act Information Scraping",
    "Case Law Scraping",
    "Legal Procedure Scraping",
    "General Legal Information Scraping"
  ],
  "cache": { ... },
  "timestamp": "2026-02-27T13:52:00.000Z"
}
```

## Usage Examples

### Using with cURL

```bash
# Search for IPC section
curl -X POST http://localhost:4000/api/scraper/search \
  -H "Content-Type: application/json" \
  -d '{"query": "IPC 420"}'

# Get chatbot response
curl -X POST http://localhost:4000/api/scraper/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is bail procedure?"}'

# Clear cache
curl -X DELETE http://localhost:4000/api/scraper/cache \
  -H "Content-Type: application/json" \
  -d '{"query": "IPC 420"}'

# Get cache stats
curl http://localhost:4000/api/scraper/cache/stats

# Health check
curl http://localhost:4000/api/scraper/health
```

### Using with JavaScript/Fetch

```javascript
// Search for legal information
const searchLegalInfo = async (query) => {
  const response = await fetch('http://localhost:4000/api/scraper/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query })
  });
  return await response.json();
};

// Get chatbot response
const getChatResponse = async (message) => {
  const response = await fetch('http://localhost:4000/api/scraper/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message })
  });
  return await response.json();
};

// Usage
const result = await searchLegalInfo('IPC 420');
console.log(result);

const chatResponse = await getChatResponse('What is bail?');
console.log(chatResponse.response);
```

## Query Types

The scraper automatically detects the type of query and uses the appropriate scraping strategy:

1. **IPC Queries**: Matches patterns like "IPC 420", "Section 302"
2. **Act Queries**: Contains keywords like "act", "amendment"
3. **Case Law Queries**: Contains keywords like "case", "judgment", "verdict"
4. **Legal Procedure Queries**: Contains keywords like "procedure", "how to", "process"
5. **General Queries**: All other legal queries

## Switching Between Chatbot Backends

### Option 1: Use Built-in Knowledge Base (Current)
```javascript
// In your frontend
const response = await fetch('/api/chatbot/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userQuery })
});
```

### Option 2: Use Web Scraper Service
```javascript
// In your frontend
const response = await fetch('/api/scraper/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userQuery })
});
```

### Option 3: Use AI API (Future)
```javascript
// In your frontend
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userQuery })
});
```

## Caching Strategy

- **Cache Duration**: 24 hours (86400 seconds)
- **Cache Key Format**: `search_{query_lowercase_trimmed}`
- **Cache Check Period**: 1 hour (3600 seconds)
- **Benefits**:
  - Reduces load on Indian Kanoon servers
  - Faster response times for repeated queries
  - Lower bandwidth usage

## Error Handling

The scraper service includes comprehensive error handling:

1. **Network Errors**: Returns fallback message if scraping fails
2. **Timeout**: 10-second timeout for each request
3. **Invalid Responses**: Gracefully handles malformed HTML
4. **Empty Results**: Provides helpful message when no data is found

## Performance Considerations

- **Timeout**: 10 seconds per request
- **User Agent**: Mimics a real browser to avoid blocking
- **Rate Limiting**: Consider implementing rate limiting for production
- **Concurrent Requests**: Service can handle multiple concurrent requests

## Legal and Ethical Considerations

1. **Respect robots.txt**: Always check the website's robots.txt file
2. **Rate Limiting**: Don't overload the source website
3. **Attribution**: Always attribute the source (Indian Kanoon)
4. **Terms of Service**: Ensure compliance with Indian Kanoon's terms
5. **Data Accuracy**: Scraped data should be verified by legal professionals

## Troubleshooting

### Issue: Scraper returns no results
**Solution**: 
- Check if Indian Kanoon is accessible
- Verify the website structure hasn't changed
- Check network connectivity
- Review console logs for errors

### Issue: Cache not working
**Solution**:
- Check cache statistics: `GET /api/scraper/cache/stats`
- Clear cache and try again: `DELETE /api/scraper/cache`
- Verify NodeCache is properly installed

### Issue: Timeout errors
**Solution**:
- Increase timeout in `webScraperService.js`
- Check network speed
- Verify Indian Kanoon is responding

## Future Enhancements

1. **Multiple Sources**: Add more legal websites as sources
2. **AI Integration**: Combine scraping with AI for better responses
3. **Advanced Caching**: Implement Redis for distributed caching
4. **Rate Limiting**: Add rate limiting middleware
5. **Analytics**: Track popular queries and cache hit rates
6. **PDF Parsing**: Extract information from legal PDFs
7. **Image OCR**: Extract text from legal document images

## Testing

Test the scraper service:

```bash
# Test health endpoint
curl http://localhost:4000/api/scraper/health

# Test IPC query
curl -X POST http://localhost:4000/api/scraper/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is IPC 420?"}'

# Test case law query
curl -X POST http://localhost:4000/api/scraper/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Kesavananda Bharati case"}'

# Test procedure query
curl -X POST http://localhost:4000/api/scraper/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How to file FIR?"}'
```

## Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify all dependencies are installed
3. Ensure the backend server is running on port 4000
4. Check that Indian Kanoon is accessible from your network

## License

This service is part of the LegalIQ platform and follows the same license terms.
