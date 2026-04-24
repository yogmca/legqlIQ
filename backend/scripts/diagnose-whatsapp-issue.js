/**
 * WhatsApp Service Diagnostic Tool
 * 
 * This script simulates exactly what happens when a consultation is booked
 * and helps diagnose any issues with the WhatsApp service.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const whatsappService = require('../services/whatsappService');

console.log('🔍 WhatsApp Service Diagnostic Tool\n');

// Simulate consultation booking data (exactly as it comes from the controller)
const consultationData = {
  clientPhone: process.env.ADMIN_WHATSAPP_NUMBER || '916361793003',
  clientName: 'Yogesh Singh',
  professionalPhone: process.env.ADMIN_WHATSAPP_NUMBER || '916361793003',
  lawyerName: 'Sreeram Singh',
  caseType: 'Criminal Law',
  preferredDate: new Date('2026-04-26'),
  preferredTime: '12:00 PM',
  consultationType: 'in-person'
};

console.log('📋 Test Data (simulating consultation booking):');
console.log(JSON.stringify(consultationData, null, 2));
console.log('');

async function runDiagnostics() {
  try {
    console.log('🧪 Test 1: Sending consultation booked notification to professional...\n');
    
    const result = await whatsappService.sendConsultationBookedToProfessional(consultationData);
    
    console.log('\n✅ Result:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ SUCCESS! WhatsApp notification sent successfully.');
      console.log(`✅ Request ID: ${result.request_id}`);
      console.log('✅ Check your WhatsApp for the message.');
    } else {
      console.log('\n❌ FAILED! WhatsApp notification was not sent.');
      console.log(`❌ Reason: ${result.reason || 'Unknown'}`);
      if (result.error) {
        console.log('❌ Error details:', JSON.stringify(result.error, null, 2));
      }
    }
    
  } catch (error) {
    console.error('\n❌ EXCEPTION occurred:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.response) {
      console.error('\n📡 API Response:');
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run diagnostics
runDiagnostics().then(() => {
  console.log('\n🏁 Diagnostic complete.');
  process.exit(0);
}).catch(err => {
  console.error('\n💥 Unexpected error:', err);
  process.exit(1);
});
