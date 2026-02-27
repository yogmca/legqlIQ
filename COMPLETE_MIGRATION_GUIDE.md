# Complete Guide: Extract Local DB Tables & Create in Cloud

## 🎯 Goal
Extract all your local MongoDB collections (tables) and recreate them in MongoDB Atlas cloud.

---

## ✅ Step 1: Extract Local Database (COMPLETED)

You've already done this! Your data is exported to: `./mongodb-backup/legaliq/`

### What Was Extracted:
```bash
✅ users collection         → 1 document (390 bytes)
✅ consultations collection → 0 documents (empty)
✅ lawyers collection       → 0 documents (empty)
```

### Verification:
```bash
# View exported files
ls -lh mongodb-backup/legaliq/

# Output shows:
# - users.bson (390B) + users.metadata.json (465B)
# - consultations.bson (0B) + consultations.metadata.json (608B)
# - lawyers.bson (0B) + lawyers.metadata.json (473B)
```

---

## 🌐 Step 2: Create MongoDB Atlas Account (FREE)

### 2.1 Sign Up (2 minutes)
1. **Go to**: https://www.mongodb.com/cloud/atlas/register
2. **Sign up with**:
   - ✅ Google account (fastest - recommended!)
   - OR Email address
   - OR GitHub account
3. **No credit card required** for free tier

### 2.2 Verify Email
- If using email signup, check inbox and verify
- Google/GitHub signup is auto-verified

---

## 🏗️ Step 3: Create Free Cluster (3 minutes)

### 3.1 Start Cluster Creation
1. After login, click **"Create"** or **"Build a Database"**
2. Choose deployment type: **"M0 FREE"**
   ```
   ✅ FREE Forever
   ✅ 512MB Storage
   ✅ Shared RAM
   ✅ Perfect for development & small production
   ```

### 3.2 Configure Cluster Settings

**Cloud Provider & Region:**
```
Provider: AWS (recommended)
Region: Choose closest to your users:
  • India: Mumbai (ap-south-1)
  • USA: N. Virginia (us-east-1)
  • Europe: Frankfurt (eu-central-1)
```

**Cluster Name:**
```
Name: LegalIQ-Cluster (or keep default "Cluster0")
```

**Click**: "Create Cluster" button

⏱️ **Wait**: 1-3 minutes for cluster to deploy (status will show "Active")

---

## 🔐 Step 4: Configure Security (5 minutes)

### 4.1 Create Database User

1. **Navigate**: Left sidebar → **"Database Access"** (under Security)
2. **Click**: "Add New Database User"
3. **Configure**:
   ```
   Authentication Method: Password
   Username: legaliq_admin
   Password: [Click "Autogenerate Secure Password" OR create your own]
   ```
   
   **⚠️ CRITICAL: Copy and save this password immediately!**
   ```
   Example: xK9mP2nQ7vL4wR8sT3yU6hJ5
   ```

4. **Database User Privileges**: 
   - Select: **"Read and write to any database"**
   
5. **Click**: "Add User"

### 4.2 Whitelist IP Address

1. **Navigate**: Left sidebar → **"Network Access"** (under Security)
2. **Click**: "Add IP Address"
3. **For Testing/Development**:
   ```
   Click: "Allow Access from Anywhere"
   IP: 0.0.0.0/0
   Comment: Development access
   ```
   
   **⚠️ For Production**: Add specific IP addresses only

4. **Click**: "Confirm"

---

## 🔗 Step 5: Get Connection String (2 minutes)

### 5.1 Navigate to Connect
1. **Go to**: Database → Clusters
2. **Find**: Your cluster (should show "Active" status)
3. **Click**: "Connect" button

### 5.2 Choose Connection Method
1. **Select**: "Connect your application"
2. **Driver**: Node.js
3. **Version**: 5.5 or later

### 5.3 Copy Connection String
You'll see something like:
```
mongodb+srv://legaliq_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 5.4 Customize Connection String
Replace `<password>` and add database name:

**Before:**
```
mongodb+srv://legaliq_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**After:**
```
mongodb+srv://legaliq_admin:xK9mP2nQ7vL4wR8sT3yU6hJ5@cluster0.abc123.mongodb.net/legaliq?retryWrites=true&w=majority
```

