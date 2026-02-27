# Complete EC2 Deployment - All Commands from CloudShell to Production

## 📋 Prerequisites

- ✅ EC2 Instance running: **13.62.225.158** (i-065d1191523b74c99)
- ✅ Files in CloudShell: `/home/cloudshell-user/legqlIQ/`
- ✅ Access to EC2 via Session Manager or SSH

---

## PART 1: Export from CloudShell

### Step 1: Create Tarball in CloudShell

```bash
# Navigate to parent directory
cd /home/cloudshell-user

# Create tarball
tar -czf legqlIQ.tar.gz legqlIQ/

# Verify tarball created
ls -lh legqlIQ.tar.gz
```

### Step 2: Upload to S3

```bash
# Create S3 bucket (use unique name)
BUCKET_NAME="legaliq-deploy-$(date +%s)"
aws s3 mb s3://$BUCKET_NAME --region eu-north-1

# Upload tarball
aws s3 cp legqlIQ.tar.gz s3://$BUCKET_NAME/

# Verify upload
aws s3 ls s3://$BUCKET_NAME/

# Save bucket name for later
echo "Your bucket name: $BUCKET_NAME"
```

**Important**: Copy the bucket name that's printed!

---

## PART 2: Connect to EC2

### Option A: Using Session Manager (Recommended)

1. Go to: https://eu-north-1.console.aws.amazon.com/systems-manager/session-manager/start-session?region=eu-north-1
2. Select instance **i-065d1191523b74c99**
3. Click **Start session**
4. Once connected, run:

```bash
# Switch to ec2-user
sudo su - ec2-user
cd ~
```

### Option B: Using SSH (if you have the key)

```bash
# From CloudShell or local machine
ssh -i your-key.pem ec2-user@13.62.225.158
```

---

## PART 3: Install Dependencies on EC2

**Run these commands on EC2 (after connecting):**

### Step 1: Update System

```bash
sudo yum update -y
```

### Step 2: Install Node.js

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Load NVM
source ~/.bashrc

# Install Node.js 18
nvm install 18

# Verify installation
node --version
npm --version
```

### Step 3: Install Nginx

```bash
sudo yum install nginx -y

# Verify installation
nginx -v
```

---

## PART 4: Download and Extract Application

**Replace `YOUR-BUCKET-NAME` with the bucket name from Step 2:**

```bash
# Download from S3
aws s3 cp s3://YOUR-BUCKET-NAME/legqlIQ.tar.gz .

# Extract
tar -xzf legqlIQ.tar.gz

# Verify extraction
ls -la legqlIQ/

# Navigate to project
cd legqlIQ
```

---

## PART 5: Build Application

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Build Frontend

```bash
# Build for production
npm run build

# Verify dist folder created
ls -la dist/

