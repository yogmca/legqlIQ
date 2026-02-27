# Fix "Unable to connect to server" Error on Registration Page

## Problem
When trying to register on the AWS EC2 instance, you get the error:
```
⚠ Unable to connect to server. Please try again.
```

## Root Cause
The backend server at `http://13.62.225.158:4000` is not responding to API requests.

## Quick Fix (Run on EC2)

### Option 1: Automated Fix Script
```bash
# SSH into your EC2 instance
ssh -i your-key.pem ec2-user@13.62.225.158

# Navigate to project directory
cd /path/to/karnataka-bar-association

# Make script executable
chmod +x fix-backend-connection.sh

# Run the fix script
./fix-backend-connection.sh
```

This script will:
- ✅ Check if backend is running
- ✅ Check if ports are listening
- ✅ Test MongoDB connection
- ✅ Restart backend if needed
- ✅ Restart frontend with correct config
- ✅ Verify everything is working

### Option 2: Manual Fix

#### Step 1: Check Backend Status
```bash
# Check if backend is running
ps aux | grep "node.*server.js"

# Check if port 4000 is listening
netstat -tuln | grep 4000
# or
ss -tuln | grep 4000
```

#### Step 2: Start/Restart Backend
```bash
# Navigate to backend directory
cd backend

# If using PM2
pm2 restart backend
# or start if not running
pm2 start server.js --name backend

# If NOT using PM2
# Stop existing backend
pkill -f "node.*server.js"

# Start backend
nohup node server.js > ../backend.log 2>&1 &

# Go back to project root
cd ..
```

#### Step 3: Verify Backend is Working
```bash
# Test locally
curl http://localhost:4000/api/lawyers?limit=1

# Test externally
curl http://13.62.225.158:4000/api/lawyers?limit=1

# Test registration endpoint
curl -X POST http://localhost:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"test@example.com","password":"test123","phone":"9876543210","role":"client"}'
```

You should get JSON responses. If you get "Connection refused" or no response, the backend is not running.

#### Step 4: Check Backend Logs
```bash
# If using PM2
pm2 logs backend

# If not using PM2
tail -f backend.log
```

Look for:
- ✅ "MongoDB connected successfully"
- ✅ "Server running on port 4000"
- ❌ Any error messages

#### Step 5: Restart Frontend
```bash
# Stop frontend
pkill -f "vite"

# If using PM2
pm2 restart frontend

# If NOT using PM2
nohup npm run dev -- --host 0.0.0.0 --port 5173 > frontend.log 2>&1 &
```

#### Step 6: Clear Browser Cache
1. Open browser
2. Press `Ctrl + Shift + Delete`
3. Clear cached images and files
4. Or do a hard refresh: `Ctrl + Shift + R`

## Common Issues & Solutions

### Issue 1: Backend Not Starting
**Symptoms:** Backend process dies immediately

**Check:**
```bash
cd backend
node server.js
```

**Common causes:**
- ❌ MongoDB connection failed
- ❌ Missing environment variables
- ❌ Port 4000 already in use
- ❌ Missing dependencies

**Solutions:**
```bash
# Check MongoDB connection string in backend/.env
cat backend/.env | grep MONGODB_URI

# Install dependencies
cd backend
npm install

# Check if port is in use
lsof -i :4000
# Kill process using port 4000
kill -9 <PID>
```

### Issue 2: Port 4000 Blocked by Firewall
**Symptoms:** Backend runs locally but not accessible externally

**Check AWS Security Group:**
1. Go to AWS Console → EC2 → Security Groups
2. Find your instance's security group
3. Check Inbound Rules
4. Ensure these rules exist:
   - Type: Custom TCP
   - Port: 4000
   - Source: 0.0.0.0/0 (or your IP)
   
   - Type: Custom TCP
   - Port: 5173
   - Source: 0.0.0.0/0 (or your IP)

**Add missing rules:**
```
Security Groups → Select your group → Edit inbound rules → Add rule
```

### Issue 3: MongoDB Connection Failed
**Symptoms:** Backend starts but crashes, logs show MongoDB errors

**Check:**
```bash
# View backend logs
tail -50 backend.log | grep -i mongodb

# Test MongoDB connection string
cd backend
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://yogmca_db_user:Diya2012@legaliq.b4xrthx.mongodb.net/legaliq').then(() => console.log('Connected')).catch(err => console.error(err));"
```

