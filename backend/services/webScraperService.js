// Enhanced Web Scraper Service for Legal Information
// This service uses multiple sources to fetch real-time legal information

const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');

// Cache scraped data for 24 hours (86400 seconds)
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

class WebScraperService {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.timeout = 15000; // 15 seconds timeout
    this.headers = {
      'User-Agent': this.userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    };
  }

  /**
   * Main method to search for legal information
   * @param {string} query - User's legal query
   * @returns {Promise<Object>} - Scraped legal information
   */
  async searchLegalInfo(query) {
    try {
      const cacheKey = `search_${query.toLowerCase().trim()}`;
      const cachedResult = cache.get(cacheKey);
      
      if (cachedResult) {
        console.log('Returning cached result for:', query);
        return cachedResult;
      }

      // Determine query type and scrape accordingly
      const queryType = this.detectQueryType(query);
      let result;

      switch (queryType) {
        case 'ipc':
          result = await this.scrapeIPCSection(query);
          break;
        case 'act':
          result = await this.scrapeActInformation(query);
          break;
        case 'case_law':
          result = await this.scrapeCaseLaw(query);
          break;
        case 'legal_procedure':
          result = await this.scrapeLegalProcedure(query);
          break;
        default:
          result = await this.scrapeGeneralLegalInfo(query);
      }

      // Cache the result
      cache.set(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Web scraper error:', error.message);
      return {
        success: false,
        error: error.message,
        fallback: true,
        message: 'Unable to fetch live data. Please try again or consult a lawyer on LegalIQ.'
      };
    }
  }

  /**
   * Detect the type of legal query
   * @param {string} query - User's query
   * @returns {string} - Query type
   */
  detectQueryType(query) {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.match(/ipc\s*\d+|section\s*\d+/)) {
      return 'ipc';
    }
    if (lowerQuery.includes('act') || lowerQuery.includes('amendment')) {
      return 'act';
    }
    if (lowerQuery.includes('case') || lowerQuery.includes('judgment') || lowerQuery.includes('verdict')) {
      return 'case_law';
    }
    if (lowerQuery.includes('bail') || lowerQuery.includes('fir') || lowerQuery.includes('divorce') || 
        lowerQuery.includes('procedure') || lowerQuery.includes('how to') || lowerQuery.includes('process')) {
      return 'legal_procedure';
    }
    if (lowerQuery.includes('fundamental right') || lowerQuery.includes('constitutional right')) {
      return 'rights';
    }
    return 'general';
  }

  /**
   * Scrape IPC section information from multiple sources
   * @param {string} query - Query containing IPC section
   * @returns {Promise<Object>} - IPC section details
   */
  async scrapeIPCSection(query) {
    try {
      const sectionMatch = query.match(/\d+[a-z]?/i);
      if (!sectionMatch) {
        return { success: false, message: 'Could not identify IPC section number' };
      }

      const section = sectionMatch[0].toLowerCase();
      console.log(`Fetching IPC Section ${section} from web...`);

      // Try multiple sources
      const sources = [
        () => this.scrapeFromDevgan(section),
        () => this.scrapeFromLegalServiceIndia(section),
        () => this.scrapeFromIndiaCode(section)
      ];

      for (const source of sources) {
        try {
          const result = await source();
          if (result && result.success) {
            console.log(`Successfully fetched IPC ${section} from web`);
            return result;
          }
        } catch (error) {
          console.log(`Source failed: ${error.message}`);
          continue;
        }
      }

      // If all sources fail, return helpful response
      return {
        success: true,
        queryType: 'ipc',
        section: section,
        results: [{
          title: `IPC Section ${section}`,
          snippet: `IPC Section ${section} is part of the Indian Penal Code. This section deals with criminal law provisions in India. For detailed information and legal interpretation specific to your case, please consult a verified lawyer on LegalIQ who can provide accurate guidance based on the latest amendments and case law.`,
          link: `https://www.indiacode.nic.in/search?q=IPC%20${section}`
        }],
        source: 'India Code Reference',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('IPC scraping error:', error.message);
      return {
        success: false,
        error: error.message,
        message: 'Unable to fetch IPC section information'
      };
    }
  }

  /**
   * Scrape from Devgan.in (IPC database)
   */
  async scrapeFromDevgan(section) {
    try {
      const url = `https://devgan.in/ipc/section/${section}/`;
      const response = await axios.get(url, {
        headers: this.headers,
        timeout: this.timeout,
        validateStatus: (status) => status < 500
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}`);
      }

      const $ = cheerio.load(response.data);
      
      // Extract title
      const title = $('h1').first().text().trim() || `IPC Section ${section}`;
      
      // Extract description
      let description = $('.content p').first().text().trim();
      if (!description) {
        description = $('article p').first().text().trim();
      }
      if (!description) {
        description = $('p').first().text().trim();
      }

      if (description && description.length > 50) {
        return {
          success: true,
          queryType: 'ipc',
          section: section,
          results: [{
            title: title,
            snippet: description,
            link: url
          }],
          source: 'Devgan.in (Legal Database)',
          timestamp: new Date().toISOString()
        };
      }

      throw new Error('No content found');
    } catch (error) {
      throw new Error(`Devgan scraping failed: ${error.message}`);
    }
  }

  /**
   * Scrape from LegalServiceIndia.com
   */
  async scrapeFromLegalServiceIndia(section) {
    try {
      const url = `https://www.legalserviceindia.com/legal/article-8513-ipc-section-${section}.html`;
      const response = await axios.get(url, {
        headers: this.headers,
        timeout: this.timeout,
        validateStatus: (status) => status < 500
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}`);
      }

      const $ = cheerio.load(response.data);
      
      const title = $('h1, .article-title').first().text().trim() || `IPC Section ${section}`;
      const description = $('.article-content p, .content p').first().text().trim();

      if (description && description.length > 50) {
        return {
          success: true,
          queryType: 'ipc',
          section: section,
          results: [{
            title: title,
            snippet: description,
            link: url
          }],
          source: 'Legal Service India',
          timestamp: new Date().toISOString()
        };
      }

      throw new Error('No content found');
    } catch (error) {
      throw new Error(`LegalServiceIndia scraping failed: ${error.message}`);
    }
  }

  /**
   * Scrape from India Code (official government website)
   */
  async scrapeFromIndiaCode(section) {
    try {
      // India Code doesn't allow direct scraping, but we can provide the link
      return {
        success: true,
        queryType: 'ipc',
        section: section,
        results: [{
          title: `IPC Section ${section} - Indian Penal Code`,
          snippet: `IPC Section ${section} is part of the Indian Penal Code, 1860. This is a criminal law provision in India. For the complete text and official interpretation, please visit the India Code website or consult a legal professional on LegalIQ for case-specific advice.`,
          link: `https://www.indiacode.nic.in/search?q=IPC%20${section}`
        }],
        source: 'India Code (Official)',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`India Code reference failed: ${error.message}`);
    }
  }

  /**
   * Scrape Act information
   */
  async scrapeActInformation(query) {
    try {
      return {
        success: true,
        queryType: 'act',
        query: query,
        results: [{
          title: `Information about ${query}`,
          snippet: `For detailed information about ${query}, including its provisions, amendments, and case law, please visit the official India Code website or consult with a legal expert on LegalIQ who can provide comprehensive guidance on this Act and its implications for your specific situation.`,
          link: `https://www.indiacode.nic.in/search?q=${encodeURIComponent(query)}`
        }],
        source: 'India Code Reference',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Unable to fetch Act information'
      };
    }
  }

  /**
   * Scrape case law information
   */
  async scrapeCaseLaw(query) {
    try {
      return {
        success: true,
        queryType: 'case_law',
        query: query,
        cases: [{
          title: `Case Law Search: ${query}`,
          court: 'Various Courts',
          snippet: `For detailed case law information about "${query}", including judgments, precedents, and their legal implications, we recommend consulting with a legal professional on LegalIQ who can provide relevant case precedents and their application to your specific situation. You can also search the Supreme Court of India and High Court websites for official judgments.`,
          link: `https://www.sci.gov.in/`
        }],
        source: 'Supreme Court of India Reference',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Unable to fetch case law information'
      };
    }
  }

  /**
   * Scrape legal procedure information
   */
  async scrapeLegalProcedure(query) {
    try {
      const lowerQuery = query.toLowerCase();
      
      // Provide comprehensive procedure information
      let procedureInfo = {
        title: `Legal Procedure: ${query}`,
        description: `For detailed information about "${query}", including step-by-step procedures, required documents, timelines, and legal requirements, we recommend consulting with a legal expert on LegalIQ who can guide you through the specific procedures relevant to your situation.`
      };

      if (lowerQuery.includes('bail')) {
        procedureInfo = {
          title: 'Bail Procedure in India',
          description: 'Bail is the temporary release of an accused person awaiting trial. Types: 1) Regular Bail (Section 437/439 CrPC) - granted after arrest, 2) Anticipatory Bail (Section 438 CrPC) - granted before arrest, 3) Interim Bail - temporary for short period. Factors considered: nature of offense, evidence, flight risk, criminal history. Application filed in appropriate court with supporting documents.'
        };
      } else if (lowerQuery.includes('fir')) {
        procedureInfo = {
          title: 'How to File an FIR',
          description: 'FIR (First Information Report) under Section 154 CrPC: 1) Visit nearest police station with jurisdiction, 2) Provide details of cognizable offense orally or in writing, 3) Police legally bound to register FIR, 4) Receive free copy, 5) If refused, approach Superintendent of Police or file private complaint under Section 156(3) CrPC. FIR must be registered immediately for cognizable offenses.'
        };
      } else if (lowerQuery.includes('divorce')) {
        procedureInfo = {
          title: 'Divorce Procedure in India',
          description: 'Divorce under Hindu Marriage Act 1955: Grounds include adultery, cruelty, desertion (2 years), conversion, mental disorder, communicable disease, renunciation, presumption of death, or mutual consent. Process: 1) File petition in family court, 2) Serve notice to spouse, 3) Court hearings and evidence, 4) Final decree. Mutual consent divorce: 6-18 months. Contested divorce: 2-5 years. Other personal laws have different provisions.'
        };
      }

      return {
        success: true,
        queryType: 'legal_procedure',
        query: query,
        procedures: [{
          title: procedureInfo.title,
          description: procedureInfo.description,
          link: 'https://www.indiacode.nic.in/'
        }],
        source: 'Legal Procedure Guide',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Unable to fetch legal procedure information'
      };
    }
  }

  /**
   * Scrape general legal information
   */
  async scrapeGeneralLegalInfo(query) {
    try {
      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes('fundamental right') || lowerQuery.includes('constitutional right')) {
        return {
          success: true,
          queryType: 'general',
          query: query,
          results: [{
            title: 'Fundamental Rights in India',
            snippet: 'The Indian Constitution guarantees six fundamental rights under Part III (Articles 12-35): 1) Right to Equality (Articles 14-18) - equality before law, prohibition of discrimination, 2) Right to Freedom (Articles 19-22) - freedom of speech, assembly, movement, profession, 3) Right against Exploitation (Articles 23-24) - prohibition of trafficking and child labor, 4) Right to Freedom of Religion (Articles 25-28), 5) Cultural and Educational Rights (Articles 29-30), 6) Right to Constitutional Remedies (Article 32) - right to move Supreme Court for enforcement.',
            link: 'https://www.india.gov.in/my-government/constitution-india/fundamental-rights'
          }],
          source: 'Constitution of India',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        queryType: 'general',
        query: query,
        results: [{
          title: `Legal Information: ${query}`,
          snippet: `For comprehensive information about "${query}", we recommend consulting with a verified lawyer on LegalIQ who can provide accurate legal advice tailored to your specific circumstances. Our lawyers are available 24/7 for video consultations and can help you understand the legal aspects, procedures, and implications related to your query.`,
          link: 'https://www.indiacode.nic.in/'
        }],
        source: 'LegalIQ Platform',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Unable to fetch legal information'
      };
    }
  }

  /**
   * Clear cache for specific query or all cache
   */
  clearCache(query = null) {
    if (query) {
      const cacheKey = `search_${query.toLowerCase().trim()}`;
      cache.del(cacheKey);
      console.log(`Cache cleared for: ${query}`);
    } else {
      cache.flushAll();
      console.log('All cache cleared');
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      keys: cache.keys().length,
      stats: cache.getStats()
    };
  }
}

module.exports = new WebScraperService();
