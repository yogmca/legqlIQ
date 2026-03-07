// Web Scraper Controller with Google Search fallback
// Handles API requests for web scraping using old scraper + Google/Wikipedia fallback

const webScraperService = require('../services/webScraperService');
const axios = require('axios');
const cheerio = require('cheerio');

// Import chatbot controller for routing LegalIQ queries
const chatbotController = require('./chatbotController');

/**
 * Search for legal information using web scraper
 * POST /api/scraper/search
 */
exports.searchLegalInfo = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    console.log('Scraping legal information for query:', query);

    const result = await webScraperService.searchLegalInfo(query);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message || 'Failed to scrape legal information',
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Scraper controller error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while scraping legal information',
      error: error.message
    });
  }
};

/**
 * Get formatted response for chatbot
 * POST /api/scraper/chat
 */
exports.getChatResponse = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    console.log('Processing chatbot query with scraper:', message);

    // Check if query is about LegalIQ platform - route to chatbot controller
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('legaliq') ||
        lowerMessage.includes('how to use') ||
        lowerMessage.match(/^(hi|hello|hey|namaste)/) ||
        (lowerMessage.includes('platform') && (lowerMessage.includes('use') || lowerMessage.includes('how')))) {
      console.log('Routing to chatbot controller for platform query');
      return chatbotController.getChatResponse(req, res);
    }

    // First try the old web scraper service (for IPC, legal sites, etc.)
    const scrapedData = await webScraperService.searchLegalInfo(message);

    // If old scraper succeeded, format and return the response
    if (scrapedData && scrapedData.success) {
      const response = formatChatResponse(scrapedData, message);
      console.log('✅ Answered from legal sites scraper');
      return res.json({
        success: true,
        response: response,
        rawData: scrapedData
      });
    }

    // If old scraper failed, try Google/Wikipedia as fallback
    console.log('⚠️ Legal sites scraper failed, trying Google/Wikipedia...');
    const webResponse = await scrapeGoogleForQuery(message);
    
    if (webResponse) {
      // Add LegalIQ consultation message
      const responseWithConsultation = webResponse + '\n\n💡 **Need Expert Advice?**\nFor personalized guidance on "' + message + '", consult our verified professionals on LegalIQ (https://legaliq.in):\n• Lawyers for legal matters\n• Tax Consultants for tax-related queries\n• Auditors for financial audits';
      
      console.log('✅ Answered from Google/Wikipedia search');
      return res.json({
        success: true,
        response: responseWithConsultation
      });
    }

    // Final fallback response
    console.log('⚠️ All scraping methods failed, using fallback');
    res.json({
      success: true,
      response: `I couldn't find specific information about "${message}" at the moment.\n\n💡 **Get Expert Help:**\nFor accurate information about "${message}", consult our verified professionals on LegalIQ (https://legaliq.in):\n• Lawyers for legal matters\n• Tax Consultants for tax-related queries\n• Auditors for financial audits`
    });

  } catch (error) {
    console.error('Chat scraper error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get response. Please try again.',
      error: error.message
    });
  }
};

/**
 * Scrape Google search results (fallback when legal sites fail)
 */
