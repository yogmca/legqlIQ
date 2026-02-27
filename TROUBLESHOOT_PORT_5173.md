# 🔴 TROUBLESHOOTING: Port 5173 Still Not Accessible

## 📋 Complete Diagnostic Checklist

Run these commands on your EC2 instance to find the issue:

### Step 1: Verify Vite is Running and Listening

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@13.62.225.158

# Check if anything is listening on port 5173
sudo netstat -tulpn | grep 5173
```

**Expected output:**
```
tcp        0      0 0.0.0.0:5173            0.0.0.0:*               LISTEN      12345/node
```

**If you see nothing**: Vite is not running
**If you see `127.0.0.1:5173`**: Vite is only listening on localhost (won't work)
**If you see `172.31.x.x:5173`**: Vite is only on private IP (won't work)
**If you see `0.0.0.0:5173`**: Good! Vite is listening correctly

### Step 2: Check Security Group Rules

```bash
# Get your instance ID
INSTANCE_ID=$(ec2-metadata --instance-id | cut -d " " -f 2)
echo "Instance ID: $INSTANCE_ID"

# Get security group ID
SG_ID=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
  --output text 2>/dev/null)
echo "Security Group ID: $SG_ID"

# Check if port 5173 is open
aws ec2 describe-security-groups \
  --group-ids $SG_ID \
  --query 'SecurityGroups[0].IpPermissions[?FromPort==`5173`]' \
  --output json 2>/dev/null
```

**Expected output:** Should show a rule for port 5173
**If empty `[]`**: Port 5173 is NOT in security group (this is likely your issue!)

### Step 3: Check Local Firewall (iptables/firewalld)

```bash
# Check iptables
sudo iptables -L -n -v | grep 5173

# Check firewalld status
sudo systemctl status firewalld

# If firewalld is active, check rules
sudo firewall-cmd --list-all 2>/dev/null
```

### Step 4: Test Connectivity from EC2 Itself

```bash
# Test localhost
curl -I http://localhost:5173

# Test private IP
curl -I http://172.31.255.194:5173

# Test public IP from inside EC2
curl -I http://13.62.225.158:5173
```

### Step 5: Check Vite Configuration

```bash
cd ~/karnataka-bar-association

# Check if vite.config.js has server settings
cat vite.config.js | grep -A 10 "server:"
```

## 🔧 FIXES Based on Diagnosis

### Fix 1: Vite Not Running or Wrong Host

**Stop any running Vite:**
```bash
# Find and kill Vite process
pkill -f vite
# or
pm2 delete all
```

**Start Vite correctly:**
```bash
cd ~/karnataka-bar-association

# Method 1: Direct command
npm run dev -- --host 0.0.0.0 --port 5173

# Method 2: With PM2 (keeps running)
pm2 start npm --name "vite-dev" -- run dev -- --host 0.0.0.0 --port 5173
pm2 logs vite-dev
```

**Verify it's listening on 0.0.0.0:**
```bash
sudo netstat -tulpn | grep 5173
# Should show: 0.0.0.0:5173
```

### Fix 2: Port 5173 NOT in Security Group (Most Likely Issue)

**Via AWS CLI:**
```bash
# Get your current IP
MY_IP=$(curl -s https://checkip.amazonaws.com)
echo "Your IP: $MY_IP"

# Get instance and security group info
INSTANCE_ID=$(ec2-metadata --instance-id | cut -d " " -f 2)
SG_ID=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
  --output text)

echo "Adding port 5173 to security group $SG_ID..."

# Add port 5173 rule
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 5173 \
  --cidr $MY_IP/32 \
  --description "Vite dev server from my IP"

# Verify it was added
aws ec2 describe-security-groups \
  --group-ids $SG_ID \
  --query 'SecurityGroups[0].IpPermissions[?FromPort==`5173`]' \
  --output table
```

**Via AWS Console (Detailed Steps):**

1. Open browser → https://console.aws.amazon.com/ec2/
2. Click **Security Groups** in left sidebar
3. Find your security group (check the box next to it)
4. Click **Inbound rules** tab at bottom
5. Click **Edit inbound rules** button
6. Click **Add rule** button
7. Fill in:
   - **Type**: Custom TCP
   - **Port range**: 5173
   - **Source**: My IP (or 0.0.0.0/0 for testing)
   - **Description**: Vite dev server
8. Click **Save rules**
9. Wait 30 seconds for AWS to apply

### Fix 3: Firewall Blocking Port

```bash
# If firewalld is running
sudo systemctl status firewalld

