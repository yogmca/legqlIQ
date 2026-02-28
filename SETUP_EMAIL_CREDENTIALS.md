# Setup Email Credentials for Notifications

## Current Issue

The email notifications are failing because the Gmail credentials are not properly configured in the `.env` file.

**Error:** `Username and Password not accepted`

## Quick Fix - Setup Gmail App Password

Follow these steps to configure email notifications:

### Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Under "How you sign in to Google", click **2-Step Verification**
4. Follow the prompts to enable 2-Step Verification if not already enabled

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
   - Or navigate: Google Account → Security → 2-Step Verification → App passwords
2. You may need to sign in again
3. Under "Select app", choose **Mail**
4. Under "Select device", choose **Other (Custom name)**
5. Enter a name like "LegalIQ Backend"
6. Click **Generate**
7. Google will show you a 16-character password (e.g., `abcd efgh ijkl mnop`)
8. **Copy this password** (you won't be able to see it again)

### Step 3: Update .env File

Open `karnataka-bar-association/backend/.env` and update these lines:

```env
# Email Configuration for Contact Form
EMAIL_USER=yogmca@gmail.com
EMAIL_PASSWORD=your-16-character-app-password-here
CONTACT_EMAIL=yogmca@gmail.com
```

**Replace:**
- `EMAIL_USER` with your Gmail address (e.g., yogmca@gmail.com)
- `EMAIL_PASSWORD` with the 16-character App Password (remove spaces)
- `CONTACT_EMAIL` is already set to yogmca@gmail.com (where notifications will be sent)

**Example:**
```env
EMAIL_USER=yogmca@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
CONTACT_EMAIL=yogmca@gmail.com
```

### Step 4: Restart Backend Server

After updating the `.env` file, restart the backend server:

```bash
# Kill the current server
lsof -ti:4000 | xargs kill -9

# Start the server again
cd karnataka-bar-association/backend && npm start
```

Or simply press `Ctrl+C` in the terminal running the backend and run `npm start` again.

## Testing

After setting up the credentials, test the email functionality:

### Test 1: Register a New User
1. Go to the registration page
2. Fill in the form and submit
3. Check yogmca@gmail.com for the registration notification email

### Test 2: Book a Consultation
1. Login as a client
2. Book a consultation with a lawyer
3. Check yogmca@gmail.com for the consultation booking notification email

## Troubleshooting

### "Username and Password not accepted"
- Make sure you're using an **App Password**, not your regular Gmail password
- Remove any spaces from the App Password
- Ensure 2-Step Verification is enabled on your Google Account

### "Less secure app access"
- You don't need to enable "Less secure app access"
- App Passwords are the secure way to authenticate

### Still not working?
1. Double-check the EMAIL_USER is correct
2. Regenerate a new App Password and try again
3. Make sure there are no extra spaces or quotes in the .env file
4. Check the backend server logs for specific error messages

## Alternative: Use Different Email Service

If you prefer not to use Gmail, you can configure other email services:

### Using Outlook/Hotmail
```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Using Custom SMTP
```env
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASSWORD=your-password
```

Then update `emailService.js` to use these settings instead of the hardcoded Gmail service.

## Security Notes

⚠️ **Important Security Reminders:**

1. **Never commit the `.env` file** to Git (it's already in `.gitignore`)
2. **Never share your App Password** publicly
3. **Rotate App Passwords** periodically for security
4. **Revoke unused App Passwords** from your Google Account settings
5. If the App Password is compromised, **revoke it immediately** and generate a new one

## What Happens After Setup

Once configured correctly, the system will automatically send emails to `yogmca@gmail.com` for:

✅ **New User Registrations** (both clients and lawyers)
✅ **New Consultation Bookings** (both in-person and video)
✅ **Contact Form Submissions** (already working)

All emails include:
- Professional HTML formatting
- Complete user/client information
- Timestamps in Indian Standard Time
- Clickable email and phone links

---

**Need Help?**

If you continue to experience issues after following these steps, check:
1. Backend server logs for detailed error messages
2. Gmail account security settings
3. That the .env file is in the correct location: `karnataka-bar-association/backend/.env`