**Changes:**
- ✅ Replace `<password>` with your actual password
- ✅ Add `/legaliq` before the `?` (this is your database name)

**⚠️ Save this connection string - you'll need it multiple times!**

---

## 📤 Step 6: Import Tables to Cloud (2 minutes)

### 6.1 Verify MongoDB Tools Installed
```bash
# Check if mongorestore is installed
mongorestore --version

# If not installed (macOS):
brew tap mongodb/brew
brew install mongodb-database-tools
```

### 6.2 Import All Collections
Run this command from your project directory:

```bash
cd karnataka-bar-association

mongorestore \
  --uri="mongodb+srv://legaliq_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/legaliq" \
  ./mongodb-backup/legaliq
```

**Replace:**
- `YOUR_PASSWORD` → Your database user password
- `cluster0.xxxxx.mongodb.net` → Your actual cluster URL

### 6.3 Expected Output
```
2026-02-19T06:16:55.227-0800  preparing collections to restore from
2026-02-19T06:16:55.227-0800  reading metadata for legaliq.users from mongodb-backup/legaliq/users.metadata.json
2026-02-19T06:16:55.227-0800  reading metadata for legaliq.lawyers from mongodb-backup/legaliq/lawyers.metadata.json
2026-02-19T06:16:55.227-0800  reading metadata for legaliq.consultations from mongodb-backup/legaliq/consultations.metadata.json
2026-02-19T06:16:55.236-0800  restoring legaliq.users from mongodb-backup/legaliq/users.bson
2026-02-19T06:16:55.258-0800  finished restoring legaliq.users (1 document, 0 failures)
2026-02-19T06:16:55.258-0800  restoring legaliq.lawyers from mongodb-backup/legaliq/lawyers.bson
2026-02-19T06:16:55.258-0800  finished restoring legaliq.lawyers (0 documents, 0 failures)
2026-02-19T06:16:55.258-0800  restoring legaliq.consultations from mongodb-backup/legaliq/consultations.bson
2026-02-19T06:16:55.258-0800  finished restoring legaliq.consultations (0 documents, 0 failures)
2026-02-19T06:16:55.258-0800  1 document(s) restored successfully. 0 document(s) failed to restore.
```

✅ **Success!** All 3 collections are now in the cloud!

---

## ✅ Step 7: Verify Tables in Cloud (2 minutes)

### 7.1 Via MongoDB Atlas UI (Visual)

1. **Go to**: https://cloud.mongodb.com
2. **Navigate**: Database → Browse Collections
3. **Select Database**: `legaliq`
4. **You should see**:

```
📁 legaliq (database)
│
├── 📊 users (1 document)
│   └── Click to view your Google OAuth user
│
├── 📊 lawyers (0 documents)
│   └── Empty collection, ready for data
│
└── 📊 consultations (0 documents)
    └── Empty collection, ready for data
```

### 7.2 Via Command Line (Technical)

```bash
# Connect to your Atlas cluster
mongosh "mongodb+srv://legaliq_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/legaliq"

# Once connected, run these commands:
show collections
# Output: users, lawyers, consultations

db.users.countDocuments()
# Output: 1

db.lawyers.countDocuments()
# Output: 0

db.consultations.countDocuments()
# Output: 0

# View your user document
db.users.findOne()
# Shows your Google OAuth user data
```

---

## 🔧 Step 8: Update Backend to Use Cloud Database (1 minute)

### 8.1 Update Environment Variables

Open `backend/.env` and replace the MongoDB URI:

**Before (Local):**
```env
MONGODB_URI=mongodb://localhost:27017/legaliq
```

**After (Cloud):**
```env
MONGODB_URI=mongodb+srv://legaliq_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/legaliq?retryWrites=true&w=majority
```

**Complete `.env` file should look like:**
```env
# MongoDB Atlas Cloud Connection
MONGODB_URI=mongodb+srv://legaliq_admin:xK9mP2nQ7vL4wR8sT3yU6hJ5@cluster0.abc123.mongodb.net/legaliq?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=4000

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Google OAuth Credentials
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
```

### 8.2 Restart Backend Server

