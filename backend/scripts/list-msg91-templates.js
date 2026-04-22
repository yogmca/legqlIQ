/**
 * List All MSG91 WhatsApp Templates
 * 
 * This script fetches all WhatsApp templates from your MSG91 account
 * to see what templates are available and their status.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');

const AUTH_KEY = process.env.MSG91_AUTH_KEY;

console.log('📋 Listing All MSG91 WhatsApp Templates\n');
console.log(`Auth Key: ${AUTH_KEY ? '✅ Set (' + AUTH_KEY.substring(0, 8) + '...)' : '❌ Missing'}\n`);

if (!AUTH_KEY) {
  console.error('❌ MSG91_AUTH_KEY not configured in .env');
  process.exit(1);
}

async function listTemplates() {
  try {
    console.log('📡 Fetching templates from MSG91...\n');
    
    // Try different API endpoints
    const endpoints = [
      'https://api.msg91.com/api/v5/whatsapp/template/list',
      'https://control.msg91.com/api/v5/whatsapp/template/list',
      'https://api.msg91.com/api/v5/whatsapp/templates'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying: ${endpoint}`);
        const response = await axios.get(endpoint, {
          headers: {
            'authkey': AUTH_KEY,
            'Content-Type': 'application/json'
          }
        });

        console.log('\n✅ Templates found!\n');
        console.log('📋 Full Response:');
        console.log(JSON.stringify(response.data, null, 2));
        console.log('\n');

        // Parse and display templates
        const templates = response.data?.data || response.data?.templates || response.data;
        
        if (Array.isArray(templates)) {
          console.log(`\n📊 Found ${templates.length} template(s):\n`);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          
          templates.forEach((template, index) => {
            console.log(`\n${index + 1}. Template Name: ${template.name || template.elementName || 'N/A'}`);
            console.log(`   Status: ${template.status || 'N/A'}`);
            console.log(`   Language: ${template.language || 'N/A'}`);
            console.log(`   Category: ${template.category || 'N/A'}`);
            console.log(`   Created: ${template.createdAt || 'N/A'}`);
            
            if (template.components) {
              console.log(`   Components:`);
              template.components.forEach(comp => {
                console.log(`     - ${comp.type}: ${comp.format || 'text'}`);
              });
            }
          });
          
          console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          
          // Check for our specific template
          const ourTemplate = templates.find(t => 
            (t.name || t.elementName || '').toLowerCase().includes('consultation')
          );
          
          if (ourTemplate) {
            console.log('\n✅ Found consultation template:');
            console.log(`   Exact Name: "${ourTemplate.name || ourTemplate.elementName}"`);
            console.log(`   Status: ${ourTemplate.status}`);
            console.log(`   Use this exact name in your code!`);
          } else {
            console.log('\n⚠️  No consultation-related template found.');
            console.log('   You need to create the template in MSG91 dashboard first.');
          }
        } else {
          console.log('\n⚠️  Unexpected response format. Raw data:');
          console.log(JSON.stringify(templates, null, 2));
        }
        
        return; // Success, exit
        
      } catch (err) {
        if (err.response?.status === 404) {
          console.log(`   ❌ Not found (404)\n`);
          continue; // Try next endpoint
        }
        throw err; // Other errors, throw
      }
    }
    
    console.log('\n❌ Could not find templates endpoint. All endpoints returned 404.');
    console.log('\n💡 Alternative: Check templates manually in MSG91 dashboard:');
    console.log('   1. Login to https://msg91.com');
    console.log('   2. Go to WhatsApp → Templates');
    console.log('   3. Look for your template name');
    console.log('   4. Check its status (should be "APPROVED")');
    console.log('   5. Copy the exact template name to use in code');

  } catch (error) {
    console.error('\n❌ Error fetching templates:\n');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Response:`, JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.error('\n💡 Invalid Auth Key - check MSG91_AUTH_KEY in .env');
      } else if (error.response.status === 403) {
        console.error('\n💡 Access forbidden - check your MSG91 account permissions');
      }
    } else {
      console.error('Error:', error.message);
    }
    
    console.log('\n📋 Manual Steps:');
    console.log('   1. Login to MSG91 dashboard: https://msg91.com');
    console.log('   2. Navigate to: WhatsApp → Templates');
    console.log('   3. Find your template and note:');
    console.log('      - Exact template name');
    console.log('      - Status (must be APPROVED)');
    console.log('      - Language code (usually "en")');
    console.log('   4. Update your code with the exact template name');
    
    process.exit(1);
  }
}

listTemplates();
