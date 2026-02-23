import React, { useState, useEffect, useRef } from 'react';
import './VideoConsultation.css';
import WebRTCService from '../services/webrtcService';
import authService from '../services/authService';

const VideoConsultation = ({ consultation, onClose, onEndCall }) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef = useRef(null);
  const webrtcServiceRef = useRef(null);

  // Check if WebRTC is enabled via environment variable
  const isWebRTCEnabled = import.meta.env.VITE_ENABLE_WEBRTC === 'true';
  const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

  // Get the current user to determine what name to display
  const currentUser = authService.getUser();
  const isLawyer = currentUser?.role === 'lawyer';
  
  // If current user is lawyer, show client name; otherwise show lawyer name
  const otherPartyName = isLawyer
    ? (consultation.clientInfo?.name || consultation.clientName || 'Client')
    : (consultation.lawyerInfo?.name || consultation.lawyerName || 'Lawyer');

  useEffect(() => {
    // Initialize video call
    initializeVideoCall();

    return () => {
      // Cleanup
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopVideoCall();
    };
  }, []);

  const initializeVideoCall = async () => {
    try {
      if (isWebRTCEnabled) {
        // Real WebRTC mode
        await initializeWebRTC();
      } else {
        // Mock mode (local development)
        await initializeMockMode();
      }
    } catch (error) {
      console.error('Error initializing video call:', error);
      alert('Unable to access camera/microphone. Please check permissions.');
      setConnectionStatus('failed');
    }
  };

  const initializeWebRTC = async () => {
    console.log('[VideoConsultation] Initializing WebRTC mode');
    
    // Create WebRTC service instance
    webrtcServiceRef.current = new WebRTCService();

    // Set up callbacks
    webrtcServiceRef.current.onRemoteStream = (stream) => {
      console.log('[VideoConsultation] Remote stream received');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    webrtcServiceRef.current.onConnectionStateChange = (state) => {
      console.log('[VideoConsultation] Connection state:', state);
      if (state === 'connected') {
        setConnectionStatus('connected');
        setIsCallActive(true);
        startTimer();
      } else if (state === 'disconnected' || state === 'failed') {
        setConnectionStatus('failed');
      }
    };

    webrtcServiceRef.current.onPeerJoined = (role) => {
      console.log('[VideoConsultation] Peer joined:', role);
      setConnectionStatus('connecting');
    };

    webrtcServiceRef.current.onPeerLeft = (role) => {
      console.log('[VideoConsultation] Peer left:', role);
      alert(`The ${role} has left the consultation`);
    };

    // Get local stream
    const localStream = await webrtcServiceRef.current.getLocalStream();
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }

    // Initialize WebRTC connection
    const user = authService.getUser();
    const userId = user?._id || user?.id || 'unknown';
    // Determine role based on user type - check if user is a lawyer
    const role = user?.role === 'lawyer' ? 'lawyer' : 'client';
    console.log('[VideoConsultation] User role:', role, 'User:', user);

    await webrtcServiceRef.current.initialize(
      consultation._id || consultation.id,
      userId,
      role,
      socketUrl
    );
  };

  const initializeMockMode = async () => {
    console.log('[VideoConsultation] Initializing Mock mode (local development)');
    
    // Request access to camera and microphone
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    // Simulate connection establishment
    setTimeout(() => {
      setConnectionStatus('connected');
      setIsCallActive(true);
      startTimer();
    }, 2000);
  };

  const stopVideoCall = () => {
    if (isWebRTCEnabled && webrtcServiceRef.current) {
      // Close WebRTC connection
      webrtcServiceRef.current.close();
    } else {
      // Stop mock mode streams
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVideo = () => {
    if (isWebRTCEnabled && webrtcServiceRef.current) {
      const enabled = webrtcServiceRef.current.toggleVideo(!isVideoEnabled);
      setIsVideoEnabled(enabled);
    } else {
      // Mock mode
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const videoTrack = localVideoRef.current.srcObject.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !videoTrack.enabled;
          setIsVideoEnabled(videoTrack.enabled);
        }
      }
    }
  };

  const toggleAudio = () => {
    if (isWebRTCEnabled && webrtcServiceRef.current) {
      const enabled = webrtcServiceRef.current.toggleAudio(!isAudioEnabled);
      setIsAudioEnabled(enabled);
    } else {
      // Mock mode
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const audioTrack = localVideoRef.current.srcObject.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled;
          setIsAudioEnabled(audioTrack.enabled);
        }
      }
    }
  };

  const handleEndCall = () => {
    if (window.confirm('Are you sure you want to end the consultation?')) {
      stopVideoCall();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      onEndCall({
        duration: callDuration,
        endedAt: new Date().toISOString()
      });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      const newMessage = {
        id: Date.now(),
        sender: 'client',
        text: chatInput,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, newMessage]);
      setChatInput('');
    }
  };

  return (
    <div className="video-consultation-container">
      <div className="video-consultation-header">
        <div className="consultation-info">
          <h3>Video Consultation with {otherPartyName}</h3>
          <div className="call-status">
            <span className={`status-indicator ${connectionStatus}`}></span>
            <span className="status-text">
              {connectionStatus === 'connecting' && 'Connecting...'}
              {connectionStatus === 'connected' && `Connected • ${formatDuration(callDuration)}`}
              {connectionStatus === 'failed' && 'Connection Failed'}
            </span>
            {!isWebRTCEnabled && (
              <span className="demo-badge">DEMO MODE</span>
            )}
          </div>
        </div>
        <button className="btn-minimize" onClick={onClose} title="Minimize">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 10h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="video-consultation-body">
        <div className="video-grid">
          {/* Remote Video (Lawyer) */}
          <div className="video-container remote-video">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="video-element"
            />
            <div className="video-placeholder">
              <div className="avatar-large">
                {otherPartyName.split(' ')[1]?.[0] || otherPartyName[0]}
              </div>
              <p>{otherPartyName}</p>
              {connectionStatus === 'connecting' && (
                <div className="connecting-spinner"></div>
              )}
              {!isWebRTCEnabled && (
                <p className="demo-text">Demo Mode - No real connection</p>
              )}
            </div>
            <div className="video-label">{otherPartyName}</div>
          </div>

          {/* Local Video (Client) */}
          <div className="video-container local-video">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="video-element"
            />
            {!isVideoEnabled && (
              <div className="video-placeholder">
                <div className="avatar-medium">You</div>
              </div>
            )}
            <div className="video-label">You</div>
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="chat-panel">
            <div className="chat-header">
              <h4>Chat</h4>
              <button onClick={() => setShowChat(false)} className="btn-close-chat">
                &times;
              </button>
            </div>
            <div className="chat-messages">
              {chatMessages.length === 0 ? (
                <p className="no-messages">No messages yet</p>
              ) : (
                chatMessages.map(msg => (
                  <div key={msg.id} className={`chat-message ${msg.sender}`}>
                    <div className="message-content">{msg.text}</div>
                    <div className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendMessage} className="chat-input-form">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="chat-input"
              />
              <button type="submit" className="btn-send">Send</button>
            </form>
          </div>
        )}
      </div>

      <div className="video-consultation-controls">
        <div className="control-buttons">
          <button
            className={`control-btn ${!isAudioEnabled ? 'disabled' : ''}`}
            onClick={toggleAudio}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
              </svg>
            )}
          </button>

          <button
            className={`control-btn ${!isVideoEnabled ? 'disabled' : ''}`}
            onClick={toggleVideo}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/>
              </svg>
            )}
          </button>

          <button
            className="control-btn"
            onClick={() => setShowChat(!showChat)}
            title="Toggle chat"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            {chatMessages.length > 0 && (
              <span className="chat-badge">{chatMessages.length}</span>
            )}
          </button>

          <button
            className="control-btn end-call-btn"
            onClick={handleEndCall}
            title="End call"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
            </svg>
          </button>
        </div>

        <div className="consultation-details">
          <span className="case-type">{consultation.caseType}</span>
          <span className="appointment-date">
            {new Date(consultation.preferredDate).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoConsultation;
