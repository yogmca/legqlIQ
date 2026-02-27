# Fix Nginx "Conflicting Server Name" Warning

## 🚀 Quick Start Commands

### Start Frontend Development Server (Port 5173):
```bash
cd ~/karnataka-bar-association
npm run dev -- --host 0.0.0.0
```

### Start Backend Server (Port 4000):
```bash
cd ~/karnataka-bar-association/backend
npm start
```

### Start Both Servers (Using start.sh):
```bash
cd ~/karnataka-bar-association
chmod +x start.sh
./start.sh
```

---

## 🔍 The Warning You're Seeing

```
nginx: [warn] conflicting server name "_" on 0.0.0.0:80, ignored
```

## 📝 What This Means

This warning appears when nginx finds multiple server blocks with the same `server_name` listening on the same port. The underscore `_` is a catch-all server name that matches any request.

## ✅ Solution: Remove Duplicate Configurations

### Step 1: Check All Nginx Configuration Files

```bash
# List all nginx configuration files
sudo ls -la /etc/nginx/conf.d/
sudo ls -la /etc/nginx/sites-enabled/
```

### Step 2: Remove Default/Duplicate Configurations

```bash
# Remove default nginx configurations
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/conf.d/default.conf
sudo rm -f /etc/nginx/conf.d/default

# If there are other .conf files, check them
sudo ls -la /etc/nginx/conf.d/
```

### Step 3: Ensure Only One Configuration Exists

You should have only ONE configuration file for your app. Check if `/etc/nginx/conf.d/legaliq.conf` exists:

```bash
sudo cat /etc/nginx/conf.d/legaliq.conf
```

If it doesn't exist, create it:

```bash
sudo bash -c 'cat > /etc/nginx/conf.d/legaliq.conf << EOF
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
    
    # Handle React Router (SPA)
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
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
    
    # Error pages
    error_page 404 /index.html;
}
EOF'
```

### Step 4: Test Configuration

```bash
sudo nginx -t
```

You should see:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Step 5: Restart Nginx

```bash
# Stop nginx completely
sudo nginx -s stop

# Wait a moment
sleep 2

# Start nginx fresh
sudo nginx
```

OR use service command:

```bash
sudo service nginx restart
```

### Step 6: Verify No Warning

```bash
# Check nginx process
ps aux | grep nginx

# Check error log for warnings
sudo tail -20 /var/log/nginx/error.log
```

## 🔍 Advanced Troubleshooting

### Find All Server Blocks with "server_name _"

```bash
sudo nginx -T 2>&1 | grep -B 2 -A 10 "server_name _"
```

This will show you ALL server blocks that use `server_name _`.

### Check Main Nginx Configuration

```bash
sudo cat /etc/nginx/nginx.conf | grep -A 5 "include"
```

Look for lines like:
- `include /etc/nginx/conf.d/*.conf;`
- `include /etc/nginx/sites-enabled/*;`

### List All Included Configuration Files

```bash
# Check conf.d directory
sudo ls -la /etc/nginx/conf.d/

# Check sites-enabled directory (if it exists)
sudo ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "sites-enabled doesn't exist"
```

## ⚠️ Important: The Warning is Usually Harmless

Even with the warning, nginx will work correctly. It simply means:
- Multiple server blocks match the same criteria
- Nginx will use the FIRST one it finds
- The others are ignored

However, it's best practice to have only ONE configuration to avoid confusion.

## 🎯 Quick Fix Commands

Run these commands in sequence:

```bash
# 1. Remove all default configs
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/conf.d/default.conf
sudo rm -f /etc/nginx/conf.d/default

# 2. List remaining configs
echo "=== Configs in conf.d ==="
sudo ls -la /etc/nginx/conf.d/

# 3. Test configuration
sudo nginx -t

# 4. Restart nginx
sudo nginx -s stop && sleep 2 && sudo nginx

# 5. Check for warnings
sudo tail -20 /var/log/nginx/error.log
```

## 📋 Expected Result

After following these steps, when you run `sudo nginx`, you should see:
- No warnings
- Nginx starts successfully
- Your app is accessible at `http://YOUR_IP`

## 🔄 If Warning Persists

If you still see the warning after removing default configs:

1. **Check for hidden configs:**
   ```bash
   sudo find /etc/nginx -name "*.conf" -type f
   ```

2. **Review each config file:**
   ```bash
   sudo find /etc/nginx -name "*.conf" -type f -exec echo "=== {} ===" \; -exec cat {} \;
   ```

3. **Look for duplicate server blocks** in the same file

4. **Consider using a specific server_name** instead of `_`:
   ```nginx
   server_name 13.62.225.158 localhost;
   ```

## ✅ Best Practice Configuration

Instead of using `server_name _`, use your actual server name or IP:

```nginx
server {
    listen 80 default_server;
    server_name 13.62.225.158 localhost;
    # ... rest of config
}
```

The `default_server` parameter makes this the default server block for port 80.

---

## 🚀 Frontend Server Commands

### Option 1: Development Server (Recommended for Development)

```bash
# Navigate to project
cd ~/karnataka-bar-association

# Start Vite dev server (accessible from external IP)
npm run dev -- --host 0.0.0.0

# Access at: http://YOUR_IP:5173
```

**Note:** Make sure port 5173 is open in your EC2 security group.

### Option 2: Production Build with Nginx (Recommended for Production)

```bash
# Navigate to project
cd ~/karnataka-bar-association

# Build the frontend
npm run build

# Restart nginx to serve the built files
sudo nginx -s reload

# Access at: http://YOUR_IP
```

### Option 3: Preview Production Build

```bash
# Build first
npm run build

# Preview the build
npm run preview -- --host 0.0.0.0 --port 5173

# Access at: http://YOUR_IP:5173
```

## 🔄 Complete Startup Sequence

### For Development:

```bash
# Terminal 1: Start Backend
cd ~/karnataka-bar-association/backend
npm start

# Terminal 2: Start Frontend
cd ~/karnataka-bar-association
npm run dev -- --host 0.0.0.0
```

### For Production:

```bash
# 1. Start Backend
cd ~/karnataka-bar-association/backend
npm start &

# 2. Build Frontend
cd ~/karnataka-bar-association
npm run build

# 3. Start Nginx
sudo nginx

# Access at: http://YOUR_IP
```

## 📋 Package.json Scripts Reference

From [`package.json`](package.json:6-10):
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 Quick Reference Table

| Task | Command | Port | Access URL |
|------|---------|------|------------|
| Dev Server | `npm run dev -- --host 0.0.0.0` | 5173 | `http://YOUR_IP:5173` |
| Backend | `cd backend && npm start` | 4000 | `http://YOUR_IP:4000` |
| Production | `npm run build && sudo nginx` | 80 | `http://YOUR_IP` |
| Both (Dev) | `./start.sh` | 5173, 4000 | `http://YOUR_IP:5173` |

---

**🎯 TL;DR**:
- **Fix nginx warning**: Remove `/etc/nginx/sites-enabled/default` and `/etc/nginx/conf.d/default.conf`, then restart nginx
- **Start frontend dev**: `npm run dev -- --host 0.0.0.0`
- **Start backend**: `cd backend && npm start`
- **Production**: `npm run build && sudo nginx`
