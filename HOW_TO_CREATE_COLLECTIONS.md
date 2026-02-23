# How to Create Tables (Collections) in MongoDB

## 🎯 Key Concept: MongoDB Creates Collections Automatically!

**Unlike SQL databases**, you don't need to manually create tables in MongoDB. Collections are created automatically when you:
1. Insert the first document
2. Import data with mongorestore
3. Define a Mongoose model (schema)

---

## 🔄 How Your Tables Were Created

### Your LegalIQ App Already Has 3 Collections!

They were created automatically when you defined Mongoose models:

```javascript
// backend/models/User.js
const User = mongoose.model('User', userSchema);
// ✅ Creates "users" collection automatically

// backend/models/Lawyer.js
const Lawyer = mongoose.model('Lawyer', lawyerSchema);
// ✅ Creates "lawyers" collection automatically

// backend/models/Consultation.js
const Consultation = mongoose.model('Consultation', consultationSchema);
// ✅ Creates "consultations" collection automatically
```

**When are they physically created?**
- When you insert the first document
- OR when you run mongorestore (import)

---

## 📋 Method 1: Automatic Creation (Recommended)

### How It Works:
MongoDB creates collections automatically when you insert data.

### Example - Creating Users Collection:

**Step 1: Define Schema** (Already done in [`backend/models/User.js`](karnataka-bar-association/backend/models/User.js))
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  password: String,
  role: { type: String, default: 'user' }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
```

**Step 2: Insert First Document** (Collection created automatically!)
```javascript
// When user registers:
const user = new User({
  name: "John Doe",
  email: "john@example.com",
  phone: "+91-9876543210",
  password: "hashedPassword"
});

await user.save();
// ✅ "users" collection is created automatically!
```

### Your App Already Does This:

**When user registers** ([`backend/controllers/authController.js`](karnataka-bar-association/backend/controllers/authController.js)):
```javascript
// POST /api/auth/register
const user = await User.create({ name, email, phone, password });
// ✅ Creates "users" collection if it doesn't exist
```

**When user logs in with Google** ([`backend/config/passport.js`](karnataka-bar-association/backend/config/passport.js)):
```javascript
let user = await User.findOne({ googleId: profile.id });
if (!user) {
  user = await User.create({ googleId, name, email, profilePicture });
  // ✅ Creates "users" collection if it doesn't exist
}
```

---

## 📋 Method 2: Manual Creation (Optional)

### Via MongoDB Shell (mongosh):

```bash
# Connect to MongoDB
mongosh "mongodb://localhost:27017/legaliq"

# Create collection explicitly
db.createCollection("users")
db.createCollection("lawyers")
db.createCollection("consultations")

# Verify
show collections
```

### Via MongoDB Atlas UI:

1. Go to: https://cloud.mongodb.com
2. Navigate: Database → Browse Collections
3. Click: "Create Database"
4. Enter:
   - Database name: `legaliq`
   - Collection name: `users`
5. Click: "Create"
6. Repeat for `lawyers` and `consultations`

**⚠️ Note**: You don't need to do this! Your app creates them automatically.

---

## 📋 Method 3: Import Creates Collections (What You're Doing)

### When You Run mongorestore:

```bash
mongorestore \
  --uri="mongodb+srv://user:pass@cluster.mongodb.net/legaliq" \
  ./mongodb-backup/legaliq
