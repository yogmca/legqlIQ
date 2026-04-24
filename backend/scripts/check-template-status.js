require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');

const AUTH_KEY = process.env.MSG91_AUTH_KEY;
const NAMESPACE = process.env.MSG91_WHATSAPP_NAMESPACE;

console.log('='.repeat(80));
console.log('MSG91 WHATSAPP TEMPLATE STATUS CHECKER');
console.log('='.repeat(80));
console.log('\n📋 Configuration:');
console.log(`   Auth Key: ${AUTH_KEY ? AUTH_KEY.substring(0, 10) + '...' : 'NOT SET'}`);
console.log(`   Namespace: ${NAMESPACE || 'NOT SET'}`);
console.log('\n');

async function checkTemplateStatus() {
  try {
    console.log('🔍 Fetching all templates from MSG91...\n');
    
    const response = await axios.get('https://api.msg91.com/api/v5/whatsapp/whatsapp-template-list', {
      headers: {
        'authkey': AUTH_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.data) {
      const templates = response.data.data;
      console.log(`✅ Found ${templates.length} total templates\n`);
      
      // Look for consultation_booked_professional template
      const targetTemplate = templates.find(t => 
        t.name === 'consultation_booked_professional' || 
        t.templateName === 'consultation_booked_professional'
      );
      
      if (targetTemplate) {
        console.log('✅ TEMPLATE FOUND: consultation_booked_professional');
        console.log('─'.repeat(80));
        console.log(JSON.stringify(targetTemplate, null, 2));
        console.log('─'.repeat(80));
        
        // Check status
        const status = targetTemplate.status || targetTemplate.templateStatus;
        console.log(`\n📊 Template Status: ${status}`);
        
        if (status === 'APPROVED') {
          console.log('✅ Template is APPROVED');
        } else if (status === 'PENDING') {
          console.log('⚠️  Template is still PENDING approval from Meta');
        } else if (status === 'REJECTED') {
          console.log('❌ Template was REJECTED by Meta');
        } else {
          console.log(`⚠️  Unknown status: ${status}`);
        }
        
        // Check language
        const language = targetTemplate.language || targetTemplate.languageCode;
        console.log(`🌐 Language: ${language}`);
        
        if (language !== 'en') {
          console.log(`⚠️  WARNING: Template language is "${language}" but code expects "en"`);
        }
        
      } else {
        console.log('❌ TEMPLATE NOT FOUND: consultation_booked_professional');
        console.log('\n📝 Available templates:');
        templates.forEach((t, index) => {
          const name = t.name || t.templateName;
          const status = t.status || t.templateStatus;
          const language = t.language || t.languageCode;
          console.log(`   ${index + 1}. ${name} (${status}) [${language}]`);
        });
      }
      
      console.log('\n' + '='.repeat(80));
      console.log('RECOMMENDATIONS:');
      console.log('='.repeat(80));
      
      if (!targetTemplate) {
        console.log('1. Create the template "consultation_booked_professional" in MSG91 dashboard');
        console.log('2. Ensure the template name matches exactly (case-sensitive)');
        console.log('3. Set language to "en" (English)');
        console.log('4. Wait for Meta approval (can take 24-48 hours)');
      } else {
        const status = targetTemplate.status || targetTemplate.templateStatus;
        const language = targetTemplate.language || targetTemplate.languageCode;
        
        if (status !== 'APPROVED') {
          console.log('1. Wait for Meta to approve the template');
          console.log('2. Check Meta Business Manager for approval status');
          console.log('3. Ensure template follows WhatsApp Business Policy');
        }
        
        if (language !== 'en') {
          console.log(`1. Template language is "${language}" but code expects "en"`);
          console.log('2. Either:');
          console.log('   a) Create a new template with language "en", OR');
          console.log(`   b) Update code to use language "${language}"`);
        }
        
        if (status === 'APPROVED' && language === 'en') {
          console.log('✅ Template looks good! If still getting errors:');
          console.log('1. Check namespace matches in MSG91 dashboard');
          console.log('2. Verify integrated number ID is correct');
          console.log('3. Try sending a test message');
        }
      }
      
    } else {
      console.log('❌ Unexpected response format from MSG91');
      console.log(JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error fetching templates:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`   ${error.message}`);
    }
  }
}

// Run the check
checkTemplateStatus().then(() => {
  console.log('\n✅ Check complete\n');
}).catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
