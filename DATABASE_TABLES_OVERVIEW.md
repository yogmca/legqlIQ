# LegalIQ Database Collections (Tables) Overview

## 🗄️ MongoDB Collections = SQL Tables

In MongoDB, we call them **"Collections"** instead of "Tables", but they serve the same purpose!

---

## 📋 Your Database Has 3 Collections:

```
Database: legaliq
│
├── 📁 users (User Accounts)
│   └── 1 document (your Google login account)
│
├── 📁 lawyers (Lawyer Profiles)
│   └── 0 documents (empty, ready for lawyer registrations)
│
└── 📁 consultations (Appointment Bookings)
    └── 0 documents (empty, ready for bookings)
```

---

## 1️⃣ Collection: **users** (User Accounts)

**Purpose**: Stores client/user accounts who book consultations

### Key Fields:
```
┌─────────────────────────────────────────────────────────┐
│ USERS COLLECTION                                        │
├─────────────────────────────────────────────────────────┤
│ _id              : Unique ID (auto-generated)           │
│ googleId         : Google OAuth ID (if Gmail login)     │
│ name             : Full name                            │
│ email            : Email address (unique)               │
│ phone            : Phone number                         │
│ password         : Hashed password (bcrypt)             │
│ dateOfBirth      : Date of birth                        │
│ gender           : male/female/other                    │
│ address          : {street, city, state, pincode}       │
│ profilePicture   : Profile photo URL                    │
│ role             : user/lawyer/admin                    │
│ isVerified       : Email verified? (true/false)         │
│ createdAt        : Registration date                    │
│ updatedAt        : Last modified date                   │
└─────────────────────────────────────────────────────────┘
```

### Current Data:
- **1 user** (your Google OAuth test account)

### Sample User:
```json
{
  "_id": "65c1234567890abcdef12345",
  "googleId": "108234567890123456789",
  "name": "John Doe",
  "email": "john.doe@gmail.com",
  "profilePicture": "https://lh3.googleusercontent.com/a/...",
  "role": "user",
  "isVerified": true,
  "createdAt": "2026-02-18T10:30:00.000Z"
}
```

---

## 2️⃣ Collection: **lawyers** (Lawyer Profiles)

**Purpose**: Stores lawyer/advocate professional profiles

### Key Fields:
```
┌─────────────────────────────────────────────────────────┐
│ LAWYERS COLLECTION                                      │
├─────────────────────────────────────────────────────────┤
│ _id                : Unique ID (auto-generated)         │
│ userId             : Link to users collection (optional)│
│ name               : Lawyer's full name                 │
│ email              : Email address (unique)             │
│ phone              : Contact number                     │
│ barRegistrationNo  : Bar Council number (unique)        │
│ specialization     : ["Criminal Law", "Civil Law", ...] │
│ experience         : Years of experience                │
│ location           : City/location                      │
│ court              : Court name (e.g., High Court)      │
│ address            : Office address                     │
│ languages          : ["English", "Hindi", "Kannada"]    │
│ education          : Qualifications                     │
│ description        : Professional bio                   │
│ profilePicture     : Profile photo URL                  │
│ rating             : Average rating (0-5)               │
│ totalReviews       : Number of reviews                  │
│ consultationFee    : Fee per consultation (₹)           │
│ availability       : Accepting bookings? (true/false)   │
│ isVerified         : Bar Council verified? (true/false) │
│ createdAt          : Profile creation date              │
│ updatedAt          : Last modified date                 │
└─────────────────────────────────────────────────────────┘
```

### Current Data:
- **0 lawyers** (empty - ready for lawyer registrations)

### Sample Lawyer:
```json
{
  "_id": "65c1234567890abcdef12346",
  "name": "Adv. Priya Sharma",
  "email": "priya.sharma@lawfirm.com",
  "phone": "+91-9876543210",
  "barRegistrationNo": "KAR/2015/12345",
  "specialization": ["Criminal Law", "Family Law", "Consumer Protection"],
  "experience": 8,
  "location": "Bangalore",
  "court": "Karnataka High Court",
  "languages": ["English", "Hindi", "Kannada"],
  "education": "LLB from National Law School, Bangalore",
  "rating": 4.7,
  "totalReviews": 156,
  "consultationFee": 1500,
  "availability": true,
  "isVerified": true
}
```

---

## 3️⃣ Collection: **consultations** (Appointment Bookings)

**Purpose**: Stores consultation appointments between users and lawyers

