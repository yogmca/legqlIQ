/**
 * Check MSG91 Template Structure
 * 
 * This script fetches the actual template structure from MSG91
 * to see what components (HEADER, BODY, FOOTER, BUTTONS) it has.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');

const AUTH_KEY = process.env.MSG91_AUTH_KEY;
const TEMPLATE_NAME = 'consultation_booked_professional';

console.log('🔍 Checking MSG91 Template Structure\n');
console.log(`Template Name: ${TEMPLATE_NAME}`);
console.log(`Auth Key: ${AUTH_KEY ? '✅ Set' : '❌ Missing'}\n`);

if (!AUTH_KEY) {
  console.error('❌ MSG91_AUTH_KEY not configured in .env');
  process.exit(1);
}

async function checkTemplate() {
  try {
    console.log('📡 Fetching template from MSG91...\n');
    
    // MSG91 API endpoint to get template details
    const response = await axios.get(
      `https://api.msg91.com/api/v5/whatsapp/template/details`,
      {
        headers: {
          'authkey': AUTH_KEY
        },
        params: {
          name: TEMPLATE_NAME
        }
      }
    );

    console.log('✅ Template found!\n');
    console.log('📋 Full Response:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n');

    // Parse template structure
    if (response.data && response.data.data) {
      const template = response.data.data;
      
      console.log('📊 Template Analysis:');
      console.log(`  Name: ${template.name || 'N/A'}`);
      console.log(`  Status: ${template.status || 'N/A'}`);
      console.log(`  Language: ${template.language || 'N/A'}`);
      console.log(`  Category: ${template.category || 'N/A'}`);
      console.log('\n');

      if (template.components) {
        console.log('🧩 Components:');
        template.components.forEach((comp, index) => {
          console.log(`\n  Component ${index + 1}:`);
          console.log(`    Type: ${comp.type}`);
          console.log(`    Format: ${comp.format || 'N/A'}`);
          console.log(`    Text: ${comp.text || 'N/A'}`);
          
          if (comp.example && comp.example.header_text) {
            console.log(`    Example Header: ${JSON.stringify(comp.example.header_text)}`);
          }
          if (comp.example && comp.example.body_text) {
            console.log(`    Example Body: ${JSON.stringify(comp.example.body_text)}`);
          }
        });
      }

      console.log('\n\n💡 What to send in API:');
      
      const hasHeader = template.components?.some(c => c.type === 'HEADER');
      const headerComponent = template.components?.find(c => c.type === 'HEADER');
      const hasHeaderVariables = headerComponent?.example?.header_text?.length > 0;
      
      if (hasHeader) {
        if (hasHeaderVariables) {
          console.log('  ✅ HEADER: Include header_1, header_2, etc. in components');
          console.log(`     Variables needed: ${headerComponent.example.header_text.length}`);
        } else {
          console.log('  ⚠️  HEADER: Static text, DO NOT include header keys in components');
        }
      } else {
        console.log('  ℹ️  No HEADER component in template');
      }

      const bodyComponent = template.components?.find(c => c.type === 'BODY');
      if (bodyComponent) {
        const bodyVars = bodyComponent.example?.body_text?.[0] || [];
        console.log(`  ✅ BODY: Include body_1 to body_${bodyVars.length} in components`);
        console.log(`     Variables needed: ${bodyVars.length}`);
      }

    }

  } catch (error) {
    console.error('❌ Error fetching template:\n');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Response:`, JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.error('\n💡 Invalid Auth Key - check MSG91_AUTH_KEY in .env');
      } else if (error.response.status === 404) {
        console.error('\n💡 Template not found - check template name or create it in MSG91 dashboard');
      }
    } else {
      console.error('Error:', error.message);
    }
    
    process.exit(1);
  }
}

checkTemplate();