**Solutions:**
- Check MongoDB Atlas is accessible
- Verify connection string in `backend/.env`
- Check MongoDB Atlas IP whitelist (should allow 0.0.0.0/0 or your EC2 IP)

### Issue 4: CORS Errors
**Symptoms:** Backend works but browser shows CORS errors

**Check backend/.env:**
```bash
cat backend/.env | grep CLIENT_URL
```

Should be:
```
CLIENT_URL=http://13.62.225.158:5173
FRONTEND_URL=http://13.62.225.158:5173
```

**Fix:**
```bash
# Update backend/.env
nano backend/.env
# Change CLIENT_URL to http://13.62.225.158:5173

# Restart backend
pm2 restart backend
```

### Issue 5: Frontend Using Wrong API URL
**Symptoms:** Frontend loads but can't connect to backend

**Check .env:**
```bash
cat .env | grep VITE_API_URL
```

Should be:
```
VITE_API_URL=http://13.62.225.158:4000/api
VITE_SOCKET_URL=http://13.62.225.158:4000
```

**Fix:**
```bash
# Update .env
nano .env
# Change VITE_API_URL to http://13.62.225.158:4000/api

# Restart frontend (important - Vite reads env at startup)
pkill -f vite
npm run dev -- --host 0.0.0.0 --port 5173 &
```

## Verification Checklist

After applying fixes, verify:

- [ ] Backend is running: `ps aux | grep "node.*server.js"`
- [ ] Port 4000 is listening: `netstat -tuln | grep 4000`
- [ ] Backend API works locally: `curl http://localhost:4000/api/lawyers?limit=1`
- [ ] Backend API works externally: `curl http://13.62.225.158:4000/api/lawyers?limit=1`
- [ ] Registration endpoint works: `curl -X POST http://localhost:4000/api/auth/register -H 'Content-Type: application/json' -d '{"name":"Test","email":"test@test.com","password":"test123","phone":"1234567890","role":"client"}'`
- [ ] Frontend is running: `ps aux | grep vite`
- [ ] Port 5173 is listening: `netstat -tuln | grep 5173`
- [ ] Frontend loads: Open `http://13.62.225.158:5173` in browser
- [ ] Registration page loads: `http://13.62.225.158:5173/register`
- [ ] Browser cache cleared
- [ ] No CORS errors in browser console (F12)

## Test Registration

1. Open browser: `http://13.62.225.158:5173/register`
2. Select "Client" or "Lawyer"
3. Fill in the form
4. Click "Create Account"
5. Should redirect to homepage with user logged in

If you still see "Unable to connect to server":
- Check browser console (F12) for the actual error
- Check Network tab to see the failed request
- Verify the request is going to `http://13.62.225.158:4000/api/auth/register`

## Quick Commands Reference

```bash
# Check services status
pm2 status

# View logs
pm2 logs backend
pm2 logs frontend

# Restart all services
pm2 restart all

# Test backend
curl http://13.62.225.158:4000/api/lawyers?limit=1

# Test registration
curl -X POST http://13.62.225.158:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"test@test.com","password":"test123","phone":"1234567890","role":"client"}'

# Check ports
netstat -tuln | grep -E "4000|5173"

# Check processes
ps aux | grep -E "node|vite"
```

## Need More Help?

If the issue persists:

1. **Collect diagnostic information:**
   ```bash
   # Save to a file
   echo "=== Backend Status ===" > diagnostic.txt
   ps aux | grep "node.*server.js" >> diagnostic.txt
   echo "=== Port Status ===" >> diagnostic.txt
   netstat -tuln | grep -E "4000|5173" >> diagnostic.txt
   echo "=== Backend Logs ===" >> diagnostic.txt
   tail -50 backend.log >> diagnostic.txt
   echo "=== PM2 Status ===" >> diagnostic.txt
   pm2 status >> diagnostic.txt
   
   # View the file
   cat diagnostic.txt
   ```

2. **Check the actual error in browser:**
   - Open browser console (F12)
   - Go to Network tab
   - Try to register
   - Look at the failed request
   - Check the error message

3. **Common error messages and meanings:**
   - "ERR_CONNECTION_REFUSED" → Backend not running
   - "ERR_CONNECTION_TIMED_OUT" → Firewall blocking port
   - "CORS error" → Backend CORS misconfigured
   - "500 Internal Server Error" → Backend crashed, check logs
   - "404 Not Found" → Wrong API endpoint URL
