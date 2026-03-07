// Smart Legal Chatbot with Built-in Knowledge Base + Google Web Scraping
// This provides instant responses with real-time web search

const axios = require('axios');
const cheerio = require('cheerio');

// Comprehensive legal knowledge base
const legalKnowledge = {
  ipc: {
    '420': {
      title: 'IPC Section 420 - Cheating',
      description: 'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security.',
      punishment: 'Imprisonment up to 7 years and fine',
      bailable: 'Non-bailable',
      cognizable: 'Cognizable',
      triable: 'Magistrate of First Class'
    },
    '302': {
      title: 'IPC Section 302 - Murder',
      description: 'Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.',
      punishment: 'Death penalty or life imprisonment and fine',
      bailable: 'Non-bailable',
      cognizable: 'Cognizable',
      triable: 'Court of Session'
    },
    '376': {
      title: 'IPC Section 376 - Rape',
      description: 'Whoever commits rape shall be punished with rigorous imprisonment for a term which shall not be less than 10 years but which may extend to imprisonment for life, and shall also be liable to fine.',
      punishment: 'Minimum 10 years to life imprisonment and fine',
      bailable: 'Non-bailable',
      cognizable: 'Cognizable',
      triable: 'Court of Session'
    },
    '498a': {
      title: 'IPC Section 498A - Cruelty by Husband or Relatives',
      description: 'Whoever, being the husband or the relative of the husband of a woman, subjects such woman to cruelty shall be punished with imprisonment for a term which may extend to three years and shall also be liable to fine.',
      punishment: 'Up to 3 years imprisonment and fine',
      bailable: 'Non-bailable',
      cognizable: 'Cognizable',
      triable: 'Magistrate of First Class'
    }
  },
  procedures: {
    bail: 'Bail is the temporary release of an accused person awaiting trial, sometimes on condition that a sum of money is lodged to guarantee their appearance in court. In India, bail can be: 1) Regular Bail - granted by court after arrest, 2) Anticipatory Bail - granted before arrest under Section 438 CrPC, 3) Interim Bail - temporary bail for a short period. The decision depends on the nature of offense, evidence, and flight risk.',
    fir: 'FIR (First Information Report) is the first step in criminal proceedings. To file an FIR: 1) Visit the nearest police station, 2) Provide details of the cognizable offense orally or in writing, 3) Police are legally bound to register your FIR under Section 154 CrPC, 4) You will receive a free copy of the FIR, 5) If police refuse, approach the Superintendent of Police or file a private complaint in court.',
    pil: 'PIL (Public Interest Litigation) is a legal action initiated for the protection of public interest. Any citizen can file a PIL in the Supreme Court under Article 32 or High Court under Article 226 of the Constitution. It can be filed for: violation of fundamental rights, environmental issues, corruption in public offices, or any matter of public importance.',
    divorce: 'In India, divorce can be obtained under various personal laws. Under Hindu Marriage Act, grounds include: adultery, cruelty, desertion for 2 years, conversion to another religion, mental disorder, communicable disease, or mutual consent. The process involves filing a petition, serving notice to spouse, court hearings, and final decree. Mutual consent divorce is faster (6-18 months) than contested divorce (2-5 years).'
  },
  rights: {
    fundamental: 'The Indian Constitution guarantees six fundamental rights: 1) Right to Equality (Articles 14-18), 2) Right to Freedom (Articles 19-22), 3) Right against Exploitation (Articles 23-24), 4) Right to Freedom of Religion (Articles 25-28), 5) Cultural and Educational Rights (Articles 29-30), 6) Right to Constitutional Remedies (Article 32). These rights are enforceable by courts and form the foundation of Indian democracy.',
    consumer: 'Consumer rights in India include: 1) Right to Safety, 2) Right to Information, 3) Right to Choose, 4) Right to be Heard, 5) Right to Seek Redressal, 6) Right to Consumer Education. Consumers can file complaints in Consumer Forums for defective goods, deficient services, unfair trade practices, or overcharging.',
    women: 'Special rights for women in India include: Protection against domestic violence (DV Act 2005), Protection against dowry harassment (IPC 498A), Equal property rights, Maternity benefits, Sexual harassment protection at workplace (POSH Act 2013), Right to maintenance, and Special provisions in criminal law.'
  }
};