```

**What Happens:**
1. ✅ Reads `users.metadata.json` → Creates `users` collection
2. ✅ Reads `lawyers.metadata.json` → Creates `lawyers` collection
3. ✅ Reads `consultations.metadata.json` → Creates `consultations` collection
4. ✅ Imports all documents from .bson files
5. ✅ Creates all indexes defined in schemas

**Result:**
```
✅ Database "legaliq" created (if doesn't exist)
✅ Collection "users" created with 1 document
✅ Collection "lawyers" created (empty)
✅ Collection "consultations" created (empty)
```

---

## 🎯 How Collections Are Created in MongoDB Atlas

### Automatic Creation Flow:

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Define Mongoose Model                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  // backend/models/User.js                              │
│  const userSchema = new mongoose.Schema({...});         │
│  const User = mongoose.model('User', userSchema);       │
│                                                          │
│  ✅ Model defined, but collection NOT created yet       │
│                                                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Step 2: First Data Operation                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  // User registers or logs in                           │
│  await User.create({ name, email, ... });               │
│                                                          │
│  ✅ MongoDB creates "users" collection automatically!   │
│  ✅ Applies schema validation                           │
│  ✅ Creates indexes                                     │
│                                                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Step 3: Collection Exists in Database                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Database: legaliq                                      │
│  └── Collection: users ✅                               │
│      └── Document: { name, email, ... }                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Verify Collections Exist

### Method 1: MongoDB Shell
```bash
# Connect to local MongoDB
mongosh "mongodb://localhost:27017/legaliq"

# List all collections
show collections
# Output: users, lawyers, consultations

# Check if collection exists
db.getCollectionNames()
# Output: ["users", "lawyers", "consultations"]
```

### Method 2: MongoDB Atlas UI
1. Go to: https://cloud.mongodb.com
2. Navigate: Database → Browse Collections
3. Select: `legaliq` database
4. See: All 3 collections listed

### Method 3: Via Your Backend Code
```javascript
// In your backend
const mongoose = require('mongoose');

// List all collections
const collections = await mongoose.connection.db.listCollections().toArray();
console.log(collections.map(c => c.name));
// Output: ["users", "lawyers", "consultations"]
```

---

## 🆕 How to Add New Collections (Tables)

### If You Want to Add a New Collection:

**Example: Adding a "reviews" collection**

**Step 1: Create Model File**
```javascript
// backend/models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
```

**Step 2: Use in Your Code**
```javascript
// backend/controllers/reviewController.js
const Review = require('../models/Review');

// Create first review
const review = await Review.create({
  userId: "65c123...",
  lawyerId: "65c456...",
  rating: 5,
  comment: "Excellent lawyer!"
});

// ✅ "reviews" collection created automatically!
```

**That's it!** No manual table creation needed.

---

## 🔄 MongoDB vs SQL: Creating Tables

### SQL (Manual Creation Required):
```sql
-- Must create table first
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Then insert data
INSERT INTO users (name, email, phone) 
VALUES ('John Doe', 'john@example.com', '+91-9876543210');
```

### MongoDB (Automatic Creation):
```javascript
// Just define schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Insert data - collection created automatically!
await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+91-9876543210'
});
// ✅ "users" collection created automatically!
```

---

## 📊 Your Current Collections (Already Created!)

### Collection 1: users ✅
**Created by**: [`backend/models/User.js`](karnataka-bar-association/backend/models/User.js)
**First document**: When you logged in with Google OAuth
**Status**: Active with 1 document

### Collection 2: lawyers ✅
**Created by**: [`backend/models/Lawyer.js`](karnataka-bar-association/backend/models/Lawyer.js)
**First document**: Will be created when first lawyer registers
**Status**: Exists but empty (0 documents)

### Collection 3: consultations ✅
**Created by**: [`backend/models/Consultation.js`](karnataka-bar-association/backend/models/Consultation.js)
**First document**: Will be created when first consultation is booked
**Status**: Exists but empty (0 documents)

---

## 🎓 Understanding MongoDB Collection Creation

### Key Points:

1. **No CREATE TABLE needed**: MongoDB is schema-less at the database level
2. **Mongoose adds structure**: Your models define the schema
3. **Lazy creation**: Collections created on first insert
4. **Flexible schema**: Can add fields without altering table
5. **Indexes created automatically**: When defined in schema

### Example Timeline:

```
Time: 0:00 - Define Model
├── File: backend/models/User.js created
├── Schema: userSchema defined
└── Status: Collection does NOT exist yet

Time: 0:05 - Start Server
├── Server connects to MongoDB
├── Models loaded into memory
└── Status: Collection still does NOT exist

Time: 0:10 - First User Registers
├── User.create() called
├── MongoDB creates "users" collection
├── Inserts first document
└── Status: Collection NOW exists! ✅

Time: 0:15 onwards - Collection Exists
├── All future User.create() calls
├── Use existing "users" collection
└── No new collection created
```

---

## 🛠️ Practical Examples

### Example 1: Check if Collection Exists

```javascript
// In your backend code
const mongoose = require('mongoose');

async function checkCollections() {
  const collections = await mongoose.connection.db
    .listCollections()
    .toArray();
  
  console.log('Existing collections:');
  collections.forEach(col => {
    console.log(`- ${col.name}`);
  });
}

// Call after MongoDB connects
checkCollections();
```

### Example 2: Create Collection with First Document

```javascript
// This creates the collection if it doesn't exist
const User = require('./models/User');

// First user registration
const firstUser = await User.create({
  name: "John Doe",
  email: "john@example.com",
  phone: "+91-9876543210",
  password: "securePassword"
});

