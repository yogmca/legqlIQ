# Complete Email Fix Guide for LegalIQ

## Current Status

✅ **Email Service Implementation**: Complete and comprehensive
✅ **Email Functions**: All implemented in `backend/services/emailService.js`
✅ **Email Calls**: Properly integrated in controllers

❌ **Issue**: Emails are not being sent because Gmail credentials are not configured

## Email Notifications Currently Implemented

### 1. User Registration
- ✅ Admin notification email
- ✅ Welcome email to new user

### 2. Consultation Booking
- ✅ Admin notification email
- ✅ Client confirmation email
- ✅ Professional notification email

### 3. Consultation Status Updates
- ✅ Consultation accepted notification to client
- ✅ Consultation rescheduled notification to client
- ✅ Consultation cancelled notification to client
- ✅ Consultation cancelled notification to professional

### 4. Other Notifications
- ✅ Contact form submission to admin
- ✅ Auto-reply to contact form submitter
- ✅ Password reset email

## The Problem

The email credentials in `backend/.env` are placeholders:
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
CONTACT_EMAIL=yogmca@gmail.com
```

## Solution: Configure Gmail App Password

### Step 1: Enable 2-Step Verification

1. Go to: https://myaccount.google.com/security
2. Click on "2-Step Verification"
3. Follow the setup process to enable it
4. This is **required** before you can create an App Password

### Step 2: Generate Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. You may need to sign in again
3. Under "Select app", choose **"Mail"**
4. Under "Select device", choose **"Other (Custom name)"**
5. Enter: **"LegalIQ Backend Server"**
6. Click **"Generate"**
7. Google will show you a 16-character password like: `abcd efgh ijkl mnop`
8. **Copy this password** (you won't be able to see it again)

### Step 3: Update Environment Variables

Edit `backend/.env` file and update these lines:

```env
# Email Configuration for Contact Form
EMAIL_USER=yogmca@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
CONTACT_EMAIL=yogmca@gmail.com
```

**Important**: 
- Remove all spaces from the App Password
- Use the actual 16-character password, not your regular Gmail password
- Keep `CONTACT_EMAIL` as `yogmca@gmail.com` (this is where admin notifications go)

### Step 4: Restart the Backend Server

```bash
# Kill the current server
pkill -f "node server.js"

# Wait 2 seconds
sleep 2

# Start the server again
cd backend && node server.js
```

Or if using PM2:
```bash
pm2 restart all
```

## Testing Email Functionality

### Test 1: Check Email Configuration

Run this command to verify your email settings are loaded:

```bash
cd backend
node -e "require('dotenv').config(); console.log('EMAIL_USER:', process.env.EMAIL_USER); console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configured***' : 'NOT SET'); console.log('CONTACT_EMAIL:', process.env.CONTACT_EMAIL);"
```

Expected output:
```
EMAIL_USER: yogmca@gmail.com
EMAIL_PASSWORD: ***configured***
CONTACT_EMAIL: yogmca@gmail.com
```

### Test 2: Send Test Email

Create a test script:

```bash
cd backend
cat > test-email-notifications.js << 'EOF'
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
  } else {
    console.log('⚠️  Some email notifications failed.');
    console.log('💡 Common issues:');
    console.log('   1. Check EMAIL_PASSWORD is a Gmail App Password (not regular password)');
    console.log('   2. Verify 2-Step Verification is enabled on Gmail');
    console.log('   3. Check EMAIL_USER is correct');
    console.log('   4. Ensure no firewall is blocking port 587');
  }
  
  console.log('\n');
  process.exit(successCount === totalCount ? 0 : 1);
}

testAllEmails().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
EOF

