# Google OAuth 2.0 Setup Guide for LegalIQ

This guide will walk you through setting up Google OAuth 2.0 authentication for the LegalIQ application.

## Prerequisites

- Google Account
- LegalIQ application running locally or deployed

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: `LegalIQ` (or your preferred name)
5. Click "Create"
6. Wait for the project to be created and select it

## Step 2: Enable Google+ API (or Google Identity Services)

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google+ API" or "Google Identity Services"
3. Click on it and press **Enable**
4. Wait for the API to be enabled

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type (unless you have a Google Workspace)
3. Click **Create**
4. Fill in the required information:
   - **App name**: LegalIQ
   - **User support email**: Your email
   - **App logo**: (Optional) Upload LegalIQ logo
   - **Application home page**: Your frontend URL
   - **Authorized domains**: Add your domain (e.g., `localhost` for development)
   - **Developer contact information**: Your email
5. Click **Save and Continue**
6. On the **Scopes** page, click **Add or Remove Scopes**
7. Add these scopes:
   - `userinfo.email`
   - `userinfo.profile`
8. Click **Update** and then **Save and Continue**
9. On **Test users** page (if in testing mode), add your email for testing
10. Click **Save and Continue**
11. Review and click **Back to Dashboard**

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Select **Application type**: Web application
4. Enter **Name**: LegalIQ Web Client
5. Add **Authorized JavaScript origins**:
   - For local development: `http://localhost:5173`
   - For production: `https://yourdomain.com`
6. Add **Authorized redirect URIs**:
   - For local development: `http://localhost:4000/api/auth/google/callback`
   - For production: `https://api.yourdomain.com/api/auth/google/callback`
7. Click **Create**
8. A dialog will appear with your **Client ID** and **Client Secret**
9. **IMPORTANT**: Copy both values immediately

## Step 5: Configure Backend Environment Variables

1. Open `karnataka-bar-association/backend/.env`
2. Update the following variables with your credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-client-id-from-google-console
GOOGLE_CLIENT_SECRET=your-actual-client-secret-from-google-console
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
```

3. For production deployment, update these URLs:

```env
# Production Configuration
CLIENT_URL=https://yourdomain.com
SERVER_URL=https://api.yourdomain.com
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback
```

## Step 6: Update Frontend Environment Variables

1. Open `karnataka-bar-association/.env`
2. Ensure the API URL is correct:

```env
# For local development
VITE_API_URL=http://localhost:4000/api

# For production
VITE_API_URL=https://api.yourdomain.com/api
```

## Step 7: Restart the Application

1. Stop the backend server (Ctrl+C in the terminal)
2. Restart the backend:
   ```bash
   cd karnataka-bar-association/backend
   npm start
   ```
3. The frontend should automatically reload

## Step 8: Test Google OAuth Login

1. Open your browser and go to `http://localhost:5173/login`
2. Click the "Continue with Google" button
3. You should be redirected to Google's login page
4. Sign in with your Google account
5. Grant permissions to LegalIQ
6. You should be redirected back to the application and logged in

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem**: The redirect URI doesn't match what's configured in Google Console.

**Solution**: 
- Check that `GOOGLE_CALLBACK_URL` in `.env` exactly matches the redirect URI in Google Console
- Ensure there are no trailing slashes
- Verify the protocol (http vs https)

### Error: "invalid_client"

**Problem**: Client ID or Client Secret is incorrect.

**Solution**:
- Double-check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Ensure there are no extra spaces or quotes
- Regenerate credentials if necessary

### Error: "access_denied"

**Problem**: User denied permission or app is not verified.

**Solution**:
- If in testing mode, ensure your email is added to test users
- Check OAuth consent screen configuration
- Verify required scopes are added

### Error: "User not found after OAuth"

**Problem**: User creation failed in database.

**Solution**:
- Check MongoDB connection
- Verify User model has `googleId` field
- Check backend logs for detailed error messages

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different credentials** for development and production
3. **Rotate secrets regularly** in production
4. **Enable 2FA** on your Google Cloud account
5. **Monitor OAuth usage** in Google Cloud Console
6. **Set up proper CORS** policies for production
7. **Use HTTPS** in production (required by Google)

## Production Deployment Checklist

- [ ] Update OAuth consent screen with production URLs
- [ ] Add production redirect URIs to Google Console
- [ ] Update all environment variables with production values
- [ ] Enable HTTPS on your server
- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique secrets for JWT and session
- [ ] Set up MongoDB Atlas or production database
- [ ] Configure proper CORS origins
- [ ] Test OAuth flow in production environment
- [ ] Monitor error logs and OAuth metrics

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [MongoDB User Authentication](https://www.mongodb.com/docs/manual/core/authentication/)

## Support

If you encounter issues:
1. Check the backend console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check Google Cloud Console for API quotas and errors
5. Review the OAuth consent screen status

## Architecture Overview

```
User clicks "Continue with Google"
    ↓
Frontend redirects to: /api/auth/google
    ↓
Backend redirects to: Google OAuth consent page
    ↓
User grants permissions
    ↓
Google redirects to: /api/auth/google/callback
    ↓
Backend receives user profile from Google
    ↓
Backend finds or creates user in MongoDB
    ↓
Backend generates JWT token
    ↓
Backend redirects to: Frontend with token in URL
    ↓
Frontend extracts token and fetches user profile
    ↓
User is logged in
```

## Files Modified for Google OAuth

### Backend
- `backend/config/passport.js` - Passport Google OAuth strategy
- `backend/routes/authRoutes.js` - OAuth routes
- `backend/models/User.js` - Added `googleId` field
- `backend/server.js` - Passport middleware integration
- `backend/.env` - OAuth credentials

### Frontend
- `src/components/Login.jsx` - Google login button and callback handling
- `.env` - API URL configuration

---

**Last Updated**: 2026-02-19
**Version**: 1.0.0
