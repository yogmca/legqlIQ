# Nginx Configuration Guide for File Upload Size Limits

## Overview
This guide explains how to configure nginx to allow large file uploads (up to 50MB) for the LegalIQ application.

## Configuration Files

### 1. Main Nginx Configuration
**File:** `/etc/nginx/nginx.conf`

**Purpose:** Global nginx settings that apply to all sites

**To edit:**
```bash
sudo nano /etc/nginx/nginx.conf
```

**What to add:**
Find the `http {` block and add `client_max_body_size 50M;` right after it:

```nginx
http {
    ##
    # Basic Settings
    ##
    client_max_body_size 50M;  # ADD THIS LINE
    
    sendfile on;
    tcp_nopush on;
    # ... rest of config
}
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

---

### 2. Site-Specific Configuration
**File:** `/etc/nginx/sites-available/legaliq`

**Purpose:** Configuration specific to the legaliq.in website

**To edit:**
```bash
sudo nano /etc/nginx/sites-available/legaliq
```

**What to add:**
In the HTTPS server block, add these lines after the SSL certificates:

```nginx
server {
    listen 443 ssl http2;
    server_name legaliq.in www.legaliq.in;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/legaliq.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/legaliq.in/privkey.pem;
    
    # ADD THESE LINES:
    client_max_body_size 50M;
    client_body_buffer_size 50M;
    
    # ... rest of config
}
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

---

## Testing and Applying Changes

### 1. Test Configuration
Always test before applying changes:
```bash
sudo nginx -t
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 2. Apply Changes
If test passes, reload or restart nginx:

**Option A - Reload (recommended, no downtime):**
```bash
sudo systemctl reload nginx
```

**Option B - Restart (if reload doesn't work):**
```bash
sudo systemctl restart nginx
```

### 3. Verify Nginx is Running
```bash
sudo systemctl status nginx
```

**Expected:** Should show `active (running)` in green

---

## Verification Commands

### Check if settings are applied:
```bash
# Check main config
sudo grep -A 2 "client_max_body_size" /etc/nginx/nginx.conf

# Check site config
sudo grep -A 2 "client_max_body_size" /etc/nginx/sites-available/legaliq

# Check what nginx is actually using
sudo nginx -T 2>&1 | grep "client_max_body_size"
```

---

## Common Nginx Commands

### View configuration files:
```bash
# View main config
sudo cat /etc/nginx/nginx.conf

# View site config
sudo cat /etc/nginx/sites-available/legaliq

# View all active configuration
sudo nginx -T
```

### Manage nginx service:
```bash
# Start nginx
sudo systemctl start nginx

# Stop nginx
sudo systemctl stop nginx

# Restart nginx
sudo systemctl restart nginx

# Reload nginx (no downtime)
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx

# Enable nginx to start on boot
sudo systemctl enable nginx
```

### View logs:
```bash
# View error log
sudo tail -f /var/log/nginx/error.log

# View access log
sudo tail -f /var/log/nginx/access.log

# View last 50 lines of error log
sudo tail -50 /var/log/nginx/error.log
```

### Backup configurations:
```bash
# Backup main config
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# Backup site config
sudo cp /etc/nginx/sites-available/legaliq /etc/nginx/sites-available/legaliq.backup

# Backup with timestamp
sudo cp /etc/nginx/sites-available/legaliq /etc/nginx/sites-available/legaliq.backup.$(date +%Y%m%d_%H%M%S)
```

### Restore from backup:
```bash
# Restore main config
sudo cp /etc/nginx/nginx.conf.backup /etc/nginx/nginx.conf

# Restore site config
sudo cp /etc/nginx/sites-available/legaliq.backup /etc/nginx/sites-available/legaliq

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

---

## Troubleshooting

### If nginx test fails:
```bash
# View detailed error
sudo nginx -t

# Check syntax errors in config
sudo nginx -T 2>&1 | less

# Restore from backup
sudo cp /etc/nginx/sites-available/legaliq.backup /etc/nginx/sites-available/legaliq
sudo nginx -t
```

### If nginx won't start:
```bash
# Check what's wrong
sudo systemctl status nginx

# View error logs
sudo journalctl -u nginx -n 50

# Check if port 80/443 is already in use
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### If changes don't take effect:
```bash
# Hard restart nginx
sudo systemctl stop nginx
sudo systemctl start nginx

# Clear browser cache (Ctrl+Shift+Delete)
# Or test in incognito mode
```

---

## Complete Fix for 413 Error

Run these commands in order:

```bash
# 1. Edit main nginx config
sudo nano /etc/nginx/nginx.conf
# Add: client_max_body_size 50M; in the http block

# 2. Edit site config
sudo nano /etc/nginx/sites-available/legaliq
# Add: client_max_body_size 50M; in the server block

# 3. Test configuration
sudo nginx -t

# 4. Restart nginx
sudo systemctl restart nginx

# 5. Restart backend
pm2 restart backend

# 6. Verify
sudo nginx -T 2>&1 | grep "client_max_body_size"
pm2 status

# 7. Clear browser cache and test
```

---

## Summary

**Files to edit:**
1. `/etc/nginx/nginx.conf` - Add `client_max_body_size 50M;` in `http` block
2. `/etc/nginx/sites-available/legaliq` - Add `client_max_body_size 50M;` in `server` block

**Commands to apply:**
```bash
sudo nginx -t && sudo systemctl restart nginx && pm2 restart backend
```

**Then:** Clear browser cache (Ctrl+Shift+Delete) and test article creation.
