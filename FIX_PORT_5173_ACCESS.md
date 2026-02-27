# Fix: Application Not Accessible on Port 5173

## 🔍 Problem

You're trying to access: `http://13.62.225.158:5173`

**Issue**: Your security group only has rules for ports 22, 80, and 443. Port **5173** (Vite dev server) is **not open**.

## 🎯 Solution Options

### Option 1: Add Port 5173 to Security Group (Quick Fix for Testing)

⚠️ **WARNING**: Port 5173 is the Vite **development server**. This should NOT be used in production!

#### Via AWS Console:
1. **AWS Console** → **EC2** → **Security Groups**
2. **Select your security group**
3. **Inbound rules** → **Edit inbound rules**
4. **Add rule**:
   - Type: **Custom TCP**
   - Port: **5173**
   - Source: **My IP** (or `YOUR_IP/32`)
   - Description: "Vite dev server - TEMPORARY"
5. **Save rules**

#### Via AWS CLI:
```bash
# Get your IP
MY_IP=$(curl -s https://checkip.amazonaws.com)

# Get your security group ID
SG_ID="sg-xxxxxxxxx"  # Replace with your actual security group ID

# Add port 5173 rule
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 5173 \
  --cidr $MY_IP/32 \
  --description "Vite dev server - TEMPORARY"

echo "✓ Port 5173 opened for your IP"
```

### Option 2: Use Production Build (RECOMMENDED)

Instead of running the dev server, build and serve the production version:

#### Step 1: SSH into your EC2 instance
```bash
ssh -i your-key.pem ec2-user@13.62.225.158
```

#### Step 2: Build the frontend
```bash
cd ~/karnataka-bar-association

# Build for production
npm run build

# This creates a 'dist' folder with optimized files
```

#### Step 3: Serve with Nginx (Port 80)

**Install Nginx:**
```bash
# For Amazon Linux 2
sudo amazon-linux-extras install nginx1 -y

# For Ubuntu
sudo apt update && sudo apt install nginx -y
```

**Configure Nginx:**
```bash
sudo nano /etc/nginx/conf.d/legaliq.conf
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name 13.62.225.158;
    root /home/ec2-user/karnataka-bar-association/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Start Nginx:**
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

**Now access**: `http://13.62.225.158` (port 80, no need to specify)

### Option 3: Run Vite with Host Flag (Temporary Testing)

If you must use the dev server:

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@13.62.225.158

cd ~/karnataka-bar-association

# Run Vite with host flag
npm run dev -- --host 0.0.0.0 --port 5173
```

Then add port 5173 to security group (Option 1 above).

## 🔒 Security Considerations

### Current Security Group Status

Your security group has:
- ✅ Port 80 (HTTP) - Open to 0.0.0.0/0
- ✅ Port 443 (HTTPS) - Open to 0.0.0.0/0
- ⚠️ Port 22 (SSH) - Open to 0.0.0.0/0 (NEEDS FIX)
- ❌ Port 5173 - Not open (that's why you can't access it)
- ❌ Port 4000 - Not open (backend API)

### Recommended Configuration

**For Production:**
```
Port 80 (HTTP)   → 0.0.0.0/0 ✅ (public website)
Port 443 (HTTPS) → 0.0.0.0/0 ✅ (public website with SSL)
Port 22 (SSH)    → YOUR_IP/32 ⚠️ (admin access only)
Port 4000        → localhost only (proxied through Nginx)
Port 5173        → CLOSED ✅ (dev server not needed)
```

**For Development/Testing:**
```
Port 80 (HTTP)   → 0.0.0.0/0 ✅
Port 443 (HTTPS) → 0.0.0.0/0 ✅
Port 22 (SSH)    → YOUR_IP/32 ⚠️
Port 4000        → YOUR_IP/32 ⚠️ (backend API)
Port 5173        → YOUR_IP/32 ⚠️ (dev server - temporary)
```

## 📋 Complete Setup Guide

### Step-by-Step Production Deployment

1. **Fix SSH Security** (CRITICAL):
```bash
MY_IP=$(curl -s https://checkip.amazonaws.com)
SG_ID="your-sg-id"

# Remove SSH from 0.0.0.0/0
aws ec2 revoke-security-group-ingress \
  --group-id $SG_ID \
  --ip-permissions IpProtocol=tcp,FromPort=22,ToPort=22,IpRanges='[{CidrIp=0.0.0.0/0}]'

# Add SSH for your IP only
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 22 \
  --cidr $MY_IP/32 \
  --description "SSH from my IP"
```

2. **SSH into EC2**:
```bash
ssh -i your-key.pem ec2-user@13.62.225.158
```

3. **Check if backend is running**:
```bash
# Check if backend is running on port 4000
sudo netstat -tulpn | grep 4000

# If not running, start it
cd ~/karnataka-bar-association/backend
npm install
node server.js
# Or with PM2:
pm2 start server.js --name legaliq-backend
```

4. **Build frontend**:
```bash
cd ~/karnataka-bar-association

# Install dependencies if needed
npm install

# Build for production
npm run build
```

5. **Install and configure Nginx**:
```bash
# Install Nginx
sudo amazon-linux-extras install nginx1 -y

# Create config
sudo tee /etc/nginx/conf.d/legaliq.conf > /dev/null <<'EOF'
server {
    listen 80;
    server_name 13.62.225.158;
    root /home/ec2-user/karnataka-bar-association/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Test and start Nginx
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx
```

6. **Access your application**:
```
http://13.62.225.158
```

## 🔍 Troubleshooting

### "Still can't access on port 80"

**Check Nginx status:**
```bash
sudo systemctl status nginx
sudo nginx -t
```

**Check Nginx logs:**
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

**Check if port 80 is listening:**
```bash
sudo netstat -tulpn | grep :80
```

### "Backend API not working"

**Check backend is running:**
```bash
sudo netstat -tulpn | grep :4000
pm2 status
pm2 logs legaliq-backend
```

**Test backend locally:**
```bash
curl http://localhost:4000/api/health
```

### "Permission denied for dist folder"

**Fix permissions:**
```bash
chmod -R 755 ~/karnataka-bar-association/dist
```

## 📊 Summary

**Current Issue**: Port 5173 not open in security group

**Quick Fix**: Add port 5173 rule (for testing only)

**Proper Solution**: 
1. Build production version (`npm run build`)
2. Serve with Nginx on port 80 (already open)
3. Access via `http://13.62.225.158`
4. Fix SSH security (restrict to your IP)

**Next Steps**:
1. Set up SSL certificate for HTTPS
2. Configure custom domain
3. Set up MongoDB Atlas connection
4. Configure environment variables

---

**⏱️ Time to fix**: 10-15 minutes for production setup