# Add port 5173
sudo firewall-cmd --permanent --add-port=5173/tcp
sudo firewall-cmd --reload

# Verify
sudo firewall-cmd --list-ports
```

### Fix 4: Update vite.config.js

```bash
cd ~/karnataka-bar-association

# Backup current config
cp vite.config.js vite.config.js.backup

# Edit config
nano vite.config.js
```

**Add or update server configuration:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Listen on all interfaces
    port: 5173,
    strictPort: true
  }
})
```

Save and restart Vite.

## 🧪 Complete Test Sequence

Run these in order:

```bash
# 1. Check Vite is running
sudo netstat -tulpn | grep 5173
# Expected: tcp 0 0 0.0.0.0:5173 ... LISTEN

# 2. Test from EC2 localhost
curl -I http://localhost:5173
# Expected: HTTP/1.1 200 OK

# 3. Check security group has port 5173
aws ec2 describe-security-groups \
  --group-ids $(aws ec2 describe-instances \
    --instance-ids $(ec2-metadata --instance-id | cut -d " " -f 2) \
    --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
    --output text) \
  --query 'SecurityGroups[0].IpPermissions[?FromPort==`5173`]' \
  --output table
# Expected: Should show a rule

# 4. Test from your local machine
# Open browser: http://13.62.225.158:5173
```

## 📊 Diagnostic Output Template

Run this complete diagnostic and share the output:

```bash
#!/bin/bash
echo "=== EC2 Instance Info ==="
ec2-metadata --instance-id
ec2-metadata --public-ipv4
ec2-metadata --local-ipv4

echo -e "\n=== Port 5173 Listening Status ==="
sudo netstat -tulpn | grep 5173

echo -e "\n=== Vite Process ==="
ps aux | grep vite | grep -v grep

echo -e "\n=== PM2 Status ==="
pm2 status 2>/dev/null || echo "PM2 not running"

echo -e "\n=== Security Group Rules ==="
INSTANCE_ID=$(ec2-metadata --instance-id | cut -d " " -f 2)
SG_ID=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
  --output text 2>/dev/null)
echo "Security Group: $SG_ID"
aws ec2 describe-security-groups \
  --group-ids $SG_ID \
  --query 'SecurityGroups[0].IpPermissions[*].[IpProtocol,FromPort,ToPort,IpRanges[*].CidrIp]' \
  --output table 2>/dev/null || echo "AWS CLI not configured"

echo -e "\n=== Firewall Status ==="
sudo systemctl status firewalld 2>/dev/null || echo "firewalld not active"
sudo iptables -L -n | grep 5173 || echo "No iptables rules for 5173"

echo -e "\n=== Local Connectivity Test ==="
curl -I http://localhost:5173 2>&1 | head -5

echo -e "\n=== Vite Config ==="
cat ~/karnataka-bar-association/vite.config.js 2>/dev/null || echo "vite.config.js not found"
```

## 🎯 Most Common Issues (In Order)

1. **Port 5173 NOT added to security group** (90% of cases)
   - Fix: Add rule in AWS Console or CLI

2. **Vite not running with --host 0.0.0.0** (5% of cases)
   - Fix: Restart with `npm run dev -- --host 0.0.0.0 --port 5173`

3. **Firewall blocking port** (3% of cases)
   - Fix: `sudo firewall-cmd --add-port=5173/tcp`

4. **Wrong public IP** (1% of cases)
   - Fix: Verify with `ec2-metadata --public-ipv4`

5. **Vite crashed/not running** (1% of cases)
   - Fix: Check logs, restart Vite

## ✅ Success Criteria

When everything is working, you should see:

```bash
# On EC2:
$ sudo netstat -tulpn | grep 5173
tcp  0  0  0.0.0.0:5173  0.0.0.0:*  LISTEN  12345/node

# Security group shows:
Custom TCP | 5173 | YOUR_IP/32 (or 0.0.0.0/0)

# Browser shows:
http://13.62.225.158:5173 → Your Vite app loads ✅
```

---

**🚨 ACTION: Run the diagnostic script above and check each item**
