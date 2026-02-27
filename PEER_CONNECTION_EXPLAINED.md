# How Two Peers Connect - Data Flow Explanation

## 🔑 The Key: Consultation ID (Room ID)

When a client books a consultation, a **unique Consultation ID** is created. This ID is the "meeting room" that both lawyer and client join.

## 📊 Complete Data Flow

### Step 1: Booking Creates the Connection Point

```javascript
// Client books consultation
POST /api/consultations
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "lawyerId": 5,
  "lawyerName": "Adv. Rajesh Kumar",
  "lawyerEmail": "rajesh@kbalaw.in",
  "caseType": "Criminal Law",
  "preferredDate": "2026-02-20",
  "preferredTime": "10:00 AM",
  "caseDescription": "Need legal consultation..."
}

// Backend creates consultation with unique ID
Response:
{
  "id": 123,  // ← THIS IS THE ROOM ID!
  "status": "pending",
  "roomId": "consultation-123",  // Derived from ID
  ...
}
```

### Step 2: Both Parties Use Same Consultation ID

```
┌─────────────────────────────────────────────────────────────┐
│                    Consultation ID: 123                      │
│                   Room ID: "consultation-123"                │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
        ┌───────────────┐           ┌───────────────┐
        │  CLIENT SIDE  │           │  LAWYER SIDE  │
        │               │           │               │
        │ consultation  │           │ consultation  │
        │   .id = 123   │           │   .id = 123   │
        └───────────────┘           └───────────────┘
                │                           │
                │                           │
                └─────────────┬─────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Signaling Server │
                    │  Room: 123       │
                    └──────────────────┘
                              │
                              ▼
                    WebRTC P2P Connection
```

## 💾 Database Schema

### Consultations Table
```javascript
{
  id: 123,                              // PRIMARY KEY - This is the Room ID!
  clientName: "John Doe",
  clientEmail: "john@example.com",
  clientPhone: "9876543210",
  lawyerId: 5,
  lawyerName: "Adv. Rajesh Kumar",
  lawyerEmail: "rajesh@kbalaw.in",
  caseType: "Criminal Law",
  preferredDate: "2026-02-20",
  preferredTime: "10:00 AM",
  status: "pending",                    // pending → active → completed
  roomId: "consultation-123",           // Derived: "consultation-" + id
  createdAt: "2026-02-18T10:00:00Z"
}
```

## 🔄 Connection Flow with Data

### Client Side Flow:

```javascript
// 1. Client views their appointments
GET /api/consultations?email=john@example.com

Response:
[
  {
    id: 123,  // ← Client gets this ID
    lawyerName: "Adv. Rajesh Kumar",
    preferredDate: "2026-02-20",
    preferredTime: "10:00 AM",
    status: "pending"
  }
]

// 2. Client clicks "Start Video Call"
const consultation = { id: 123, ... };

// 3. Client joins room using consultation ID
socket.emit('join-room', {
  roomId: `consultation-${consultation.id}`,  // "consultation-123"
  userType: 'client',
  userId: 'john@example.com'
});
```

### Lawyer Side Flow:

```javascript
// 1. Lawyer views their appointments
GET /api/consultations?lawyerId=5

Response:
[
  {
    id: 123,  // ← Lawyer gets SAME ID
    clientName: "John Doe",
    preferredDate: "2026-02-20",
    preferredTime: "10:00 AM",
    status: "pending"
  }
]

// 2. Lawyer clicks "Join Consultation"
const consultation = { id: 123, ... };

// 3. Lawyer joins SAME room using SAME consultation ID
socket.emit('join-room', {
  roomId: `consultation-${consultation.id}`,  // "consultation-123" (SAME!)
  userType: 'lawyer',
  userId: 'rajesh@kbalaw.in'
});
```

## 🎯 How They Find Each Other

### Signaling Server Logic:

```javascript
// Server maintains a Map of rooms
const rooms = new Map();

// When client joins
socket.on('join-room', ({ roomId, userType, userId }) => {
  // roomId = "consultation-123"
  
  socket.join(roomId);  // Socket.IO room
  
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      consultationId: 123,
      participants: []
    });
  }
  
  rooms.get(roomId).participants.push({
    socketId: socket.id,
    userType: userType,  // 'client'
    userId: userId
  });
  
  // Notify others in the SAME room
  socket.to(roomId).emit('user-joined', {
    userType: userType
  });
});

// When lawyer joins THE SAME room
// Same logic executes, but now:
// - Room already exists
// - Client is already in the room
// - Lawyer gets added to participants
// - Client receives 'user-joined' event
// - WebRTC connection starts
```

## 📱 Real-World Example

### Scenario: John books consultation with Adv. Rajesh Kumar

