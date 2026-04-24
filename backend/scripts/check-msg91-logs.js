/**
 * Check MSG91 WhatsApp Delivery Logs
 * 
 * This script checks the delivery status of WhatsApp messages sent via MSG91
 * 
 * Usage:
 *   node backend/scripts/check-msg91-logs.js <request_id>
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');

const AUTH_KEY = process.env.MSG91_AUTH_KEY;
const requestId = process.argv[2];

if (!requestId) {
  console.log('Usage: node backend/scripts/check-msg91-logs.js <request_id>');
  console.log('\nExample:');
  console.log('  node backend/scripts/check-msg91-logs.js 6169ddbac7bd4dc183e4a6dad0c0499c');
  console.log('\nYou can find the request_id in:');
  console.log('  1. The test script output');
  console.log('  2. Your backend logs');
  console.log('  3. MSG91 dashboard → WhatsApp → Logs');
  process.exit(1);
}

if (!AUTH_KEY) {
  console.error('❌ MSG91_AUTH_KEY not found in .env file');
  process.exit(1);
}

console.log('🔍 Checking MSG91 delivery status...\n');
console.log(`Request ID: ${requestId}`);
console.log(`Auth Key: ${AUTH_KEY.substring(0, 8)}...\n`);

async function checkDeliveryStatus() {
  try {
    // MSG91 WhatsApp delivery report API
    const url = `https://api.msg91.com/api/v5/whatsapp/report/${requestId}`;
    
    console.log(`📡 Fetching from: ${url}\n`);
    
    const response = await axios.get(url, {
      headers: {
        'authkey': AUTH_KEY
      }
    });

    console.log('✅ Response received:\n');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Analyze the response
    if (response.data && response.data.data) {
      const data = response.data.data;
      console.log('\n📊 Delivery Status Analysis:');
      
      if (Array.isArray(data)) {
        data.forEach((msg, index) => {
          console.log(`\n  Message ${index + 1}:`);
          console.log(`    To: ${msg.to || 'N/A'}`);
          console.log(`    Status: ${msg.status || 'N/A'}`);
          console.log(`    Delivered: ${msg.delivered ? '✅ Yes' : '❌ No'}`);
          console.log(`    Error: ${msg.error || 'None'}`);
        });
      } else {
        console.log(`    Status: ${data.status || 'N/A'}`);
        console.log(`    Message: ${data.message || 'N/A'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error fetching delivery status:\n');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Response:`, JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 404) {
        console.error('\n💡 Possible reasons:');
        console.error('   1. Request ID not found (check if it\'s correct)');
        console.error('   2. Message is still being processed (try again in a few seconds)');
        console.error('   3. Request ID is too old (MSG91 keeps logs for limited time)');
      } else if (error.response.status === 401) {
        console.error('\n💡 Authentication failed - check MSG91_AUTH_KEY in .env');
      }
    } else {
      console.error(error.message);
    }
    
    process.exit(1);
  }
}

checkDeliveryStatus();
