# How to Get Google OAuth Credentials - Step by Step Guide

## Quick Answer

**Yes! Once you set up Google OAuth credentials, ANY user with a Gmail account can log in to your application.** You only need to set this up ONCE as the application owner/developer.

## Understanding Google OAuth

### What You're Setting Up
- **You (Developer)**: Create ONE set of credentials for your LegalIQ application
- **Your Users**: Can log in with ANY Gmail account (their personal Gmail)
- **Google's Role**: Verifies the user's identity and sends their profile to your app

### Analogy
Think of it like a building with a security system:
- **You**: Install ONE security system (OAuth credentials) at the entrance
- **Your Users**: Each person uses their own key card (Gmail account) to enter
- **Security System**: Verifies each person's key card and lets them in

## Step-by-Step: Getting Your Credentials

### Step 1: Go to Google Cloud Console

1. Open your browser and go to: **https://console.cloud.google.com/**
2. Sign in with YOUR Google account (the developer account)

### Step 2: Create a New Project

```
1. Click the project dropdown at the top (says "Select a project")
2. Click "NEW PROJECT" button
3. Enter details:
   - Project name: LegalIQ
   - Organization: (leave as default or select if you have one)
4. Click "CREATE"
5. Wait 10-30 seconds for project creation
6. Select your new "LegalIQ" project from the dropdown
```

### Step 3: Enable Google+ API

```
1. In the left sidebar, click "APIs & Services" > "Library"
2. In the search box, type: "Google+ API"
3. Click on "Google+ API" from results
4. Click the blue "ENABLE" button
5. Wait for it to enable (takes a few seconds)
```

**Alternative**: You can also enable "Google Identity Services" which is the newer API.

### Step 4: Configure OAuth Consent Screen

This is what users see when they click "Continue with Google"

```
1. Go to "APIs & Services" > "OAuth consent screen" (left sidebar)
2. Select "External" (allows anyone with Gmail to log in)
3. Click "CREATE"

4. Fill in App Information:
   ┌─────────────────────────────────────────────┐
   │ App name: LegalIQ                           │
   │ User support email: your-email@gmail.com    │
   │ App logo: (optional - upload if you have)   │
   └─────────────────────────────────────────────┘

5. Fill in App Domain (optional for testing):
   ┌─────────────────────────────────────────────┐
   │ Application home page: http://localhost:5173│
   │ (leave others blank for now)                │
   └─────────────────────────────────────────────┘

6. Developer contact information:
   ┌─────────────────────────────────────────────┐
   │ Email: your-email@gmail.com                 │
   └─────────────────────────────────────────────┘

7. Click "SAVE AND CONTINUE"

8. On Scopes page:
   - Click "ADD OR REMOVE SCOPES"
   - Check these boxes:
     ☑ .../auth/userinfo.email
     ☑ .../auth/userinfo.profile
   - Click "UPDATE"
   - Click "SAVE AND CONTINUE"

9. On Test users page:
   - For testing mode, add your email
   - Click "ADD USERS"
   - Enter: your-email@gmail.com
   - Click "ADD"
   - Click "SAVE AND CONTINUE"

10. Review and click "BACK TO DASHBOARD"
```

### Step 5: Create OAuth 2.0 Credentials (THE IMPORTANT PART!)

```
1. Go to "APIs & Services" > "Credentials" (left sidebar)

2. Click "CREATE CREDENTIALS" at the top
   └─> Select "OAuth 2.0 Client ID"

3. Configure OAuth client:
   
   Application type: Web application
   
   Name: LegalIQ Web Client
   
   Authorized JavaScript origins:
   ┌─────────────────────────────────────────────┐
   │ Click "ADD URI"                             │
   │ Enter: http://localhost:5173                │
   │                                             │
   │ (For production, add: https://yourdomain.com)│
   └─────────────────────────────────────────────┘
   
   Authorized redirect URIs:
   ┌─────────────────────────────────────────────┐
   │ Click "ADD URI"                             │
   │ Enter: http://localhost:4000/api/auth/google/callback │
   │                                             │
   │ (For production, add:                       │
   │  https://api.yourdomain.com/api/auth/google/callback) │
   └─────────────────────────────────────────────┘

4. Click "CREATE"
```

### Step 6: Copy Your Credentials

A popup will appear with your credentials:

```
┌──────────────────────────────────────────────────────────┐
│  OAuth client created                                    │
│                                                          │
│  Your Client ID                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 123456789-abcdefghijk.apps.googleusercontent.com   │ │
│  │                                          [Copy]     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Your Client Secret                                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │ GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ                  │ │
│  │                                          [Copy]     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│                                    [OK]                  │
└──────────────────────────────────────────────────────────┘
```

