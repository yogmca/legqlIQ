# Nginx Commands for Non-Systemd Systems

## 🔍 Your System

You're getting: `System has not been booted with systemd`

This means you're using:
- **WSL (Windows Subsystem for Linux)**, OR
- **Older init system (SysV, Upstart)**, OR
- **Docker container**, OR
- **Custom Linux setup**

## ✅ Nginx Commands for Your System

### Start Nginx:
```bash
sudo service nginx start
```

### Stop Nginx:
```bash
sudo service nginx stop
```

### Restart Nginx:
```bash
sudo service nginx restart
```

### Check Nginx Status:
```bash
sudo service nginx status
```

### Test Nginx Configuration:
```bash
sudo nginx -t
```

### Reload Nginx (without stopping):
```bash
sudo nginx -s reload
```

## 🚀 Complete Setup for Your System

### Step 1: Install Nginx

```bash
# Try these in order until one works:
sudo apt-get update && sudo apt-get install nginx -y
# OR
sudo yum install nginx -y
# OR
sudo amazon-linux-extras install nginx1 -y
```

### Step 2: Configure Nginx

```bash
# Create configuration
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

# Remove default config
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/conf.d/default.conf
```

### Step 3: Build Frontend

```bash
cd ~/karnataka-bar-association
npm run build
```

### Step 4: Fix Permissions

```bash
chmod -R 755 ~/karnataka-bar-association/dist
```

### Step 5: Test and Start Nginx

```bash
# Test configuration
sudo nginx -t

# Start Nginx
sudo service nginx start

# Check if it's running
sudo service nginx status
```

### Step 6: Access Your App

Open browser: `http://13.62.225.158`

## 🔄 After Making Frontend Changes

```bash
# 1. Build new version
cd ~/karnataka-bar-association
npm run build

# 2. Restart Nginx
sudo service nginx restart

# 3. Access updated app
# http://13.62.225.158
```

## 🆘 Alternative: Start Nginx Directly

If `service` command doesn't work:

```bash
# Start Nginx
sudo nginx

# Stop Nginx
sudo nginx -s stop

# Reload Nginx
sudo nginx -s reload

# Check if running
ps aux | grep nginx
```

## 🔍 Troubleshooting

### Check if Nginx is Running:
```bash
ps aux | grep nginx
sudo netstat -tulpn | grep :80
```

### Check Nginx Logs:
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### If Port 80 is Already in Use:
```bash
# Find what's using port 80
sudo netstat -tulpn | grep :80

# Kill the process (replace PID)
sudo kill -9 PID
```

### If Nginx Won't Start:
```bash
# Check configuration
sudo nginx -t

# Check for errors
sudo nginx -T

# Try starting manually
sudo nginx
```

## 📋 Complete Workflow for Your System

```bash
# 1. SSH into EC2
ssh -i your-key.pem ec2-user@13.62.225.158

# 2. Navigate to project
cd ~/karnataka-bar-association

# 3. Pull latest changes (if using git)
git pull

# 4. Install dependencies
npm install

# 5. Build frontend
npm run build

# 6. Restart Nginx
sudo service nginx restart
# OR
sudo nginx -s reload

# 7. Access app
# http://13.62.225.158
```

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Start Nginx | `sudo service nginx start` OR `sudo nginx` |
| Stop Nginx | `sudo service nginx stop` OR `sudo nginx -s stop` |
| Restart Nginx | `sudo service nginx restart` OR `sudo nginx -s reload` |
| Check Status | `sudo service nginx status` OR `ps aux \| grep nginx` |
| Test Config | `sudo nginx -t` |
| View Logs | `sudo tail -f /var/log/nginx/error.log` |

## 🔄 For Development (Port 5173)

If you prefer to use the dev server instead:

```bash
cd ~/karnataka-bar-association
npm run dev
```

Access: `http://13.62.225.158:5173`

(Make sure port 5173 is open in security group and your IP is whitelisted)

## ⚠️ Important Notes

1. **No systemd** means you're likely on WSL or older system
2. Use `service` command instead of `systemctl`
3. Nginx might not auto-start on boot
4. You may need to start Nginx manually after reboot

## 🚀 Auto-Start Nginx on Boot (Optional)

```bash
# For SysV init systems
sudo update-rc.d nginx defaults

# OR for chkconfig systems
sudo chkconfig nginx on
```

---

**🎯 KEY COMMAND**: `sudo service nginx restart` (not systemctl!)

**✅ AFTER CHANGES**: `npm run build && sudo service nginx restart`