async function scrapeGoogleForQuery(query) {
  try {
    console.log('🔍 Scraping Google for:', query);
    
    // Add "India" context to query if not present
    const enhancedQuery = query.toLowerCase().includes('india') ? query : `${query} India`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(enhancedQuery)}&hl=en&gl=in&num=10`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'Referer': 'https://www.google.com/'
      },
      timeout: 15000,
      maxRedirects: 5
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // Extract featured snippet/answer box first
    const featuredSelectors = [
      '.IZ6rdc', '.hgKElc', '.kno-rdesc span', '.LGOjhe', '.iKJnec', '.Z0LcW',
      'div[data-attrid="wa:/description"] span', '.kno-ftr span', '.wDYxhc span', '.hgKElc span'
    ];

    for (const selector of featuredSelectors) {
      const featuredText = $(selector).first().text().trim();
      if (featuredText && featuredText.length > 50) {
        results.push({
          title: 'Featured Answer',
          snippet: featuredText
        });
        console.log('✅ Found featured snippet');
        break;
      }
    }

    // Extract regular organic search results
    const resultContainers = $('.g, .tF2Cxc, .Gx5Zad, div[data-sokoban-container], .hlcw0c');
    
    resultContainers.each((index, element) => {
      if (results.length >= 3) return false;
      
      const $elem = $(element);
      
      // Extract title
      let title = $elem.find('h3').first().text().trim();
      if (!title) title = $elem.find('.LC20lb, .DKV0Md, .vvjwJb').first().text().trim();
      
      // Extract snippet
      let snippet = '';
      const snippetSelectors = [
        '.VwiC3b', '.lEBKkf', '.yXK7lf', '.s', '.st', '.aCOpRe',
        'div[data-content-feature="1"]', 'span[data-dobid]', '.IsZvec',
        'div[style*="-webkit-line-clamp"]', '.lyLwlc'
      ];
      
      for (const snippetSelector of snippetSelectors) {
        snippet = $elem.find(snippetSelector).first().text().trim();
        if (snippet && snippet.length > 30) break;
      }
      
      if (title && snippet && snippet.length > 30) {
        results.push({ title, snippet });
      }
    });

    // If no results from Google, try Wikipedia as fallback
    if (results.length === 0) {
      console.log('⚠️ No Google results, trying Wikipedia...');
      return await searchWikipediaWithIndiaFilter(query);
    }

    if (results.length > 0) {
      console.log(`✅ Successfully extracted ${results.length} Google results`);
      
      let formattedResponse = `**Google Search Results for: "${query}"**\n\n`;
      
      results.forEach((result, index) => {
        formattedResponse += `**${index + 1}. ${result.title}**\n`;
        formattedResponse += `${result.snippet}\n\n`;
      });
      
      return formattedResponse;
    }

    return null;
    
  } catch (error) {
    console.error('❌ Google scraping error:', error.message);
    // Try Wikipedia as fallback
    return await searchWikipediaWithIndiaFilter(query);
  }
}

/**
 * Search Wikipedia API with India-specific filtering
 */
async function searchWikipediaWithIndiaFilter(query) {
  try {
    console.log('🔍 Searching Wikipedia with India filter for:', query);
    
    // Add "India" to query for better context
    const enhancedQuery = query.toLowerCase().includes('india') ? query : `${query} India`;
    
    // Search Wikipedia
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(enhancedQuery)}&format=json&srlimit=5`;
    
    const searchResponse = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'LegalIQ-Bot/1.0 (https://legaliq.in; support@legaliq.in)'
      },
      timeout: 10000
    });

    if (searchResponse.data.query && searchResponse.data.query.search.length > 0) {
      const results = [];
      
      // Filter results to prioritize India-related content
      const searchResults = searchResponse.data.query.search;
      const indiaRelatedResults = searchResults.filter(result => 
        result.title.toLowerCase().includes('india') || 
        result.snippet.toLowerCase().includes('india')
      );
      
      // Use India-related results first, then others
      const prioritizedResults = indiaRelatedResults.length > 0 ? indiaRelatedResults : searchResults;
      
      // Get top 3 results
      for (let i = 0; i < Math.min(3, prioritizedResults.length); i++) {
        const searchResult = prioritizedResults[i];
        const pageTitle = searchResult.title;
        
        // Get full page extract
        const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(pageTitle)}&format=json`;
        
        try {
          const contentResponse = await axios.get(contentUrl, {
            headers: {
              'User-Agent': 'LegalIQ-Bot/1.0 (https://legaliq.in; support@legaliq.in)'
            },
            timeout: 10000
          });

          const pages = contentResponse.data.query.pages;
          const pageId = Object.keys(pages)[0];
          
          if (pageId !== '-1') {
            const extract = pages[pageId].extract;
            
            if (extract) {
              // Limit to first 400 characters for readability
              const summary = extract.length > 400 ? extract.substring(0, 400) + '...' : extract;
              
              results.push({
                title: pageTitle,
                snippet: summary,
                link: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`
              });
            }
          }
        } catch (contentError) {
          console.log(`Failed to get content for ${pageTitle}`);
        }
      }

      if (results.length > 0) {
        console.log(`✅ Found ${results.length} Wikipedia results (India-filtered)`);
        
        let formattedResponse = `**Information about: "${query}"**\n\n`;
        
        results.forEach((result, index) => {
          formattedResponse += `**${index + 1}. ${result.title}**\n`;
          formattedResponse += `${result.snippet}\n`;
          formattedResponse += `🔗 ${result.link}\n\n`;
        });
        
        return formattedResponse;
      }
    }

    console.log('⚠️ No Wikipedia results found');
    return null;
    
  } catch (error) {
    console.error('❌ Wikipedia API error:', error.message);
    return null;
  }
}

/**
 * Clear scraper cache
 * DELETE /api/scraper/cache
 */
exports.clearCache = async (req, res) => {
  try {
    const { query } = req.body;

    webScraperService.clearCache(query);

    res.json({
      success: true,
      message: query ? `Cache cleared for: ${query}` : 'All cache cleared'
    });

  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message
    });
  }
};

/**
 * Get cache statistics
 * GET /api/scraper/cache/stats
 */
