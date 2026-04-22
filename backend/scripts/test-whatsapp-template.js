/**
 * Test WhatsApp Template - Diagnostic Script
 * 
 * This script helps diagnose MSG91 WhatsApp template issues by:
 * 1. Testing the template with sample data
 * 2. Showing the exact payload being sent
 * 3. Displaying the MSG91 API response
 * 
 * Usage:
 *   node backend/scripts/test-whatsapp-template.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');
const crypto = require('crypto');

// Generate UUID v4 compatible string
function generateUUID() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Configuration
const AUTH_KEY = process.env.MSG91_AUTH_KEY;
const INTEGRATED_NUMBER_ID = process.env.MSG91_WHATSAPP_INTEGRATED_NUMBER_ID;
const TEST_PHONE = process.env.ADMIN_WHATSAPP_NUMBER || '919876543210'; // Change this to your test number

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

console.log('🧪 MSG91 WhatsApp Template Test\n');
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

// Test different payload formats
async function testTemplate() {
  const formattedPhone = formatPhone(TEST_PHONE);

  console.log('📱 Test Data:');
  console.log(JSON.stringify(TEST_DATA, null, 2));
  console.log('');

  // Try Format 1: Without HEADER component (template has static text-only header)
  const payload1 = {
    integrated_number: INTEGRATED_NUMBER_ID,
    content_type: 'template',
    payload: {
      to: formattedPhone,
      type: 'template',
      template: {
        name: TEMPLATE_NAME,
        language: {
          code: 'en'
        },
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
    }
  };

  console.log('📤 Payload Format 1 (Without HEADER component):');
  console.log(JSON.stringify(payload1, null, 2));
  console.log('');

  try {
    console.log('🚀 Sending request to MSG91 (Format 1)...\n');
    const response = await axios.post(
      'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
      payload1,
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
    console.log('✅ Template is working correctly with Format 1!');
    console.log('✅ Check your WhatsApp for the test message.');
    return;
    
  } catch (error) {
    console.error('❌ Format 1 failed. Trying Format 2...\n');
    console.error('Format 1 Error:', error.response?.data || error.message);
    console.log('');
  }

  // Try Format 2: With to_and_components array WITHOUT HEADER
  const payload2 = {
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

  console.log('📤 Payload Format 2 (to_and_components WITHOUT HEADER):');
  console.log(JSON.stringify(payload2, null, 2));
  console.log('');

  try {
    console.log('🚀 Sending request to MSG91 (Format 2)...\n');
    const response = await axios.post(
      'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
      payload2,
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
    console.log('✅ Template is working correctly with Format 2!');
    console.log('✅ Check your WhatsApp for the test message.');
    return;
    
  } catch (error) {
    console.error('❌ ERROR! Both formats failed. MSG91 API Error:\n');
    
    if (error.response) {
      console.error('Status Code:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('\nResponse Data:');
      console.error(JSON.stringify(error.response.data, null, 2));
      console.error('\nResponse Headers:');
      console.error(JSON.stringify(error.response.headers, null, 2));
      
      // Analyze the error
      console.error('\n🔍 Error Analysis:');
      const errorData = error.response.data;
      
      if (errorData.message) {
        console.error(`  Message: ${errorData.message}`);
      }
      
      if (errorData.type === 'error') {
        console.error('  Type: API Error');
      }
      
      // Common error scenarios
      if (error.response.status === 401) {
        console.error('\n💡 Possible Issue: Invalid Auth Key');
        console.error('   Solution: Check MSG91_AUTH_KEY in .env file');
      } else if (error.response.status === 400) {
        console.error('\n💡 Possible Issues:');
        console.error('   1. Template not found or not approved in MSG91');
        console.error('   2. Template variable count mismatch');
        console.error('   3. Template variable types incorrect (should be "text")');
        console.error('   4. Invalid phone number format');
        console.error('\n   Solutions:');
        console.error('   ✓ Check template exists in MSG91 dashboard');
        console.error('   ✓ Verify template status is "APPROVED"');
        console.error('   ✓ Ensure template has 5 variables: {{1}} to {{5}}');
        console.error('   ✓ Set all variable types to "text" (not "number")');
        console.error('   ✓ Verify phone number is correct');
      } else if (error.response.status === 404) {
        console.error('\n💡 Possible Issue: Invalid Integrated Number ID');
        console.error('   Solution: Check MSG91_WHATSAPP_INTEGRATED_NUMBER_ID in .env');
      }
      
    } else if (error.request) {
      console.error('No response received from MSG91');
      console.error('Request was made but no response received');
      console.error('\n💡 Possible Issues:');
      console.error('   1. Network connectivity problem');
      console.error('   2. MSG91 API is down');
      console.error('   3. Firewall blocking the request');
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    console.error('\n📋 Troubleshooting Checklist:');
    console.error('   [ ] Template created in MSG91 dashboard');
    console.error('   [ ] Template name matches exactly: "consultation_booked_professional"');
    console.error('   [ ] Template status is "APPROVED" (not pending/rejected)');
    console.error('   [ ] Template has 6 variables: {{1}}, {{2}}, {{3}}, {{4}}, {{5}}, {{6}}');
    console.error('   [ ] All variables are type "text" (not "number")');
    console.error('   [ ] MSG91_AUTH_KEY is correct in .env');
    console.error('   [ ] MSG91_WHATSAPP_INTEGRATED_NUMBER_ID is correct in .env');
    console.error('   [ ] Test phone number is valid (with country code)');
    
    process.exit(1);
  }
}

// Run the test
testTemplate().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