### Key Fields:
```
┌─────────────────────────────────────────────────────────┐
│ CONSULTATIONS COLLECTION                                │
├─────────────────────────────────────────────────────────┤
│ _id                : Unique ID (auto-generated)         │
│ clientId           : Link to users._id                  │
│ lawyerId           : Link to lawyers._id                │
│ clientInfo         : {name, email, phone}               │
│ lawyerInfo         : {name, email, specialization}      │
│ caseType           : Type of case (11 options)          │
│ caseDescription    : Detailed description               │
│ preferredDate      : Appointment date                   │
│ preferredTime      : Appointment time                   │
│ status             : pending/confirmed/completed/...    │
│ videoCallData      : {roomId, startTime, endTime, ...}  │
│ payment            : {amount, status, transactionId}    │
│ notes              : Client notes                       │
│ lawyerNotes        : Lawyer's private notes             │
│ followUpRequired   : Need follow-up? (true/false)       │
│ followUpDate       : Follow-up date                     │
│ rating             : Client rating (1-5)                │
│ review             : Client review text                 │
│ reviewedAt         : Review submission date             │
│ createdAt          : Booking creation date              │
│ updatedAt          : Last modified date                 │
│ confirmedAt        : Confirmation date                  │
│ completedAt        : Completion date                    │
│ cancelledAt        : Cancellation date                  │
└─────────────────────────────────────────────────────────┘
```

### Case Types (11 Options):
1. Criminal Law
2. Civil Law
3. Family Law
4. Corporate Law
5. Property Law
6. Labour Law
7. Tax Law
8. Constitutional Law
9. Consumer Protection
10. Intellectual Property
11. Other

### Status Options:
- `pending`: Waiting for lawyer confirmation
- `confirmed`: Lawyer confirmed the appointment
- `completed`: Consultation finished
- `cancelled`: Appointment cancelled
- `rescheduled`: Date/time changed

### Current Data:
- **0 consultations** (empty - ready for bookings)

### Sample Consultation:
```json
{
  "_id": "65c1234567890abcdef12347",
  "clientId": "65c1234567890abcdef12345",
  "lawyerId": "65c1234567890abcdef12346",
  "clientInfo": {
    "name": "John Doe",
    "email": "john.doe@gmail.com",
    "phone": "+91-9876543210"
  },
  "lawyerInfo": {
    "name": "Adv. Priya Sharma",
    "email": "priya.sharma@lawfirm.com",
    "specialization": ["Criminal Law", "Family Law"]
  },
  "caseType": "Family Law",
  "caseDescription": "Need consultation regarding divorce proceedings and child custody matters. Married for 5 years, have one child...",
  "preferredDate": "2026-02-25T00:00:00.000Z",
  "preferredTime": "10:00 AM",
  "status": "confirmed",
  "videoCallData": {
    "roomId": "consultation-65c1234567890abcdef12347",
    "startTime": "2026-02-25T10:00:00.000Z",
    "endTime": "2026-02-25T10:45:00.000Z",
    "duration": 45
  },
  "payment": {
    "amount": 1500,
    "status": "paid",
    "transactionId": "TXN123456789",
    "paidAt": "2026-02-20T14:30:00.000Z"
  },
  "rating": 5,
  "review": "Excellent consultation! Very professional and helpful.",
  "createdAt": "2026-02-20T09:15:00.000Z",
  "confirmedAt": "2026-02-20T14:30:00.000Z",
  "completedAt": "2026-02-25T10:45:00.000Z"
}
```

---

## 🔗 How Collections Are Connected (Relationships)

### Visual Relationship Diagram:

```
┌──────────────────────┐
│      USERS           │
│   (User Accounts)    │
│                      │
│  • _id (Primary)     │
│  • googleId          │
│  • name              │
│  • email (unique)    │
│  • phone             │
│  • password (hashed) │
│  • role              │
│  • profilePicture    │
└──────────┬───────────┘
           │
           │ One user can have
           │ MANY consultations
           │
           ▼
┌──────────────────────────────────────┐
│        CONSULTATIONS                 │
│    (Appointment Bookings)            │
│                                      │
│  • _id (Primary)                     │
│  • clientId ──────────────┐          │
│  • lawyerId ──────────┐   │          │
│  • clientInfo         │   │          │
│  • lawyerInfo         │   │          │
│  • caseType           │   │          │
│  • caseDescription    │   │          │
│  • preferredDate      │   │          │
│  • status             │   │          │
│  • videoCallData      │   │          │
│  • payment            │   │          │
│  • rating & review    │   │          │
└───────────────────────┼───┼──────────┘
                        │   │
                        │   └─────────────┐
                        │                 │
           One lawyer   │                 │ Links to
           can have     │                 │ user who
           MANY         │                 │ booked
           consultations│                 │
                        │                 │
                        ▼                 ▼
           ┌────────────────────┐  ┌─────────────┐
           │     LAWYERS        │  │    USERS    │
           │ (Lawyer Profiles)  │  │  (Clients)  │
           │                    │  └─────────────┘
           │  • _id (Primary)   │
           │  • userId ─────────┼──► Optional link
           │  • name            │     to user account
           │  • email (unique)  │     (if lawyer also
           │  • barRegistration │      has user login)
           │  • specialization  │
           │  • experience      │
           │  • location        │
           │  • rating          │
           │  • consultationFee │
           └────────────────────┘
```

