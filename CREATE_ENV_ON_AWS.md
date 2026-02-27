# Create .env File on AWS EC2

## Problem
The `.env` file is empty on your AWS EC2 instance at `~/legqlIQ/`

## Solution

### Step 1: Create the frontend .env file

```bash
cd ~/legqlIQ
nano .env
```

### Step 2: Paste this content into the .env file

```env
# Backend API URL - Use your EC2 public IP
VITE_API_URL=http://13.62.225.158:4000/api

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_live_SINnm2d5ld3vlh

# WebRTC Configuration
VITE_ENABLE_WEBRTC=true
# WebSocket server URL - Use your EC2 public IP
VITE_SOCKET_URL=http://13.62.225.158:4000
```

### Step 3: Save the file
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

### Step 4: Create/Update backend .env file

```bash
cd ~/legqlIQ/backend
nano .env
```

### Step 5: Paste this content into backend/.env

```env
# Server Configuration
PORT=4000
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/legaliq

# Client URL - Use your EC2 public IP
CLIENT_URL=http://13.62.225.158:5173

# Session Secret
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://13.62.225.158:4000/api/auth/google/callback

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_SINnm2d5ld3vlh
RAZORPAY_KEY_SECRET=your-razorpay-secret-key

# SMS Service (if using)
SMS_API_KEY=your-sms-api-key
SMS_SENDER_ID=LEGALIQ
```

### Step 6: Save the backend .env file
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

### Step 7: Restart the services

```bash
# Go back to project root
cd ~/legqlIQ

# If using PM2
pm2 restart all

# Or manually restart
pkill -f "node server.js"
pkill -f "vite"

# Start backend
cd backend
node server.js > backend.log 2>&1 &

# Start frontend
cd ..
npm run dev -- --host 0.0.0.0 --port 5173 > frontend.log 2>&1 &
```

### Step 8: Verify the setup

```bash
# Check if backend is running
curl http://13.62.225.158:4000/api/health

# Check if lawyers endpoint works
curl http://13.62.225.158:4000/api/lawyers?limit=12&offset=0

# Check running processes
ps aux | grep node
```

## Quick Copy-Paste Commands

### Create frontend .env
```bash
cd ~/legqlIQ
cat > .env << 'EOF'
# Backend API URL
VITE_API_URL=http://13.62.225.158:4000/api

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_live_SINnm2d5ld3vlh

# WebRTC Configuration
VITE_ENABLE_WEBRTC=true
VITE_SOCKET_URL=http://13.62.225.158:4000
EOF
```

### Create backend .env
```bash
cd ~/legqlIQ/backend
cat > .env << 'EOF'
PORT=4000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/legaliq
CLIENT_URL=http://13.62.225.158:5173
SESSION_SECRET=legaliq-secret-key-change-in-production-2026
RAZORPAY_KEY_ID=rzp_live_SINnm2d5ld3vlh
RAZORPAY_KEY_SECRET=your-razorpay-secret-key
EOF
```

### Restart everything
```bash
cd ~/legqlIQ
pm2 restart all || (pkill -f "node" && pkill -f "vite" && cd backend && node server.js & cd .. && npm run dev -- --host 0.0.0.0 --port 5173 &)
```

## Verify Files Were Created

```bash
# Check frontend .env
cat ~/legqlIQ/.env

# Check backend .env
cat ~/legqlIQ/backend/.env

# Check if services are running
netstat -tulpn | grep -E '4000|5173'
```

## Important Notes

1. **Replace IP Address**: If your EC2 public IP changes, update both .env files
2. **Security**: Never commit .env files to git (they should be in .gitignore)
3. **MongoDB**: Make sure MongoDB is running: `sudo systemctl status mongod`
4. **Ports**: Ensure AWS Security Group allows inbound traffic on ports 4000 and 5173

## Troubleshooting

If the API still doesn't work:

1. **Check if MongoDB is running**:
   ```bash
   sudo systemctl status mongod
   sudo systemctl start mongod
   ```

2. **Check backend logs**:
   ```bash
   cd ~/legqlIQ/backend
   tail -f backend.log
   ```

3. **Check frontend logs**:
   ```bash
   cd ~/legqlIQ
   tail -f frontend.log
   ```

4. **Test backend directly**:
   ```bash
   curl -v http://localhost:4000/api/lawyers?limit=12&offset=0
   ```

5. **Check AWS Security Group**:
   - Go to EC2 Console
   - Select your instance
   - Click "Security" tab
   - Verify inbound rules allow ports 4000 and 5173
