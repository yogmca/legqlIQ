# LegalIQ Database Schema Documentation

## 📊 Database Overview

**Database Name**: `legaliq`  
**Type**: MongoDB (NoSQL Document Database)  
**Collections**: 3 (Users, Lawyers, Consultations)

> **Note**: In MongoDB, we use **"Collections"** instead of "Tables" (SQL terminology). Each collection stores documents (similar to rows in SQL).

---

## 🗂️ Collections Structure

### Collection 1: **users** (User Accounts)

**Purpose**: Stores all registered users (clients) who can book consultations

**Location**: `backend/models/User.js`

#### Schema Fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Unique identifier (MongoDB auto-generates) |
| `googleId` | String | No | Google OAuth ID (for Gmail login users) |
| `name` | String | Yes | User's full name |
| `email` | String | Yes | Email address (unique, lowercase) |
| `phone` | String | No | Phone number (optional for OAuth users) |
| `password` | String | No | Hashed password (not stored for OAuth users) |
| `dateOfBirth` | Date | No | User's date of birth |
| `gender` | String | No | Options: 'male', 'female', 'other' |
| `address` | Object | No | Contains: street, city, state, pincode |
| `profilePicture` | String | No | URL to profile image |
| `role` | String | Yes | Options: 'user', 'lawyer', 'admin' (default: 'user') |
| `isVerified` | Boolean | Yes | Email verification status (default: false) |
| `createdAt` | Date | Auto | Account creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

#### Example Document:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "googleId": "108234567890123456789",
  "name": "John Doe",
  "email": "john.doe@gmail.com",
  "phone": "+91-9876543210",
  "dateOfBirth": "1990-05-15T00:00:00.000Z",
  "gender": "male",
  "address": {
    "street": "123 MG Road",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001"
  },
  "profilePicture": "https://lh3.googleusercontent.com/a/...",
  "role": "user",
  "isVerified": true,
  "createdAt": "2026-02-18T10:30:00.000Z",
  "updatedAt": "2026-02-18T10:30:00.000Z"
}
```

#### Indexes:
- `email`: Unique index for fast lookups
- `googleId`: Sparse unique index (only for OAuth users)

#### Methods:
- `comparePassword(candidatePassword)`: Verify password during login
- `getPublicProfile()`: Return safe user data (excludes password)

---

### Collection 2: **lawyers** (Lawyer Profiles)

**Purpose**: Stores lawyer profiles with professional details

**Location**: `backend/models/Lawyer.js`

#### Schema Fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Unique identifier |
| `userId` | ObjectId | No | Reference to User collection (if lawyer has account) |
| `name` | String | Yes | Lawyer's full name |
| `email` | String | Yes | Email address (unique) |
| `phone` | String | Yes | Contact phone number |
| `barRegistrationNo` | String | Yes | Bar Council registration number (unique) |
| `specialization` | Array[String] | Yes | Legal specializations (e.g., ["Criminal Law", "Civil Law"]) |
| `experience` | Number | Yes | Years of experience |
| `location` | String | Yes | City/location |
| `court` | String | Yes | Court where they practice |
| `address` | String | No | Office address |
| `languages` | Array[String] | No | Languages spoken |
| `education` | String | No | Educational qualifications |
| `description` | String | No | Professional bio |
| `profilePicture` | String | No | URL to profile photo |
| `rating` | Number | Yes | Average rating (0-5, default: 0) |
| `totalReviews` | Number | Yes | Total number of reviews (default: 0) |
| `consultationFee` | Number | Yes | Fee per consultation (default: 0) |
| `availability` | Boolean | Yes | Currently accepting consultations (default: true) |
| `isVerified` | Boolean | Yes | Bar Council verification status (default: false) |
| `createdAt` | Date | Auto | Profile creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

#### Example Document:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "name": "Adv. Priya Sharma",
  "email": "priya.sharma@lawfirm.com",
  "phone": "+91-9876543210",
  "barRegistrationNo": "KAR/2015/12345",
  "specialization": ["Criminal Law", "Family Law", "Consumer Protection"],
  "experience": 8,
  "location": "Bangalore",
  "court": "Karnataka High Court",
  "address": "456 Residency Road, Bangalore - 560025",
  "languages": ["English", "Hindi", "Kannada"],
  "education": "LLB from National Law School, Bangalore",
  "description": "Experienced criminal and family law advocate with 8+ years of practice...",
  "profilePicture": "https://example.com/profiles/priya.jpg",
  "rating": 4.7,
  "totalReviews": 156,
  "consultationFee": 1500,
  "availability": true,
  "isVerified": true,
  "createdAt": "2025-01-10T08:00:00.000Z",
  "updatedAt": "2026-02-18T12:00:00.000Z"
}
```

#### Indexes:
- `email`: Unique index
- `barRegistrationNo`: Unique index
- `userId`: Sparse index (for lawyers with user accounts)

