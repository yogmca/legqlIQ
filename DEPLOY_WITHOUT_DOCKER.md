# Deploy LegalIQ WITHOUT Docker - Simple Guide

Complete step-by-step guide to deploy LegalIQ to AWS without using Docker.

## 🎯 Overview

This method uploads your code directly to AWS EC2 and runs it with Node.js and PM2.

**Total Time**: ~30 minutes  
**Cost**: ~$10/month (free for first year)  
**Difficulty**: Easy

---

## Part 1: Prepare Your Application (On Your Mac)

### Step 1: Build Frontend

```bash
# Go to project directory
cd karnataka-bar-association

# Build production version
npm run build

# This creates a 'dist' folder with optimized files
```

### Step 2: Create Deployment Package

```bash
# Create package directory
mkdir -p legaliq-deploy
mkdir -p legaliq-deploy/frontend
mkdir -p legaliq-deploy/backend

# Copy built frontend
cp -r dist/* legaliq-deploy/frontend/

# Copy backend files
cp -r backend/* legaliq-deploy/backend/

# Copy environment template
cp .env.example legaliq-deploy/backend/.env.example

# Create archive (includes ALL code and dependencies)
cd legaliq-deploy/backend
npm install --production  # Install dependencies
cd ../..
tar -czf legaliq-deploy.tar.gz legaliq-deploy/

# You now have: legaliq-deploy.tar.gz (~300MB)
```

---

## Part 2: Set Up AWS EC2 Server

### Step 1: Create AWS Account

1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Fill in details and add credit card
4. Verify email and phone

### Step 2: Launch EC2 Instance

1. **Login to AWS Console**
   - Go to https://console.aws.amazon.com
   - Search for "EC2" and click

2. **Launch Instance**
   - Click "Launch Instance" button
   
3. **Configure Instance**:
   ```
   Name: legaliq-server
   
   Application and OS Images:
   - Ubuntu Server 22.04 LTS (Free tier eligible)
   
   Instance type:
   - t2.micro (Free tier eligible)
   
   Key pair:
   - Click "Create new key pair"
   - Name: legaliq-key
   - Key pair type: RSA
   - Private key format: .pem
   - Click "Create key pair"
   - SAVE THE FILE! (legaliq-key.pem)
   
   Network settings:
   - Allow SSH traffic from: My IP
   - Allow HTTP traffic from: Internet
   - Allow HTTPS traffic from: Internet
   
   Configure storage:
   - 20 GB gp3
   
   Click "Launch instance"
   ```

4. **Wait for Instance to Start** (~2 minutes)
   - Status should show "Running"
   - Note the "Public IPv4 address" (e.g., 54.123.45.67)

---

## Part 3: Connect to Your Server

### Step 1: Prepare SSH Key

```bash
# On your Mac, open Terminal
cd ~/Downloads  # Or wherever you saved legaliq-key.pem

# Set correct permissions
chmod 400 legaliq-key.pem

# Move to safe location
mkdir -p ~/.ssh
mv legaliq-key.pem ~/.ssh/
```

### Step 2: Connect to EC2

```bash
# Replace with YOUR EC2 public IP
ssh -i ~/.ssh/legaliq-key.pem ubuntu@54.123.45.67

# Type 'yes' when asked about fingerprint
# You should now see: ubuntu@ip-xxx:~$
```

---

## Part 4: Install Required Software on Server

### Step 1: Update System

```bash
# On EC2 server
sudo apt update
sudo apt upgrade -y
```

### Step 2: Install Node.js

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### Step 3: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### Step 4: Install Nginx (Web Server)

```bash
sudo apt install -y nginx
```

---

## Part 5: Upload Your Application

### Step 1: Upload from Your Mac

```bash
# Open NEW terminal on your Mac (keep EC2 connection open)
cd ~/IndianLaw/karnataka-bar-association

# Upload the package (replace with YOUR EC2 IP)
scp -i ~/.ssh/legaliq-key.pem legaliq-deploy.tar.gz ubuntu@54.123.45.67:/home/ubuntu/
```

### Step 2: Extract on Server

```bash
# Back in EC2 terminal
cd /home/ubuntu
tar -xzf legaliq-deploy.tar.gz
cd legaliq-deploy
```

---

## Part 6: Configure Application

### Step 1: Set Up Backend Environment

```bash
cd /home/ubuntu/legaliq-deploy/backend

# Create .env file
nano .env
```

**Paste this** (replace with YOUR values):
```env
# Server
PORT=4000
NODE_ENV=production

# MongoDB (use MongoDB Atlas - see below)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/legaliq

# JWT (generate random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d

# Session
SESSION_SECRET=your-super-secret-session-key-min-32-characters

# URLs (replace with your domain or use IP for now)
CLIENT_URL=http://54.123.45.67
SERVER_URL=http://54.123.45.67:4000

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://54.123.45.67:4000/api/auth/google/callback
```

