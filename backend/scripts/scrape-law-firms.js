const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// URL to scrape
const TARGET_URL = 'https://neetishastra.com/email-ids-office-locations-of-top-50-corporate-law-firms-for-lawyers-and-law-students-legal-jobs-internships-2026/';

/**
 * Clean email address by removing common suffixes and invalid characters
 */
function cleanEmail(email) {
  if (!email) return '';
  
  // Remove common suffixes that get appended
  email = email.replace(/careers$/i, '');
  email = email.replace(/\.careers$/i, '');
  email = email.replace(/\s+/g, '');
  
  // Validate email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return '';
  }
  
  return email.toLowerCase().trim();
}

/**
 * Clean firm name
 */
function cleanFirmName(name) {
  if (!name) return '';
  
  // Remove leading numbers and dots
  name = name.replace(/^\d+[\.\)]\s*/, '');
  
  // Remove "Email:" prefix
  name = name.replace(/^Email:\s*/i, '');
  
  // Remove trailing "Email" word
  name = name.replace(/\s*Email\s*$/i, '');
  
  // Clean up extra whitespace
  name = name.replace(/\s+/g, ' ').trim();
  
  return name;
}

/**
 * Scrape law firm data from the target URL
 */
async function scrapeLawFirms() {
  console.log('🔍 Starting web scraper for top 50 corporate law firms...\n');
  console.log(`📍 Target URL: ${TARGET_URL}\n`);

  try {
    // Fetch the webpage
    console.log('📥 Fetching webpage...');
    const response = await axios.get(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 30000
    });

    console.log('✅ Webpage fetched successfully\n');
    console.log('🔍 Parsing HTML content...\n');

    // Load HTML into cheerio
    const $ = cheerio.load(response.data);

    const lawFirms = [];
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    // Strategy 1: Look for structured lists or tables
    $('ol li, ul li, table tr').each((index, element) => {
      const text = $(element).text().trim();
      
      // Extract emails from the text
      const emails = text.match(emailPattern);
      
      if (emails && emails.length > 0) {
        // Try to extract firm name (usually before the email or at the start)
        let firmName = text.split(/[@\n]/)[0].trim();
        firmName = cleanFirmName(firmName);
        
        // Extract location if present
        const locationMatch = text.match(/(?:Location|Office|Address):\s*([^,\n]+)/i);
        const location = locationMatch ? locationMatch[1].trim() : '';

        emails.forEach(email => {
          const cleanedEmail = cleanEmail(email);
          if (cleanedEmail && firmName && !cleanedEmail.includes('example.com') && !cleanedEmail.includes('neetishastra')) {
            lawFirms.push({
              name: firmName,
              email: cleanedEmail,
              location: location,
              source: 'list_item'
            });
          }
        });
      }
    });

    // Strategy 2: Look for paragraphs with email addresses
    $('p').each((index, element) => {
      const text = $(element).text().trim();
      const emails = text.match(emailPattern);
      
      if (emails && emails.length > 0) {
        // Try to find firm name in the same paragraph or previous heading
        let firmName = '';
        const prevHeading = $(element).prevAll('h1, h2, h3, h4, h5, h6').first().text().trim();
        
        if (prevHeading) {
          firmName = prevHeading.replace(/^\d+[\.\)]\s*/, '').trim();
        } else {
          // Extract from the paragraph itself
          const sentences = text.split(/[.!?]\s+/);
          if (sentences.length > 0) {
            firmName = sentences[0].replace(/^\d+[\.\)]\s*/, '').trim();
          }
        }

        emails.forEach(email => {
          const cleanedEmail = cleanEmail(email);
          if (cleanedEmail && firmName && !cleanedEmail.includes('example.com') && !cleanedEmail.includes('neetishastra')) {
            lawFirms.push({
              name: firmName,
              email: cleanedEmail,
              location: '',
              source: 'paragraph'
            });
          }
        });
      }
    });

    // Strategy 3: Look for specific patterns in the entire content
    const bodyText = $('body').text();
    const firmPatterns = [
      /([A-Z][A-Za-z\s&,]+(?:Law|Legal|Associates|Partners|Chambers|Advocates|Consultants))\s*[-–—:]\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
      /(\d+\.\s*)([A-Z][A-Za-z\s&,]+)\s*[-–—:]\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi
    ];

    firmPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(bodyText)) !== null) {
        let firmName = (match[2] || match[1]).trim();
        firmName = cleanFirmName(firmName);
        const email = cleanEmail(match[3] || match[2]);
        
        if (firmName && email && email.includes('@') && !email.includes('example.com') && !email.includes('neetishastra')) {
          lawFirms.push({
            name: firmName,
            email: email,
            location: '',
            source: 'pattern_match'
          });
        }
      }
    });

    // Remove duplicates based on email
    const uniqueFirms = [];
    const seenEmails = new Set();

    lawFirms.forEach(firm => {
      if (!seenEmails.has(firm.email)) {
        seenEmails.add(firm.email);
        uniqueFirms.push(firm);
      }
    });

    console.log(`✅ Scraping completed!\n`);
    console.log(`📊 Found ${uniqueFirms.length} unique law firms with email addresses\n`);

    // Display results
    if (uniqueFirms.length > 0) {
      console.log('📋 Scraped Law Firms:\n');
      console.log('='.repeat(80));
      uniqueFirms.forEach((firm, index) => {
        console.log(`${index + 1}. ${firm.name}`);
        console.log(`   📧 Email: ${firm.email}`);
        if (firm.location) {
          console.log(`   📍 Location: ${firm.location}`);
        }
        console.log(`   🔍 Source: ${firm.source}`);
        console.log('-'.repeat(80));
      });
    } else {
      console.log('⚠️  No law firms found. The page structure might have changed.');
      console.log('💡 Tip: Visit the URL manually to check the content structure.');
    }

    return uniqueFirms;

  } catch (error) {
    console.error('❌ Error scraping law firms:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('🌐 Network error: Could not reach the website. Check your internet connection.');
    } else if (error.response) {
      console.error(`📡 HTTP Error: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏱️  Request timed out. The website might be slow or unreachable.');
    }
    
    return [];
  }
}

/**
 * Save scraped data to files
 */
async function saveScrapedData(lawFirms) {
  if (lawFirms.length === 0) {
    console.log('\n⚠️  No data to save.');
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  
  // Save as JSON
  const jsonFile = path.join(__dirname, `law-firms-${timestamp}.json`);
  fs.writeFileSync(jsonFile, JSON.stringify(lawFirms, null, 2));
  console.log(`\n💾 Saved JSON data to: ${jsonFile}`);

  // Save as TXT (compatible with send-law-firm-invitations.js)
  const txtFile = path.join(__dirname, `law-firms-${timestamp}.txt`);
  const txtContent = lawFirms.map(firm => `${firm.name}, ${firm.email}`).join('\n');
  fs.writeFileSync(txtFile, txtContent);
  console.log(`💾 Saved TXT data to: ${txtFile}`);

  // Save as CSV
  const csvFile = path.join(__dirname, `law-firms-${timestamp}.csv`);
  const csvContent = 'Name,Email,Location,Source\n' + 
    lawFirms.map(firm => `"${firm.name}","${firm.email}","${firm.location}","${firm.source}"`).join('\n');
  fs.writeFileSync(csvFile, csvContent);
  console.log(`💾 Saved CSV data to: ${csvFile}`);

  console.log('\n✅ All files saved successfully!');
  
  return { jsonFile, txtFile, csvFile };
}

/**
 * Main function
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     LegalIQ - Top 50 Corporate Law Firms Web Scraper          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Scrape the data
  const lawFirms = await scrapeLawFirms();

  // Save the data
  if (lawFirms.length > 0) {
    const files = await saveScrapedData(lawFirms);
    
    console.log('\n' + '='.repeat(80));
    console.log('📬 NEXT STEPS - Send Invitation Emails');
    console.log('='.repeat(80));
    console.log('\nTo send invitation emails to these law firms, run:\n');
    console.log(`   cd backend/scripts`);
    console.log(`   node send-law-firm-invitations.js ${path.basename(files.txtFile)}\n`);
    console.log('This will use the existing email invitation script with the scraped data.\n');
    console.log('💡 Tip: Review the scraped data before sending emails to ensure accuracy.');
  } else {
    console.log('\n' + '='.repeat(80));
    console.log('🔧 TROUBLESHOOTING');
    console.log('='.repeat(80));
    console.log('\nThe scraper could not find law firm data. Possible reasons:');
    console.log('1. The website structure has changed');
    console.log('2. The website is blocking automated requests');
    console.log('3. Network connectivity issues\n');
    console.log('💡 Manual Alternative:');
    console.log('   1. Visit the URL in your browser');
    console.log('   2. Copy the law firm names and emails');
    console.log('   3. Create a text file with format: "Firm Name, email@example.com"');
    console.log('   4. Run: node send-law-firm-invitations.js your-file.txt\n');
  }

  console.log('✨ Scraping process completed!\n');
}

// Run the scraper
if (require.main === module) {
  main().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { scrapeLawFirms, saveScrapedData };