**IMPORTANT**: 
- Click the [Copy] button for Client ID
- Click the [Copy] button for Client Secret
- Save these somewhere safe (you'll need them in the next step)

### Step 7: Add Credentials to Your Application

1. Open your project folder: `karnataka-bar-association/backend/.env`

2. Replace the placeholder values:

```env
# BEFORE (placeholders):
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# AFTER (your actual credentials):
GOOGLE_CLIENT_ID=123456789-abcdefghijk.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

3. Save the file

### Step 8: Restart Your Backend Server

```bash
# Stop the current backend (Ctrl+C in the terminal)

# Start it again
cd karnataka-bar-association/backend
npm start
```

### Step 9: Test It!

1. Open your browser: `http://localhost:5173/login`
2. Click "Continue with Google"
3. You'll see Google's login page
4. Sign in with ANY Gmail account
5. Grant permissions to LegalIQ
6. You'll be redirected back and logged in!

## Common Questions

### Q1: Do I need to create credentials for each user?
**No!** You create credentials ONCE. Then ANY user with a Gmail account can log in.

### Q2: Can users with any Gmail account log in?
**Yes!** Once you set up OAuth:
- john@gmail.com can log in ✅
- sarah@gmail.com can log in ✅
- anyone@gmail.com can log in ✅

### Q3: What if I see "This app isn't verified"?
During development, Google shows this warning. Click "Advanced" → "Go to LegalIQ (unsafe)" to continue testing.

To remove this warning in production:
1. Go to OAuth consent screen
2. Click "PUBLISH APP"
3. Submit for verification (takes 1-2 weeks)

### Q4: What's the difference between "Internal" and "External"?
- **Internal**: Only users in your Google Workspace organization can log in
- **External**: Anyone with a Gmail account can log in (what you want!)

### Q5: Do I need to add test users?
- **Testing mode**: Yes, add specific Gmail addresses
- **Production mode**: No, anyone can log in after you publish the app

### Q6: Can I use this in production?
Yes! Just update the URLs in Google Console:
```
Authorized JavaScript origins:
  https://yourdomain.com

Authorized redirect URIs:
  https://api.yourdomain.com/api/auth/google/callback
```

And update your `.env` file:
```env
CLIENT_URL=https://yourdomain.com
SERVER_URL=https://api.yourdomain.com
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback
```

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    HOW IT WORKS                             │
└─────────────────────────────────────────────────────────────┘

Developer (You) - ONE TIME SETUP:
┌──────────────────────────────────────┐
│ 1. Create Google Cloud Project      │
│ 2. Get Client ID & Secret            │
│ 3. Add to backend/.env               │
└──────────────────────────────────────┘
                 ↓
         Setup Complete!
                 ↓
┌──────────────────────────────────────────────────────────┐
│              NOW ANY USER CAN LOG IN:                    │
└──────────────────────────────────────────────────────────┘

User 1 (john@gmail.com):
  Click "Continue with Google" → Signs in → Logged in! ✅

User 2 (sarah@gmail.com):
  Click "Continue with Google" → Signs in → Logged in! ✅

User 3 (anyone@gmail.com):
  Click "Continue with Google" → Signs in → Logged in! ✅
```

## What Gets Stored in Your Database

When a user logs in with Google, your app stores:

```javascript
{
  googleId: "1234567890",              // Google's unique ID for this user
  name: "John Doe",                    // From their Google profile
  email: "john@gmail.com",             // From their Google account
  profilePicture: "https://...",       // Their Google profile picture
  isVerified: true,                    // Google accounts are pre-verified
  role: "user",                        // Your app's role system
  createdAt: "2026-02-19T05:00:00Z"   // When they first logged in
}
```

## Security Notes

✅ **Safe to share**: Client ID (it's public)
❌ **Never share**: Client Secret (keep it secret!)
❌ **Never commit**: `.env` file to Git

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Problem**: The callback URL doesn't match.

**Solution**: 
1. Check Google Console → Credentials → Your OAuth Client
2. Verify redirect URI is exactly: `http://localhost:4000/api/auth/google/callback`
3. No trailing slash, exact match required

### Error: "invalid_client"
**Problem**: Client ID or Secret is wrong.

**Solution**:
1. Go to Google Console → Credentials
2. Click on your OAuth client
3. Copy the Client ID and Secret again
4. Update `backend/.env`
5. Restart backend server

### Can't find the credentials
**Solution**:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Make sure you're in the correct project (check dropdown at top)
3. Look for "OAuth 2.0 Client IDs" section
4. Click on your client name to see credentials

## Need Help?

If you get stuck:
1. Check the error message in browser console (F12)
2. Check backend terminal for error logs
3. Verify all URLs match exactly (no typos)
4. Make sure MongoDB is running
5. Restart both frontend and backend servers

---

**Remember**: You set this up ONCE, and then EVERYONE with a Gmail account can use it to log in to your LegalIQ application!