console.log('✅ Users collection created!');
```

### Example 3: Add Sample Lawyers (Creates Collection)

```javascript
// This will create "lawyers" collection
const Lawyer = require('./models/Lawyer');

const sampleLawyers = [
  {
    name: "Adv. Priya Sharma",
    email: "priya@lawfirm.com",
    phone: "+91-9876543210",
    barRegistrationNo: "KAR/2015/12345",
    specialization: ["Criminal Law", "Family Law"],
    experience: 8,
    location: "Bangalore",
    court: "Karnataka High Court",
    consultationFee: 1500
  },
  {
    name: "Adv. Rajesh Kumar",
    email: "rajesh@legalservices.com",
    phone: "+91-9876543211",
    barRegistrationNo: "KAR/2018/67890",
    specialization: ["Corporate Law", "Tax Law"],
    experience: 5,
    location: "Mumbai",
    court: "Bombay High Court",
    consultationFee: 2000
  }
];

// Insert sample lawyers
await Lawyer.insertMany(sampleLawyers);
console.log('✅ Lawyers collection created with 2 documents!');
```

---

## 🚀 Creating Collections in MongoDB Atlas (Cloud)

### Method 1: Import Your Backup (Recommended)

**This is what you'll do:**
```bash
mongorestore \
  --uri="mongodb+srv://user:pass@cluster.mongodb.net/legaliq" \
  ./mongodb-backup/legaliq
```

**What happens:**
1. ✅ Reads metadata files (users.metadata.json, lawyers.metadata.json, consultations.metadata.json)
2. ✅ Creates all 3 collections in Atlas
3. ✅ Imports all documents
4. ✅ Creates all indexes
5. ✅ Applies schema validation

**Result:**
```
Database: legaliq
├── users (1 document) ✅
├── lawyers (0 documents) ✅
└── consultations (0 documents) ✅
```

### Method 2: Let Your App Create Them

**After connecting to Atlas:**
1. Update [`backend/.env`](karnataka-bar-association/backend/.env) with Atlas URI
2. Restart backend server
3. Register a new user → Creates `users` collection
4. Add a lawyer → Creates `lawyers` collection
5. Book consultation → Creates `consultations` collection

**Collections created automatically as you use the app!**

### Method 3: Manual Creation in Atlas UI

**If you want to create empty collections manually:**

1. Go to: https://cloud.mongodb.com
2. Navigate: Database → Browse Collections
3. Click: "Create Database"
4. Enter:
   - Database name: `legaliq`
   - Collection name: `users`
5. Click: "Create"
6. Repeat for `lawyers` and `consultations`

**⚠️ Not recommended**: Your app already handles this automatically!

---

## 🎨 Creating Collections with Indexes

### Your Models Already Define Indexes:

**User Model** ([`backend/models/User.js`](karnataka-bar-association/backend/models/User.js)):
```javascript
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true  // ✅ Creates unique index on email
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true  // ✅ Creates sparse unique index on googleId
  }
});
```

**Consultation Model** ([`backend/models/Consultation.js`](karnataka-bar-association/backend/models/Consultation.js)):
```javascript
// Indexes for better query performance
consultationSchema.index({ clientId: 1, createdAt: -1 });
consultationSchema.index({ lawyerId: 1, createdAt: -1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ preferredDate: 1 });
```

**When are indexes created?**
- Automatically when collection is created
- OR when you call `Model.createIndexes()`

---

## 🔍 Verify Collections Were Created

### After mongorestore, verify:

**Via Command Line:**
```bash
# Connect to Atlas
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/legaliq"

# List collections
show collections
# Output: users, lawyers, consultations

# Check collection stats
db.users.stats()
db.lawyers.stats()
db.consultations.stats()
```

**Via Atlas UI:**
```
1. Go to: Database → Browse Collections
2. Select: legaliq database
3. See: All 3 collections listed
4. Click each to view documents
```

**Via Backend Code:**
```javascript
// Add this to your server.js after MongoDB connects
mongoose.connection.on('connected', async () => {
  console.log('✅ MongoDB Connected');
  
  const collections = await mongoose.connection.db
    .listCollections()
    .toArray();
  
  console.log('📊 Collections:');
  collections.forEach(col => {
    console.log(`   - ${col.name}`);
  });
});
```

---

## 📝 Complete Example: Creating All Collections

### If Starting Fresh (No Backup):

```javascript
// backend/scripts/initializeDatabase.js
const mongoose = require('mongoose');
const User = require('./models/User');
const Lawyer = require('./models/Lawyer');
const Consultation = require('./models/Consultation');

