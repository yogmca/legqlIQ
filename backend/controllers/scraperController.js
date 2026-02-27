// Web Scraper Controller
// Handles API requests for web scraping legal information

const webScraperService = require('../services/webScraperService');

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

    const scrapedData = await webScraperService.searchLegalInfo(message);

    // Format the scraped data into a chatbot-friendly response
    const response = formatChatResponse(scrapedData, message);

    res.json({
      success: true,
      response: response,
      rawData: scrapedData
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
      service: 'Web Scraper Service',
      status: 'operational',
      features: [
        'IPC Section Scraping',
        'Act Information Scraping',
        'Case Law Scraping',
        'Legal Procedure Scraping',
        'General Legal Information Scraping'
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