### Relationship Types:

1. **User → Consultations** (One-to-Many)
   - One user can book multiple consultations
   - Link: `consultations.clientId` references `users._id`

2. **Lawyer → Consultations** (One-to-Many)
   - One lawyer can have multiple consultations
   - Link: `consultations.lawyerId` references `lawyers._id`

3. **Lawyer → User** (Optional One-to-One)
   - A lawyer can optionally have a user account
   - Link: `lawyers.userId` references `users._id`

---

## 📊 Data Flow Example

### Scenario: User Books a Consultation

```
Step 1: User Registration
┌─────────────────────────────────────────┐
│ User registers via Google OAuth         │
│ → Creates document in USERS collection  │
│ → Returns: userId = "65c123..."         │
└─────────────────────────────────────────┘

Step 2: Browse Lawyers
┌─────────────────────────────────────────┐
│ User searches for lawyers               │
│ → Query LAWYERS collection              │
│ → Filter by specialization, location    │
│ → Returns: List of matching lawyers     │
└─────────────────────────────────────────┘

Step 3: Book Consultation
┌─────────────────────────────────────────┐
│ User selects lawyer and fills form      │
│ → Creates document in CONSULTATIONS     │
│ → Links: clientId + lawyerId            │
│ → Status: "pending"                     │
└─────────────────────────────────────────┘

Step 4: Lawyer Confirms
┌─────────────────────────────────────────┐
│ Lawyer reviews and confirms             │
│ → Updates CONSULTATIONS document        │
│ → Status: "pending" → "confirmed"       │
│ → Sets confirmedAt timestamp            │
└─────────────────────────────────────────┘

Step 5: Video Consultation
┌─────────────────────────────────────────┐
│ Both join video call                    │
│ → Updates videoCallData in CONSULTATIONS│
│ → Records: roomId, startTime, duration  │
└─────────────────────────────────────────┘

Step 6: Review & Rating
┌─────────────────────────────────────────┐
│ User submits review                     │
│ → Updates CONSULTATIONS: rating, review │
│ → Updates LAWYERS: rating, totalReviews │
│ → Status: "completed"                   │
└─────────────────────────────────────────┘
```

---

## 🔍 Quick Comparison: MongoDB vs SQL

| Concept | MongoDB (Your App) | SQL Equivalent |
|---------|-------------------|----------------|
| **Database** | `legaliq` | `legaliq` database |
| **Collection** | `users` | `users` table |
| **Document** | User object with fields | Row in users table |
| **Field** | `email`, `name`, etc. | Column in table |
| **_id** | Auto-generated ObjectId | Primary Key (id) |
| **Reference** | `clientId: ObjectId` | Foreign Key |
| **Embedded Doc** | `address: {city, state}` | Separate table or JSON column |
| **Array** | `specialization: [...]` | Separate junction table |

---

## 📦 What's in Your Exported Data

### File Structure:
```
mongodb-backup/legaliq/
│
├── users.bson                    (390 bytes - 1 user)
├── users.metadata.json           (Schema definition)
│
├── consultations.bson            (0 bytes - empty)
├── consultations.metadata.json   (Schema definition)
│
├── lawyers.bson                  (0 bytes - empty)
├── lawyers.metadata.json         (Schema definition)
│
└── prelude.json                  (Export metadata)
```

### What Gets Imported to Atlas:
When you run `mongorestore`, it will create:
1. ✅ **Database**: `legaliq`
2. ✅ **Collection**: `users` with 1 document
3. ✅ **Collection**: `consultations` (empty, ready to use)
4. ✅ **Collection**: `lawyers` (empty, ready to use)
5. ✅ **Indexes**: All indexes defined in models
6. ✅ **Schema**: Mongoose will enforce schema validation

