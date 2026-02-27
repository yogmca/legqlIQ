/**
 * WebRTC Service
 * Handles peer-to-peer video/audio connections for consultations
 */

import { io } from 'socket.io-client';

// STUN servers for NAT traversal (using free Google STUN servers)
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
};

class WebRTCService {
  constructor() {
    this.socket = null;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.consultationId = null;
    this.userId = null;
    this.role = null; // 'client' or 'lawyer'
    this.isInitiator = false;
    
    // Callbacks
    this.onRemoteStream = null;
    this.onConnectionStateChange = null;
    this.onPeerJoined = null;
    this.onPeerLeft = null;
  }

  /**
   * Initialize WebRTC connection
   */
  async initialize(consultationId, userId, role, serverUrl = 'http://localhost:4000') {
    this.consultationId = consultationId;
    this.userId = userId;
    this.role = role;

    // Connect to signaling server
    this.socket = io(serverUrl, {
      transports: ['websocket'],
      reconnection: true
    });

    // Set up socket event listeners
    this.setupSocketListeners();

    // Join consultation room
    this.socket.emit('join-consultation', {
      consultationId,
      userId,
      role
    });

    console.log(`[WebRTC] Initialized for consultation ${consultationId} as ${role}`);
  }

  /**
   * Set up socket event listeners for signaling
   */
  setupSocketListeners() {
    // Peer joined the room
    this.socket.on('peer-joined', ({ role }) => {
      console.log(`[WebRTC] Peer joined: ${role}`);
      if (this.onPeerJoined) {
        this.onPeerJoined(role);
      }
    });

    // Both peers are ready to connect
    this.socket.on('ready-to-connect', async () => {
      console.log('[WebRTC] Both peers ready, initiating connection');
      console.log('[WebRTC] My role:', this.role);
      console.log('[WebRTC] Local stream exists:', !!this.localStream);
      
      // Client initiates the connection
      if (this.role === 'client') {
        console.log('[WebRTC] I am client, creating offer...');
        this.isInitiator = true;
        try {
          await this.createOffer();
        } catch (error) {
          console.error('[WebRTC] Failed to create offer:', error);
        }
      } else {
        console.log('[WebRTC] I am lawyer, waiting for offer...');
      }
    });

    // Received WebRTC offer
    this.socket.on('offer', async ({ offer }) => {
      console.log('[WebRTC] Received offer');
      await this.handleOffer(offer);
    });

    // Received WebRTC answer
    this.socket.on('answer', async ({ answer }) => {
      console.log('[WebRTC] Received answer');
      await this.handleAnswer(answer);
    });

    // Received ICE candidate
    this.socket.on('ice-candidate', async ({ candidate }) => {
      console.log('[WebRTC] Received ICE candidate');
      await this.handleIceCandidate(candidate);
    });

    // Peer disconnected
    this.socket.on('peer-disconnected', ({ role }) => {
      console.log(`[WebRTC] Peer disconnected: ${role}`);
      if (this.onPeerLeft) {
        this.onPeerLeft(role);
      }
    });

    // Peer left
    this.socket.on('peer-left', ({ role }) => {
      console.log(`[WebRTC] Peer left: ${role}`);
      if (this.onPeerLeft) {
        this.onPeerLeft(role);
      }
    });
  }

  /**
   * Get local media stream (camera and microphone)
   */
  async getLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      console.log('[WebRTC] Local stream acquired');
      return this.localStream;
    } catch (error) {
      console.error('[WebRTC] Error getting local stream:', error);
      throw error;
    }
  }

  /**
   * Create peer connection
   */
  createPeerConnection() {
    // Don't create if already exists
    if (this.peerConnection) {
      console.log('[WebRTC] Peer connection already exists');
      return;
    }
    
    this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

    // Add local stream tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Received remote track');
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      this.remoteStream.addTrack(event.track);
      
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream);
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC] Sending ICE candidate');
        this.socket.emit('ice-candidate', {
          consultationId: this.consultationId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', this.peerConnection.connectionState);
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(this.peerConnection.connectionState);
      }
    };

    console.log('[WebRTC] Peer connection created');
  }

  /**
   * Create and send offer
   */
  async createOffer() {
    try {
      this.createPeerConnection();

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      console.log('[WebRTC] Sending offer');
      this.socket.emit('offer', {
        consultationId: this.consultationId,
        offer: offer
      });
    } catch (error) {
      console.error('[WebRTC] Error creating offer:', error);
      throw error;
    }
  }

  /**
   * Handle received offer
   */
  async handleOffer(offer) {
    try {
      // Only the non-initiator (lawyer) should handle the offer
      if (this.isInitiator) {
        console.log('[WebRTC] Ignoring offer - I am the initiator');
        return;
      }
      
      this.createPeerConnection();

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      console.log('[WebRTC] Sending answer');
      this.socket.emit('answer', {
        consultationId: this.consultationId,
        answer: answer
      });
    } catch (error) {
      console.error('[WebRTC] Error handling offer:', error);
      throw error;
    }
  }

  /**
   * Handle received answer
   */
  async handleAnswer(answer) {
    try {
      // Only the initiator (client who sent the offer) should handle the answer
      if (!this.isInitiator) {
        console.log('[WebRTC] Ignoring answer - I am not the initiator');
        return;
      }
      
      // Check if we're in the right state to receive an answer
      if (this.peerConnection.signalingState !== 'have-local-offer') {
        console.log('[WebRTC] Ignoring answer - wrong state:', this.peerConnection.signalingState);
        return;
      }
      
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('[WebRTC] Answer set successfully');
    } catch (error) {
      console.error('[WebRTC] Error handling answer:', error);
      throw error;
    }
  }

  /**
   * Handle received ICE candidate
   */
  async handleIceCandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('[WebRTC] ICE candidate added');
    } catch (error) {
      console.error('[WebRTC] Error adding ICE candidate:', error);
    }
  }

  /**
   * Toggle video track
   */
  toggleVideo(enabled) {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  /**
   * Toggle audio track
   */
  toggleAudio(enabled) {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  /**
   * Close connection and cleanup
   */
  close() {
    console.log('[WebRTC] Closing connection');

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Leave consultation room
    if (this.socket) {
      this.socket.emit('leave-consultation', {
        consultationId: this.consultationId
      });
      this.socket.disconnect();
      this.socket = null;
    }

    this.remoteStream = null;
  }
}

export default WebRTCService;
