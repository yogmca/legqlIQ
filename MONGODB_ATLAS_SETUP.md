# MongoDB Atlas Cloud Setup Guide

## Overview
This guide will help you migrate your local MongoDB database to MongoDB Atlas (cloud) for production deployment. MongoDB Atlas offers a **FREE tier (M0)** with 512MB storage - perfect for getting started!

---

## 📊 Current Local Data Export

Your local database has been exported to: `./mongodb-backup/legaliq/`

**Data Summary:**
- ✅ **1 user** (Google OAuth account)
- ✅ **0 consultations**
- ✅ **0 lawyers**

---

## Step 1: Create MongoDB Atlas Account (FREE)

### 1.1 Sign Up
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up using:
   - Email address
   - OR Google account (recommended - faster!)
   - OR GitHub account

### 1.2 Complete Registration
- No credit card required for free tier
- Verify your email if using email signup

---

## Step 2: Create a Free Cluster

### 2.1 Choose Deployment Type
1. After login, click **"Build a Database"** or **"Create"**
2. Select **"M0 FREE"** tier
   - 512MB storage
   - Shared RAM
   - Perfect for development and small production apps

### 2.2 Configure Cluster
1. **Cloud Provider**: Choose any (AWS, Google Cloud, or Azure)
2. **Region**: Choose closest to your users
   - For India: `Mumbai (ap-south-1)` or `Singapore (ap-southeast-1)`
   - For USA: `N. Virginia (us-east-1)` or `Oregon (us-west-2)`
3. **Cluster Name**: `LegalIQ` (or keep default)
4. Click **"Create Cluster"** (takes 1-3 minutes)

---

## Step 3: Configure Database Access

### 3.1 Create Database User
1. In left sidebar, click **"Database Access"** (under Security)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set credentials:
   ```
   Username: legaliq_admin
   Password: [Generate secure password or create your own]
   ```
   **⚠️ IMPORTANT: Save these credentials - you'll need them!**

5. **Database User Privileges**: Select **"Read and write to any database"**
6. Click **"Add User"**

### 3.2 Whitelist IP Address
1. In left sidebar, click **"Network Access"** (under Security)
2. Click **"Add IP Address"**
3. For development/testing:
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, restrict to specific IPs
4. Click **"Confirm"**

---

## Step 4: Get Connection String

### 4.1 Navigate to Database
1. In left sidebar, click **"Database"** (under Deployment)
2. Find your cluster (should show "Active" status)
3. Click **"Connect"** button

### 4.2 Choose Connection Method
1. Select **"Connect your application"**
2. **Driver**: Node.js
3. **Version**: 5.5 or later
4. Copy the connection string - it looks like:
   ```
   mongodb+srv://legaliq_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 4.3 Customize Connection String
Replace `<password>` with your actual password and add database name:
```
mongodb+srv://legaliq_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/legaliq?retryWrites=true&w=majority
```

**Example:**
```
mongodb+srv://legaliq_admin:MySecurePass123@cluster0.abc123.mongodb.net/legaliq?retryWrites=true&w=majority
```

---

## Step 5: Import Local Data to Atlas

### 5.1 Install MongoDB Database Tools (if not installed)
```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-database-tools

# Verify installation
mongorestore --version
```

### 5.2 Import Data
Run this command from your project directory:

```bash
mongorestore \
  --uri="mongodb+srv://legaliq_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/legaliq" \
  ./mongodb-backup/legaliq
```

**Replace:**
- `YOUR_PASSWORD` with your database user password
- `cluster0.xxxxx.mongodb.net` with your actual cluster URL

**Expected Output:**
```
2026-02-18T22:16:55.227-0800	preparing collections to restore from
2026-02-18T22:16:55.227-0800	reading metadata for legaliq.users from mongodb-backup/legaliq/users.metadata.json
2026-02-18T22:16:55.227-0800	restoring legaliq.users from mongodb-backup/legaliq/users.bson
2026-02-18T22:16:55.236-0800	finished restoring legaliq.users (1 document, 0 failures)
2026-02-18T22:16:55.258-0800	1 document(s) restored successfully. 0 document(s) failed to restore.
```

---

## Step 6: Update Backend Configuration

### 6.1 Update `.env` File
Open `backend/.env` and update the MongoDB connection string:

```env
# MongoDB Atlas Cloud Connection
MONGODB_URI=mongodb+srv://legaliq_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/legaliq?retryWrites=true&w=majority