```
Day 1 - Booking:
─────────────────
John (Client):
  1. Clicks "Book Consultation" on Rajesh's card
  2. Fills form and submits
  3. Backend creates: Consultation ID = 123
  4. John receives confirmation: "Booking ID: 123"

Day 2 - Consultation Time:
──────────────────────────
John (Client):
  1. Opens "My Consultations"
  2. Sees: "Consultation with Adv. Rajesh Kumar - ID: 123"
  3. Clicks "Start Video Call"
  4. App joins room: "consultation-123"
  5. Waits for lawyer...

Adv. Rajesh Kumar (Lawyer):
  1. Opens "My Consultations" (lawyer dashboard)
  2. Sees: "Consultation with John Doe - ID: 123"
  3. Clicks "Join Consultation"
  4. App joins room: "consultation-123" (SAME ROOM!)
  5. Connection established!

Result:
  ✅ Both in room "consultation-123"
  ✅ WebRTC peer connection established
  ✅ Video and audio flowing between them
```

## 🔐 Security: How to Ensure Only Authorized Users Join

```javascript
// Backend validation before allowing room join
socket.on('join-room', async ({ roomId, userType, userId, token }) => {
  // 1. Extract consultation ID from room ID
  const consultationId = parseInt(roomId.replace('consultation-', ''));
  
  // 2. Fetch consultation from database
  const consultation = await db.consultations.findById(consultationId);
  
  // 3. Verify user is authorized
  if (userType === 'client') {
    if (consultation.clientEmail !== userId) {
      socket.emit('error', 'Unauthorized');
      return;
    }
  } else if (userType === 'lawyer') {
    if (consultation.lawyerId !== userId) {
      socket.emit('error', 'Unauthorized');
      return;
    }
  }
  
  // 4. Only if authorized, allow join
  socket.join(roomId);
  // ... rest of logic
});
```

## 📊 Data Structure in Memory

```javascript
// Signaling server's rooms Map
rooms = Map {
  "consultation-123" => {
    consultationId: 123,
    participants: [
      {
        socketId: "abc123xyz",
        userType: "client",
        userId: "john@example.com",
        joinedAt: "2026-02-20T10:00:05Z"
      },
      {
        socketId: "def456uvw",
        userType: "lawyer",
        userId: "rajesh@kbalaw.in",
        joinedAt: "2026-02-20T10:00:12Z"
      }
    ],
    status: "active"
  },
  
  "consultation-124" => {
    consultationId: 124,
    participants: [
      {
        socketId: "ghi789rst",
        userType: "client",
        userId: "jane@example.com",
        joinedAt: "2026-02-20T11:00:03Z"
      }
      // Lawyer hasn't joined yet
    ],
    status: "waiting"
  }
}
```

## 🎬 Complete Code Example

### Client Component:
```javascript
const VideoConsultation = ({ consultation }) => {
  // consultation.id = 123 (from database)
  
  const roomId = `consultation-${consultation.id}`;  // "consultation-123"
  
  useEffect(() => {
    const socket = io('http://localhost:4001');
    
    // Join room using consultation ID
    socket.emit('join-room', {
      roomId: roomId,  // "consultation-123"
      userType: 'client',
      userId: consultation.clientEmail
    });
    
    // Listen for lawyer joining
    socket.on('user-joined', ({ userType }) => {
      if (userType === 'lawyer') {
        console.log('Lawyer joined! Starting WebRTC...');
        startWebRTCConnection();
      }
    });
  }, []);
};
```

### Lawyer Component:
```javascript
const LawyerVideoConsultation = ({ consultation }) => {
  // consultation.id = 123 (SAME ID from database)
  
  const roomId = `consultation-${consultation.id}`;  // "consultation-123" (SAME!)
  
  useEffect(() => {
    const socket = io('http://localhost:4001');
    
    // Join SAME room using SAME consultation ID
    socket.emit('join-room', {
      roomId: roomId,  // "consultation-123"
      userType: 'lawyer',
      userId: consultation.lawyerEmail
    });
    
    // Client receives notification that lawyer joined
    // WebRTC connection starts automatically
  }, []);
};
```

## ✅ Summary

**Two peers connect based on:**

1. **Consultation ID** (Primary Key from database)
   - Created when client books consultation
   - Stored in database
   - Both client and lawyer have access to it

2. **Room ID** (Derived from Consultation ID)
   - Format: `"consultation-{id}"`
   - Example: `"consultation-123"`
   - Used by signaling server to group participants

3. **User Authorization**
   - Client email matches consultation.clientEmail
   - Lawyer ID matches consultation.lawyerId
   - Prevents unauthorized access

**The Consultation ID is the "meeting room number" that connects them!**
