# WebRTC Peer-to-Peer Video Consultation - Implementation Guide

## Current Implementation vs Full P2P

### ✅ What's Already Implemented
- WebRTC camera and microphone access
- Video display components
- Booking system
- Appointment management
- UI/UX for video calls

### 🔄 What's Needed for True Two-Way Video (Lawyer ↔ Client)

For both lawyer and client to see each other's video in the same "channel/room", we need:

## 1. **Signaling Server** (WebSocket/Socket.IO)

The signaling server helps establish the peer-to-peer connection between lawyer and client.

### How It Works:
```
Client                 Signaling Server              Lawyer
  |                           |                         |
  |------ Join Room 123 ----->|                         |
  |                           |<----- Join Room 123 ----|
  |                           |                         |
  |<--- Offer (SDP) ----------|---------- Offer ------->|
  |<--- Answer (SDP) ---------|<--------- Answer -------|
  |<--- ICE Candidates -------|--- ICE Candidates ----->|
  |                           |                         |
  |<==========  Direct P2P Video Connection  ==========>|
```

## 2. **Implementation Options**

### Option A: Simple Socket.IO Signaling (Recommended for MVP)

**Install Dependencies:**
```bash
cd karnataka-bar-association/backend
npm install socket.io
```

**Backend Implementation** (`backend/signaling-server.js`):
```javascript
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Store active rooms
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a consultation room
  socket.on('join-room', ({ roomId, userType }) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { participants: [] });
    }
    
    rooms.get(roomId).participants.push({
      socketId: socket.id,
      userType // 'client' or 'lawyer'
    });

    // Notify others in the room
    socket.to(roomId).emit('user-joined', {
      socketId: socket.id,
      userType
    });

    console.log(`${userType} joined room ${roomId}`);
  });

  // Forward WebRTC offer
  socket.on('offer', ({ roomId, offer }) => {
    socket.to(roomId).emit('offer', {
      offer,
      from: socket.id
    });
  });

  // Forward WebRTC answer
  socket.on('answer', ({ roomId, answer }) => {
    socket.to(roomId).emit('answer', {
      answer,
      from: socket.id
    });
  });

  // Forward ICE candidates
  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', {
      candidate,
      from: socket.id
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Remove from all rooms
    rooms.forEach((room, roomId) => {
      room.participants = room.participants.filter(p => p.socketId !== socket.id);
      if (room.participants.length === 0) {
        rooms.delete(roomId);
      } else {
        socket.to(roomId).emit('user-left', socket.id);
      }
    });
    console.log('User disconnected:', socket.id);
  });
});

server.listen(4001, () => {
  console.log('Signaling server running on http://localhost:4001');
});
```

**Frontend Implementation** (Update `VideoConsultation.jsx`):
```javascript
import { io } from 'socket.io-client';

const VideoConsultation = ({ consultation, userType }) => {
  const [socket, setSocket] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    initializeConnection();
    return () => cleanup();
  }, []);

  const initializeConnection = async () => {
    // 1. Connect to signaling server
    const newSocket = io('http://localhost:4001');
    setSocket(newSocket);

    // 2. Get local media
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    localVideoRef.current.srcObject = stream;

    // 3. Create peer connection
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // 4. Add local stream to peer connection
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // 5. Handle remote stream
    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    // 6. Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        newSocket.emit('ice-candidate', {
          roomId: consultation.id,
          candidate: event.candidate
        });
      }
    };

    setPeerConnection(pc);

    // 7. Join room
    const roomId = `consultation-${consultation.id}`;
    newSocket.emit('join-room', { roomId, userType });

    // 8. Handle signaling
    newSocket.on('user-joined', async ({ userType: joinedUserType }) => {
      if (userType === 'client' && joinedUserType === 'lawyer') {
        // Client creates offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        newSocket.emit('offer', { roomId, offer });
      }
    });

    newSocket.on('offer', async ({ offer }) => {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      newSocket.emit('answer', { roomId, answer });
    });

    newSocket.on('answer', async ({ answer }) => {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    newSocket.on('ice-candidate', async ({ candidate }) => {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    });
  };

  const cleanup = () => {
    if (peerConnection) {
      peerConnection.close();
    }
    if (socket) {
      socket.disconnect();
    }
  };

  // ... rest of component
};
```

### Option B: Use Third-Party Services (Production Ready)

For production, use established services:

1. **Twilio Video** (Recommended)
   - Easy integration
   - Reliable infrastructure
   - Pay-as-you-go pricing
   ```bash
   npm install twilio-video
   ```

2. **Agora.io**
   - Good for India
   - Free tier available
   - Low latency

3. **Daily.co**
   - Simple API
   - Embedded video rooms
   - Free tier

4. **Jitsi Meet**
   - Open source
   - Self-hostable
   - Free

## 3. **Room/Channel Management**

### Database Schema for Consultation Rooms:
```javascript
{
  consultationId: 1,
  roomId: "consultation-1-abc123",
  clientSocketId: "socket-client-xyz",
  lawyerSocketId: "socket-lawyer-abc",
  status: "active", // pending, active, completed
  startedAt: "2026-02-18T10:00:00Z",
  endedAt: null
}
```

## 4. **Complete Flow**

### Client Side:
1. Books consultation → Gets consultation ID
2. At appointment time, clicks "Start Video Call"
3. Joins room: `consultation-{id}`
4. Waits for lawyer to join
5. Once lawyer joins, WebRTC connection established
6. Both see each other's video

### Lawyer Side:
1. Receives notification of booked consultation
2. At appointment time, clicks "Join Consultation"
3. Joins same room: `consultation-{id}`
4. WebRTC connection established with client
5. Both see each other's video

## 5. **Quick Start Implementation**

### Step 1: Install Socket.IO
```bash
cd karnataka-bar-association/backend
npm install socket.io

cd ../
npm install socket.io-client
```

### Step 2: Start Signaling Server
```bash
node backend/signaling-server.js
```

### Step 3: Update VideoConsultation Component
Add WebRTC peer connection logic (code provided above)

### Step 4: Test
1. Open app in two browsers
2. Book consultation in one
3. Both join the same consultation ID
4. Video connection established automatically

## 6. **Testing Two-Way Video**

### Local Testing:
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend API
cd backend && npm start

# Terminal 3: Signaling Server
node backend/signaling-server.js
```

### Test URLs:
- Client: http://localhost:5173 (Browser 1)
- Lawyer: http://localhost:5173 (Browser 2 or different device)
- Both join consultation with same ID

## 7. **Security Considerations**

- ✅ Use HTTPS in production (required for WebRTC)
- ✅ Implement authentication
- ✅ Validate room access (only authorized users)
- ✅ Use TURN servers for NAT traversal
- ✅ Encrypt signaling messages
- ✅ Implement session timeouts

## 8. **Production Deployment**

### STUN/TURN Servers:
```javascript
const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  { 
    urls: 'turn:your-turn-server.com:3478',
    username: 'user',
    credential: 'pass'
  }
];
```

### Recommended Services:
- **Twilio TURN** - Reliable, global
- **Xirsys** - Affordable TURN service
- **Self-hosted Coturn** - Open source TURN server

## Summary

**Current Status:**
- ✅ WebRTC foundation implemented
- ✅ Camera/microphone access working
- ✅ UI components ready
- ⏳ Signaling server needed for P2P connection

**Next Steps:**
1. Add Socket.IO signaling server (30 minutes)
2. Update VideoConsultation with WebRTC peer connection (1 hour)
3. Test with two browsers (15 minutes)
4. Deploy signaling server (production)

**The infrastructure is 80% complete - just need the signaling layer to connect lawyer and client in the same room!**