#### Methods:
- `getPublicProfile()`: Return lawyer profile data

---

### Collection 3: **consultations** (Consultation Bookings)

**Purpose**: Stores consultation appointments between users and lawyers

**Location**: `backend/models/Consultation.js`

#### Schema Fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Unique identifier |
| `clientId` | ObjectId | Yes | Reference to User collection |
| `lawyerId` | ObjectId | Yes | Reference to Lawyer collection |
| `clientInfo` | Object | Yes | Denormalized client data (name, email, phone) |
| `lawyerInfo` | Object | Yes | Denormalized lawyer data (name, email, specialization) |
| `caseType` | String | Yes | Type of legal case (enum: 11 options) |
| `caseDescription` | String | Yes | Detailed case description (min 20 chars) |
| `preferredDate` | Date | Yes | Requested consultation date |
| `preferredTime` | String | Yes | Requested consultation time |
| `status` | String | Yes | Options: 'pending', 'confirmed', 'completed', 'cancelled', 'rescheduled' |
| `videoCallData` | Object | No | Contains: roomId, startTime, endTime, duration, recordingUrl |
| `payment` | Object | No | Contains: amount, status, transactionId, paidAt |
| `notes` | String | No | Client notes |
| `lawyerNotes` | String | No | Lawyer's private notes |
| `followUpRequired` | Boolean | No | Whether follow-up needed (default: false) |
| `followUpDate` | Date | No | Scheduled follow-up date |
| `rating` | Number | No | Client rating (1-5) |
| `review` | String | No | Client review text |
| `reviewedAt` | Date | No | Review submission timestamp |
| `createdAt` | Date | Auto | Booking creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |
| `confirmedAt` | Date | Auto | Confirmation timestamp |
| `completedAt` | Date | Auto | Completion timestamp |
| `cancelledAt` | Date | Auto | Cancellation timestamp |

#### Case Type Options (Enum):
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

#### Example Document:
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "clientId": "507f1f77bcf86cd799439011",
  "lawyerId": "507f1f77bcf86cd799439012",
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
  "caseDescription": "Need consultation regarding divorce proceedings and child custody matters...",
  "preferredDate": "2026-02-25T00:00:00.000Z",
  "preferredTime": "10:00 AM",
  "status": "confirmed",
  "videoCallData": {
    "roomId": "consultation-507f1f77bcf86cd799439013",
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
  "notes": "First consultation, need urgent advice",
  "lawyerNotes": "Client seems genuine, prepare divorce petition draft",
  "followUpRequired": true,
  "followUpDate": "2026-03-05T00:00:00.000Z",
  "rating": 5,
  "review": "Excellent consultation! Very professional and helpful.",
  "reviewedAt": "2026-02-25T11:00:00.000Z",
  "createdAt": "2026-02-20T09:15:00.000Z",
  "updatedAt": "2026-02-25T11:00:00.000Z",
  "confirmedAt": "2026-02-20T14:30:00.000Z",
  "completedAt": "2026-02-25T10:45:00.000Z"
}
```

#### Indexes:
- `clientId + createdAt`: Fast client consultation history
- `lawyerId + createdAt`: Fast lawyer consultation history
- `status`: Filter by consultation status
- `preferredDate`: Sort by appointment date

#### Methods:
- `getSummary()`: Return brief consultation overview
- `getByClient(clientId, options)`: Get all consultations for a client
- `getByLawyer(lawyerId, options)`: Get all consultations for a lawyer

---

## 🔗 Relationships (How Collections Connect)

### 1. User → Consultation (One-to-Many)
- One user can have **many consultations**
- Link: `consultations.clientId` → `users._id`

```javascript
// Get all consultations for a user
Consultation.find({ clientId: userId })
```

### 2. Lawyer → Consultation (One-to-Many)
- One lawyer can have **many consultations**
- Link: `consultations.lawyerId` → `lawyers._id`

```javascript
// Get all consultations for a lawyer
Consultation.find({ lawyerId: lawyerId })
```

### 3. User → Lawyer (Optional One-to-One)
- A lawyer can optionally have a **user account**
- Link: `lawyers.userId` → `users._id`

```javascript
// Get lawyer's user account
Lawyer.findOne({ _id: lawyerId }).populate('userId')
```

### Relationship Diagram:
```
┌─────────────┐
│    users    │
│   (clients) │
└──────┬──────┘
       │
       │ clientId (One-to-Many)
       │
       ▼
┌─────────────────┐      ┌──────────────┐
│  consultations  │◄─────┤   lawyers    │
│   (bookings)    │      │ (advocates)  │
└─────────────────┘      └──────┬───────┘
                                │
                                │ userId (Optional)
                                │
                         ┌──────▼──────┐
                         │    users    │
                         │ (lawyer acc)│
                         └─────────────┘
