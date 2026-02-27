# Fix: Nginx Not Listening on Port 80

## 🚨 Problem

```bash
curl: (7) Failed to connect to 13.62.225.158 port 80 after 1 ms: Could not connect to server
```

This means nginx is NOT actually listening on port 80.

## 🔍 Step 1: Check if Nginx is Really Running

```bash
# Check nginx processes
ps aux | grep nginx

# Check what's listening on port 80
sudo netstat -tulpn | grep :80

# OR use ss command
sudo ss -tulpn | grep :80
```

**Expected:** You should see nginx listening on port 80.
**If you see nothing:** Nginx is not running or not listening on port 80.

## 🔧 Step 2: Check Nginx Configuration

```bash
# Test nginx configuration
sudo nginx -t

# View full configuration
sudo nginx -T | less
```

Look for errors in the output.

## 🚀 Step 3: Start Nginx Properly

### Option A: Stop and Start Fresh

```bash
# Kill any existing nginx processes
sudo pkill nginx

# Wait a moment
sleep 2

# Start nginx
sudo nginx

# Verify it's running
ps aux | grep nginx
sudo netstat -tulpn | grep :80
```

### Option B: Use Service Command

```bash
# Stop nginx
sudo service nginx stop

# Start nginx
sudo service nginx start

# Check status
sudo service nginx status
```

## 🔍 Step 4: Check for Port Conflicts

```bash
# See what's using port 80
sudo netstat -tulpn | grep :80

# OR
sudo lsof -i :80
```

If something else is using port 80, you need to stop it first.

## 📋 Step 5: Check Nginx Error Logs

```bash
# View error log
sudo tail -50 /var/log/nginx/error.log

# View access log
sudo tail -50 /var/log/nginx/access.log
```

## 🔧 Common Issues & Fixes

### Issue 1: Permission Denied

```bash
# Check nginx user permissions
sudo chown -R nginx:nginx /var/log/nginx/
sudo chmod -R 755 /var/log/nginx/

# Try starting again
sudo nginx
```

### Issue 2: Configuration File Not Found

```bash
# Check if config exists
ls -la /etc/nginx/nginx.conf
ls -la /etc/nginx/conf.d/

# If legaliq.conf doesn't exist, create it
sudo bash -c 'cat > /etc/nginx/conf.d/legaliq.conf << EOF
server {
    listen 80;
    server_name _;
    root /home/ec2-user/karnataka-bar-association/dist;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF'

# Test and restart
sudo nginx -t
sudo nginx -s reload
```

### Issue 3: Nginx Not Installed

```bash
# Check if nginx is installed
which nginx

# If not installed, install it
sudo yum install nginx -y
# OR
sudo apt-get install nginx -y
```

### Issue 4: SELinux Blocking (Amazon Linux)

```bash
# Check SELinux status
getenforce

# If enforcing, temporarily disable
sudo setenforce 0

# Try starting nginx
sudo nginx

# Check if it works now
curl http://localhost
```

## 🎯 Complete Diagnostic Script

Run this to diagnose the issue:

```bash
echo "=== Checking Nginx Status ==="
ps aux | grep nginx

echo -e "\n=== Checking Port 80 ==="
sudo netstat -tulpn | grep :80

echo -e "\n=== Testing Nginx Config ==="
sudo nginx -t

echo -e "\n=== Checking Nginx Installation ==="
which nginx
nginx -v

echo -e "\n=== Checking Error Logs ==="
sudo tail -20 /var/log/nginx/error.log

echo -e "\n=== Checking if dist folder exists ==="
ls -la ~/karnataka-bar-association/dist/

echo -e "\n=== Checking nginx configs ==="
sudo ls -la /etc/nginx/conf.d/
```

## 🚀 Quick Fix Sequence

Try these commands in order:

```bash
# 1. Kill any existing nginx
sudo pkill nginx

# 2. Remove conflicting configs
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/conf.d/default.conf

# 3. Ensure your config exists
sudo ls -la /etc/nginx/conf.d/legaliq.conf

# 4. Test configuration
sudo nginx -t

# 5. Start nginx
sudo nginx

# 6. Verify it's listening
sudo netstat -tulpn | grep :80

# 7. Test locally
curl http://localhost

# 8. Test externally
curl http://13.62.225.158
```

## 🔍 If Still Not Working

### Check if dist folder exists and has content:

```bash
ls -la ~/karnataka-bar-association/dist/
```

If it doesn't exist or is empty:

```bash
cd ~/karnataka-bar-association
npm run build
```

### Check nginx main configuration:

```bash
sudo cat /etc/nginx/nginx.conf
```

Make sure it includes:
```nginx
include /etc/nginx/conf.d/*.conf;
```

### Try binding to all interfaces explicitly:

Edit your nginx config to explicitly bind to 0.0.0.0:

```bash
sudo nano /etc/nginx/conf.d/legaliq.conf
```

Change:
```nginx
listen 80;
```

To:
```nginx
listen 0.0.0.0:80;
```

Then:
```bash
sudo nginx -t
sudo nginx -s reload
```

## 📊 Expected Working State

When everything is working, you should see:

```bash
$ ps aux | grep nginx
root      1234  nginx: master process nginx
nginx     1235  nginx: worker process

$ sudo netstat -tulpn | grep :80
tcp    0    0 0.0.0.0:80    0.0.0.0:*    LISTEN    1234/nginx

$ curl http://localhost
<!DOCTYPE html>
<html>
...
```

## 🆘 Last Resort

If nothing works, reinstall and reconfigure:

```bash
# Stop and remove nginx
sudo service nginx stop
sudo yum remove nginx -y

# Reinstall
sudo yum install nginx -y

# Create config
sudo bash -c 'cat > /etc/nginx/conf.d/legaliq.conf << EOF
server {
    listen 80;
    server_name _;
    root /home/ec2-user/karnataka-bar-association/dist;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF'

# Start nginx
sudo service nginx start

# Test
curl http://localhost
```

---

**🎯 Next Step**: Run the diagnostic script above and share the output to identify the exact issue.
