const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../.env' });

console.log('🧪 Testing Gmail Configuration...\n');

// Show configuration (masked)
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-4) : 'NOT SET');
console.log('Password length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);
console.log('');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Test email
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER, // Send to yourself
  subject: '✅ LegalIQ Email Test - Success!',
  text: 'If you receive this email, your Gmail App Password is working correctly!',
  html: `
    <div style="font-family: Arial; padding: 20px; background: #f0f0f0;">
      <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #28a745;">✅ Email Configuration Test Successful!</h2>
        <p>Your Gmail App Password is working correctly.</p>
        <p><strong>Configuration Details:</strong></p>
        <ul>
          <li>Email: ${process.env.EMAIL_USER}</li>
          <li>Service: Gmail SMTP</li>
          <li>Status: ✅ Connected</li>
        </ul>
        <p>You can now send marketing emails to the scraped advocate list.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Test sent from LegalIQ Email Service<br>
          ${new Date().toLocaleString()}
        </p>
      </div>
    </div>
  `
};

// Send test email
console.log('📤 Sending test email to:', process.env.EMAIL_USER);
console.log('⏳ Please wait...\n');

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('❌ EMAIL TEST FAILED!\n');
    console.log('Error:', error.message);
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Check if EMAIL_PASSWORD has NO spaces (should be 16 characters)');
    console.log('2. Verify 2-Step Verification is enabled on your Gmail account');
    console.log('3. Generate a NEW App Password at: https://myaccount.google.com/apppasswords');
    console.log('4. Make sure EMAIL_USER matches the Gmail account with the app password');
    console.log('5. Wait 2-3 minutes after generating new app password');
    process.exit(1);
  } else {
    console.log('✅ EMAIL TEST SUCCESSFUL!\n');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('\n🎉 Your Gmail configuration is working!');
    console.log('📧 Check your inbox:', process.env.EMAIL_USER);
    console.log('\n✨ You can now run the marketing email campaign:');
    console.log('   node scripts/send-marketing-emails.js');
    process.exit(0);
  }
});
