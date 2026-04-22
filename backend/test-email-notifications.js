require('dotenv').config();
const emailService = require('./services/emailService');

async function testAllEmails() {
  console.log('\n🧪 Testing LegalIQ Email Notifications\n');
  console.log('📧 Email Configuration:');
  console.log('   EMAIL_USER:', process.env.EMAIL_USER);
  console.log('   CONTACT_EMAIL:', process.env.CONTACT_EMAIL);
  console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Configured' : '❌ NOT SET');
  console.log('\n' + '='.repeat(60) + '\n');

  const testResults = [];

  // Test 1: Admin notification for new user registration
  console.log('1️⃣  Testing: Admin notification for new user registration...');
  try {
    const result1 = await emailService.sendNewUserNotification({
      name: 'Test User',
      email: 'testuser@example.com',
      phone: '9876543210',
      role: 'user',
      professionalType: 'user'
    });
    console.log(result1.success ? '   ✅ SUCCESS' : '   ❌ FAILED');
    testResults.push({ test: 'Admin User Registration', success: result1.success });
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
    testResults.push({ test: 'Admin User Registration', success: false, error: error.message });
  }

  // Test 2: Welcome email to new user
  console.log('\n2️⃣  Testing: Welcome email to new user...');
  try {
    const result2 = await emailService.sendWelcomeEmail(
      process.env.CONTACT_EMAIL,
      'Test User',
      'user',
      'user'
    );
    console.log(result2.success ? '   ✅ SUCCESS' : '   ❌ FAILED');
    testResults.push({ test: 'Welcome Email', success: result2.success });
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
    testResults.push({ test: 'Welcome Email', success: false, error: error.message });
  }

  // Test 3: Admin notification for new professional registration
  console.log('\n3️⃣  Testing: Admin notification for new lawyer registration...');
  try {
    const result3 = await emailService.sendNewUserNotification({
      name: 'Test Lawyer',
      email: 'testlawyer@example.com',
      phone: '9876543210',
      role: 'lawyer',
      professionalType: 'lawyer'
    });
    console.log(result3.success ? '   ✅ SUCCESS' : '   ❌ FAILED');
    testResults.push({ test: 'Admin Lawyer Registration', success: result3.success });
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
    testResults.push({ test: 'Admin Lawyer Registration', success: false, error: error.message });
  }

  // Test 4: Consultation booking notification to admin
  console.log('\n4️⃣  Testing: Consultation booking notification to admin...');
  try {
    const result4 = await emailService.sendNewConsultationNotification({
      clientName: 'Test Client',
      clientEmail: 'client@example.com',
      clientPhone: '9876543210',
      lawyerName: 'Test Lawyer',
      lawyerEmail: 'lawyer@example.com',
      caseType: 'Criminal Law',
      caseDescription: 'Test case description',
      preferredDate: new Date(),
      preferredTime: '10:00 AM',
      consultationType: 'video',
      amount: 500
    });
    console.log(result4.success ? '   ✅ SUCCESS' : '   ❌ FAILED');
    testResults.push({ test: 'Admin Consultation Notification', success: result4.success });
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
    testResults.push({ test: 'Admin Consultation Notification', success: false, error: error.message });
  }

  // Test 5: Consultation booking confirmation to client
  console.log('\n5️⃣  Testing: Consultation booking confirmation to client...');
  try {
    const result5 = await emailService.sendConsultationBookingToClient({
      clientName: 'Test Client',
      clientEmail: process.env.CONTACT_EMAIL,
      lawyerName: 'Test Lawyer',
      caseType: 'Criminal Law',
      caseDescription: 'Test case description',
      preferredDate: new Date(),
      preferredTime: '10:00 AM',
      consultationType: 'video'
    });
    console.log(result5.success ? '   ✅ SUCCESS' : '   ❌ FAILED');
    testResults.push({ test: 'Client Booking Confirmation', success: result5.success });
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
    testResults.push({ test: 'Client Booking Confirmation', success: false, error: error.message });
  }

  // Test 6: Consultation booking notification to professional
  console.log('\n6️⃣  Testing: Consultation booking notification to professional...');
  try {
    const result6 = await emailService.sendConsultationBookingToProfessional({
      clientName: 'Test Client',
      clientPhone: '9876543210',
      lawyerName: 'Test Lawyer',
      lawyerEmail: process.env.CONTACT_EMAIL,
      caseType: 'Criminal Law',
      caseDescription: 'Test case description',
      preferredDate: new Date(),
      preferredTime: '10:00 AM',
      consultationType: 'video'
    });
    console.log(result6.success ? '   ✅ SUCCESS' : '   ❌ FAILED');
    testResults.push({ test: 'Professional Booking Notification', success: result6.success });
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
    testResults.push({ test: 'Professional Booking Notification', success: false, error: error.message });
  }

  // Test 7: Contact form email
  console.log('\n7️⃣  Testing: Contact form submission...');
  try {
    const result7 = await emailService.sendContactEmail({
      name: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      subject: 'Test Subject',
      message: 'This is a test message'
    });
    console.log(result7.success ? '   ✅ SUCCESS' : '   ❌ FAILED');
    testResults.push({ test: 'Contact Form', success: result7.success });
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
    testResults.push({ test: 'Contact Form', success: false, error: error.message });
  }

  // Test 8: Consultation accepted notification
  console.log('\n8️⃣  Testing: Consultation accepted notification to client...');
  try {
    const result8 = await emailService.sendConsultationAcceptedToClient({
      clientName: 'Test Client',
      clientEmail: process.env.CONTACT_EMAIL,
      lawyerName: 'Test Lawyer',
      preferredDate: new Date(),
      preferredTime: '10:00 AM',
      consultationType: 'video'
    });
    console.log(result8.success ? '   ✅ SUCCESS' : '   ❌ FAILED');
    testResults.push({ test: 'Consultation Accepted', success: result8.success });
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
    testResults.push({ test: 'Consultation Accepted', success: false, error: error.message });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 TEST SUMMARY\n');
  
  const successCount = testResults.filter(r => r.success).length;
  const totalCount = testResults.length;
  
  testResults.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.test}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n🎯 Results: ${successCount}/${totalCount} tests passed\n`);
  
  if (successCount === totalCount) {
    console.log('🎉 All email notifications are working correctly!');
    console.log('📬 Check your inbox at:', process.env.CONTACT_EMAIL);
    console.log('\n💡 Next steps:');
    console.log('   1. Check your email inbox (including spam folder)');
    console.log('   2. You should have received 8 test emails');
    console.log('   3. Test real user registration and consultation booking');
  } else {
    console.log('⚠️  Some email notifications failed.');
    console.log('\n💡 Common issues:');
    console.log('   1. Check EMAIL_PASSWORD is a Gmail App Password (not regular password)');
    console.log('   2. Verify 2-Step Verification is enabled on Gmail');
    console.log('   3. Check EMAIL_USER is correct');
    console.log('   4. Ensure no firewall is blocking port 587');
    console.log('\n📖 See EMAIL_FIX_COMPLETE_GUIDE.md for detailed troubleshooting');
  }
  
  console.log('\n');
  process.exit(successCount === totalCount ? 0 : 1);
}

testAllEmails().catch(error => {
  console.error('\n❌ Fatal error:', error);
  console.error('\n💡 This usually means:');
  console.error('   - Email credentials are not configured in .env file');
  console.error('   - Network/firewall is blocking SMTP connection');
  console.error('   - Gmail App Password is invalid');
  console.error('\n📖 See EMAIL_FIX_COMPLETE_GUIDE.md for setup instructions');
  process.exit(1);
});
