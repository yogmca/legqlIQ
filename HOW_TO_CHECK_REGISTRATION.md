# How to Check if Registration is Working

## Quick Browser Test

### 1. Open the Registration Page
Open your browser and go to:
```
http://13.62.225.158:5173/register
```

### 2. Fill Out the Registration Form
- Select user type: **Client** or **Lawyer**
- Fill in all required fields:
  - Name
  - Email
  - Phone (10 digits)
  - Password (minimum 6 characters)
  - Confirm Password

### 3. Submit the Form
- Click "Create Account" button
- If working correctly:
  - ✅ No "Unable to connect to server" error
  - ✅ Redirects to homepage
  - ✅ User is logged in

### 4. Check Browser Console (F12)
- Press `F12` to open Developer Tools
- Go to **Console** tab
- Should see no errors
- Go to **Network** tab
- Look for request to `http://13.62.225.158:4000/api/auth/register`
- Status should be `201 Created` (success)

## Command Line Tests (On EC2)

### Test 1: Check Backend is Running
```bash
ps aux | grep "node.*server.js"
```
**Expected**: Should show backend process running

### Test 2: Check Frontend is Running
```bash
ps aux | grep vite
```
**Expected**: Should show vite process running

### Test 3: Check Ports are Listening
```bash
ss -tuln | grep -E "4000|5173"
```
**Expected**:
```
tcp   LISTEN 0      511                    *:4000            *:*
tcp   LISTEN 0      511                    *:5173            *:*
```

### Test 4: Test Backend API Locally
```bash
curl http://localhost:4000/api/lawyers?limit=1
```
**Expected**: JSON response with lawyer data

### Test 5: Test Backend API Externally
```bash
curl http://13.62.225.158:4000/api/lawyers?limit=1
```
**Expected**: Same JSON response (not timeout)

### Test 6: Test Registration Endpoint
```bash
curl -X POST http://13.62.225.158:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test User",
    "email": "testuser123@example.com",
    "password": "test123",
    "phone": "9876543210",
    "role": "client"
  }'
```
**Expected**: JSON response with success and token
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGc...",
  "user": {...}
}
```

### Test 7: Check Frontend is Accessible
```bash
curl -I http://13.62.225.158:5173
```
**Expected**: HTTP 200 OK

## Command Line Tests (From Your Local Computer)

### Test Backend API
```bash
curl http://13.62.225.158:4000/api/lawyers?limit=1
```
**Expected**: JSON response (not connection timeout)

### Test Registration Endpoint
```bash
curl -X POST http://13.62.225.158:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Local Test",
    "email": "localtest@example.com",
    "password": "test123",
    "phone": "1234567890",
    "role": "client"
  }'
```
**Expected**: Success response with token

## Check AWS Security Group

### Via AWS Console
1. Go to: https://console.aws.amazon.com/ec2/
2. Click **Security Groups** (left sidebar)
3. Find your security group
4. Click **Inbound rules** tab
5. Verify these rules exist:

| Type | Port | Source | Description |
|------|------|--------|-------------|
| Custom TCP | 4000 | 0.0.0.0/0 | Backend API |
| Custom TCP | 5173 | 0.0.0.0/0 | Frontend |
| SSH | 22 | 0.0.0.0/0 | SSH |

### Via AWS CLI (if configured)
```bash
aws ec2 describe-security-groups \
  --filters "Name=ip-permission.to-port,Values=4000" \
  --query 'SecurityGroups[*].[GroupId,GroupName]'
```

## Check Environment Variables

### On EC2 - Frontend .env
```bash
cat ~/legqlIQ/.env
```
**Expected**:
```
VITE_API_URL=http://13.62.225.158:4000/api
VITE_SOCKET_URL=http://13.62.225.158:4000
VITE_RAZORPAY_KEY_ID=rzp_live_SINnm2d5ld3vlh
VITE_ENABLE_WEBRTC=true
```

### On EC2 - Backend .env
```bash
cat ~/legqlIQ/backend/.env | grep -E "CLIENT_URL|SERVER_URL|PORT"
```
**Expected**:
```
PORT=4000
CLIENT_URL=http://13.62.225.158:5173
SERVER_URL=http://13.62.225.158:4000
```

## Check Logs

### Backend Logs
```bash
# If using PM2
pm2 logs backend --lines 50

# If using nohup
tail -50 ~/legqlIQ/backend.log
```
**Look for**:
- ✅ "MongoDB connected successfully"
- ✅ "Server running on port 4000"
- ❌ Any error messages

### Frontend Logs
```bash
# If using PM2
pm2 logs frontend --lines 50

# If using nohup
tail -50 ~/legqlIQ/frontend.log
```
**Look for**:
- ✅ "VITE v7.3.1 ready"
- ✅ "Local: http://localhost:5173/"
- ✅ "Network: http://172.31.19.44:5173/"

## Full System Check Script

Create and run this script on EC2:

```bash
#!/bin/bash
echo "=== System Check ==="
echo ""

echo "1. Backend Process:"
ps aux | grep "node.*server.js" | grep -v grep
echo ""

echo "2. Frontend Process:"
ps aux | grep vite | grep -v grep
echo ""

echo "3. Listening Ports:"
ss -tuln | grep -E "4000|5173"
echo ""

echo "4. Backend API Test:"
curl -s http://localhost:4000/api/lawyers?limit=1 | head -c 100
echo ""
echo ""

echo "5. Frontend Test:"
curl -s -I http://localhost:5173 | head -5
echo ""

echo "6. External Backend Test:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://13.62.225.158:4000/api/lawyers?limit=1
echo ""

echo "7. Environment Variables:"
echo "Frontend API URL: $(grep VITE_API_URL .env | cut -d'=' -f2)"
echo "Backend Port: $(grep "^PORT=" backend/.env | cut -d'=' -f2)"
echo ""

echo "=== Check Complete ==="
```

Save as `check-system.sh`, make executable, and run:
```bash
chmod +x check-system.sh
./check-system.sh
```

## What Success Looks Like

### ✅ All Working
- Backend process running
- Frontend process running
- Ports 4000 and 5173 listening
- API returns JSON (not timeout)
- Registration page loads in browser
- Can create new account without errors
- User is logged in after registration

### ❌ Still Having Issues

If you see:
- **"Connection timeout"** → Port 4000 still blocked by AWS Security Group
- **"Connection refused"** → Backend not running
- **"404 Not Found"** → Wrong API URL
- **"CORS error"** → Backend CLIENT_URL misconfigured
- **"500 Internal Server Error"** → Backend crashed, check logs

## Quick Verification Checklist

Run these commands in order:

```bash
# 1. Check processes
ps aux | grep -E "node.*server.js|vite" | grep -v grep

# 2. Check ports
ss -tuln | grep -E "4000|5173"

# 3. Test backend locally
curl http://localhost:4000/api/lawyers?limit=1

# 4. Test backend externally
curl http://13.62.225.158:4000/api/lawyers?limit=1

# 5. Test registration
curl -X POST http://13.62.225.158:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"test@test.com","password":"test123","phone":"1234567890","role":"client"}'
```

If all 5 commands work, registration is working correctly!
