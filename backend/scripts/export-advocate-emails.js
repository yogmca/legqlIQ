const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Scrape advocates from KSBC website
async function scrapeAdvocates() {
  try {
    console.log('🔍 Scraping advocates from KSBC website...');
    const response = await axios.get('https://ksbc.org.in/senior_advocates_list.php');
    const $ = cheerio.load(response.data);
    
    const advocates = [];
    const emailRegex = /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;
    
    // Get all text content from the page
    const pageText = $('body').text();
    
    // Split by advocate entries (they start with "Shri." or "Smt.")
    const entries = pageText.split(/(?=Shri\.|Smt\.)/);
    
    entries.forEach(entry => {
      // Extract name (first line after Shri./Smt.)
      const nameMatch = entry.match(/(?:Shri\.|Smt\.)\s*([^,\n]+)/);
      if (!nameMatch) return;
      
      const name = nameMatch[1].trim();
      
      // Extract email
      const emailMatches = entry.match(emailRegex);
      if (emailMatches && emailMatches.length > 0) {
        const email = emailMatches[0].toLowerCase();
        
        // Validate it's a proper email
        if (email.includes('@') && email.includes('.')) {
          advocates.push({ name, email });
        }
      }
    });
    
    console.log(`✅ Found ${advocates.length} advocates with valid emails`);
    return advocates;
  } catch (error) {
    console.error('❌ Error scraping advocates:', error.message);
    return [];
  }
}

// Export to CSV
function exportToCSV(advocates) {
  const csv = ['Name,Email'];
  advocates.forEach(adv => {
    csv.push(`"${adv.name}","${adv.email}"`);
  });
  
  const filename = 'advocates-email-list.csv';
  fs.writeFileSync(filename, csv.join('\n'));
  console.log(`\n✅ Exported to ${filename}`);
}

// Export to JSON
function exportToJSON(advocates) {
  const filename = 'advocates-email-list.json';
  fs.writeFileSync(filename, JSON.stringify(advocates, null, 2));
  console.log(`✅ Exported to ${filename}`);
}

// Main function
async function main() {
  console.log('🚀 LegalIQ Advocate Email List Exporter\n');
  
  const advocates = await scrapeAdvocates();
  
  if (advocates.length === 0) {
    console.log('❌ No advocates found.');
    process.exit(1);
  }
  
  // Export to both formats
  exportToCSV(advocates);
  exportToJSON(advocates);
  
  console.log('\n📊 Summary:');
  console.log(`   Total advocates: ${advocates.length}`);
  console.log('\n📧 Sample advocates:');
  advocates.slice(0, 5).forEach((adv, i) => {
    console.log(`   ${i + 1}. ${adv.name} - ${adv.email}`);
  });
  console.log(`   ... and ${advocates.length - 5} more`);
  
  console.log('\n✨ Export completed! You can now:');
  console.log('   1. Use the CSV file with Gmail, Mailchimp, or other email services');
  console.log('   2. Import into any email marketing platform');
  console.log('   3. Send emails manually using the list');
  
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