```

---

## 📈 Current Database Status

### Data Export Summary:
```
✅ users collection: 1 document (390 bytes)
✅ consultations collection: 0 documents (empty)
✅ lawyers collection: 0 documents (empty)
```

### Exported Files:
```
mongodb-backup/legaliq/
├── users.bson                    # Binary data (1 user)
├── users.metadata.json           # Schema metadata
├── consultations.bson            # Binary data (empty)
├── consultations.metadata.json   # Schema metadata
├── lawyers.bson                  # Binary data (empty)
├── lawyers.metadata.json         # Schema metadata
└── prelude.json                  # Export metadata
```

---

## 🔍 MongoDB vs SQL Comparison

| MongoDB | SQL | Description |
|---------|-----|-------------|
| Database | Database | Top-level container |
| Collection | Table | Stores related documents/rows |
| Document | Row | Individual record |
| Field | Column | Data attribute |
| Embedded Document | JOIN | Nested data structure |
| `_id` | Primary Key | Unique identifier |
| Reference (ObjectId) | Foreign Key | Link between collections |

### Example Comparison:

**SQL Query:**
```sql
SELECT u.name, c.caseType, l.name as lawyer_name
FROM consultations c
JOIN users u ON c.clientId = u.id
JOIN lawyers l ON c.lawyerId = l.id
WHERE c.status = 'confirmed';
```

**MongoDB Query:**
```javascript
Consultation.find({ status: 'confirmed' })
  .populate('clientId', 'name')
  .populate('lawyerId', 'name')
  .exec();
```

---

## 🛠️ Collection Operations

### Create (Insert) Operations

#### Create User:
```javascript
const user = new User({
  name: "John Doe",
  email: "john@example.com",
  phone: "+91-9876543210",
  password: "securePassword123"
});
await user.save();
```

#### Create Lawyer:
```javascript
const lawyer = new Lawyer({
  name: "Adv. Priya Sharma",
  email: "priya@lawfirm.com",
  phone: "+91-9876543210",
  barRegistrationNo: "KAR/2015/12345",
  specialization: ["Criminal Law", "Family Law"],
  experience: 8,
  location: "Bangalore",
  court: "Karnataka High Court",
  consultationFee: 1500
});
await lawyer.save();
```

#### Create Consultation:
```javascript
const consultation = new Consultation({
  clientId: userId,
  lawyerId: lawyerId,
  clientInfo: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+91-9876543210"
  },
  lawyerInfo: {
    name: "Adv. Priya Sharma",
    email: "priya@lawfirm.com",
    specialization: ["Criminal Law"]
  },
  caseType: "Family Law",
  caseDescription: "Need consultation regarding divorce proceedings...",
  preferredDate: new Date("2026-02-25"),
  preferredTime: "10:00 AM"
});
await consultation.save();
```

### Read (Query) Operations

#### Find All Users:
```javascript
const users = await User.find();
```

#### Find User by Email:
```javascript
const user = await User.findOne({ email: "john@example.com" });
```

#### Find Lawyers by Specialization:
```javascript
const lawyers = await Lawyer.find({ 
  specialization: { $in: ["Criminal Law"] } 
});
```

#### Find Consultations with Population:
```javascript
const consultations = await Consultation.find({ clientId: userId })
  .populate('lawyerId', 'name email specialization rating')
  .sort({ createdAt: -1 });
```

### Update Operations

#### Update User Profile:
```javascript
await User.findByIdAndUpdate(userId, {
  phone: "+91-9999999999",
  address: {
    city: "Mumbai",
    state: "Maharashtra"
  }
}, { new: true });
```

#### Update Consultation Status:
```javascript
await Consultation.findByIdAndUpdate(consultationId, {
  status: 'confirmed',
  confirmedAt: new Date()
}, { new: true });
```

### Delete Operations

#### Delete User:
```javascript
await User.findByIdAndDelete(userId);
```

#### Cancel Consultation:
```javascript
await Consultation.findByIdAndUpdate(consultationId, {
  status: 'cancelled',
  cancelledAt: new Date()
});
```

---

## 🔐 Data Security Features

### 1. Password Hashing
- Passwords are hashed using **bcrypt** (12 salt rounds)
- Never stored in plain text
- Automatic hashing via Mongoose pre-save hook

### 2. Field Validation
- Email format validation using regex
- Required field enforcement
- Enum validation for status fields
- Minimum length validation for descriptions

### 3. Unique Constraints
- Email addresses (users and lawyers)
- Google OAuth IDs
- Bar registration numbers

### 4. Sensitive Data Protection
- Password field has `select: false` (excluded from queries by default)
- Public profile methods exclude sensitive data

---

## 📊 Data Relationships & Integrity

### Referential Integrity:
MongoDB doesn't enforce foreign key constraints like SQL, but we maintain integrity through:

1. **ObjectId References**: Link documents across collections
2. **Populate Method**: Mongoose automatically joins related data
3. **Denormalization**: Store frequently accessed data (clientInfo, lawyerInfo) to reduce queries

### Why Denormalization?
```javascript
// Without denormalization (2 queries):
const consultation = await Consultation.findById(id);
const client = await User.findById(consultation.clientId);

