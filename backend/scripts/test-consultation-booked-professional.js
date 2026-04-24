/**
 * Test consultation_booked_professional Template
 * 
 * This script tests the consultation_booked_professional template
 * using the exact format that works (Format 2 from test-whatsapp-template.js)
 * 
 * Usage:
 *   node backend/scripts/test-consultation-booked-professional.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');

// Configuration
const AUTH_KEY = process.env.MSG91_AUTH_KEY;
const INTEGRATED_NUMBER_ID = process.env.MSG91_WHATSAPP_INTEGRATED_NUMBER_ID;
const TEST_PHONE = process.env.ADMIN_WHATSAPP_NUMBER || '916361793003';

// Template to test
const TEMPLATE_NAME = 'consultation_booked_professional';

// Test data for professional notification
// Template variables: {{1}}=Professional Name, {{2}}=Client Name, {{3}}=Type, {{4}}=Case Type, {{5}}=Date, {{6}}=Time
const TEST_DATA = {
  professionalName: 'Sreeram Singh',
  clientName: 'Yogesh Singh',
  consultationType: 'In-Person',
  caseType: 'Criminal Law',
  date: 'Sunday, 26 April 2026',
  time: '12:00 PM'
};

console.log('🧪 Testing consultation_booked_professional Template\n');
console.log('Configuration:');
console.log(`  Auth Key: ${AUTH_KEY ? '✅ Set (' + AUTH_KEY.substring(0, 8) + '...)' : '❌ Missing'}`);
console.log(`  Integrated Number ID: ${INTEGRATED_NUMBER_ID || '❌ Missing'}`);
console.log(`  Test Phone: ${TEST_PHONE}`);
console.log(`  Template Name: ${TEMPLATE_NAME}\n`);

if (!AUTH_KEY || !INTEGRATED_NUMBER_ID) {
  console.error('❌ Missing required environment variables!');
  console.error('Please set MSG91_AUTH_KEY and MSG91_WHATSAPP_INTEGRATED_NUMBER_ID in .env file');
  process.exit(1);
}

// Format phone number
function formatPhone(phone) {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned;
  }
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
}

// Test the template
async function testTemplate() {
  const formattedPhone = formatPhone(TEST_PHONE);

  console.log('📱 Test Data:');
  console.log(JSON.stringify(TEST_DATA, null, 2));
  console.log('');

  // Use Format 2 (to_and_components WITHOUT HEADER) - this is the format that works!
  const payload = {
    integrated_number: INTEGRATED_NUMBER_ID,
    content_type: 'template',
    payload: {
      messaging_product: 'whatsapp',
      type: 'template',
      template: {
        name: TEMPLATE_NAME,
        language: {
          code: 'en',
          policy: 'deterministic'
        },
        to_and_components: [
          {
            to: [formattedPhone],
            components: [
              {
                type: 'BODY',
                parameters: [
                  { type: 'text', text: TEST_DATA.professionalName },
                  { type: 'text', text: TEST_DATA.clientName },
                  { type: 'text', text: TEST_DATA.consultationType },
                  { type: 'text', text: TEST_DATA.caseType },
                  { type: 'text', text: TEST_DATA.date },
                  { type: 'text', text: TEST_DATA.time }
                ]
              }
            ]
          }
        ]
      }
    }
  };

  console.log('📤 Payload (to_and_components WITHOUT HEADER):');
  console.log(JSON.stringify(payload, null, 2));
  console.log('');

  try {
    console.log('🚀 Sending request to MSG91...\n');
    const response = await axios.post(
      'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
      payload,
      {
        headers: {
          'authkey': AUTH_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ SUCCESS! MSG91 Response:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('');
    console.log('✅ Template is working correctly!');
    console.log('✅ Check your WhatsApp for the test message.');
    console.log(`✅ Request ID: ${response.data.request_id || 'N/A'}`);
    
  } catch (error) {
    console.error('❌ ERROR! MSG91 API Error:\n');
    
    if (error.response) {
      console.error('Status Code:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('\nResponse Data:');
      console.error(JSON.stringify(error.response.data, null, 2));
      
      // Analyze the error
      console.error('\n🔍 Error Analysis:');
      const errorData = error.response.data;
      
      if (errorData.message) {
        console.error(`  Message: ${errorData.message}`);
      }
      
      if (errorData.errors) {
        console.error(`  Errors: ${errorData.errors}`);
      }
      
    } else if (error.request) {
      console.error('No response received from MSG91');
      console.error('Request was made but no response received');
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    process.exit(1);
  }
}

// Run the test
testTemplate().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