# Keep other variables the same
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=4000
FRONTEND_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
```

### 6.2 Restart Backend Server
```bash
cd karnataka-bar-association/backend
npm start
```

You should see:
```
✅ MongoDB Atlas Connected Successfully
🚀 Server running on port 4000
```

---

## Step 7: Verify Cloud Database

### 7.1 Check in MongoDB Atlas UI
1. Go to **"Database"** → **"Browse Collections"**
2. You should see:
   - Database: `legaliq`
   - Collections: `users`, `consultations`, `lawyers`
   - 1 document in `users` collection

### 7.2 Test Application
1. Open your app: http://localhost:5173
2. Try logging in with Google OAuth
3. The app should now be using the cloud database!

---

## 🎉 Benefits of MongoDB Atlas

### ✅ Advantages
- **Always Available**: 99.995% uptime SLA
- **Automatic Backups**: Point-in-time recovery
- **Scalability**: Easy to upgrade as you grow
- **Security**: Built-in encryption and authentication
- **Monitoring**: Real-time performance metrics
- **Global**: Deploy in multiple regions

### 💰 Free Tier Limits (M0)
- **Storage**: 512MB
- **RAM**: Shared
- **Connections**: 500 concurrent
- **Backup**: Manual only (no automatic backups)
- **Perfect for**: Development, testing, small production apps

---

## 🔒 Security Best Practices

### For Production Deployment:

1. **Strong Password**: Use complex database password
   ```bash
   # Generate secure password
   openssl rand -base64 32
   ```

2. **IP Whitelist**: Restrict to specific IPs
   - Add your AWS EC2 instance IP
   - Remove "Allow from Anywhere" (0.0.0.0/0)

3. **Environment Variables**: Never commit `.env` to Git
   ```bash
   # Add to .gitignore
   echo "backend/.env" >> .gitignore
   ```

4. **Separate Databases**: Use different databases for dev/prod
   - Development: `legaliq-dev`
   - Production: `legaliq-prod`

---

## 📈 Monitoring Your Database

### Atlas Dashboard Features:
1. **Metrics**: View real-time performance
2. **Alerts**: Set up email notifications
3. **Logs**: Access database logs
4. **Profiler**: Analyze slow queries

### Access Monitoring:
1. Go to your cluster
2. Click **"Metrics"** tab
3. View:
   - Operations per second
   - Network traffic
   - Connections
   - Storage usage

---

## 🚀 Next Steps After Migration

### 1. Update Google OAuth Redirect URIs
When deploying to production, add your production URL:
```
https://your-domain.com/api/auth/google/callback
```

### 2. Deploy to AWS EC2
Follow the `AWS_DEPLOYMENT_GUIDE.md` with your new Atlas connection string

### 3. Set Production Environment Variables
```env
MONGODB_URI=mongodb+srv://legaliq_admin:PROD_PASSWORD@cluster0.xxxxx.mongodb.net/legaliq-prod
FRONTEND_URL=https://your-domain.com
GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback
JWT_SECRET=[Generate new secure secret]
```

### 4. Enable Automatic Backups (Paid Tiers)
- Upgrade to M10+ for automatic backups
- Configure backup schedule
- Set retention policy

---

## 🛠️ Troubleshooting

### Issue: "Authentication failed"
**Solution**: Double-check username and password in connection string

### Issue: "Connection timeout"
**Solution**: 
- Verify IP whitelist includes your IP
- Check if cluster is "Active" status
- Wait 1-3 minutes after creating cluster

### Issue: "Database not found"
**Solution**: 
- Ensure database name is in connection string: `/legaliq?`
- MongoDB creates database automatically on first write

### Issue: "Too many connections"
**Solution**:
- Free tier limit: 500 connections
- Check for connection leaks in code
- Implement connection pooling (already configured in Mongoose)

### Issue: "mongorestore command not found"
**Solution**:
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-database-tools

# Verify
mongorestore --version
```

---

## 📚 Additional Resources

- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Connection String Format**: https://docs.mongodb.com/manual/reference/connection-string/
- **Security Checklist**: https://docs.atlas.mongodb.com/security-checklist/
- **Pricing**: https://www.mongodb.com/pricing

---

## 💡 Quick Reference Commands

### Export from Local MongoDB
```bash
mongodump --db=legaliq --out=./mongodb-backup
```

### Import to MongoDB Atlas
```bash
mongorestore \
  --uri="mongodb+srv://user:pass@cluster.mongodb.net/legaliq" \
  ./mongodb-backup/legaliq
```

### Test Connection
```bash
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/legaliq"
```

### View Collections
```javascript
// In mongosh
show dbs
use legaliq
show collections
db.users.countDocuments()
```

---

## ✅ Migration Checklist

- [ ] Create MongoDB Atlas account
- [ ] Create M0 free cluster
- [ ] Create database user with password
- [ ] Whitelist IP address (0.0.0.0/0 for testing)
- [ ] Get connection string
- [ ] Run mongorestore command
- [ ] Update backend/.env with Atlas URI
- [ ] Restart backend server
- [ ] Verify connection in Atlas UI
- [ ] Test login functionality
- [ ] Update Google OAuth redirect URIs for production
- [ ] Restrict IP whitelist for production

---

**🎯 You're Ready!** Follow the steps above to migrate your LegalIQ database to the cloud. The entire process takes about 10-15 minutes.