// With denormalization (1 query):
const consultation = await Consultation.findById(id);
// consultation.clientInfo already has name, email, phone
```

---

## 🚀 Scaling Considerations

### Current Setup (Good for):
- ✅ Up to 10,000 users
- ✅ Up to 5,000 lawyers
- ✅ Up to 100,000 consultations
- ✅ Free tier: 512MB storage

### When to Upgrade:

#### To M10 Tier ($0.08/hour):
- More than 512MB data
- Need automatic backups
- Need dedicated resources
- Production workloads

#### Optimization Strategies:
1. **Indexes**: Already configured for common queries
2. **Pagination**: Limit query results
3. **Projection**: Select only needed fields
4. **Aggregation**: Use for complex analytics

---

## 📝 Sample Queries for Common Operations

### 1. User Registration
```javascript
// POST /api/auth/register
const user = await User.create({
  name, email, phone, password
});
```

### 2. User Login
```javascript
// POST /api/auth/login
const user = await User.findOne({ email }).select('+password');
const isMatch = await user.comparePassword(password);
```

### 3. Search Lawyers
```javascript
// GET /api/lawyers?specialization=Criminal Law&location=Bangalore
const lawyers = await Lawyer.find({
  specialization: { $in: ["Criminal Law"] },
  location: "Bangalore",
  availability: true
});
```

### 4. Book Consultation
```javascript
// POST /api/consultations
const consultation = await Consultation.create({
  clientId, lawyerId, clientInfo, lawyerInfo,
  caseType, caseDescription, preferredDate, preferredTime
});
```

### 5. Get User's Consultations
```javascript
// GET /api/consultations/user/:userId
const consultations = await Consultation.find({ clientId: userId })
  .populate('lawyerId', 'name specialization rating')
  .sort({ createdAt: -1 });
```

### 6. Get Lawyer's Appointments
```javascript
// GET /api/consultations/lawyer/:lawyerId
const appointments = await Consultation.find({ 
  lawyerId: lawyerId,
  status: { $in: ['pending', 'confirmed'] }
})
  .populate('clientId', 'name email phone')
  .sort({ preferredDate: 1 });
```

---

## 🎯 Migration to MongoDB Atlas

When you import your data to MongoDB Atlas, all three collections will be created automatically:

### Import Command:
```bash
mongorestore \
  --uri="mongodb+srv://user:pass@cluster.mongodb.net/legaliq" \
  ./mongodb-backup/legaliq
```

### What Gets Created:
1. **Database**: `legaliq`
2. **Collections**: 
   - `users` (with 1 document)
   - `consultations` (empty, ready for bookings)
   - `lawyers` (empty, ready for lawyer profiles)
3. **Indexes**: All indexes defined in models
4. **Schema Validation**: Mongoose enforces schema rules

---

## 📚 Additional Resources

### MongoDB Concepts:
- **Documents**: https://docs.mongodb.com/manual/core/document/
- **Collections**: https://docs.mongodb.com/manual/core/databases-and-collections/
- **Indexes**: https://docs.mongodb.com/manual/indexes/
- **Relationships**: https://docs.mongodb.com/manual/tutorial/model-referenced-one-to-many-relationships-between-documents/

### Mongoose Documentation:
- **Schemas**: https://mongoosejs.com/docs/guide.html
- **Models**: https://mongoosejs.com/docs/models.html
- **Queries**: https://mongoosejs.com/docs/queries.html
- **Populate**: https://mongoosejs.com/docs/populate.html

---

## ✅ Quick Reference

### View Collections in MongoDB Atlas:
1. Go to **Database** → **Browse Collections**
2. Select database: `legaliq`
3. View collections: `users`, `lawyers`, `consultations`

### View Collections via CLI:
```bash
# Connect to Atlas
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/legaliq"

# List collections
show collections

# Count documents
db.users.countDocuments()
db.lawyers.countDocuments()
db.consultations.countDocuments()

# View sample document
db.users.findOne()
```

### Backup Collections:
```bash
# Export all collections
mongodump --uri="mongodb+srv://..." --db=legaliq --out=./backup

# Export specific collection
mongodump --uri="mongodb+srv://..." --db=legaliq --collection=users --out=./backup
```

---

**🎯 Summary**: Your LegalIQ database has 3 collections (users, lawyers, consultations) with well-defined schemas and relationships. All collections will be automatically created in MongoDB Atlas when you import your data!
