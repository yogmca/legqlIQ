# Migrate Local MongoDB to MongoDB Atlas Cloud

Complete guide to move your LegalIQ database from local MongoDB to MongoDB Atlas (cloud).

## 🎯 Overview

**What we'll do:**
1. Create FREE MongoDB Atlas account
2. Set up cloud database
3. Export data from local MongoDB
4. Import data to MongoDB Atlas
5. Update your application to use cloud database

**Time**: ~20 minutes  
**Cost**: FREE (forever with M0 tier)

---

## Part 1: Create MongoDB Atlas Account (5 minutes)

### Step 1: Sign Up

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Fill in details:
   - Email address
   - First name, Last name
   - Password
3. Click "Create your Atlas account"
4. Verify your email

### Step 2: Create Organization

1. After email verification, login
2. Organization name: `LegalIQ`
3. Project name: `LegalIQ Production`
4. Click "Next"

### Step 3: Create FREE Cluster

1. Click "Build a Database"
2. Choose **M0 FREE** tier
3. Configure:
   ```
   Cloud Provider: AWS
   Region: Choose closest to you
          - For India: Mumbai (ap-south-1)
          - For US: N. Virginia (us-east-1)
   
   Cluster Name: LegalIQ-Cluster
   ```
4. Click "Create Cluster"
5. Wait 3-5 minutes for cluster creation

---

## Part 2: Configure Database Access (3 minutes)

### Step 1: Create Database User

1. Click "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Configure:
   ```
   Authentication Method: Password
   Username: legaliq-admin
   Password: Click "Autogenerate Secure Password"
   
   IMPORTANT: Copy and save this password!
   Example: aB3dE5fG7hI9jK
   ```
4. Database User Privileges: "Read and write to any database"
5. Click "Add User"

### Step 2: Whitelist IP Addresses

1. Click "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Choose one:
   
   **Option A: Allow from anywhere** (easier for development)
   ```
   Click "Allow Access from Anywhere"
   IP Address: 0.0.0.0/0
   ```
   
   **Option B: Specific IPs** (more secure)
   ```
   Add your current IP
   Add your AWS EC2 IP (when you deploy)
   ```
4. Click "Confirm"

---

## Part 3: Get Connection String (2 minutes)

### Step 1: Get Connection URL

1. Click "Database" (left sidebar)
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. Driver: Node.js
5. Version: 5.5 or later
6. Copy the connection string:
   ```
   mongodb+srv://legaliq-admin:<password>@legaliq-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 2: Format Connection String

Replace `<password>` with your actual password:
```
Before:
mongodb+srv://legaliq-admin:<password>@legaliq-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority

After (example):
mongodb+srv://legaliq-admin:aB3dE5fG7hI9jK@legaliq-cluster.xxxxx.mongodb.net/legaliq?retryWrites=true&w=majority
```

**IMPORTANT**: Add `/legaliq` before the `?` to specify database name!

---

## Part 4: Export Local MongoDB Data (5 minutes)

### Step 1: Check What Data You Have

```bash
# Connect to local MongoDB
mongosh

# List databases
show dbs

# Use legaliq database
use legaliq

# List collections
show collections

# Count documents in each collection
db.users.countDocuments()
db.consultations.countDocuments()
db.lawyers.countDocuments()

# Exit
exit
```

### Step 2: Export Data

```bash
# Export entire database
mongodump --db=legaliq --out=./mongodb-backup

# This creates a folder: mongodb-backup/legaliq/
# Contains all your collections as .bson files
```

**Alternative: Export specific collections**
```bash
# Export only users
mongoexport --db=legaliq --collection=users --out=users.json

# Export consultations
mongoexport --db=legaliq --collection=consultations --out=consultations.json

# Export lawyers
mongoexport --db=legaliq --collection=lawyers --out=lawyers.json
```

---

## Part 5: Import Data to MongoDB Atlas (5 minutes)

### Method 1: Using mongorestore (Recommended)

```bash
# Import entire database
mongorestore --uri="mongodb+srv://legaliq-admin:aB3dE5fG7hI9jK@legaliq-cluster.xxxxx.mongodb.net/legaliq" ./mongodb-backup/legaliq

# Replace with YOUR connection string!
```

### Method 2: Using mongoimport (For JSON exports)

```bash
# Import users
mongoimport --uri="mongodb+srv://legaliq-admin:aB3dE5fG7hI9jK@legaliq-cluster.xxxxx.mongodb.net/legaliq" --collection=users --file=users.json

# Import consultations
mongoimport --uri="mongodb+srv://legaliq-admin:aB3dE5fG7hI9jK@legaliq-cluster.xxxxx.mongodb.net/legaliq" --collection=consultations --file=consultations.json

# Import lawyers
mongoimport --uri="mongodb+srv://legaliq-admin:aB3dE5fG7hI9jK@legaliq-cluster.xxxxx.mongodb.net/legaliq" --collection=lawyers --file=lawyers.json
```

### Method 3: Using MongoDB Compass (GUI)

1. Download MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Install and open
3. Connect to Atlas:
   - Paste your connection string
   - Click "Connect"
4. Select `legaliq` database
5. For each collection:
   - Click "Add Data" > "Import File"
   - Select your .json file
   - Click "Import"

---

## Part 6: Verify Data Migration

### Step 1: Check in MongoDB Atlas

1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections"
3. Select `legaliq` database
4. Verify collections:
   - users
   - consultations
   - lawyers
5. Check document counts match your local database

### Step 2: Test Connection from Your App

```bash
# On your Mac
cd karnataka-bar-association/backend

# Create test script
nano test-atlas.js
```

Paste this:
```javascript
const mongoose = require('mongoose');

