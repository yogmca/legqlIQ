# Fix Email Notifications for New User Registration

## Problem
Admin is not receiving email notifications when new users (like Santosh Gowda) register as lawyers.

## Root Cause
The email service is configured but the Gmail credentials in the `.env` file are placeholders:
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

## Solution: Update Email Configuration on AWS EC2

### Step 1: SSH into your EC2 instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 2: Navigate to backend directory
```bash
cd /path/to/karnataka-bar-association/backend
```

### Step 3: Edit the .env file
```bash
nano .env
```

### Step 4: Update Email Configuration
Find these lines (around line 86-90):
```env
# Email Configuration for Contact Form
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
CONTACT_EMAIL=yogmca@gmail.com
```

**Change to:**
```env
# Email Configuration for Contact Form
EMAIL_USER=yogmca@gmail.com
EMAIL_PASSWORD=YOUR_GMAIL_APP_PASSWORD_HERE
CONTACT_EMAIL=yogmca@gmail.com
```

### Step 5: Get Gmail App Password

1. **Enable 2-Step Verification** (if not already enabled):
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup process

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Other" as the device and name it "LegalIQ Backend"
   - Click "Generate"
   - Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

3. **Update .env file** with the app password (remove spaces):
   ```env
   EMAIL_PASSWORD=xxxxxxxxxxxxxxxx
   ```

### Step 6: Save and Exit
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

### Step 7: Restart the Backend Server

**Option A: If using PM2**
```bash
pm2 restart all
```

**Option B: If running directly**
```bash
# Kill the current process
pkill -f "node server.js"

# Start again
cd /path/to/karnataka-bar-association/backend
npm start
```

**Option C: If using systemd service**
```bash
sudo systemctl restart legaliq-backend
```

### Step 8: Test the Email Service

Create a test script to verify emails are working:

```bash
nano test-email.js
```

Paste this content:
```javascript
require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmail() {
  console.log('Testing email service...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('CONTACT_EMAIL:', process.env.CONTACT_EMAIL);
  
  try {
    // Test admin notification
    const result = await emailService.sendNewUserNotification({
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      role: 'lawyer',
      professionalType: 'lawyer'
    });
    console.log('Admin notification result:', result);
    
    // Test welcome email
    const welcomeResult = await emailService.sendWelcomeEmail(
      'yogmca@gmail.com',
      'Test User',
      'lawyer',
      'lawyer'
    );
    console.log('Welcome email result:', welcomeResult);
    
    console.log('✅ Email test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Email test failed:', error);
    process.exit(1);
  }
}

testEmail();
```

Run the test:
```bash
node test-email.js
```

### Step 9: Check Server Logs

Monitor the logs for email-related messages:
```bash
# If using PM2
pm2 logs

# If running directly, check the terminal output for:
# - "New user notification email sent successfully:"
# - "Welcome email sent successfully to:"
# - "Failed to send new user notification:"
# - "Failed to send welcome email:"
```

## Verification Checklist

- [ ] Gmail 2-Step Verification is enabled
- [ ] Gmail App Password is generated
- [ ] `.env` file updated with correct EMAIL_USER and EMAIL_PASSWORD
- [ ] Backend server restarted
- [ ] Test email script runs successfully
- [ ] Check spam folder for test emails

## Expected Behavior After Fix

When a new user registers:
1. **Admin receives email** at `yogmca@gmail.com` with subject: "🆕 New [Role] Registration - LegalIQ"
2. **User receives email** at their registered email with subject: "Welcome to LegalIQ - Your Account is Ready!"

## Troubleshooting

### Issue: "Invalid login" error
**Solution**: Make sure you're using an App Password, not your regular Gmail password

### Issue: "Less secure app access" error
**Solution**: Use App Password instead (Google deprecated less secure apps)

### Issue: Still not receiving emails
**Check:**
1. Spam/Junk folder
2. Gmail filters/rules
3. Server logs for specific error messages
4. Firewall blocking port 587 or 465

### Issue: Emails sent but not received
**Check:**
1. Email address is correct in CONTACT_EMAIL
2. Check Gmail's "Sent" folder to confirm emails were sent
3. Check recipient's spam folder

## Quick Fix Commands (Copy-Paste)

```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Navigate to backend
cd /path/to/karnataka-bar-association/backend

# Edit .env
nano .env

# After editing, restart server
pm2 restart all

# Check logs
pm2 logs --lines 100
```

## Email Service Code Reference

The email service sends two emails on registration:

1. **Admin Notification** (`authController.js` lines 47-55 and 308-309):
   - Function: `emailService.sendNewUserNotification()`
   - Recipient: `process.env.CONTACT_EMAIL`
   - Contains: User details, role, professional info

2. **User Welcome Email** (`authController.js` lines 57-63 and 312-317):
   - Function: `emailService.sendWelcomeEmail()`
   - Recipient: User's registered email
   - Contains: Welcome message, next steps, platform features

Both emails are sent asynchronously (non-blocking) so registration succeeds even if emails fail.

## Support

If you continue to have issues:
1. Check the server logs for specific error messages
2. Verify the Gmail account can send emails manually
3. Test with a different Gmail account
4. Consider using a dedicated email service like SendGrid or AWS SES for production
