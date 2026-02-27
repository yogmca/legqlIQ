# Fix: Nginx 500 Internal Server Error

## 🚨 The Problem

```html
<h1>500 Internal Server Error</h1>
```

Nginx is running but can't serve files. This is usually caused by:
1. Missing or empty `dist` folder
2. Wrong file permissions
3. Incorrect path in nginx config
4. SELinux blocking access

## 🔍 Step 1: Check Nginx Error Log

```bash
# View the error log - this will tell us exactly what's wrong
sudo tail -50 /var/log/nginx/error.log
```

Look for errors like:
- "No such file or directory"
- "Permission denied"
- "13: Permission denied"

## 🔧 Step 2: Check if dist Folder Exists

```bash
# Check if dist folder exists
ls -la ~/karnataka-bar-association/dist/

# Check if it has an index.html
ls -la ~/karnataka-bar-association/dist/index.html
```

### If dist folder is missing or empty:

```bash
# Navigate to project
cd ~/karnataka-bar-association

# Build the frontend
npm run build

# Verify files were created
ls -la ~/karnataka-bar-association/dist/
```

## 🔧 Step 3: Fix File Permissions

```bash
# Make sure nginx can read the files
chmod -R 755 ~/karnataka-bar-association/dist/

# Make sure parent directories are accessible
chmod 755 ~/karnataka-bar-association
chmod 755 ~

# Verify permissions
ls -la ~/karnataka-bar-association/ | grep dist
```

## 🔧 Step 4: Check Nginx Configuration

```bash
# View the nginx config
sudo cat /etc/nginx/conf.d/legaliq.conf

# Check what path nginx is trying to use
sudo nginx -T | grep "root"
```

The `root` directive should point to: `/home/ec2-user/karnataka-bar-association/dist`

### If the path is wrong, fix it:

```bash
sudo nano /etc/nginx/conf.d/legaliq.conf
```

Make sure it has:
```nginx
root /home/ec2-user/karnataka-bar-association/dist;
```

Then reload:
```bash
sudo nginx -t
sudo nginx -s reload
```

## 🔧 Step 5: Check SELinux (Amazon Linux)

```bash
# Check if SELinux is enforcing
getenforce

# If it says "Enforcing", temporarily disable it
sudo setenforce 0

# Test again
curl http://localhost

# If it works now, SELinux was the issue
# To permanently fix, set the correct context:
sudo chcon -R -t httpd_sys_content_t ~/karnataka-bar-association/dist/

# Re-enable SELinux
sudo setenforce 1
```

## 🔧 Step 6: Check Nginx User Permissions

```bash
# Check which user nginx runs as
ps aux | grep nginx

# Usually it's 'nginx' or 'www-data'
# Make sure that user can access the files

# If nginx user is 'nginx':
sudo -u nginx ls ~/karnataka-bar-association/dist/

# If you get permission denied, fix it:
chmod 755 ~
chmod 755 ~/karnataka-bar-association
chmod -R 755 ~/karnataka-bar-association/dist
```

## 🎯 Complete Fix Script

Run this complete fix:

```bash
echo "=== Step 1: Check if dist exists ==="
ls -la ~/karnataka-bar-association/dist/

echo -e "\n=== Step 2: Build if needed ==="
cd ~/karnataka-bar-association
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "Building frontend..."
    npm run build
else
    echo "dist folder exists and has content"
fi

echo -e "\n=== Step 3: Fix permissions ==="
chmod 755 ~
chmod 755 ~/karnataka-bar-association
chmod -R 755 ~/karnataka-bar-association/dist

echo -e "\n=== Step 4: Check nginx config ==="
sudo nginx -t

echo -e "\n=== Step 5: Reload nginx ==="
sudo nginx -s reload

echo -e "\n=== Step 6: Test ==="
curl -I http://localhost

echo -e "\n=== Step 7: Check error log ==="
sudo tail -20 /var/log/nginx/error.log
```

## 📋 Most Common Causes & Fixes

### Cause 1: dist Folder Doesn't Exist

**Fix:**
```bash
cd ~/karnataka-bar-association
npm run build
sudo nginx -s reload
```

### Cause 2: Permission Denied

**Fix:**
```bash
chmod 755 ~
chmod 755 ~/karnataka-bar-association
chmod -R 755 ~/karnataka-bar-association/dist
sudo nginx -s reload
```

### Cause 3: Wrong Path in Config

**Fix:**
```bash
# Check current path
sudo nginx -T | grep "root"

# Should be: /home/ec2-user/karnataka-bar-association/dist
# If wrong, edit config:
sudo nano /etc/nginx/conf.d/legaliq.conf

# Change root path, then:
sudo nginx -t
sudo nginx -s reload
```

### Cause 4: SELinux Blocking

**Fix:**
```bash
sudo setenforce 0
curl http://localhost
# If works, then:
sudo chcon -R -t httpd_sys_content_t ~/karnataka-bar-association/dist/
sudo setenforce 1
```

## 🔍 Detailed Diagnostics

Run this to get detailed information:

```bash
echo "=== 1. Check dist folder ==="
ls -la ~/karnataka-bar-association/dist/ 2>&1 | head -10

echo -e "\n=== 2. Check permissions ==="
ls -ld ~
ls -ld ~/karnataka-bar-association
ls -ld ~/karnataka-bar-association/dist

echo -e "\n=== 3. Check nginx config ==="
sudo nginx -T 2>&1 | grep -A 5 "server {"

echo -e "\n=== 4. Check nginx user ==="
ps aux | grep nginx | head -2

echo -e "\n=== 5. Test nginx user access ==="
NGINX_USER=$(ps aux | grep "nginx: worker" | head -1 | awk '{print $1}')
echo "Nginx runs as: $NGINX_USER"
sudo -u $NGINX_USER ls ~/karnataka-bar-association/dist/ 2>&1 | head -5

echo -e "\n=== 6. Check SELinux ==="
getenforce 2>&1

echo -e "\n=== 7. Recent nginx errors ==="
sudo tail -30 /var/log/nginx/error.log
```

## ✅ Expected Result

After fixing, you should see:

```bash
$ curl -I http://localhost
HTTP/1.1 200 OK
Server: nginx/1.28.2
Content-Type: text/html
```

And the error log should be clean (no new errors).

## 🆘 If Still Getting 500 Error

1. **Share the error log output:**
   ```bash
   sudo tail -50 /var/log/nginx/error.log
   ```

2. **Check if index.html exists:**
   ```bash
   cat ~/karnataka-bar-association/dist/index.html | head -20
   ```

3. **Try a simple test file:**
   ```bash
   echo "Test" > ~/karnataka-bar-association/dist/test.html
   curl http://localhost/test.html
   ```

---

**🎯 Next Step**: Run the error log command first to see the exact error:
```bash
sudo tail -50 /var/log/nginx/error.log
```

This will tell us exactly what's wrong.