const ATLAS_URI = 'mongodb+srv://legaliq-admin:aB3dE5fG7hI9jK@legaliq-cluster.xxxxx.mongodb.net/legaliq?retryWrites=true&w=majority';

mongoose.connect(ATLAS_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas!');
    
    // Count documents
    const User = mongoose.model('User', new mongoose.Schema({}), 'users');
    const count = await User.countDocuments();
    console.log(`📊 Users in database: ${count}`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err);
    process.exit(1);
  });
```

Run test:
```bash
node test-atlas.js
```

Should see:
```
✅ Connected to MongoDB Atlas!
📊 Users in database: X
```

---

## Part 7: Update Your Application

### Step 1: Update Local Development

```bash
# Edit backend/.env
cd karnataka-bar-association/backend
nano .env
```

Update MongoDB URI:
```env
# OLD (local):
# MONGODB_URI=mongodb://localhost:27017/legaliq

# NEW (Atlas):
MONGODB_URI=mongodb+srv://legaliq-admin:aB3dE5fG7hI9jK@legaliq-cluster.xxxxx.mongodb.net/legaliq?retryWrites=true&w=majority
```

Save and exit.

### Step 2: Restart Backend

```bash
# Stop current backend (Ctrl+C in terminal)

# Start again
npm start
```

Should see:
```
✅ MongoDB connected successfully
Backend server running on http://localhost:4000
```

### Step 3: Test Your Application

1. Open http://localhost:5173
2. Try logging in
3. Try creating a consultation
4. Check if data is saved

### Step 4: Verify in Atlas

1. Go to MongoDB Atlas
2. Click "Browse Collections"
3. Check if new data appears

---

## Part 8: Production Deployment

### Update Production .env

When deploying to AWS, use the same Atlas connection string:

```env
# In production backend/.env
MONGODB_URI=mongodb+srv://legaliq-admin:aB3dE5fG7hI9jK@legaliq-cluster.xxxxx.mongodb.net/legaliq?retryWrites=true&w=majority
```

**Benefits:**
- ✅ Same database for development and production
- ✅ No need to migrate data again
- ✅ Automatic backups
- ✅ Better performance
- ✅ Free forever (M0 tier)

---

## 🔒 Security Best Practices

### 1. Use Environment Variables

Never hardcode connection string in code:
```javascript
// ❌ BAD
mongoose.connect('mongodb+srv://user:pass@...');

// ✅ GOOD
mongoose.connect(process.env.MONGODB_URI);
```

### 2. Rotate Passwords Regularly

1. Go to Database Access
2. Click "Edit" on user
3. Click "Edit Password"
4. Generate new password
5. Update .env file

### 3. Restrict IP Access

For production:
1. Go to Network Access
2. Remove "0.0.0.0/0"
3. Add only your AWS EC2 IP

### 4. Enable Backup

1. Go to your cluster
2. Click "..." > "Edit Configuration"
3. Enable "Continuous Backup" (paid feature)
4. Or use free snapshots

---

## 📊 MongoDB Atlas Features

### Free Tier (M0) Includes:

- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Shared vCPU
- ✅ No credit card required
- ✅ Free forever
- ✅ Automatic backups (limited)
- ✅ SSL encryption
- ✅ 99.9% uptime SLA

### Monitoring

1. Go to "Metrics" tab
2. View:
   - Connections
   - Operations per second
   - Network traffic
   - Storage usage

### Alerts

1. Go to "Alerts" tab
2. Set up alerts for:
   - High connections
   - Storage usage
   - Performance issues

---

## 🔧 Troubleshooting

### Connection Timeout

**Problem**: Can't connect to Atlas

**Solutions**:
```bash
# 1. Check IP whitelist
# Go to Network Access, ensure your IP is allowed

# 2. Check connection string
# Ensure password is correct (no special characters issues)

# 3. Test with mongosh
mongosh "mongodb+srv://legaliq-admin:PASSWORD@cluster.mongodb.net/legaliq"
```

### Authentication Failed

**Problem**: Wrong username/password

**Solution**:
1. Go to Database Access
2. Reset password
3. Update .env file

### Import Failed

**Problem**: mongorestore not found

**Solution**:
```bash
# Install MongoDB Database Tools
# Mac:
brew install mongodb-database-tools

# Linux:
sudo apt install mongodb-database-tools

# Windows:
# Download from: https://www.mongodb.com/try/download/database-tools
```

---

## 📋 Quick Reference

### Connection Strings

**Local MongoDB**:
```
mongodb://localhost:27017/legaliq
```

**MongoDB Atlas**:
```
mongodb+srv://username:password@cluster.mongodb.net/legaliq?retryWrites=true&w=majority
```

### Common Commands

```bash
# Export local database
mongodump --db=legaliq --out=./backup

# Import to Atlas
mongorestore --uri="ATLAS_URI" ./backup/legaliq

# Test connection
mongosh "ATLAS_URI"

# Check collections
mongosh "ATLAS_URI" --eval "db.getCollectionNames()"
```

---

## ✅ Migration Checklist

- [ ] Create MongoDB Atlas account
- [ ] Create M0 free cluster
- [ ] Create database user
- [ ] Whitelist IP addresses
- [ ] Get connection string
- [ ] Export local data
- [ ] Import to Atlas
- [ ] Verify data in Atlas
- [ ] Update backend/.env
- [ ] Test application locally
- [ ] Update production .env
- [ ] Deploy to AWS

---

**Your local MongoDB data is now in the cloud and accessible from anywhere!** 🎉

**Benefits:**
- ✅ Access from development and production
- ✅ Automatic backups
- ✅ Better performance
- ✅ Free forever
- ✅ No server maintenance
