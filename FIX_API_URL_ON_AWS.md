# Fix API URL Issue on AWS EC2

## Problem
The frontend `.env` file is pointing to `localhost:4000` instead of the production server IP `13.62.225.158:4000`, causing API calls to fail.

## Solution

### Step 1: SSH into your EC2 instance
```bash
ssh -i your-key.pem ec2-user@13.62.225.158
```

### Step 2: Navigate to your project directory
```bash
cd /path/to/karnataka-bar-association
```

### Step 3: Update the frontend .env file
```bash
nano .env
```

### Step 4: Change the VITE_API_URL
Update this line:
```
VITE_API_URL=http://localhost:4000/api
```

To:
```
VITE_API_URL=http://13.62.225.158:4000/api
```

Also update the WebSocket URL:
```
VITE_SOCKET_URL=http://13.62.225.158:4000
```

### Step 5: Save and exit
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

### Step 6: Rebuild the frontend
Since Vite uses environment variables at build time, you need to rebuild:

```bash
# Stop the frontend if it's running
pkill -f "vite"

# Rebuild the frontend
npm run build

# Restart the frontend
npm run dev -- --host 0.0.0.0 --port 5173 &
```

Or if using PM2:
```bash
pm2 restart frontend
```

### Step 7: Verify the changes
Test the API endpoint:
```bash
curl http://13.62.225.158:4000/api/lawyers?limit=12&offset=0
```

You should see JSON data with lawyers information.

### Step 8: Test from browser
Open your browser and navigate to:
```
http://13.62.225.158:5173
```

The lawyers should now load correctly.

## Alternative: Use Environment Variables at Runtime

If you want to avoid rebuilding, you can also set environment variables when starting the dev server:

```bash
VITE_API_URL=http://13.62.225.158:4000/api VITE_SOCKET_URL=http://13.62.225.158:4000 npm run dev -- --host 0.0.0.0 --port 5173
```

## Important Notes

1. **CORS Configuration**: Make sure your backend `.env` also has the correct CLIENT_URL:
   ```bash
   nano backend/.env
   ```
   
   Update:
   ```
   CLIENT_URL=http://13.62.225.158:5173
   ```

2. **Restart Backend** if you changed backend .env:
   ```bash
   cd backend
   pm2 restart backend
   # or
   pkill -f "node server.js"
   cd backend && node server.js &
   ```

3. **Security**: For production, consider using:
   - A domain name instead of IP address
   - HTTPS instead of HTTP
   - Environment-specific .env files

## Quick Fix Commands (All-in-One)

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@13.62.225.158

# Navigate to project
cd /path/to/karnataka-bar-association

# Update frontend .env
sed -i 's|VITE_API_URL=http://localhost:4000/api|VITE_API_URL=http://13.62.225.158:4000/api|g' .env
sed -i 's|VITE_SOCKET_URL=http://localhost:4000|VITE_SOCKET_URL=http://13.62.225.158:4000|g' .env

# Update backend .env
sed -i 's|CLIENT_URL=http://localhost:5173|CLIENT_URL=http://13.62.225.158:5173|g' backend/.env

# Restart services
pm2 restart all

# Or if not using PM2
pkill -f "vite"
pkill -f "node server.js"
cd backend && node server.js &
cd .. && npm run dev -- --host 0.0.0.0 --port 5173 &
```

## Verification

After making changes, verify:

1. **Backend is running**:
   ```bash
   curl http://13.62.225.158:4000/api/health
   ```

2. **Lawyers endpoint works**:
   ```bash
   curl http://13.62.225.158:4000/api/lawyers?limit=12&offset=0
   ```

3. **Frontend is accessible**:
   - Open browser: `http://13.62.225.158:5173`
   - Check browser console for errors
   - Verify lawyers are loading

## Troubleshooting

If still not working:

1. **Check if backend is running**:
   ```bash
   ps aux | grep "node server.js"
   netstat -tulpn | grep 4000
   ```

2. **Check if frontend is running**:
   ```bash
   ps aux | grep "vite"
   netstat -tulpn | grep 5173
   ```

3. **Check AWS Security Group**:
   - Port 4000 should be open
   - Port 5173 should be open
   - Check inbound rules in AWS Console

4. **Check logs**:
   ```bash
   # Backend logs
   pm2 logs backend
   
   # Frontend logs
   pm2 logs frontend
   ```