---

## 🎯 How to View Your Collections in MongoDB Atlas

### After Import:

1. **Login to MongoDB Atlas**: https://cloud.mongodb.com
2. **Navigate**: Database → Browse Collections
3. **Select Database**: `legaliq`
4. **View Collections**:

```
legaliq (database)
│
├── 📁 users
│   └── 1 document
│       ├── View: Click to see your Google OAuth user
│       ├── Edit: Modify fields
│       └── Delete: Remove document
│
├── 📁 lawyers
│   └── 0 documents
│       └── Ready for lawyer registrations
│
└── 📁 consultations
    └── 0 documents
        └── Ready for booking appointments
```

---

## 🔧 Common Database Operations

### 1. View All Users
```javascript
// In your backend code
const users = await User.find();
console.log(users);
```

```bash
# In MongoDB shell (mongosh)
db.users.find().pretty()
```

### 2. Count Documents
```javascript
// Backend
const userCount = await User.countDocuments();
const lawyerCount = await Lawyer.countDocuments();
const consultationCount = await Consultation.countDocuments();
```

```bash
# MongoDB shell
db.users.countDocuments()
db.lawyers.countDocuments()
db.consultations.countDocuments()
```

### 3. Find Specific User
```javascript
// By email
const user = await User.findOne({ email: "john@example.com" });

// By ID
const user = await User.findById("65c1234567890abcdef12345");
```

### 4. Find Lawyers by Specialization
```javascript
const criminalLawyers = await Lawyer.find({
  specialization: { $in: ["Criminal Law"] },
  availability: true
});
```

### 5. Get User's Consultations
```javascript
const myConsultations = await Consultation.find({ clientId: userId })
  .populate('lawyerId', 'name specialization rating')
  .sort({ createdAt: -1 });
```

---

## 📈 Database Growth Projection

### Storage Estimates:

| Collection | Avg Doc Size | 1K Records | 10K Records | 100K Records |
|------------|--------------|------------|-------------|--------------|
| **users** | ~400 bytes | ~400 KB | ~4 MB | ~40 MB |
| **lawyers** | ~800 bytes | ~800 KB | ~8 MB | ~80 MB |
| **consultations** | ~1 KB | ~1 MB | ~10 MB | ~100 MB |
| **Total** | - | ~2.2 MB | ~22 MB | ~220 MB |

### Free Tier Capacity (512 MB):
- ✅ Can handle ~50,000 users
- ✅ Can handle ~25,000 lawyers
- ✅ Can handle ~250,000 consultations
- ✅ Perfect for small to medium production apps!

---

## 🚀 Next Steps

### 1. Import to MongoDB Atlas
```bash
mongorestore \
  --uri="mongodb+srv://user:pass@cluster.mongodb.net/legaliq" \
  ./mongodb-backup/legaliq
```

### 2. Verify Import
```bash
# Connect to Atlas
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/legaliq"

# Check collections
show collections

# Count documents
db.users.countDocuments()        # Should show: 1
db.lawyers.countDocuments()      # Should show: 0
db.consultations.countDocuments() # Should show: 0
```

### 3. Update Backend Configuration
```env
# backend/.env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/legaliq
```

### 4. Test Application
- Login with Google OAuth
- Your user data will be in the cloud!
- Ready to add lawyers and book consultations

---

## 💡 Key Takeaways

1. **3 Collections** = 3 "Tables" in your database
   - `users`: Client accounts
   - `lawyers`: Lawyer profiles
   - `consultations`: Appointment bookings

2. **Collections are Connected** via ObjectId references
   - Like foreign keys in SQL
   - Use `.populate()` to join data

3. **Currently Have**:
   - ✅ 1 user (your Google OAuth account)
   - ⏳ 0 lawyers (ready for registrations)
   - ⏳ 0 consultations (ready for bookings)

4. **After Atlas Migration**:
   - Same structure in the cloud
   - Always available (99.995% uptime)
   - Automatic scaling
   - Built-in security

---

## 📚 Related Documentation

- **Full Schema Details**: See `DATABASE_SCHEMA.md`
- **Atlas Setup Guide**: See `MONGODB_ATLAS_SETUP.md`
- **Migration Guide**: See `MONGODB_ATLAS_MIGRATION.md`

---

**🎯 Ready to migrate!** Your database structure is well-designed and ready for production use in MongoDB Atlas.