node test-email-notifications.js
```

### Test 3: Real-World Testing

After configuring email credentials:

1. **Test User Registration**:
   - Register a new user on the platform
   - Check `yogmca@gmail.com` for admin notification
   - Check the new user's email for welcome message

2. **Test Consultation Booking**:
   - Book a consultation with a lawyer
   - Check `yogmca@gmail.com` for admin notification
   - Check client's email for booking confirmation
   - Check lawyer's email for booking notification

## Troubleshooting

### Issue: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solution**: You're using your regular Gmail password instead of an App Password
- Generate a new App Password (see Step 2 above)
- Update `EMAIL_PASSWORD` in `.env` with the 16-character App Password
- Restart the server

### Issue: "Error: getaddrinfo ENOTFOUND smtp.gmail.com"

**Solution**: Network/firewall issue
- Check your internet connection
- Verify firewall allows outbound connections on port 587
- Try using port 465 with secure: true in emailService.js

### Issue: Emails going to spam

**Solution**: 
- Add sender email to contacts
- Mark test emails as "Not Spam"
- For production, consider using a dedicated email service (SendGrid, AWS SES)

### Issue: "App Passwords" option not available

**Solution**: 
- Ensure 2-Step Verification is enabled first
- Wait a few minutes after enabling 2-Step Verification
- Try accessing from: https://myaccount.google.com/apppasswords

## Email Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├──► Admin Email (yogmca@gmail.com)
                            │    Subject: "🆕 New [Role] Registration"
                            │
                            └──► User Email (user's email)
                                 Subject: "Welcome to LegalIQ"

┌─────────────────────────────────────────────────────────────┐
│                 CONSULTATION BOOKING                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├──► Admin Email (yogmca@gmail.com)
                            │    Subject: "📅 New Consultation Booking"
                            │
                            ├──► Client Email
                            │    Subject: "✅ Consultation Booked Successfully"
                            │
                            └──► Professional Email
                                 Subject: "🔔 New Consultation Request"

┌─────────────────────────────────────────────────────────────┐
│              CONSULTATION STATUS UPDATES                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├──► Client Email (when accepted)
                            │    Subject: "✅ Consultation Confirmed"
                            │
                            ├──► Client Email (when rescheduled)
                            │    Subject: "📅 Consultation Rescheduled"
                            │
                            └──► Client Email (when cancelled)
                                 Subject: "❌ Consultation Cancelled"
```

## Production Recommendations

### 1. Use Dedicated Email Service

For production, consider using:
- **SendGrid** (99.9% deliverability, 100 emails/day free)
- **AWS SES** (62,000 emails/month free with EC2)
- **Mailgun** (5,000 emails/month free)

### 2. Set Up Email Monitoring

- Log all email attempts
- Track delivery rates
- Set up alerts for failures
- Monitor bounce rates

### 3. Implement Email Queue

For high-volume scenarios:
- Use Bull or RabbitMQ for email queuing
- Retry failed emails automatically
- Rate limit to avoid Gmail limits

### 4. Configure SPF/DKIM Records

If using custom domain:
- Add SPF record to DNS
- Configure DKIM signing
- Set up DMARC policy

## Quick Reference

### Email Service Methods

| Method | Purpose | Recipient |
|--------|---------|-----------|
| `sendNewUserNotification()` | New user registration | Admin |
| `sendWelcomeEmail()` | Welcome new user | User |
| `sendNewConsultationNotification()` | New consultation | Admin |
| `sendConsultationBookingToClient()` | Booking confirmation | Client |
| `sendConsultationBookingToProfessional()` | New booking request | Professional |
| `sendConsultationAcceptedToClient()` | Consultation accepted | Client |
| `sendConsultationRescheduledToClient()` | Consultation rescheduled | Client |
| `sendConsultationCancelledToClient()` | Consultation cancelled | Client |
| `sendConsultationCancelledToProfessional()` | Consultation cancelled | Professional |
| `sendContactEmail()` | Contact form submission | Admin |
| `sendAutoReply()` | Contact form auto-reply | User |
| `sendPasswordResetEmail()` | Password reset request | User |

### Environment Variables

```env
EMAIL_USER=yogmca@gmail.com           # Gmail account to send from
EMAIL_PASSWORD=abcdefghijklmnop       # 16-char App Password
CONTACT_EMAIL=yogmca@gmail.com        # Admin email for notifications
CLIENT_URL=http://localhost:5173      # Frontend URL for links
```

## Next Steps

1. ✅ Generate Gmail App Password
2. ✅ Update `backend/.env` with credentials
3. ✅ Restart backend server
4. ✅ Run test script
5. ✅ Test real user registration
6. ✅ Test real consultation booking
7. ✅ Monitor email delivery
8. ✅ Check spam folder if needed

---

**Last Updated**: April 22, 2026
**Status**: Ready for implementation
**Priority**: HIGH - Email notifications are critical for user experience
