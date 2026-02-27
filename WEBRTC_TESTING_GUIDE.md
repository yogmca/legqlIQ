# WebRTC Video Consultation Testing Guide

## Overview
This guide explains how to test the WebRTC peer-to-peer video consultation feature in both **Mock Mode** (for local development) and **Real Mode** (for production).

---

## Configuration

### Environment Variables (`.env` file)

```env
# WebRTC Configuration
VITE_ENABLE_WEBRTC=true    # Set to 'true' for real WebRTC, 'false' for mock mode
VITE_SOCKET_URL=http://localhost:4000  # WebSocket server URL
```

### Switching Between Modes

**Mock Mode (Local Development - No Real Connection):**
```env
VITE_ENABLE_WEBRTC=false
```
- Shows only your own camera
- No peer-to-peer connection
- Good for UI/UX testing
- No need for multiple devices

**Real Mode (Production - Actual P2P Connection):**
```env
VITE_ENABLE_WEBRTC=true
```
- Establishes real WebRTC connection
- Both users see each other
- Requires WebSocket signaling server
- Needs two separate devices/browsers

---

## Testing Real WebRTC Mode

### Prerequisites
1. ✅ Backend server running with Socket.io (`node server.js`)
2. ✅ Frontend dev server running (`npm run dev`)
3. ✅ `VITE_ENABLE_WEBRTC=true` in `.env`
4. ✅ Two separate browser windows/devices
5. ✅ Camera and microphone permissions granted

### Test Scenario 1: Same Computer, Two Browser Windows

**Step 1: Open Two Browser Windows**
- Window 1: `http://localhost:5173` (Client)
- Window 2: `http://localhost:5173` (Lawyer - use incognito/private mode)

**Step 2: Create Two User Accounts**
- Window 1: Register/Login as Client (e.g., client@test.com)
- Window 2: Register/Login as Lawyer (e.g., lawyer@test.com)

**Step 3: Book a Consultation**
- In Window 1 (Client):
  1. Go to "Video Consultations"
  2. Select a lawyer
  3. Fill consultation form
  4. Complete payment (₹1 for testing)
  5. Go to "My Appointments"

**Step 4: Start Video Call**
- In Window 1 (Client):
  - Click "Start Video Call" button
  - Allow camera/microphone access
  - You should see "Connecting..." status

- In Window 2 (Lawyer):
  - Go to "My Appointments" (you should see the same consultation)
  - Click "Start Video Call" button
  - Allow camera/microphone access

**Step 5: Verify Connection**
- Both windows should show:
  - ✅ Status changes to "Connected"
  - ✅ Timer starts counting
  - ✅ Client sees lawyer's video feed
  - ✅ Lawyer sees client's video feed
  - ✅ Both can toggle audio/video
  - ✅ Chat functionality works

### Test Scenario 2: Two Different Devices

**Device 1 (Client):**
- Connect to: `http://YOUR_LOCAL_IP:5173`
- Login as client
- Book consultation
- Start video call

**Device 2 (Lawyer):**
- Connect to: `http://YOUR_LOCAL_IP:5173`
- Login as lawyer
- Go to appointments
- Start video call

**Note:** Replace `YOUR_LOCAL_IP` with your computer's local IP address (e.g., `192.168.1.100`)

---

## Testing Mock Mode

### Configuration
```env
VITE_ENABLE_WEBRTC=false
```

### Test Steps
1. Login to the application
2. Book a consultation
3. Go to "My Appointments"
4. Click "Start Video Call"
5. You should see:
   - ✅ Your own camera feed
   - ✅ "DEMO MODE" badge in header
   - ✅ "Demo Mode - No real connection" text
   - ✅ All controls work (mute, camera toggle, etc.)
   - ⚠️ No remote video (expected behavior)

---

## Troubleshooting

### Issue: "Unable to access camera/microphone"
**Solution:**
- Grant browser permissions for camera/microphone
- Check if another application is using the camera
- Try a different browser

### Issue: "Connection Failed" or stuck on "Connecting..."
**Solution:**
- Verify backend server is running
- Check `VITE_SOCKET_URL` matches backend URL
- Open browser console (F12) and check for errors
- Ensure both users are in the same consultation

### Issue: Can't see remote video
**Solution:**
- Verify `VITE_ENABLE_WEBRTC=true`
- Check that both users clicked "Start Video Call"
- Look for WebRTC errors in browser console
- Try refreshing both browser windows

### Issue: Socket.io connection errors
**Solution:**
- Restart backend server
- Clear browser cache
- Check firewall settings
- Verify port 4000 is not blocked

---

## Browser Console Logs

### Expected Logs (Real Mode)
```
[WebRTC] Initialized for consultation 65abc123... as client
[Signaling] New connection: socket_id_123
[Signaling] client user_id joining consultation consultation_id
[WebRTC] Local stream acquired
[WebRTC] Peer connection created
[WebRTC] Both peers ready, initiating connection
[WebRTC] Sending offer
[WebRTC] Received answer
[WebRTC] Connection state: connected
```

### Expected Logs (Mock Mode)
```
[VideoConsultation] Initializing Mock mode (local development)
```

---

## Network Requirements

### Ports
- **Frontend:** 5173 (Vite dev server)
- **Backend:** 4000 (Express + Socket.io)

### Firewall Rules
- Allow incoming connections on port 4000
- Allow WebRTC traffic (UDP ports 49152-65535)

### STUN Servers (Already Configured)
- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`
- `stun:stun2.l.google.com:19302`

---

## Production Deployment

### For Production Environment

1. **Update `.env` for production:**
```env
VITE_ENABLE_WEBRTC=true
VITE_SOCKET_URL=https://your-domain.com
```

2. **Backend Configuration:**
- Use HTTPS (required for WebRTC in production)
- Configure CORS properly
- Consider using TURN servers for better connectivity

3. **TURN Servers (Optional but Recommended):**
- For users behind strict firewalls/NAT
- Services: Twilio, Xirsys, or self-hosted coturn
- Add to `webrtcService.js` ICE_SERVERS configuration

---

## Feature Checklist

### Mock Mode Features
- [x] Local camera access
- [x] Audio/video controls
- [x] Call timer
- [x] Chat interface
- [x] Demo mode indicator
- [x] End call functionality

### Real Mode Features
- [x] Peer-to-peer connection
- [x] Remote video stream
- [x] WebRTC signaling
- [x] ICE candidate exchange
- [x] Connection state management
- [x] Automatic reconnection
- [x] Peer join/leave notifications

---

## Quick Switch Commands

### Enable Real Mode
```bash
# Edit .env file
sed -i '' 's/VITE_ENABLE_WEBRTC=false/VITE_ENABLE_WEBRTC=true/' .env
```

### Enable Mock Mode
```bash
# Edit .env file
sed -i '' 's/VITE_ENABLE_WEBRTC=true/VITE_ENABLE_WEBRTC=false/' .env
```

**Note:** After changing `.env`, Vite will automatically restart the dev server.

---

## Support

For issues or questions:
1. Check browser console for errors
2. Review backend server logs
3. Verify environment configuration
4. Test with different browsers
5. Check network connectivity

---

## Summary

✅ **Mock Mode:** Perfect for local UI testing without needing multiple devices
✅ **Real Mode:** Full peer-to-peer video with actual connections
✅ **Easy Switch:** Just change one environment variable
✅ **Production Ready:** Configured with STUN servers and proper error handling
