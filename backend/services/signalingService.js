/**
 * WebRTC Signaling Service
 * Handles real-time signaling for peer-to-peer video consultations
 */

class SignalingService {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // consultationId -> { client: socketId, lawyer: socketId }
    this.users = new Map(); // socketId -> { userId, role, consultationId }
  }

  initialize() {
    this.io.on('connection', (socket) => {
      console.log(`[Signaling] New connection: ${socket.id}`);

      // Join consultation room
      socket.on('join-consultation', ({ consultationId, userId, role }) => {
        console.log(`[Signaling] ${role} ${userId} joining consultation ${consultationId}`);
        
        socket.join(consultationId);
        
        // Store user info
        this.users.set(socket.id, { userId, role, consultationId });
        
        // Get or create room
        if (!this.rooms.has(consultationId)) {
          this.rooms.set(consultationId, {});
        }
        
        const room = this.rooms.get(consultationId);
        room[role] = socket.id;
        
        // Notify the other peer that someone joined
        socket.to(consultationId).emit('peer-joined', { role });
        
        // If both peers are present, notify them to start connection
        if (room.client && room.lawyer) {
          console.log(`[Signaling] Both peers present in ${consultationId}`);
          this.io.to(consultationId).emit('ready-to-connect');
        }
      });

      // Handle WebRTC offer
      socket.on('offer', ({ consultationId, offer }) => {
        console.log(`[Signaling] Offer received for ${consultationId}`);
        socket.to(consultationId).emit('offer', { offer });
      });

      // Handle WebRTC answer
      socket.on('answer', ({ consultationId, answer }) => {
        console.log(`[Signaling] Answer received for ${consultationId}`);
        socket.to(consultationId).emit('answer', { answer });
      });

      // Handle ICE candidates
      socket.on('ice-candidate', ({ consultationId, candidate }) => {
        console.log(`[Signaling] ICE candidate received for ${consultationId}`);
        socket.to(consultationId).emit('ice-candidate', { candidate });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`[Signaling] Disconnection: ${socket.id}`);
        
        const userInfo = this.users.get(socket.id);
        if (userInfo) {
          const { consultationId, role } = userInfo;
          
          // Notify the other peer
          socket.to(consultationId).emit('peer-disconnected', { role });
          
          // Clean up room
          const room = this.rooms.get(consultationId);
          if (room) {
            delete room[role];
            if (Object.keys(room).length === 0) {
              this.rooms.delete(consultationId);
            }
          }
          
          this.users.delete(socket.id);
        }
      });

      // Handle leave consultation
      socket.on('leave-consultation', ({ consultationId }) => {
        console.log(`[Signaling] User leaving consultation ${consultationId}`);
        
        const userInfo = this.users.get(socket.id);
        if (userInfo) {
          const { role } = userInfo;
          
          socket.to(consultationId).emit('peer-left', { role });
          socket.leave(consultationId);
          
          // Clean up
          const room = this.rooms.get(consultationId);
          if (room) {
            delete room[role];
            if (Object.keys(room).length === 0) {
              this.rooms.delete(consultationId);
            }
          }
          
          this.users.delete(socket.id);
        }
      });
    });
  }

  // Get room status
  getRoomStatus(consultationId) {
    const room = this.rooms.get(consultationId);
    return {
      exists: !!room,
      clientPresent: room?.client ? true : false,
      lawyerPresent: room?.lawyer ? true : false,
      bothPresent: room?.client && room?.lawyer ? true : false
    };
  }
}

module.exports = SignalingService;