```bash
# Stop current server (Ctrl+C in terminal)
# Or kill the process:
lsof -ti:4000 | xargs kill -9

# Start server with new cloud connection
cd karnataka-bar-association/backend
npm start
```

### 8.3 Verify Connection

You should see:
```
✅ MongoDB Atlas Connected Successfully
🚀 Server running on port 4000
```

---

## 🧪 Step 9: Test Cloud Database (3 minutes)

### 9.1 Test Login
1. **Open**: http://localhost:5173
2. **Click**: "Continue with Google"
3. **Login**: With your Google account
4. **Result**: Should login successfully using cloud database!

### 9.2 Verify in Atlas UI
1. **Go to**: MongoDB Atlas → Database → Browse Collections
2. **Navigate**: legaliq → users
3. **Check**: Your user document should be there (or updated if already exists)

### 9.3 Test Lawyer Search
1. **On homepage**: Try searching for lawyers
2. **Expected**: Empty results (no lawyers added yet)
3. **This is normal**: lawyers collection is empty

---

## 📊 What Happens During Migration

### Local MongoDB → MongoDB Atlas

```
┌─────────────────────────────────────────────────────────┐
│ LOCAL MONGODB (Your Computer)                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Database: legaliq                                      │
│  ├── users (1 document)                                 │
│  ├── lawyers (0 documents)                              │
│  └── consultations (0 documents)                        │
│                                                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ mongodump (EXPORT)
                     │ Creates: ./mongodb-backup/legaliq/
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ BACKUP FILES (Your Computer)                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  mongodb-backup/legaliq/                                │
│  ├── users.bson (binary data)                           │
│  ├── users.metadata.json (schema)                       │
│  ├── lawyers.bson (empty)                               │
│  ├── lawyers.metadata.json (schema)                     │
│  ├── consultations.bson (empty)                         │
│  └── consultations.metadata.json (schema)               │
│                                                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ mongorestore (IMPORT)
                     │ Uploads to: MongoDB Atlas
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ MONGODB ATLAS (Cloud)                                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Database: legaliq                                      │
│  ├── users (1 document) ✅                              │
│  ├── lawyers (0 documents) ✅                           │
│  └── consultations (0 documents) ✅                     │
│                                                          │
│  ✨ Now accessible from anywhere!                       │
│  ✨ 99.995% uptime                                      │
│  ✨ Automatic backups (paid tiers)                      │
│  ✨ Built-in security                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Commands (Copy & Paste)

### Complete Migration in 3 Commands:

```bash
# 1. Export from local MongoDB (ALREADY DONE ✅)
cd karnataka-bar-association
mongodump --db=legaliq --out=./mongodb-backup

# 2. Import to MongoDB Atlas (DO THIS NOW)
mongorestore \
  --uri="mongodb+srv://legaliq_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/legaliq" \
  ./mongodb-backup/legaliq

# 3. Test connection
mongosh "mongodb+srv://legaliq_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/legaliq"
```

**Remember to replace:**
- `YOUR_PASSWORD` → Your database user password
- `cluster0.xxxxx.mongodb.net` → Your actual cluster URL

---

## 📋 Detailed Step-by-Step Checklist

### ✅ Pre-Migration (Completed)
- [x] Local MongoDB running
- [x] Data exported to `./mongodb-backup/legaliq/`
- [x] 3 collections exported (users, lawyers, consultations)

### 🌐 Atlas Setup (Do Now)
- [ ] Create MongoDB Atlas account
- [ ] Create M0 free cluster (wait for "Active" status)
- [ ] Create database user (username + password)
- [ ] Whitelist IP address (0.0.0.0/0 for testing)
- [ ] Get connection string
- [ ] Customize connection string (add password + database name)

### 📤 Data Import (Do Now)
- [ ] Run mongorestore command
- [ ] Verify import success (1 document restored)
- [ ] Check Atlas UI (Browse Collections)

### 🔧 Backend Configuration (Do Now)
- [ ] Update `backend/.env` with Atlas URI
- [ ] Restart backend server
- [ ] Verify "MongoDB Atlas Connected Successfully" message

### 🧪 Testing (Do Now)
- [ ] Test Google OAuth login
- [ ] Verify user data in Atlas UI
- [ ] Test lawyer search (should work, but empty results)
- [ ] Try booking consultation (should work after adding lawyers)

---

## 🎓 Understanding the Process

### What is mongodump?
- **Exports** all data from local MongoDB
- Creates **binary files** (.bson) for fast transfer
- Includes **metadata** (.json) with schema definitions
- Like taking a **snapshot** of your database

### What is mongorestore?
- **Imports** data to MongoDB Atlas
- Reads **binary files** (.bson)
- Recreates **collections** with same structure
- Applies **indexes** and **schema validation**
- Like **restoring** from a snapshot

### What Gets Transferred?
```
✅ All documents (data)
✅ Collection structure
✅ Indexes (for fast queries)
✅ Schema metadata
✅ Field types and validation rules

