# Fix: Nginx Infinite Redirect Loop

## 🚨 The Error

```
rewrite or internal redirection cycle while internally redirecting to "/index.html"
```

## 🎯 The Problem

Your nginx configuration has a `try_files` directive that's creating an infinite loop. This happens when the configuration tries to redirect to `/index.html` but the location block catches it again, creating a cycle.

## 🔧 The Fix

You need to fix your nginx configuration file.

### Step 1: Check Current Configuration

```bash
sudo cat /etc/nginx/conf.d/legaliq.conf
```

### Step 2: Create Correct Configuration

```bash
sudo bash -c 'cat > /etc/nginx/conf.d/legaliq.conf << '\''EOF'\''
server {
    listen 80;
    server_name _;
    root /home/ec2-user/karnataka-bar-association/dist;
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
    
    # Handle React Router - THIS IS THE KEY FIX
    location / {
        try_files $uri $uri/ /index.html =404;
    }
}
EOF'
```

### Step 3: Test and Reload

```bash
# Test configuration
sudo nginx -t

# If test passes, reload nginx
sudo nginx -s reload

# Test the website
curl http://localhost
```

## 🔍 What Was Wrong

The original configuration likely had:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Without the `=404` at the end, nginx would keep trying to serve `/index.html` in an infinite loop.

## ✅ Alternative Fix (Simpler)

If the above doesn't work, try this simpler configuration:

```bash
sudo bash -c 'cat > /etc/nginx/conf.d/legaliq.conf << '\''EOF'\''
server {
    listen 80;
    server_name _;
    root /home/ec2-user/karnataka-bar-association/dist;
    index index.html index.htm;
    
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location / {
        try_files $uri /index.html;
    }
}
EOF'

sudo nginx -t
sudo nginx -s reload
curl http://localhost
```

## 🔧 Even Simpler Fix (If Above Fails)

```bash
sudo bash -c 'cat > /etc/nginx/conf.d/legaliq.conf << '\''EOF'\''
server {
    listen 80;
    server_name _;
    root /home/ec2-user/karnataka-bar-association/dist;
    index index.html;
    
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    
    location / {
        index index.html;
    }
}
EOF'

sudo nginx -t
sudo nginx -s reload
```

## 📋 Complete Fix Commands

Run these in sequence:

```bash
# 1. Backup current config
sudo cp /etc/nginx/conf.d/legaliq.conf /etc/nginx/conf.d/legaliq.conf.backup

# 2. Create new config
sudo bash -c 'cat > /etc/nginx/conf.d/legaliq.conf << '\''EOF'\''
server {
    listen 80;
    server_name _;
    root /home/ec2-user/karnataka-bar-association/dist;
    index index.html;
    
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location / {
        try_files $uri /index.html;
    }
}
EOF'

# 3. Test config
sudo nginx -t

# 4. Reload nginx
sudo nginx -s reload

# 5. Test
curl http://localhost

# 6. Check for errors
sudo tail -20 /var/log/nginx/error.log
```

## ✅ Expected Result

After fixing, you should see:

```bash
$ curl http://localhost
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    ...
```

No more 500 error!

## 🔍 If Still Getting Errors

### Check if dist folder exists:

```bash
ls -la ~/karnataka-bar-association/dist/
```

If it doesn't exist:

```bash
cd ~/karnataka-bar-association
npm run build
sudo nginx -s reload
```

### Check permissions:

```bash
chmod 755 ~
chmod 755 ~/karnataka-bar-association
chmod -R 755 ~/karnataka-bar-association/dist
sudo nginx -s reload
```

---

**🎯 Bottom Line**: The `try_files` directive was creating an infinite redirect loop. The fix is to use `try_files $uri /index.html;` instead of `try_files $uri $uri/ /index.html;`
