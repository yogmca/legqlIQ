# Email Setup Checklist for LegalIQ

## ✅ Quick Setup Checklist

Follow these steps in order to get email notifications working:

### Step 1: Enable Gmail 2-Step Verification ⏱️ 2 minutes

- [ ] Go to https://myaccount.google.com/security
- [ ] Click "2-Step Verification"
- [ ] Follow the setup wizard
- [ ] Verify with your phone number
- [ ] Complete the setup

### Step 2: Generate Gmail App Password ⏱️ 1 minute

- [ ] Go to https://myaccount.google.com/apppasswords
- [ ] Sign in if prompted
- [ ] Select app: **Mail**
- [ ] Select device: **Other (Custom name)**
- [ ] Enter name: **LegalIQ Backend**
- [ ] Click **Generate**
- [ ] Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
- [ ] Save it somewhere safe (you won't see it again)

### Step 3: Update Environment Variables ⏱️ 1 minute

- [ ] Open `backend/.env` file
- [ ] Find the email configuration section (around line 86-90)
- [ ] Update these three lines:

```env
EMAIL_USER=yogmca@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
CONTACT_EMAIL=yogmca@gmail.com
```

**Important**: Remove all spaces from the App Password!

- [ ] Save the file

### Step 4: Restart Backend Server ⏱️ 30 seconds

Choose one method:

**Option A: If running directly**
```bash
pkill -f "node server.js" && sleep 2 && cd backend && node server.js
```

**Option B: If using PM2**
```bash
pm2 restart all
```

- [ ] Server restarted successfully

### Step 5: Test Email Notifications ⏱️ 2 minutes

- [ ] Run the test script:
```bash
cd backend
node test-email-notifications.js
```

- [ ] Wait for all tests to complete
- [ ] Check if all 8 tests passed ✅
- [ ] Check your email inbox at `yogmca@gmail.com`
- [ ] Check spam folder if emails not in inbox
- [ ] Verify you received 8 test emails

### Step 6: Test Real Scenarios ⏱️ 5 minutes

**Test User Registration:**
- [ ] Register a new user on the platform
- [ ] Admin receives notification at `yogmca@gmail.com`
- [ ] User receives welcome email

**Test Consultation Booking:**
- [ ] Book a consultation with a lawyer
- [ ] Admin receives booking notification
- [ ] Client receives booking confirmation
- [ ] Lawyer receives booking notification

## 🎯 Expected Results

After completing all steps, you should have:

✅ **8 test emails** in your inbox from the test script
✅ **Admin notifications** for all new registrations
✅ **Welcome emails** sent to new users
✅ **Booking confirmations** sent to clients
✅ **Booking notifications** sent to professionals
✅ **Status update emails** for consultation changes

## 📧 Email Types You'll Receive

| Email Type | Recipient | Subject Line |
|------------|-----------|--------------|
| User Registration | Admin | 🆕 New [Role] Registration - LegalIQ |
| Welcome Email | User | Welcome to LegalIQ - Your Account is Ready! |
| Consultation Booking | Admin | 📅 New Consultation Booking |
| Booking Confirmation | Client | ✅ Consultation Booked Successfully |
| Booking Notification | Professional | 🔔 New Consultation Request |
| Consultation Accepted | Client | ✅ Consultation Confirmed |
| Consultation Rescheduled | Client | 📅 Consultation Rescheduled |
| Consultation Cancelled | Client | ❌ Consultation Cancelled |
| Contact Form | Admin | LegalIQ Contact Form: [Subject] |
| Auto-Reply | User | Thank you for contacting LegalIQ |
| Password Reset | User | Password Reset Request - LegalIQ |

## ⚠️ Troubleshooting

### Problem: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solution**: You're using regular Gmail password instead of App Password
- [ ] Generate new App Password at https://myaccount.google.com/apppasswords
- [ ] Update `EMAIL_PASSWORD` in `.env` file
- [ ] Remove all spaces from the password
- [ ] Restart server

### Problem: "App Passwords" option not available

**Solution**: 2-Step Verification not enabled
- [ ] Enable 2-Step Verification first
- [ ] Wait 5 minutes
- [ ] Try accessing App Passwords again

### Problem: Emails going to spam folder

**Solution**: 
- [ ] Add `yogmca@gmail.com` to contacts
- [ ] Mark test emails as "Not Spam"
- [ ] Check Gmail filters/rules

### Problem: No emails received at all

**Solution**: Check configuration
- [ ] Verify `EMAIL_USER` is correct in `.env`
- [ ] Verify `EMAIL_PASSWORD` is the App Password (not regular password)
- [ ] Verify `CONTACT_EMAIL` is correct
- [ ] Check server logs for errors
- [ ] Run test script to see specific error messages

### Problem: Test script shows errors

**Solution**: Check the error message
- [ ] If "EAUTH": Wrong email or password
- [ ] If "ENOTFOUND": Network/firewall issue
- [ ] If "ETIMEDOUT": Firewall blocking port 587
- [ ] See detailed error in test output

## 🚀 Quick Commands

**Check email configuration:**
```bash
cd backend
node -e "require('dotenv').config(); console.log('EMAIL_USER:', process.env.EMAIL_USER); console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configured***' : 'NOT SET'); console.log('CONTACT_EMAIL:', process.env.CONTACT_EMAIL);"
```

**Run email tests:**
```bash
cd backend
node test-email-notifications.js
```

**Check server logs for email errors:**
```bash
# If using PM2
pm2 logs | grep -i email

# If running directly, check terminal output
```

**Restart server:**
```bash
# Direct
pkill -f "node server.js" && sleep 2 && cd backend && node server.js

# PM2
pm2 restart all
```

## 📝 Notes

- **Gmail Sending Limits**: 500 emails per day for regular accounts
- **App Password Security**: Keep it secret, never commit to Git
- **Production**: Consider using SendGrid, AWS SES, or Mailgun for better deliverability
- **Testing**: Always test in spam folder first
- **Monitoring**: Check server logs regularly for email failures

## ✨ Success Criteria

You'll know everything is working when:

1. ✅ Test script shows 8/8 tests passed
2. ✅ You receive all 8 test emails in your inbox
3. ✅ New user registration triggers 2 emails (admin + welcome)
4. ✅ Consultation booking triggers 3 emails (admin + client + professional)
5. ✅ No errors in server logs related to email

## 📞 Need Help?

If you're still having issues after following this checklist:

1. Check [`EMAIL_FIX_COMPLETE_GUIDE.md`](EMAIL_FIX_COMPLETE_GUIDE.md) for detailed troubleshooting
2. Review server logs for specific error messages
3. Verify Gmail account settings at https://myaccount.google.com/security
4. Test with a different Gmail account to rule out account-specific issues

---

**Estimated Total Time**: 10-15 minutes
**Difficulty**: Easy
**Prerequisites**: Gmail account with 2-Step Verification enabled