❌ NOT transferred:
  - User passwords (already hashed, secure)
  - Local MongoDB settings
  - Server configuration
```

---

## 🔍 Troubleshooting Common Issues

### Issue 1: "mongorestore: command not found"

**Solution:**
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-database-tools

# Verify
mongorestore --version
```

### Issue 2: "Authentication failed"

**Causes:**
- Wrong password in connection string
- User not created in Atlas
- Password contains special characters (needs URL encoding)

**Solution:**
```bash
# If password has special characters like @, #, %, encode them:
# @ → %40
# # → %23
# % → %25

# Example:
# Password: Pass@123
# Encoded: Pass%40123
```

### Issue 3: "Connection timeout"

**Causes:**
- IP not whitelisted
- Cluster not active yet
- Network firewall blocking

**Solution:**
1. Check Network Access → Verify 0.0.0.0/0 is added
2. Check cluster status → Should be "Active"
3. Wait 1-2 minutes and retry

### Issue 4: "Database not found"

**This is NORMAL!** MongoDB creates the database automatically when you:
- Import data with mongorestore
- OR Insert first document

**Solution:** Just proceed - database will be created during import

### Issue 5: "No documents restored"

**Check:**
```bash
# Verify backup files exist
ls -lh mongodb-backup/legaliq/

# Should show:
# users.bson (390B) - Has data
# lawyers.bson (0B) - Empty
# consultations.bson (0B) - Empty
```

**This is NORMAL** if collections are empty. The structure is still created!

---

## 🎯 After Migration: What Changes?

### What Stays the Same:
- ✅ Your code (no changes needed)
- ✅ API endpoints (same routes)
- ✅ Frontend UI (same interface)
- ✅ Data structure (same schema)
- ✅ Functionality (everything works the same)

### What Changes:
- ✅ Database location: Local → Cloud
- ✅ Connection string: localhost → Atlas URL
- ✅ Availability: Only when local MongoDB running → Always available
- ✅ Accessibility: Only from your computer → From anywhere
- ✅ Backups: Manual → Automatic (paid tiers)

### Your App Will:
- ✅ Connect to cloud database instead of local
- ✅ Store all new data in the cloud
- ✅ Work from any deployment (AWS, Heroku, Vercel, etc.)
- ✅ Be accessible to users worldwide

---

## 📊 Verify Migration Success

### Checklist:
```bash
# 1. Check Atlas UI
✅ Database "legaliq" exists
✅ Collection "users" has 1 document
✅ Collection "lawyers" exists (empty)
✅ Collection "consultations" exists (empty)

# 2. Check Backend Connection
✅ Server starts without errors
✅ Console shows "MongoDB Atlas Connected Successfully"

# 3. Check Application
✅ Can login with Google OAuth
✅ User data loads correctly
✅ Can search lawyers (empty results OK)
✅ Can navigate all pages
```

---

## 🎉 Success Indicators

### You'll know migration succeeded when:

1. **mongorestore output shows**:
   ```
   ✅ 1 document(s) restored successfully
   ✅ 0 document(s) failed to restore
   ```

2. **Atlas UI shows**:
   ```
   ✅ Database: legaliq
   ✅ Collections: users (1), lawyers (0), consultations (0)
   ```

3. **Backend console shows**:
   ```
   ✅ MongoDB Atlas Connected Successfully
   ```

4. **Application works**:
   ```
   ✅ Can login with Google
   ✅ User profile loads
   ✅ All features functional
   ```

