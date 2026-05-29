const nodemailer = require('nodemailer');
require('dotenv').config({ path: './.env' });

async function testEmailCredentials() {
  console.log('🔍 Testing Email Credentials...\n');
  
  // Show what we're reading from .env
  console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
  console.log('🔑 EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);
  console.log('🔑 PASSWORD LENGTH:', process.env.EMAIL_PASSWORD?.length);
  console.log('🔑 HAS SPACES:', process.env.EMAIL_PASSWORD?.includes(' ') ? 'YES' : 'NO');
  console.log('');

  // Try with password as-is
  console.log('Testing with password as-is from .env...');
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  try {
    await transporter.verify();
    console.log('✅ SUCCESS! Email credentials are valid!');
    process.exit(0);
  } catch (error) {
    console.log('❌ FAILED with password as-is');
    console.log('Error:', error.message);
  }

  // Try with spaces removed
  console.log('\nTesting with spaces removed...');
  const passwordNoSpaces = process.env.EMAIL_PASSWORD?.replace(/\s/g, '');
  console.log('🔑 Password without spaces:', passwordNoSpaces);
  console.log('🔑 Length:', passwordNoSpaces?.length);
  
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: passwordNoSpaces
    }
  });

  try {
    await transporter.verify();
    console.log('✅ SUCCESS! Email credentials are valid with spaces removed!');
    console.log('\n💡 Solution: Update .env to remove spaces from EMAIL_PASSWORD');
    process.exit(0);
  } catch (error) {
    console.log('❌ FAILED even with spaces removed');
    console.log('Error:', error.message);
    console.log('\n⚠️  The app password itself is invalid or expired.');
    console.log('📝 You need to generate a new app password from:');
    console.log('   https://myaccount.google.com/apppasswords');
    process.exit(1);
  }
}

testEmailCredentials();