**Save**: Press `Ctrl+X`, then `Y`, then `Enter`

### Step 2: Start Backend

```bash
# Still in backend directory
pm2 start server.js --name legaliq-backend

# Make it start on server reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs legaliq-backend
```

---

## Part 7: Configure Nginx for Frontend

### Step 1: Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/legaliq
```

**Paste this**:
```nginx
server {
    listen 80;
    server_name _;
    
    # Frontend
    root /home/ubuntu/legaliq-deploy/frontend;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API proxy
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Save**: `Ctrl+X`, `Y`, `Enter`

### Step 2: Enable Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/legaliq /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Part 8: Set Up MongoDB (Free)

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Create a new cluster (M0 - Free tier)
4. Choose AWS as provider
5. Choose region closest to your EC2 (e.g., Mumbai for India)

### Step 2: Create Database User

1. Go to "Database Access"
2. Click "Add New Database User"
3. Username: `legaliq-admin`
4. Password: Generate strong password (SAVE IT!)
5. Database User Privileges: "Read and write to any database"
6. Click "Add User"

### Step 3: Whitelist IP

1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 4: Get Connection String

1. Go to "Database" > "Connect"
2. Choose "Connect your application"
3. Copy connection string:
   ```
   mongodb+srv://legaliq-admin:<password>@cluster0.xxxxx.mongodb.net/legaliq?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password

### Step 5: Update Backend .env

```bash
# On EC2
nano /home/ubuntu/legaliq-deploy/backend/.env

# Update MONGODB_URI with your connection string
# Save and exit

# Restart backend
pm2 restart legaliq-backend
```

---

## Part 9: Update Google OAuth

### Step 1: Add EC2 IP to Google Console

1. Go to https://console.cloud.google.com/apis/credentials
2. Click on your OAuth client
3. Add to "Authorized JavaScript origins":
   - `http://54.123.45.67` (your EC2 IP)
4. Add to "Authorized redirect URIs":
   - `http://54.123.45.67:4000/api/auth/google/callback`
5. Click "Save"

---

## Part 10: Test Your Application

### Step 1: Access Your Website

Open browser and go to:
```
http://54.123.45.67
```

You should see your LegalIQ homepage!

### Step 2: Test Backend API

```
http://54.123.45.67:4000/api/health
```

Should return: `{"status":"ok",...}`

### Step 3: Test Google Login

1. Go to login page
2. Click "Continue with Google"
3. Should redirect to Google
4. After login, should redirect back

---

## Part 11: Add Custom Domain (Optional)

### If You Buy a Domain (e.g., legaliq.com)

1. **Point Domain to EC2**:
   - In your domain registrar (GoDaddy, Namecheap, etc.)
   - Add A record: `@` → `54.123.45.67`
   - Add A record: `www` → `54.123.45.67`
   - Add A record: `api` → `54.123.45.67`

2. **Update Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/legaliq
   
   # Change: server_name _;
   # To: server_name legaliq.com www.legaliq.com;
   
   sudo systemctl restart nginx
   ```

3. **Update .env**:
   ```env
   CLIENT_URL=https://legaliq.com
   SERVER_URL=https://api.legaliq.com
   GOOGLE_CALLBACK_URL=https://api.legaliq.com/api/auth/google/callback
   ```

4. **Add SSL** (Free with Let's Encrypt):
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d legaliq.com -d www.legaliq.com
   ```

---

## 🔧 Useful Commands

### Check Application Status
```bash
# Backend status
pm2 status
pm2 logs legaliq-backend

# Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
# Restart backend
pm2 restart legaliq-backend

# Restart Nginx
sudo systemctl restart nginx
```

### Update Application
```bash
# On your Mac, rebuild
cd karnataka-bar-association
npm run build
cd legaliq-deploy/backend && npm install --production && cd ../..
tar -czf legaliq-deploy.tar.gz legaliq-deploy/

# Upload to server
scp -i ~/.ssh/legaliq-key.pem legaliq-deploy.tar.gz ubuntu@54.123.45.67:/home/ubuntu/

# On server
cd /home/ubuntu
tar -xzf legaliq-deploy.tar.gz
pm2 restart legaliq-backend
```

---

## 📊 Summary

**What You Did:**
1. ✅ Built your application locally
2. ✅ Created AWS EC2 server
3. ✅ Installed Node.js and Nginx
4. ✅ Uploaded your code
5. ✅ Configured environment
6. ✅ Set up MongoDB Atlas
7. ✅ Configured Google OAuth
8. ✅ Deployed successfully!

**Your Application is Now Live!**
- Frontend: http://your-ec2-ip
- Backend: http://your-ec2-ip:4000/api
- Google Login: Working!

**Monthly Cost**: ~$10 (free for first year with AWS free tier)

---

**Congratulations! Your LegalIQ application is deployed WITHOUT Docker!** 🎉