exports.getChatResponse = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    console.log('📩 Processing query:', message);

    // Try to get response from built-in knowledge base first
    const builtInResponse = getIntelligentResponse(message);
    
    // Check if it's a known query (not the default fallback response)
    const isKnownQuery = !builtInResponse.includes('I can help you with information about Indian law');
    
    if (isKnownQuery) {
      // Return built-in response for known queries
      console.log('✅ Answered from knowledge base');
      return res.json({
        success: true,
        response: builtInResponse
      });
    }

    // For unknown queries, search Google
    console.log('🔍 Searching Google for unanswered query...');
    try {
      const webResponse = await scrapeGoogleSearch(message);
      if (webResponse) {
        // Add LegalIQ consultation message to web results
        const responseWithConsultation = webResponse + '\n\n💡 **Need Expert Advice?**\nFor personalized guidance on "' + message + '", consult our verified professionals on LegalIQ (https://legaliq.in):\n• Lawyers for legal matters\n• Tax Consultants for tax-related queries\n• Auditors for financial audits';
        
        console.log('✅ Answered from Google search');
        return res.json({
          success: true,
          response: responseWithConsultation
        });
      }
    } catch (webError) {
      console.error('❌ Google search failed:', webError.message);
    }

    // Final fallback: default response with LegalIQ consultation
    console.log('⚠️ Using default fallback response');
    res.json({
      success: true,
      response: builtInResponse
    });

  } catch (error) {
    console.error('❌ Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get response. Please try again.'
    });
  }
};

/**
 * Scrape Google search results with improved extraction
 */