---

## 🔄 Ongoing Sync (Optional)

### If You Want to Keep Local & Cloud in Sync:

**Export from Local → Import to Cloud:**
```bash
# 1. Export latest local data
mongodump --db=legaliq --out=./mongodb-backup

# 2. Import to Atlas (overwrites existing)
mongorestore \
  --uri="mongodb+srv://user:pass@cluster.mongodb.net/legaliq" \
  --drop \
  ./mongodb-backup/legaliq
```

**Export from Cloud → Import to Local:**
```bash
# 1. Export from Atlas
mongodump \
  --uri="mongodb+srv://user:pass@cluster.mongodb.net/legaliq" \
  --out=./mongodb-backup-cloud

# 2. Import to local
mongorestore --db=legaliq ./mongodb-backup-cloud/legaliq
```

---

## 🎯 Quick Reference Card

### Essential Commands:

| Task | Command |
|------|---------|
| **Export Local DB** | `mongodump --db=legaliq --out=./backup` |
| **Import to Atlas** | `mongorestore --uri="mongodb+srv://..." ./backup/legaliq` |
| **Connect to Atlas** | `mongosh "mongodb+srv://..."` |
| **Count Documents** | `db.users.countDocuments()` |
| **View Collections** | `show collections` |
| **View Document** | `db.users.findOne()` |

### Essential URLs:

| Resource | URL |
|----------|-----|
| **MongoDB Atlas** | https://cloud.mongodb.com |
| **Sign Up** | https://www.mongodb.com/cloud/atlas/register |
| **Documentation** | https://docs.atlas.mongodb.com/ |
| **Support** | https://www.mongodb.com/community/forums/ |

---

## 📞 Need Help?

### MongoDB Atlas Support:
- **Community Forum**: https://www.mongodb.com/community/forums/
- **Documentation**: https://docs.atlas.mongodb.com/
- **University** (Free courses): https://university.mongodb.com/

### Common Questions:

**Q: Do I need to pay for MongoDB Atlas?**  
A: No! M0 free tier is forever free (512MB storage)

**Q: Will my local database be deleted?**  
A: No! Export creates a copy. Local data stays intact.

**Q: Can I use both local and cloud?**  
A: Yes! Just change MONGODB_URI in .env to switch between them.

**Q: What if I run out of 512MB?**  
A: Upgrade to M10 tier (~$0.08/hour = ~$57/month) for 10GB storage

**Q: Is my data secure in the cloud?**  
A: Yes! Atlas uses encryption at rest and in transit, plus authentication.

---

## ✅ Final Checklist

Before considering migration complete:

- [ ] MongoDB Atlas account created
- [ ] Free M0 cluster deployed and "Active"
- [ ] Database user created with password saved
- [ ] IP address whitelisted (0.0.0.0/0)
- [ ] Connection string obtained and customized
- [ ] mongorestore command executed successfully
- [ ] Collections visible in Atlas UI (users, lawyers, consultations)
- [ ] backend/.env updated with Atlas URI
- [ ] Backend server restarted
- [ ] "MongoDB Atlas Connected Successfully" message seen
- [ ] Google OAuth login tested and working
- [ ] User data visible in Atlas UI

---

## 🎊 Congratulations!

Once all steps are complete, your LegalIQ database will be:
- ✅ **In the cloud** (MongoDB Atlas)
- ✅ **Always available** (99.995% uptime)
- ✅ **Globally accessible** (from anywhere)
- ✅ **Production-ready** (secure and scalable)
- ✅ **Free** (M0 tier, no credit card needed)

Your local database tables (collections) are now successfully replicated in the cloud! 🚀

---

## 📚 Related Documentation

- **Database Schema**: See `DATABASE_SCHEMA.md` for detailed field descriptions
- **Tables Overview**: See `DATABASE_TABLES_OVERVIEW.md` for visual structure
- **Atlas Setup**: See `MONGODB_ATLAS_SETUP.md` for detailed Atlas guide
- **Deployment**: See `AWS_DEPLOYMENT_GUIDE.md` for production deployment

---

**Next Step**: Follow the checklist above to complete your migration to MongoDB Atlas cloud!
