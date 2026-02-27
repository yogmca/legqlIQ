# Fix: Nginx Running But Not Accessible Externally

## ✅ Confirmed: Nginx IS Running

```bash
tcp    0    0 0.0.0.0:80    0.0.0.0:*    LISTEN    539/nginx: master p
```

Nginx is listening on port 80, but external connections are being blocked.

## 🚨 The Problem

- ✅ Nginx is running on port 80
- ❌ External connections to port 80 are blocked
- 🔒 This is a **firewall/security group** issue, NOT an nginx issue

## 🔧 Solution 1: Check AWS Security Group (Most Likely Issue)

### Step 1: Check Current Security Group Rules

1. Go to AWS Console: https://console.aws.amazon.com/ec2/
2. Click on **Instances** in the left sidebar
3. Select your EC2 instance
4. Click on the **Security** tab
5. Click on the security group name (e.g., "launch-wizard-1")
6. Click on **Inbound rules** tab

### Step 2: Add Port 80 Rule

You need an inbound rule like this:

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| HTTP | TCP | 80 | 0.0.0.0/0 | Allow HTTP from anywhere |

**To add it:**

1. Click **Edit inbound rules**
2. Click **Add rule**
3. Select **Type**: HTTP
4. **Port range**: 80 (auto-filled)
5. **Source**: Custom → `0.0.0.0/0` (or your IP for security)
6. Click **Save rules**

### Step 3: Test Again

```bash
# From your EC2 server
curl http://13.62.225.158

# From your local computer
curl http://13.62.225.158
```

## 🔧 Solution 2: Check Local Firewall (iptables)

### Check if iptables is blocking port 80:

```bash
# Check iptables rules
sudo iptables -L -n -v

# Check if port 80 is allowed
sudo iptables -L INPUT -n -v | grep 80
```

### If port 80 is blocked, allow it:

```bash
# Allow port 80
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT

# Save the rules (Amazon Linux)
sudo service iptables save

# OR for other systems
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

### Test again:

```bash
curl http://13.62.225.158
```

## 🔧 Solution 3: Check firewalld (if installed)

```bash
# Check if firewalld is running
sudo systemctl status firewalld

# If running, allow HTTP
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload

# Verify
sudo firewall-cmd --list-all
```

## 🧪 Test Locally First

```bash
# Test from the EC2 server itself
curl http://localhost

# Test with the private IP
curl http://$(hostname -I | awk '{print $1}')

# Test with public IP from server
curl http://13.62.225.158
```

**If localhost works but public IP doesn't:** It's definitely a firewall/security group issue.

## 🔍 Check if dist Folder Has Content

```bash
# Check if the dist folder exists and has files
ls -la ~/karnataka-bar-association/dist/

# If empty or doesn't exist, build it
cd ~/karnataka-bar-association
npm run build

# Verify files were created
ls -la ~/karnataka-bar-association/dist/
```

## 📋 Complete Diagnostic

Run this to check everything:

```bash
echo "=== 1. Nginx Status ==="
ps aux | grep nginx
sudo netstat -tulpn | grep :80

echo -e "\n=== 2. Test Localhost ==="
curl -I http://localhost

echo -e "\n=== 3. Test Public IP from Server ==="
curl -I http://13.62.225.158

echo -e "\n=== 4. Check iptables ==="
sudo iptables -L INPUT -n -v | grep 80

echo -e "\n=== 5. Check dist folder ==="
ls -la ~/karnataka-bar-association/dist/ | head -10

echo -e "\n=== 6. Check nginx config ==="
sudo nginx -t

echo -e "\n=== 7. Check nginx error log ==="
sudo tail -20 /var/log/nginx/error.log
```

## 🎯 Most Common Issue: AWS Security Group

**99% of the time**, when nginx is running but not accessible, it's because:

1. **Port 80 is not open in the EC2 Security Group**
2. **Your IP is not whitelisted** (if you restricted access)

### Quick Check from AWS Console:

```
EC2 Dashboard → Instances → Select your instance → Security tab → 
Security groups → Inbound rules → Look for port 80
```

If you don't see a rule for port 80, that's your problem!

## 🔐 Security Best Practice

Instead of opening to `0.0.0.0/0` (everyone), you can restrict to your IP:

1. Find your IP: https://whatismyipaddress.com/
2. In security group, use: `YOUR_IP/32` instead of `0.0.0.0/0`

Example: `203.0.113.45/32`

## ✅ Expected Result

After fixing the security group, you should be able to:

```bash
# From your local computer
curl http://13.62.225.158
# Should return HTML content

# Open in browser
http://13.62.225.158
# Should show your React app
```

## 🆘 If Still Not Working

### Check if you're testing from the right location:

```bash
# Get your EC2 public IP
curl http://checkip.amazonaws.com

# Or
curl http://ifconfig.me
```

Make sure you're using the correct public IP address.

### Check AWS Network ACLs:

1. Go to VPC Dashboard
2. Click **Network ACLs**
3. Find the ACL associated with your subnet
4. Check **Inbound Rules** - should allow port 80

### Check if instance is in a public subnet:

1. EC2 Dashboard → Instances → Select instance
2. Check **Subnet ID**
3. Go to VPC → Subnets → Find your subnet
4. Check if it has an **Internet Gateway** attached

---

**🎯 Bottom Line**: Nginx is working fine. You need to open port 80 in your AWS Security Group.

**Quick Link**: https://console.aws.amazon.com/ec2/v2/home#SecurityGroups
