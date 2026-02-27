# Frontend Server Start Commands

## 🎯 After Making Changes to Frontend

### Option 1: Development Server (Port 5173)

**On EC2, run:**
```bash
cd ~/karnataka-bar-association
npm run dev
```

**Access**: `http://13.62.225.158:5173`

**To keep running in background:**
```bash
# Using PM2 (recommended)
pm2 start npm --name "frontend" -- run dev
pm2 logs frontend
pm2 status

# Or using nohup
nohup npm run dev > frontend.log 2>&1 &
```

### Option 2: Production Build with Nginx (Port 80) - RECOMMENDED

**On EC2, run:**
```bash
# 1. Build the frontend
cd ~/karnataka-bar-association
npm run build

# 2. Restart Nginx to serve new build
sudo systemctl restart nginx

# Or if Nginx not installed yet:
sudo yum install nginx -y || sudo amazon-linux-extras install nginx1 -y

# 3. Configure Nginx (one-time setup)
sudo bash -c 'cat > /etc/nginx/conf.d/legaliq.conf << EOF
server {
    listen 80;
    server_name _;
    root /home/ec2-user/karnataka-bar-association/dist;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF'

# 4. Remove default config
sudo rm -f /etc/nginx/conf.d/default.conf

# 5. Test and start Nginx
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx
```

**Access**: `http://13.62.225.158`

## 📋 Complete Workflow After Frontend Changes

### For Development (Quick Testing):

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@13.62.225.158

# Navigate to project
cd ~/karnataka-bar-association

# Pull latest changes (if using git)
git pull

# Install any new dependencies
npm install

# Start dev server
npm run dev

# Access: http://13.62.225.158:5173
```

### For Production (Recommended):

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@13.62.225.158

# Navigate to project
cd ~/karnataka-bar-association

# Pull latest changes (if using git)
git pull

# Install any new dependencies
npm install

# Build for production
npm run build

# Restart Nginx
sudo systemctl restart nginx

# Access: http://13.62.225.158
```

## 🔄 Quick Reference Commands

### Check if Frontend is Running:

```bash
# Check dev server (port 5173)
sudo netstat -tulpn | grep 5173

# Check Nginx (port 80)
sudo systemctl status nginx

# Check PM2 processes
pm2 status
```

### Stop Frontend:

```bash
# Stop dev server
pkill -f vite

# Stop PM2 process
pm2 stop frontend
pm2 delete frontend

# Stop Nginx
sudo systemctl stop nginx
```

### Restart Frontend:

```bash
# Restart dev server
cd ~/karnataka-bar-association
npm run dev

# Restart Nginx
sudo systemctl restart nginx

# Restart PM2 process
pm2 restart frontend
```

### View Logs:

```bash
# PM2 logs
pm2 logs frontend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Dev server logs (if using nohup)
tail -f ~/karnataka-bar-association/frontend.log
```

## 🎯 Recommended Setup

### Development Environment:
```bash
# Start dev server with PM2
cd ~/karnataka-bar-association
pm2 start npm --name "frontend" -- run dev
pm2 save
pm2 startup
```

### Production Environment:
```bash
# Build and serve with Nginx
cd ~/karnataka-bar-association
npm run build
sudo systemctl restart nginx
```

## 📊 Comparison

| Method | Port | Command | Best For | Keeps Running |
|--------|------|---------|----------|---------------|
| `npm run dev` | 5173 | `npm run dev` | Quick testing | ❌ No (stops when SSH closes) |
| `pm2 start` | 5173 | `pm2 start npm -- run dev` | Development | ✅ Yes |
| `nohup` | 5173 | `nohup npm run dev &` | Development | ✅ Yes |
| **Nginx** | **80** | **`npm run build && sudo systemctl restart nginx`** | **Production** | **✅ Yes** |

## 🚀 After Every Frontend Change

### Quick Development Cycle:
```bash
# 1. Make changes locally
# 2. Upload to EC2 (or git push/pull)
# 3. On EC2:
cd ~/karnataka-bar-association
npm run dev
# 4. Test at http://13.62.225.158:5173
```

### Production Deployment:
```bash
# 1. Make changes locally
# 2. Upload to EC2 (or git push/pull)
# 3. On EC2:
cd ~/karnataka-bar-association
npm run build
sudo systemctl restart nginx
# 4. Access at http://13.62.225.158
```

## 🆘 Troubleshooting

### "Port 5173 already in use"
```bash
# Kill existing process
pkill -f vite
# Or
pm2 delete frontend
# Then start again
npm run dev
```

### "Nginx not serving new changes"
```bash
# Rebuild and restart
cd ~/karnataka-bar-association
npm run build
sudo systemctl restart nginx
# Clear browser cache (Ctrl+Shift+R)
```

### "Changes not showing"
```bash
# Clear browser cache
# Or use incognito/private window
# Or add timestamp to URL: http://13.62.225.158?v=123
```

---

**🎯 RECOMMENDED**: Use Nginx on port 80 for production. It's faster, more stable, and port 80 is already open in your security group.

**⚡ QUICK START**: `cd ~/karnataka-bar-association && npm run dev`
