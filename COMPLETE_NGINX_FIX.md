# Complete Nginx Fix - Remove All Conflicts and Fix Redirect Loop

## 🚨 Current Issues

1. **Conflicting server name "_"** - Multiple nginx configs
2. **Redirect loop** - Still happening after reload

## 🔧 Complete Fix - Run These Commands

```bash
# Step 1: Stop nginx completely
sudo nginx -s stop

# Step 2: Remove ALL existing configs
sudo rm -f /etc/nginx/conf.d/*.conf
sudo rm -f /etc/nginx/sites-enabled/*

# Step 3: Check if dist folder exists
ls -la ~/karnataka-bar-association/dist/

# Step 4: If dist doesn't exist, build it
cd ~/karnataka-bar-association
npm run build

# Step 5: Create ONE clean configuration
sudo bash -c 'cat > /etc/nginx/conf.d/legaliq.conf << '\''EOF'\''
server {
    listen 80 default_server;
    server_name _;
    root /home/ec2-user/karnataka-bar-association/dist;
    
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    
    location / {
        index index.html;
        try_files $uri $uri/index.html /index.html;
    }
}
EOF'

# Step 6: Fix permissions
chmod 755 ~
chmod 755 ~/karnataka-bar-association
chmod -R 755 ~/karnataka-bar-association/dist

# Step 7: Test configuration
sudo nginx -t

# Step 8: Start nginx fresh
sudo nginx

# Step 9: Test
curl http://localhost

# Step 10: Check for errors
sudo tail -20 /var/log/nginx/error.log
```

## 🎯 Alternative: Even Simpler Config

If the above still has issues, try this minimal config:

```bash
# Stop nginx
sudo nginx -s stop

# Remove all configs
sudo rm -f /etc/nginx/conf.d/*.conf
sudo rm -f /etc/nginx/sites-enabled/*

# Create minimal config
sudo bash -c 'cat > /etc/nginx/conf.d/legaliq.conf << '\''EOF'\''
server {
    listen 80;
    server_name _;
    
    location / {
        root /home/ec2-user/karnataka-bar-association/dist;
        index index.html;
    }
    
    location /api {
        proxy_pass http://localhost:4000;
    }
}
EOF'

# Test and start
sudo nginx -t
sudo nginx
curl http://localhost
```

## 🔍 Check What's in Your Config Now

```bash
# See all nginx configs
sudo find /etc/nginx -name "*.conf" -type f -exec echo "=== {} ===" \; -exec cat {} \;
```

## 📋 Verify Dist Folder

```bash
# Check if dist exists and has index.html
ls -la ~/karnataka-bar-association/dist/index.html

# If not, build it
cd ~/karnataka-bar-association
npm run build
ls -la ~/karnataka-bar-association/dist/
```

## 🆘 Nuclear Option - Complete Reset

If nothing works, do a complete reset:

```bash
# 1. Stop and kill nginx
sudo nginx -s stop
sudo pkill nginx

# 2. Remove ALL nginx configs
sudo rm -rf /etc/nginx/conf.d/*
sudo rm -rf /etc/nginx/sites-enabled/*
sudo rm -rf /etc/nginx/sites-available/*

# 3. Build frontend
cd ~/karnataka-bar-association
npm run build

# 4. Create ONE simple config
sudo bash -c 'cat > /etc/nginx/conf.d/app.conf << '\''EOF'\''
server {
    listen 80;
    root /home/ec2-user/karnataka-bar-association/dist;
    index index.html;
    
    location /api/ {
        proxy_pass http://localhost:4000/;
    }
}
EOF'

# 5. Fix permissions
chmod 755 /home/ec2-user
chmod 755 /home/ec2-user/karnataka-bar-association
chmod -R 755 /home/ec2-user/karnataka-bar-association/dist

# 6. Test config
sudo nginx -t

# 7. Start nginx
sudo nginx

# 8. Verify
ps aux | grep nginx
sudo netstat -tulpn | grep :80
curl http://localhost

# 9. Check logs
sudo tail -30 /var/log/nginx/error.log
```

## ✅ What Should Work

After the nuclear option, you should see:

```bash
$ curl http://localhost
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    ...
```

## 🔍 Debug: Check Main Nginx Config

The main nginx.conf might be including duplicate configs:

```bash
# View main config
sudo cat /etc/nginx/nginx.conf

# Look for include directives
sudo grep -n "include" /etc/nginx/nginx.conf
```

You might see:
```nginx
include /etc/nginx/conf.d/*.conf;
include /etc/nginx/sites-enabled/*;
```

This means nginx loads configs from BOTH directories, which can cause conflicts.

## 🎯 Final Solution

Run this complete script:

```bash
#!/bin/bash

echo "=== Stopping nginx ==="
sudo nginx -s stop
sleep 2
sudo pkill nginx

echo "=== Removing all configs ==="
sudo rm -f /etc/nginx/conf.d/*.conf
sudo rm -f /etc/nginx/sites-enabled/*

echo "=== Building frontend ==="
cd ~/karnataka-bar-association
npm run build

echo "=== Creating clean config ==="
sudo bash -c 'cat > /etc/nginx/conf.d/legaliq.conf << '\''EOF'\''
server {
    listen 80;
    root /home/ec2-user/karnataka-bar-association/dist;
    index index.html;
    
    location /api/ {
        proxy_pass http://localhost:4000/;
    }
}
EOF'

echo "=== Fixing permissions ==="
chmod 755 /home/ec2-user
chmod 755 /home/ec2-user/karnataka-bar-association
chmod -R 755 /home/ec2-user/karnataka-bar-association/dist

echo "=== Testing config ==="
sudo nginx -t

echo "=== Starting nginx ==="
sudo nginx

echo "=== Testing website ==="
sleep 2
curl -I http://localhost

echo "=== Checking for errors ==="
sudo tail -20 /var/log/nginx/error.log

echo "=== Done! ==="
```

Save this as `fix-nginx.sh`, make it executable, and run it:

```bash
chmod +x fix-nginx.sh
./fix-nginx.sh
```

---

**🎯 Key Points:**
1. Remove ALL existing nginx configs to eliminate conflicts
2. Use a simple config without complex try_files
3. Make sure dist folder exists (run `npm run build`)
4. Fix permissions on home directory and dist folder
5. Start nginx fresh (not reload)