async function scrapeGoogleSearch(query) {
  try {
    console.log('🔍 Scraping Google for:', query);
    
    // Add "India" context to query if not present
    const enhancedQuery = query.toLowerCase().includes('india') ? query : `${query} India`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(enhancedQuery)}&hl=en&gl=in&num=10`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
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

    console.log('📄 Parsing Google HTML response...');

    // Method 1: Try to extract featured snippet/answer box
    const featuredSelectors = [
      '.IZ6rdc',                    // Featured snippet content
      '.hgKElc',                    // Alternative featured snippet
      '.kno-rdesc span',            // Knowledge panel description
      '.LGOjhe',                    // Another featured format
      '.iKJnec',                    // Mobile featured snippet
      '.Z0LcW',                     // Answer box
      'div[data-attrid="wa:/description"] span',  // Knowledge graph
      '.kno-ftr span',              // Knowledge graph footer
      '.wDYxhc span',               // Featured snippet span
      '.hgKElc span'                // Featured snippet alternative
    ];

    for (const selector of featuredSelectors) {
      const featuredText = $(selector).first().text().trim();
      if (featuredText && featuredText.length > 50) {
        results.push({
          title: 'Featured Answer',
          snippet: featuredText
        });
        console.log('✅ Found featured snippet:', featuredText.substring(0, 100));
        break;
      }
    }

    // Method 2: Extract regular organic search results
    const resultContainers = $('.g, .tF2Cxc, .Gx5Zad, div[data-sokoban-container], .hlcw0c');
    
    console.log(`Found ${resultContainers.length} potential result containers`);
    
    resultContainers.each((index, element) => {
      if (results.length >= 3) return false;
      
      const $elem = $(element);
      
      // Extract title - try multiple selectors
      let title = $elem.find('h3').first().text().trim();
      if (!title) title = $elem.find('.LC20lb, .DKV0Md, .vvjwJb').first().text().trim();
      
      // Extract snippet - try multiple selectors
      let snippet = '';
      const snippetSelectors = [
        '.VwiC3b',                    // Standard snippet
        '.lEBKkf',                    // Mobile snippet
        '.yXK7lf',                    // Alternative snippet
        '.s',                         // Old format
        '.st',                        // Older format
        '.aCOpRe',                    // Another format
        'div[data-content-feature="1"]',  // Featured content
        'span[data-dobid]',           // Data-driven snippet
        '.IsZvec',                    // New format
        'div[style*="-webkit-line-clamp"]',  // Line-clamped content
        '.lyLwlc'                     // Another snippet format
      ];
      
      for (const snippetSelector of snippetSelectors) {
        snippet = $elem.find(snippetSelector).first().text().trim();
        if (snippet && snippet.length > 30) {
          console.log(`Found snippet with selector ${snippetSelector}:`, snippet.substring(0, 100));
          break;
        }
      }
      
      if (title && snippet && snippet.length > 30) {
        results.push({ title, snippet });
        console.log(`✅ Extracted result ${results.length}: ${title}`);
      }
    });

    // Method 3: If still no results, try to extract ANY text content from result divs
    if (results.length === 0) {
      console.log('⚠️ Trying alternative extraction method...');
      
      $('div').each((index, element) => {
        if (results.length >= 3) return false;
        
        const $elem = $(element);
        const text = $elem.text().trim();
        
        // Look for divs with substantial text that might be results
        if (text.length > 100 && text.length < 500) {
          const words = text.split(' ');
          if (words.length > 10 && words.length < 100) {
            // Check if it contains query-related keywords
            const lowerText = text.toLowerCase();
            const lowerQuery = query.toLowerCase();
            const queryWords = lowerQuery.split(' ');
            const matchCount = queryWords.filter(word => lowerText.includes(word)).length;
            
            if (matchCount >= 2) {
              results.push({
                title: 'Search Result',
                snippet: text.substring(0, 300) + (text.length > 300 ? '...' : '')
              });
              console.log('✅ Found alternative result');
            }
          }
        }
      });
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

    console.log('⚠️ No Google results extracted, trying Wikipedia as fallback...');
    
    // Fallback to Wikipedia API with India-specific filtering
    return await searchWikipediaWithIndiaFilter(query);
    
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

function getIntelligentResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // IPC Section queries
  const ipcMatch = lowerMessage.match(/ipc\s*(\d+a?)/i) || lowerMessage.match(/section\s*(\d+a?)/i);
  if (ipcMatch) {
    const section = ipcMatch[1];
    const ipcInfo = legalKnowledge.ipc[section];
    if (ipcInfo) {
      return `**${ipcInfo.title}**\n\n${ipcInfo.description}\n\n**Punishment:** ${ipcInfo.punishment}\n**Bailable:** ${ipcInfo.bailable}\n**Cognizable:** ${ipcInfo.cognizable}\n**Triable by:** ${ipcInfo.triable}\n\nFor specific legal advice on your case, please consult a verified lawyer on LegalIQ.`;
    }
  }
  
  // Bail queries
  if (lowerMessage.includes('bail')) {
    return `**About Bail in India**\n\n${legalKnowledge.procedures.bail}\n\nNeed help with bail application? Our experienced criminal lawyers on LegalIQ can assist you 24/7.`;
  }
  
  // FIR queries
  if (lowerMessage.includes('fir') || (lowerMessage.includes('file') && lowerMessage.includes('complaint'))) {
    return `**How to File an FIR**\n\n${legalKnowledge.procedures.fir}\n\nFacing difficulties filing an FIR? Consult our criminal law experts on LegalIQ for immediate guidance.`;
  }
  
  // PIL queries
  if (lowerMessage.includes('pil') || lowerMessage.includes('public interest')) {
    return `**Public Interest Litigation (PIL)**\n\n${legalKnowledge.procedures.pil}\n\nWant to file a PIL? Connect with our constitutional law experts on LegalIQ for professional guidance.`;
  }
  
  // Divorce queries
  if (lowerMessage.includes('divorce') || lowerMessage.includes('separation')) {
    return `**Divorce in India**\n\n${legalKnowledge.procedures.divorce}\n\nGoing through a divorce? Our family law specialists on LegalIQ can provide compassionate legal support.`;
  }
  
  // Fundamental rights
  if (lowerMessage.includes('fundamental right') || lowerMessage.includes('constitutional right')) {
    return `**Fundamental Rights in India**\n\n${legalKnowledge.rights.fundamental}\n\nBelieve your fundamental rights are violated? Consult our constitutional law experts on LegalIQ.`;
  }
  
  // Consumer rights
  if (lowerMessage.includes('consumer right') || lowerMessage.includes('consumer complaint')) {
    return `**Consumer Rights in India**\n\n${legalKnowledge.rights.consumer}\n\nFacing consumer issues? Our consumer law experts on LegalIQ can help you file complaints and seek compensation.`;
  }
  
  // Women's rights
  if (lowerMessage.includes('women') && lowerMessage.includes('right')) {
    return `**Women's Rights in India**\n\n${legalKnowledge.rights.women}\n\nNeed legal assistance? Our women's rights advocates on LegalIQ are here to help you.`;
  }
  
  // LegalIQ platform queries
  if (lowerMessage.includes('legaliq') || lowerMessage.includes('what is legaliq')) {
    return `**What is LegalIQ?**\n\nLegalIQ is India's leading professional services platform connecting you with verified experts:\n\n🏛️ **Lawyers** - Legal professionals for all your legal matters\n💰 **Tax Consultants** - Tax and GST experts for financial compliance\n📊 **Auditors** - Audit professionals for financial verification\n\n**Key Features:**\n• 10,000+ verified professionals across India\n• Search by specialization and location\n• Book video consultations 24/7\n• Secure payment and data protection\n• Expert advice from experienced professionals\n\nWhether you need legal advice, tax planning, or audit services, LegalIQ connects you with the right professional!`;
  }
  
  // How to use LegalIQ
  if (lowerMessage.includes('how to use') || lowerMessage.includes('how do i use') || lowerMessage.includes('use legaliq')) {
    return `**How to Use LegalIQ**\n\n**Step 1: Find Professionals**\n• Click "Find Lawyers", "Tax Consultants", or "Auditors"\n• Filter by specialization and location\n• View detailed profiles with ratings and experience\n\n**Step 2: Book Consultation**\n• Choose between in-person visit or video consultation\n• Select convenient date and time\n• Make secure payment\n\n**Step 3: Get Expert Advice**\n• Receive booking confirmation via email\n• Join video call at scheduled time\n• Get professional guidance for your needs\n\n**Need Help?** Our support team is available 24/7 at support@legaliq.in`;
  }
  
  // Greeting
  if (lowerMessage.match(/^(hi|hello|hey|namaste)/)) {
    return `Hello! I'm your LegalIQ AI Assistant. I can help you with:\n\n• Indian Penal Code (IPC) sections\n• Legal procedures (FIR, bail, PIL, divorce)\n• Fundamental and legal rights\n• Tax and financial queries\n• How to use LegalIQ platform\n• Finding lawyers, tax consultants, and auditors\n\nWhat would you like to know?`;
  }
  
  // Default response with suggestions (this will trigger web search)
  return `I can help you with information about Indian law and the LegalIQ platform:\n\n**Legal Information:**\n• IPC Sections (e.g., "What is IPC 420?")\n• Legal Procedures (FIR, bail, PIL, divorce)\n• Rights (fundamental, consumer, women's rights)\n\n**LegalIQ Platform:**\n• What is LegalIQ?\n• How to use LegalIQ?\n• Finding professionals\n\n**Get Professional Help:**\nFor personalized advice, consult our verified professionals:\n• Lawyers for legal matters\n• Tax Consultants for tax planning\n• Auditors for financial audits\n\nWhat would you like to know?`;
}

// Health check endpoint
exports.healthCheck = async (req, res) => {
  try {
    res.json({
      success: true,
      configured: true,
      provider: 'Built-in Legal Knowledge Base + Google Web Scraping',
      model: 'LegalIQ Smart Assistant with Google Search',
      features: ['Knowledge Base', 'Google Web Scraping', 'Wikipedia API Fallback']
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
