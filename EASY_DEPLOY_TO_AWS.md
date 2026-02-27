# Easy Deployment to AWS EC2 - Step by Step

## Method 1: Using Git (Recommended - Easiest)

### Step 1: Commit and Push Changes from Your Local Machine

```bash
# In your local project directory (IndianLaw/karnataka-bar-association)
cd ~/IndianLaw/karnataka-bar-association

# Check what files changed
git status

# Add all changes
git add .

# Commit with a message
git commit -m "Fix hardcoded localhost URLs and update consultation fees"

# Push to GitHub
git push origin main
```

### Step 2: Pull Changes on AWS EC2

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@13.62.225.158

# Navigate to project directory
cd ~/legqlIQ

# Pull latest changes
git pull origin main

# Rebuild frontend (important!)
npm run build

# Restart services
pm2 restart all

# Check status
pm2 status
```

That's it! ✅

---

## Method 2: Using SCP (If Git is Not Set Up)

### Step 1: Create a Deployment Package

```bash
# On your local machine
cd ~/IndianLaw/karnataka-bar-association

# Create a tar file excluding node_modules
tar -czf ~/Desktop/legaliq-update.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='build' \
  src/ backend/controllers/ backend/models/

# This creates a compressed file on your Desktop
```

### Step 2: Copy to EC2

```bash
# Copy the file to EC2
scp -i your-key.pem ~/Desktop/legaliq-update.tar.gz ubuntu@13.62.225.158:~/

# SSH into EC2
ssh -i your-key.pem ubuntu@13.62.225.158

# Extract the files
cd ~/legqlIQ
tar -xzf ~/legaliq-update.tar.gz

# Rebuild and restart
npm run build
pm2 restart all
```

---

## Method 3: Direct File Copy (Quickest for Few Files)

### Copy Individual Files

```bash
# From your local machine, copy specific files
# Replace 'your-key.pem' with your actual key file

# Copy Register.jsx
scp -i your-key.pem \
  ~/IndianLaw/karnataka-bar-association/src/components/Register.jsx \
  ubuntu@13.62.225.158:~/legqlIQ/src/components/

# Copy VideoConsultationList.jsx
scp -i your-key.pem \
  ~/IndianLaw/karnataka-bar-association/src/components/VideoConsultationList.jsx \
  ubuntu@13.62.225.158:~/legqlIQ/src/components/

# Copy App.jsx
scp -i your-key.pem \
  ~/IndianLaw/karnataka-bar-association/src/App.jsx \
  ubuntu@13.62.225.158:~/legqlIQ/src/

# Copy LawyerCard.jsx
scp -i your-key.pem \
  ~/IndianLaw/karnataka-bar-association/src/components/LawyerCard.jsx \
  ubuntu@13.62.225.158:~/legqlIQ/src/components/

# Copy AppointmentManager.jsx
scp -i your-key.pem \
  ~/IndianLaw/karnataka-bar-association/src/components/AppointmentManager.jsx \
  ubuntu@13.62.225.158:~/legqlIQ/src/components/

# Copy authController.js
scp -i your-key.pem \
  ~/IndianLaw/karnataka-bar-association/backend/controllers/authController.js \
  ubuntu@13.62.225.158:~/legqlIQ/backend/controllers/

# Then SSH and rebuild
ssh -i your-key.pem ubuntu@13.62.225.158
cd ~/legqlIQ
npm run build
pm2 restart all
```

---

## Recommended: Method 1 (Git) - Complete Commands

Here's the complete sequence for the easiest method:

### On Your Local Machine:

```bash
# Navigate to project
cd ~/IndianLaw/karnataka-bar-association

# Stage all changes
git add .

# Commit changes
git commit -m "Fix localhost URLs and update consultation fees to 500"

# Push to GitHub
git push origin main
```

### On AWS EC2:

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@13.62.225.158

# Navigate to project
cd ~/legqlIQ

# Pull latest changes
git pull origin main

# Install any new dependencies (if needed)
npm install
cd backend && npm install && cd ..

# Rebuild frontend
npm run build

# Restart all services
pm2 restart all

# Verify everything is running
pm2 status
pm2 logs --lines 50
```

---

## Verification After Deployment

### 1. Check Services Status
```bash
pm2 status
```

### 2. Check Logs
```bash
# View all logs
pm2 logs

# View backend logs only
pm2 logs backend

# View frontend logs only
pm2 logs frontend
```

### 3. Test API Endpoint
```bash
# Test from EC2 instance
curl http://localhost:4000/api/lawyers?limit=5

# Test from outside
curl http://13.62.225.158:4000/api/lawyers?limit=5
```

### 4. Test Registration from Browser
1. Open: `http://13.62.225.158:5173/register`
2. Fill in the registration form
3. Submit and check if it works
4. Open browser console (F12) and check Network tab
5. Verify API calls go to `13.62.225.158:4000` not `localhost:4000`

---

## Troubleshooting

### If Git Pull Fails (Merge Conflicts)

```bash
# On EC2, backup current changes
cd ~/legqlIQ
cp -r src src_backup
cp -r backend backend_backup

# Force pull (overwrites local changes)
git fetch origin
git reset --hard origin/main

# Rebuild
npm run build
pm2 restart all
```

### If Services Don't Start

```bash
# Check what's running on ports
netstat -tulpn | grep -E '4000|5173'

# Kill any stuck processes
pkill -f "node server.js"
pkill -f "vite"

# Start fresh
cd ~/legqlIQ/backend
node server.js &

cd ~/legqlIQ
npm run dev -- --host 0.0.0.0 --port 5173 &
```

### If PM2 is Not Working

```bash
# Reinstall PM2
npm install -g pm2

# Start services manually
cd ~/legqlIQ/backend
pm2 start server.js --name backend

cd ~/legqlIQ
pm2 start "npm run dev -- --host 0.0.0.0 --port 5173" --name frontend

# Save PM2 configuration
pm2 save
pm2 startup
```

---

## Quick Reference Card

**Fastest Method (Git):**
```bash
# Local
cd ~/IndianLaw/karnataka-bar-association
git add . && git commit -m "updates" && git push

# EC2
ssh -i key.pem ubuntu@13.62.225.158
cd ~/legqlIQ && git pull && npm run build && pm2 restart all
```

**One-Line Deploy Command (after SSH):**
```bash
cd ~/legqlIQ && git pull && npm run build && pm2 restart all && pm2 logs --lines 20
```

---

## Important Notes

1. **Always rebuild frontend** after pulling changes (Vite needs rebuild for env vars)
2. **Check PM2 logs** after restart to catch any errors early
3. **Test in browser** to verify changes are live
4. **Keep backups** before major updates
5. **Use Git** for version control and easy rollbacks

---

## Need Help?

If something goes wrong:

1. Check PM2 logs: `pm2 logs`
2. Check if services are running: `pm2 status`
3. Check ports: `netstat -tulpn | grep -E '4000|5173'`
4. Restart everything: `pm2 restart all`
5. If all else fails, reboot EC2 instance from AWS Console
