# Complete EC2 Deployment Guide - Fix SSH and Deploy Application

## 🚨 Current Situation

- ✅ EC2 Instance: **13.62.225.158** (i-065d1191523b74c99)
- ❌ SSH not working - Port 22 blocked
- ❌ HTTP not working - Port 80 blocked
- 📁 Files are in CloudShell, need to move to EC2

## 🔓 Step 1: Open Required Ports in Security Group

### Open Ports via AWS Console:

1. **Go to EC2 Console**: https://console.aws.amazon.com/ec2/

2. **Navigate to Security Groups**:
   - Click **Instances** in left sidebar
   - Find instance **i-065d1191523b74c99**
   - Click the **Security** tab
   - Click on the security group name

3. **Edit Inbound Rules**:
   - Click **Inbound rules** tab
   - Click **Edit inbound rules**

4. **Add These Rules**:

   | Type | Protocol | Port | Source | Description |
   |------|----------|------|--------|-------------|
   | SSH | TCP | 22 | My IP | SSH access |
   | HTTP | TCP | 80 | 0.0.0.0/0 | HTTP access |

   **To add each rule:**
   - Click **Add rule**
   - Select **Type** (SSH or HTTP)
   - For SSH, select **Source** → **My IP** (auto-detects your IP)
   - For HTTP, select **Source** → **Anywhere-IPv4** (0.0.0.0/0)
   - Click **Add rule** for the next one

5. **Save Rules**:
   - Click **Save rules**

## 🔑 Step 2: Get Your SSH Key

### Option A: Download Key from AWS Console

1. If you created a new key pair when launching the instance:
   - The `.pem` file was downloaded to your computer
   - Find it in your Downloads folder

2. If you used an existing key:
   - You should already have the `.pem` file

### Option B: Create New Key Pair (if lost)

1. Go to **EC2 → Key Pairs**
2. Click **Create key pair**
3. Name it (e.g., `my-ec2-key`)
4. Download the `.pem` file
5. Go back to your instance → **Actions** → **Security** → **Modify instance metadata options**
6. You'll need to stop the instance and attach the new key

## 🔌 Step 3: Connect to EC2

### Option A: EC2 Instance Connect (Easiest - No Key Needed)

1. Go to EC2 Console
2. Select instance **i-065d1191523b74c99**
3. Click **Connect** button at top
4. Choose **EC2 Instance Connect** tab
5. Click **Connect**

This opens a browser-based terminal!

### Option B: SSH from Local Computer

```bash
# Set key permissions
chmod 400 your-key.pem

# Connect
ssh -i your-key.pem ec2-user@13.62.225.158
```

### Option C: SSH from CloudShell

First, upload your key to CloudShell:
1. In CloudShell, click **Actions** → **Upload file**
2. Upload your `.pem` file
3. Then:

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ec2-user@13.62.225.158
```

## 📦 Step 4: Transfer Files to EC2

### Method 1: Using S3 (Recommended)

**From CloudShell:**
```bash
cd /home/cloudshell-user
tar -czf legqlIQ.tar.gz legqlIQ/

# Create S3 bucket (if you don't have one)
aws s3 mb s3://my-legaliq-deployment-$(date +%s)

# Upload
aws s3 cp legqlIQ.tar.gz s3://YOUR-BUCKET-NAME/
```

**From EC2 (after connecting):**
```bash
# Download from S3
aws s3 cp s3://YOUR-BUCKET-NAME/legqlIQ.tar.gz .

# Extract
tar -xzf legqlIQ.tar.gz
```

### Method 2: Using Git (if you have a repo)

**From EC2:**
```bash
git clone YOUR_GITHUB_REPO_URL
cd karnataka-bar-association
```

### Method 3: Using SCP (if you have the key in CloudShell)

**From CloudShell:**
```bash
scp -i your-key.pem -r /home/cloudshell-user/legqlIQ ec2-user@13.62.225.158:~/
```

## 🛠️ Step 5: Install Dependencies on EC2

**After connecting to EC2, run:**

```bash
# Update system
sudo yum update -y

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
node --version

# Install nginx
sudo yum install nginx -y

# Navigate to project
cd ~/legqlIQ

# Install dependencies
npm install

# Build frontend
npm run build

# Verify dist folder
ls -la dist/
```

## ⚙️ Step 6: Configure Nginx on EC2

```bash
# Remove any existing configs
sudo rm -f /etc/nginx/conf.d/*.conf
sudo rm -f /etc/nginx/sites-enabled/*

# Create new config
sudo bash -c 'cat > /etc/nginx/conf.d/legaliq.conf << '\''EOF'\''
server {
    listen 80;
    root /home/ec2-user/legqlIQ/dist;
    index index.html;
    
    location /api/ {
        proxy_pass http://localhost:4000/;
    }
}
EOF'

# Fix permissions
chmod 755 /home/ec2-user
chmod 755 /home/ec2-user/legqlIQ
chmod -R 755 /home/ec2-user/legqlIQ/dist

# Test config
sudo nginx -t

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify nginx is running
sudo systemctl status nginx
```

## 🧪 Step 7: Test

**From EC2:**
```bash
# Test locally
curl http://localhost

# Should return HTML
```

**From your browser:**
```
http://13.62.225.158
```

## 🚀 Step 8: Start Backend (Optional)

If you need the backend API:

```bash
cd ~/legqlIQ/backend
npm install
npm start &
```

Or use PM2 for production:
```bash
npm install -g pm2
cd ~/legqlIQ/backend
pm2 start server.js --name legaliq-backend
pm2 save
pm2 startup
```

## ✅ Final Checklist

- [ ] Port 22 (SSH) open in security group
- [ ] Port 80 (HTTP) open in security group
- [ ] Connected to EC2 instance
- [ ] Files transferred to EC2
- [ ] Node.js installed
- [ ] Nginx installed
- [ ] Frontend built (`npm run build`)
- [ ] Nginx configured
- [ ] Nginx running
- [ ] Application accessible at http://13.62.225.158

## 🆘 Troubleshooting

### Can't Connect via SSH

1. **Check security group** - Port 22 must be open
2. **Check key file** - Must have correct `.pem` file
3. **Use EC2 Instance Connect** - Easiest option, no key needed

### Can't Access Website

1. **Check port 80** - Must be open in security group
2. **Check nginx** - Run `sudo systemctl status nginx` on EC2
3. **Check dist folder** - Run `ls -la ~/legqlIQ/dist/` on EC2
4. **Check logs** - Run `sudo tail -50 /var/log/nginx/error.log` on EC2

### Files Not Transferring

1. **Use S3** - Most reliable method
2. **Use Git** - If you have a repository
3. **Use EC2 Instance Connect** - Upload files directly in browser

---

## 🎯 Quick Start (Using EC2 Instance Connect)

1. **Open ports** in security group (SSH + HTTP)
2. **Connect** via EC2 Instance Connect (no key needed)
3. **Install** Node.js and nginx
4. **Transfer** files via S3 or Git
5. **Build** and configure
6. **Access** at http://13.62.225.158

**Your Application URL**: http://13.62.225.158
