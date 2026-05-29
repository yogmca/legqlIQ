/**
 * Traffic Simulator Script
 * 
 * WARNING: This script is for TESTING PURPOSES ONLY
 * - Do NOT use this to manipulate search rankings
 * - This violates Google's Webmaster Guidelines
 * - Can result in penalties and de-indexing
 * - Google Search Console tracks ORGANIC search traffic, not direct visits
 * 
 * Use this ONLY to test your analytics implementation
 */

const axios = require('axios');
const https = require('https');

// Configuration
const CONFIG = {
  targetUrl: 'https://legaliq.in',
  requestsPerBatch: 100,
  delayBetweenRequests: 500, // 0.5 seconds
  delayBetweenBatches: 5000, // 5 seconds
  totalBatches: 60, // 100 requests x 60 batches = 6000 total requests
  
  // Indian cities for geo-simulation
  indianCities: [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
    'Chandigarh', 'Indore', 'Bhopal', 'Nagpur', 'Surat'
  ],
  
  // Various device user agents
  userAgents: [
    // Desktop browsers
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    
    // Mobile devices (Android)
    'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    
    // Mobile devices (iOS)
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    
    // Tablets
    'Mozilla/5.0 (Linux; Android 13; SM-X906C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ],
  
  // Referrers to simulate various traffic sources
  referrers: [
    '', // Direct traffic
    'https://www.google.co.in/',
    'https://www.facebook.com/',
    'https://twitter.com/',
    'https://www.linkedin.com/',
    'https://www.instagram.com/'
  ],
  
  // Pages to visit
  pages: [
    '/',
    '/about',
    '/contact',
    '/articles',
    '/lawyers',
    '/register',
    '/login'
  ]
};

// Statistics tracking
const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  startTime: null,
  endTime: null
};

/**
 * Get random element from array
 */
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Sleep function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simulate a single request
 */
async function simulateRequest(requestNumber) {
  const userAgent = getRandomElement(CONFIG.userAgents);
  const city = getRandomElement(CONFIG.indianCities);
  const referrer = getRandomElement(CONFIG.referrers);
  const page = getRandomElement(CONFIG.pages);
  const url = `${CONFIG.targetUrl}${page}`;
  
  const headers = {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8,hi;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
    'X-Simulated-City': city, // Custom header for logging
  };
  
  if (referrer) {
    headers['Referer'] = referrer;
  }
  
  try {
    console.log(`\n[Request #${requestNumber}]`);
    console.log(`  URL: ${url}`);
    console.log(`  City: ${city}`);
    console.log(`  Device: ${userAgent.includes('Mobile') ? 'Mobile' : userAgent.includes('iPad') ? 'Tablet' : 'Desktop'}`);
    console.log(`  Referrer: ${referrer || 'Direct'}`);
    
    const response = await axios.get(url, {
      headers,
      timeout: 30000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false // For testing only
      }),
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Accept 4xx as "successful" for logging
      }
    });
    
    console.log(`  Status: ${response.status}`);
    console.log(`  ✓ Request completed`);
    
    stats.successfulRequests++;
    stats.totalRequests++;
    
    return true;
  } catch (error) {
    console.log(`  ✗ Request failed: ${error.message}`);
    stats.failedRequests++;
    stats.totalRequests++;
    return false;
  }
}

/**
 * Run a batch of requests
 */
async function runBatch(batchNumber) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`BATCH ${batchNumber} - Starting ${CONFIG.requestsPerBatch} requests`);
  console.log(`${'='.repeat(60)}`);
  
  for (let i = 1; i <= CONFIG.requestsPerBatch; i++) {
    const requestNumber = (batchNumber - 1) * CONFIG.requestsPerBatch + i;
    await simulateRequest(requestNumber);
    
    // Wait between requests (except for the last one in batch)
    if (i < CONFIG.requestsPerBatch) {
      await sleep(CONFIG.delayBetweenRequests);
    }
  }
  
  console.log(`\nBatch ${batchNumber} completed`);
  printStats();
}

/**
 * Print statistics
 */
function printStats() {
  const elapsed = stats.endTime 
    ? (stats.endTime - stats.startTime) / 1000 
    : (Date.now() - stats.startTime) / 1000;
  
  console.log(`\n${'─'.repeat(60)}`);
  console.log('STATISTICS');
  console.log(`${'─'.repeat(60)}`);
  console.log(`Total Requests:      ${stats.totalRequests}`);
  console.log(`Successful:          ${stats.successfulRequests} (${((stats.successfulRequests/stats.totalRequests)*100).toFixed(1)}%)`);
  console.log(`Failed:              ${stats.failedRequests} (${((stats.failedRequests/stats.totalRequests)*100).toFixed(1)}%)`);
  console.log(`Elapsed Time:        ${elapsed.toFixed(1)}s`);
  console.log(`Requests/Second:     ${(stats.totalRequests/elapsed).toFixed(2)}`);
  console.log(`${'─'.repeat(60)}\n`);
}

/**
 * Main execution function
 */
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('TRAFFIC SIMULATOR - TESTING PURPOSES ONLY');
  console.log('='.repeat(60));
  console.log('\n⚠️  WARNING: This is for testing analytics only!');
  console.log('   - Does NOT improve SEO or search rankings');
  console.log('   - Does NOT affect Google Search Console organic data');
  console.log('   - May violate terms of service if misused');
  console.log('\nConfiguration:');
  console.log(`  Target URL:          ${CONFIG.targetUrl}`);
  console.log(`  Requests per batch:  ${CONFIG.requestsPerBatch}`);
  console.log(`  Total batches:       ${CONFIG.totalBatches}`);
  console.log(`  Total requests:      ${CONFIG.requestsPerBatch * CONFIG.totalBatches}`);
  console.log(`  Delay between reqs:  ${CONFIG.delayBetweenRequests}ms`);
  console.log(`  Delay between batch: ${CONFIG.delayBetweenBatches}ms`);
  console.log('\nStarting in 5 seconds...\n');
  
  await sleep(5000);
  
  stats.startTime = Date.now();
  
  try {
    for (let batch = 1; batch <= CONFIG.totalBatches; batch++) {
      await runBatch(batch);
      
      // Wait between batches (except after the last batch)
      if (batch < CONFIG.totalBatches) {
        console.log(`\nWaiting ${CONFIG.delayBetweenBatches/1000}s before next batch...\n`);
        await sleep(CONFIG.delayBetweenBatches);
      }
    }
    
    stats.endTime = Date.now();
    
    console.log('\n' + '='.repeat(60));
    console.log('SIMULATION COMPLETED');
    console.log('='.repeat(60));
    printStats();
    
    console.log('\n📊 Next Steps:');
    console.log('   1. Check your server logs for the requests');
    console.log('   2. Verify Google Analytics (if configured)');
    console.log('   3. Note: Google Search Console will NOT show this traffic');
    console.log('      (GSC only tracks organic search traffic from Google)\n');
    
  } catch (error) {
    console.error('\n❌ Error during simulation:', error.message);
    stats.endTime = Date.now();
    printStats();
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Simulation interrupted by user');
  stats.endTime = Date.now();
  printStats();
  process.exit(0);
});

// Run the simulation
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { simulateRequest, CONFIG };
