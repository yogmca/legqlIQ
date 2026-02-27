# Verify Nginx is Running & Fix Warning

## ✅ Check if Nginx is Running

```bash
# Check nginx process
ps aux | grep nginx

# Check if port 80 is listening
sudo netstat -tulpn | grep :80

# OR use ss command
sudo ss -tulpn | grep :80
```

**Expected output:**
```
tcp    0    0 0.0.0.0:80    0.0.0.0:*    LISTEN    1234/nginx: master
```

If you see this, **nginx IS running** ✅

## 🌐 Test Your Application

```bash
# Test from server itself
curl http://localhost

# Test from external (replace with your IP)
curl http://13.62.225.158
```

Or open in browser: `http://YOUR_EC2_IP`

## ⚠️ About the Warning

The warning `nginx: [warn] conflicting server name "_" on 0.0.0.0:80, ignored` is **NOT an error**. 

- ✅ Nginx IS running
- ✅ Your app IS accessible
- ⚠️ There are duplicate server configurations

## 🔧 Fix the Warning (Optional)

### Step 1: Find All Configuration Files

```bash
# List all nginx configs
sudo find /etc/nginx -name "*.conf" -type f

# Show which configs have server_name _
sudo grep -r "server_name _" /etc/nginx/
```

### Step 2: Remove Duplicate Configs

```bash
# Remove default configs
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/conf.d/default.conf

# List remaining configs
sudo ls -la /etc/nginx/conf.d/
```

### Step 3: Check for Multiple Server Blocks

```bash
# Show all server blocks
sudo nginx -T 2>&1 | grep -A 15 "server {"
```

If you see multiple `server_name _;` entries, you need to remove one.

### Step 4: Restart Nginx Cleanly

```bash
# Stop nginx completely
sudo nginx -s stop

# Wait a moment
sleep 2

# Start fresh
sudo nginx

# Verify no warning
sudo tail -20 /var/log/nginx/error.log
```

## 🎯 Quick Fix Commands

Run these in sequence:

```bash
# 1. Check current configs
echo "=== Current nginx configs ==="
sudo ls -la /etc/nginx/conf.d/
sudo ls -la /etc/nginx/sites-enabled/ 2>/dev/null

# 2. Remove defaults
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/conf.d/default.conf

# 3. Restart nginx
sudo nginx -s stop && sleep 2 && sudo nginx

# 4. Verify it's running
ps aux | grep nginx

# 5. Check for warnings
sudo tail -20 /var/log/nginx/error.log
```

## 📊 Status Check Commands

```bash
# Is nginx running?
ps aux | grep nginx

# What's listening on port 80?
sudo netstat -tulpn | grep :80

# Recent nginx logs
sudo tail -50 /var/log/nginx/error.log

# Test the website
curl -I http://localhost
```

## ✅ Expected Results

### Nginx Running Successfully:
```bash
$ ps aux | grep nginx
root      1234  0.0  0.1  nginx: master process nginx
nginx     1235  0.0  0.2  nginx: worker process
```

### Port 80 Listening:
```bash
$ sudo netstat -tulpn | grep :80
tcp    0    0 0.0.0.0:80    0.0.0.0:*    LISTEN    1234/nginx
```

### Website Accessible:
```bash
$ curl -I http://localhost
HTTP/1.1 200 OK
Server: nginx
Content-Type: text/html
```

## 🚨 If Nginx is NOT Running

```bash
# Check for errors
sudo nginx -t

# View error log
sudo tail -50 /var/log/nginx/error.log

# Try starting manually
sudo nginx

# Check what's using port 80
sudo netstat -tulpn | grep :80
```

## 📝 Summary

**The warning does NOT mean nginx failed to start.**

- ✅ If `ps aux | grep nginx` shows nginx processes → **It's running**
- ✅ If `netstat -tulpn | grep :80` shows nginx → **It's listening**
- ✅ If you can access your website → **Everything works**

The warning just means there are duplicate configurations. Nginx uses the first one and ignores the rest.

---

**🎯 Bottom Line**: If your website is accessible, nginx is working fine. The warning is cosmetic and can be ignored or fixed by removing duplicate config files.