# Check if index.html exists
ls -la dist/index.html
```

---

## PART 6: Configure Nginx

### Step 1: Remove Existing Configs

```bash
sudo rm -f /etc/nginx/conf.d/*.conf
sudo rm -f /etc/nginx/sites-enabled/*
```

### Step 2: Create New Config

```bash
sudo bash -c 'cat > /etc/nginx/conf.d/legaliq.conf << '\''EOF'\''
server {
    listen 80;
    server_name _;
    root /home/ec2-user/legqlIQ/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Handle React Router (SPA)
    location / {
        try_files $uri /index.html;
    }
    
    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Don't cache index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires 0;
    }
}
EOF'
```

### Step 3: Fix Permissions

```bash
chmod 755 /home/ec2-user
chmod 755 /home/ec2-user/legqlIQ
chmod -R 755 /home/ec2-user/legqlIQ/dist
```

### Step 4: Test and Start Nginx

```bash
# Test configuration
sudo nginx -t

# Start nginx
sudo systemctl start nginx

# Enable nginx to start on boot
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

---

## PART 7: Start Backend (Optional)

### Option A: Simple Start (for testing)

```bash
cd ~/legqlIQ/backend
npm start &
```

### Option B: Production Start with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start backend with PM2
cd ~/legqlIQ/backend
pm2 start server.js --name legaliq-backend

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it gives you (copy and run it)

# Check status
pm2 status
```

---

## PART 8: Open Ports in Security Group

### Via AWS Console:

1. Go to: https://console.aws.amazon.com/ec2/
2. Select instance **i-065d1191523b74c99**
3. Click **Security** tab
4. Click security group name
5. Click **Edit inbound rules**
6. Add these rules:

| Type | Port | Source | Description |
|------|------|--------|-------------|
| HTTP | 80 | 0.0.0.0/0 | Public HTTP access |
| Custom TCP | 4000 | 0.0.0.0/0 | Backend API (optional) |

7. Click **Save rules**

---

## PART 9: Test Your Application

### Test from EC2:

```bash
# Test nginx locally
curl http://localhost

# Should return HTML content
```

### Test from Browser:

Open: **http://13.62.225.158**

You should see your LegalIQ application!

---

## PART 10: Verify Everything is Running

```bash
# Check nginx status
sudo systemctl status nginx

# Check if nginx is listening on port 80
sudo netstat -tulpn | grep :80

# Check backend (if using PM2)
pm2 status

# Check nginx logs
sudo tail -50 /var/log/nginx/error.log
sudo tail -50 /var/log/nginx/access.log

# Check disk space
df -h

# Check memory
free -h
```

---

## 🎯 Complete Command Sequence (Copy-Paste)

### In CloudShell:

```bash
cd /home/cloudshell-user
tar -czf legqlIQ.tar.gz legqlIQ/
BUCKET_NAME="legaliq-deploy-$(date +%s)"
aws s3 mb s3://$BUCKET_NAME --region eu-north-1
aws s3 cp legqlIQ.tar.gz s3://$BUCKET_NAME/
echo "Bucket: $BUCKET_NAME"
```

### In EC2 (via Session Manager):

```bash
# Switch to ec2-user
sudo su - ec2-user
cd ~

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18

# Install nginx
sudo yum install nginx -y

# Download and extract (REPLACE YOUR-BUCKET-NAME)
aws s3 cp s3://YOUR-BUCKET-NAME/legqlIQ.tar.gz .
tar -xzf legqlIQ.tar.gz
cd legqlIQ

# Install and build
npm install
cd backend && npm install && cd ..
npm run build

# Configure nginx
sudo rm -f /etc/nginx/conf.d/*.conf
sudo bash -c 'cat > /etc/nginx/conf.d/legaliq.conf << '\''EOF'\''
server {
    listen 80;
    root /home/ec2-user/legqlIQ/dist;
    index index.html;
    location / {
        try_files $uri /index.html;
    }
    location /api {
        proxy_pass http://localhost:4000;
    }
}
EOF'

# Fix permissions and start
chmod 755 /home/ec2-user /home/ec2-user/legqlIQ
chmod -R 755 /home/ec2-user/legqlIQ/dist
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx

# Start backend
npm install -g pm2
cd backend
pm2 start server.js --name legaliq-backend
pm2 save
pm2 startup

# Test
curl http://localhost
```

---

## ✅ Success Checklist

- [ ] Tarball created in CloudShell
- [ ] Uploaded to S3
- [ ] Connected to EC2
- [ ] Node.js installed
- [ ] Nginx installed
- [ ] Files downloaded from S3
- [ ] Dependencies installed
- [ ] Frontend built
- [ ] Nginx configured
- [ ] Permissions fixed
- [ ] Nginx started
- [ ] Backend started (optional)
- [ ] Port 80 opened in security group
- [ ] Application accessible at http://13.62.225.158

---

## 🆘 Troubleshooting

### If nginx fails to start:
```bash
sudo nginx -t
sudo tail -50 /var/log/nginx/error.log
```

### If can't access from browser:
```bash
# Check security group has port 80 open
# Check nginx is running
sudo systemctl status nginx
```

### If getting 500 error:
```bash
# Check dist folder exists
ls -la ~/legqlIQ/dist/
# Check permissions
ls -ld /home/ec2-user /home/ec2-user/legqlIQ
```

---

**Your Application URL**: http://13.62.225.158