exports.getCacheStats = async (req, res) => {
  try {
    const stats = webScraperService.getCacheStats();

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cache stats',
      error: error.message
    });
  }
};

/**
 * Health check for scraper service
 * GET /api/scraper/health
 */
exports.healthCheck = async (req, res) => {
  try {
    res.json({
      success: true,
      service: 'Web Scraper Service with Google/Wikipedia Fallback',
      status: 'operational',
      features: [
        'IPC Section Scraping (devgan.in, legalserviceindia.com)',
        'Act Information Scraping',
        'Case Law Scraping',
        'Legal Procedure Scraping',
        'Google Search Fallback',
        'Wikipedia API Fallback'
      ],
      cache: webScraperService.getCacheStats(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Format scraped data into chatbot response
 * @param {Object} scrapedData - Data from web scraper
 * @param {string} query - Original user query
 * @returns {string} - Formatted response
 */
function formatChatResponse(scrapedData, query) {
  if (!scrapedData.success) {
    return `I apologize, but I couldn't fetch live information for your query: "${query}". ${scrapedData.message || 'Please try again or consult a verified lawyer on LegalIQ for accurate legal advice.'}`;
  }

  let response = '';

  switch (scrapedData.queryType) {
    case 'ipc':
      response = formatIPCResponse(scrapedData);
      break;
    case 'act':
      response = formatActResponse(scrapedData);
      break;
    case 'case_law':
      response = formatCaseLawResponse(scrapedData);
      break;
    case 'legal_procedure':
      response = formatProcedureResponse(scrapedData);
      break;
    default:
      response = formatGeneralResponse(scrapedData);
  }

  response += '\n\n---\n*For personalized legal advice, consult a verified lawyer on LegalIQ.*';

  return response;
}

function formatIPCResponse(data) {
  let response = `**IPC Section ${data.section} - Legal Information**\n\n`;

  if (data.results && data.results.length > 0) {
    response += 'Here\'s what I found:\n\n';
    data.results.forEach((result, index) => {
      response += `${index + 1}. **${result.title}**\n`;
      response += `   ${result.snippet}\n`;
      if (result.link) {
        response += `   [Read more](${result.link})\n`;
      }
      response += '\n';
    });
  } else {
    response += 'No specific information found for this IPC section.\n';
  }

  return response;
}

function formatActResponse(data) {
  let response = `**Legal Act Information**\n\n`;
  response += `Query: "${data.query}"\n\n`;

  if (data.results && data.results.length > 0) {
    response += 'Relevant information:\n\n';
    data.results.forEach((result, index) => {
      response += `${index + 1}. **${result.title}**\n`;
      response += `   ${result.snippet}\n`;
      if (result.link) {
        response += `   [Read more](${result.link})\n`;
      }
      response += '\n';
    });
  } else {
    response += 'No information found for this Act.\n';
  }

  return response;
}

function formatCaseLawResponse(data) {
  let response = `**Case Law Information**\n\n`;
  response += `Query: "${data.query}"\n\n`;

  if (data.cases && data.cases.length > 0) {
    response += 'Relevant cases:\n\n';
    data.cases.forEach((caseInfo, index) => {
      response += `${index + 1}. **${caseInfo.title}**\n`;
      if (caseInfo.court) {
        response += `   Court: ${caseInfo.court}\n`;
      }
      response += `   ${caseInfo.snippet}\n`;
      if (caseInfo.link) {
        response += `   [Read full judgment](${caseInfo.link})\n`;
      }
      response += '\n';
    });
  } else {
    response += 'No case law found for this query.\n';
  }

  return response;
}

function formatProcedureResponse(data) {
  let response = `**Legal Procedure Information**\n\n`;
  response += `Query: "${data.query}"\n\n`;

  if (data.procedures && data.procedures.length > 0) {
    response += 'Here\'s what I found:\n\n';
    data.procedures.forEach((proc, index) => {
      response += `${index + 1}. **${proc.title}**\n`;
      response += `   ${proc.description}\n`;
      if (proc.link) {
        response += `   [Read more](${proc.link})\n`;
      }
      response += '\n';
    });
  } else {
    response += 'No procedure information found.\n';
  }

  return response;
}

function formatGeneralResponse(data) {
  let response = `**Legal Information**\n\n`;
  response += `Query: "${data.query}"\n\n`;

  if (data.results && data.results.length > 0) {
    response += 'Here\'s what I found:\n\n';
    data.results.forEach((result, index) => {
      response += `${index + 1}. **${result.title}**\n`;
      response += `   ${result.snippet}\n`;
      if (result.link) {
        response += `   [Read more](${result.link})\n`;
      }
      response += '\n';
    });
  } else {
    response += 'No information found for this query.\n';
  }

  return response;
}

module.exports = exports;
