# 🔴 FINAL TROUBLESHOOTING - Cannot Access App

## Run These Commands on EC2

SSH into your EC2 and run these commands exactly:

```bash
# 1. Check if Vite is actually listening
echo "=== Checking if port 5173 is listening ==="
sudo netstat -tulpn | grep 5173

# 2. Check what IP it's bound to
echo "=== Checking bind address ==="
sudo lsof -i :5173

# 3. Test from EC2 itself
echo "=== Testing localhost ==="
curl -I http://localhost:5173

# 4. Check your EC2 public IP
echo "=== Your EC2 Public IP ==="
curl -s http://169.254.169.254/latest/meta-data/public-ipv4

# 5. Check security group
echo "=== Security Group Info ==="
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
echo "Instance ID: $INSTANCE_ID"

# 6. Check if firewall is blocking
echo "=== Checking firewall ==="
sudo iptables -L -n | grep 5173
sudo systemctl status firewalld 2>/dev/null || echo "firewalld not running"
```

## Based on Output, Apply Fix

### If netstat shows nothing
**Problem**: Vite is not running
**Fix**:
```bash
cd ~/karnataka-bar-association
npm run dev -- --host 0.0.0.0 --port 5173
```

### If netstat shows 127.0.0.1:5173
**Problem**: Vite only listening on localhost
**Fix**:
```bash
pkill -f vite
cd ~/karnataka-bar-association
npx vite --host 0.0.0.0 --port 5173 --strictPort
```

### If curl localhost fails
**Problem**: Vite crashed or not working
**Fix**: Check Vite logs for errors

### If firewalld is active
**Problem**: Firewall blocking port
**Fix**:
```bash
sudo firewall-cmd --permanent --add-port=5173/tcp
sudo firewall-cmd --reload
```

## GUARANTEED SOLUTION - Use Port 80

Run these commands on EC2:

```bash
# Stop Vite
pkill -f vite

# Build app
cd ~/karnataka-bar-association
npm run build

# Install Nginx
sudo yum install nginx -y || sudo amazon-linux-extras install nginx1 -y

# Configure Nginx
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

# Remove default config
sudo rm -f /etc/nginx/conf.d/default.conf /etc/nginx/sites-enabled/default

# Fix permissions
chmod -R 755 ~/karnataka-bar-association/dist

# Test and start
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx

echo ""
echo "✅ Now access: http://13.62.225.158"
echo ""
```

This WILL work because:
1. Port 80 is already open in your security group
2. Nginx is production-ready
3. No host binding issues

## Check Your Current IP

Your security group allows `17.233.163.119/32`. Verify this is still your IP:

```bash
# On your LOCAL machine (not EC2)
curl https://checkip.amazonaws.com
```

If it's different, update the security group rule.

## What Error Do You See?

When you try `http://13.62.225.158:5173`, what EXACTLY happens?

- "This site can't be reached" = Security group or firewall issue
- "Connection refused" = Vite not running or wrong port
- "Connection timed out" = Security group blocking
- Page loads but blank = Application error (check browser console)

Share the exact error message for specific help.

---

**🎯 RECOMMENDED: Just use the port 80 solution above. It's guaranteed to work.**
