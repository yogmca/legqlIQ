# ✅ Security Group Fixed - Now Start Vite Correctly

## 🎉 Good News!

You've successfully added port 5173 to your security group:
- Rule ID: `sgr-0ddc6f871f3a817dd`
- Port: `5173`
- Source: `17.233.163.119/32` (your IP)

## 🔧 Now Fix Vite Server

Your Vite server is currently running on the **private IP** (`172.31.255.194:5173`), which is why you can't access it from the internet. You need to restart it with the `--host` flag.

### Step 1: SSH into Your EC2

```bash
ssh -i your-key.pem ec2-user@13.62.225.158
```

### Step 2: Stop Current Vite Server

```bash
# Find the Vite process
ps aux | grep vite

# Kill it (press Ctrl+C if it's running in a terminal)
# Or use:
pkill -f vite
```

### Step 3: Start Vite with --host Flag

```bash
cd ~/karnataka-bar-association

# Start Vite listening on all interfaces
npm run dev -- --host 0.0.0.0 --port 5173
```

**You should see output like:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://172.31.255.194:5173/
  ➜  Network: http://172.31.255.194:5173/
  ➜  Network: http://13.62.225.158:5173/    ← This is what you need!
```

### Step 4: Test Access

Open your browser and go to:
```
http://13.62.225.158:5173
```

**It should work now!** ✅

## 🔄 Keep Vite Running in Background

If you want to close SSH and keep Vite running:

### Option 1: Using PM2 (Recommended)

```bash
# Install PM2 if not already installed
sudo npm install -g pm2

# Stop any existing PM2 processes
pm2 delete all

# Start Vite with PM2
cd ~/karnataka-bar-association
pm2 start npm --name "vite-dev" -- run dev -- --host 0.0.0.0 --port 5173

# Check status
pm2 status

# View logs
pm2 logs vite-dev

# Now you can close SSH and Vite keeps running
```

### Option 2: Using nohup

```bash
cd ~/karnataka-bar-association

# Start in background
nohup npm run dev -- --host 0.0.0.0 --port 5173 > vite.log 2>&1 &

# Check it's running
tail -f vite.log

# Press Ctrl+C to stop viewing logs (Vite keeps running)
```

### Option 3: Using screen

```bash
# Install screen
sudo yum install screen -y

# Start screen session
screen -S vite

# Run Vite
cd ~/karnataka-bar-association
npm run dev -- --host 0.0.0.0 --port 5173

# Detach from screen: Press Ctrl+A then D
# Vite keeps running in background

# Reattach later: screen -r vite
```

## ✅ Verify Everything is Working

### Check 1: Vite is Listening on All Interfaces

```bash
sudo netstat -tulpn | grep 5173
```

**Should show:**
```
tcp  0  0  0.0.0.0:5173  0.0.0.0:*  LISTEN  xxxxx/node
```

**NOT:**
```
tcp  0  0  172.31.255.194:5173  ...  ← This won't work from internet
```

### Check 2: Test from EC2 Itself

```bash
# Test localhost
curl -I http://localhost:5173

# Should return: HTTP/1.1 200 OK
```

### Check 3: Access from Browser

Open: `http://13.62.225.158:5173`

Should load your application! ✅

## 🆘 Still Not Working?

### Issue: "Connection refused" or "Can't reach"

**Check if Vite is actually running:**
```bash
ps aux | grep vite
pm2 status
```

**Check if it's listening on 0.0.0.0:**
```bash
sudo netstat -tulpn | grep 5173
```

**Restart Vite with correct flags:**
```bash
cd ~/karnataka-bar-association
npm run dev -- --host 0.0.0.0 --port 5173
```

### Issue: "Your IP changed"

If your IP changes (dynamic IP), update the security group:

```bash
# Get your new IP
curl https://checkip.amazonaws.com

# Update security group in AWS Console:
# EC2 → Security Groups → Edit inbound rules
# Change the 5173 rule source to your new IP
```

### Issue: Firewall blocking

```bash
# Check firewall
sudo systemctl status firewalld

# If active, allow port 5173
sudo firewall-cmd --permanent --add-port=5173/tcp
sudo firewall-cmd --reload
```

## 📝 Make it Permanent

Update your `package.json` to always use `--host 0.0.0.0`:

```bash
cd ~/karnataka-bar-association
nano package.json
```

Find the `"dev"` script and change it to:
```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 5173",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Save (Ctrl+X, Y, Enter).

Now you can just run:
```bash
npm run dev
```

## 🎯 Summary

**What you did:**
1. ✅ Added port 5173 to security group (DONE)

**What you need to do:**
2. ⏳ Restart Vite with `--host 0.0.0.0` flag
3. ⏳ Access `http://13.62.225.158:5173`

**Key command:**
```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

---

**⏱️ Time to fix**: 1-2 minutes

**🎯 Expected result**: `http://13.62.225.158:5173` loads your app