async function initializeDatabase() {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  
  console.log('Creating collections...');
  
  // Create users collection with sample user
  const user = await User.create({
    name: "Test User",
    email: "test@example.com",
    phone: "+91-9876543210",
    password: "password123"
  });
  console.log('✅ Users collection created');
  
  // Create lawyers collection with sample lawyer
  const lawyer = await Lawyer.create({
    name: "Adv. Test Lawyer",
    email: "lawyer@example.com",
    phone: "+91-9876543211",
    barRegistrationNo: "KAR/2020/00001",
    specialization: ["Criminal Law"],
    experience: 5,
    location: "Bangalore",
    court: "Karnataka High Court",
    consultationFee: 1000
  });
  console.log('✅ Lawyers collection created');
  
  // Create consultations collection with sample booking
  const consultation = await Consultation.create({
    clientId: user._id,
    lawyerId: lawyer._id,
    clientInfo: {
      name: user.name,
      email: user.email,
      phone: user.phone
    },
    lawyerInfo: {
      name: lawyer.name,
      email: lawyer.email,
      specialization: lawyer.specialization
    },
    caseType: "Criminal Law",
    caseDescription: "Need legal consultation for a case...",
    preferredDate: new Date("2026-03-01"),
    preferredTime: "10:00 AM"
  });
  console.log('✅ Consultations collection created');
  
  console.log('\n🎉 All collections created successfully!');
  process.exit(0);
}

initializeDatabase().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
```

**Run it:**
```bash
node backend/scripts/initializeDatabase.js
```

---

## 🎯 Summary: How Your Collections Are Created

### Your LegalIQ App:

```
✅ Collections ALREADY EXIST in local MongoDB
   (Created when you first used the app)

✅ Collections DEFINED in code:
   - backend/models/User.js → "users" collection
   - backend/models/Lawyer.js → "lawyers" collection
   - backend/models/Consultation.js → "consultations" collection

✅ Collections EXPORTED to backup:
   - mongodb-backup/legaliq/users.bson
   - mongodb-backup/legaliq/lawyers.bson
   - mongodb-backup/legaliq/consultations.bson

✅ Collections WILL BE CREATED in Atlas when you run:
   mongorestore --uri="..." ./mongodb-backup/legaliq
```

---

## 💡 Key Takeaways

### 1. MongoDB is Schema-less (at database level)
- No need to define table structure beforehand
- Collections created automatically on first insert
- Schema enforced by Mongoose (application level)

### 2. Your Collections Already Exist
- ✅ Locally: Created when you first used the app
- ⏳ In Atlas: Will be created when you run mongorestore

### 3. Three Ways Collections Are Created:
1. **Automatic**: When you insert first document (recommended)
2. **Import**: When you run mongorestore (what you're doing)
3. **Manual**: Using db.createCollection() (rarely needed)

### 4. Collections in Atlas = Collections in Local
- Same structure
- Same data
- Same indexes
- Same validation rules

---

## 🎊 You're All Set!

Your collections (tables) are:
- ✅ **Already defined** in your code (Mongoose models)
- ✅ **Already exported** from local MongoDB
- ✅ **Ready to import** to MongoDB Atlas

**Next step**: Follow [`MIGRATION_QUICK_START.md`](karnataka-bar-association/MIGRATION_QUICK_START.md) to import them to the cloud!

When you run `mongorestore`, all 3 collections will be automatically created in MongoDB Atlas with the exact same structure as your local database.

---

## 📚 Related Documentation

- **Database Schema**: [`DATABASE_SCHEMA.md`](karnataka-bar-association/DATABASE_SCHEMA.md) - Detailed field descriptions
- **Tables Overview**: [`DATABASE_TABLES_OVERVIEW.md`](karnataka-bar-association/DATABASE_TABLES_OVERVIEW.md) - Visual structure
- **Migration Guide**: [`MIGRATION_QUICK_START.md`](karnataka-bar-association/MIGRATION_QUICK_START.md) - Import to Atlas
- **Atlas Setup**: [`MONGODB_ATLAS_SETUP.md`](karnataka-bar-association/MONGODB_ATLAS_SETUP.md) - Detailed setup

---

**🚀 Bottom Line**: You don't need to manually create tables in MongoDB - they're created automatically when you insert data or import your backup!
