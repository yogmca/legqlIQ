# How to Check and Update Your IP Address

## Step 1: Check Your Current IP Address

### On Your Local Computer (Not EC2):

**Option A: Using Command Line**
```bash
# Mac/Linux
curl https://checkip.amazonaws.com

# Windows PowerShell
(Invoke-WebRequest -Uri "https://checkip.amazonaws.com").Content.Trim()

# Windows Command Prompt
curl https://checkip.amazonaws.com
```

**Option B: Using Web Browser**
1. Open your web browser
2. Go to: https://checkip.amazonaws.com
3. You'll see your IP address (e.g., `203.0.113.45`)

**Option C: Google Search**
1. Open Google
2. Search: "what is my ip"
3. Google will show your IP address

## Step 2: Compare with Security Group

Your security group currently allows: `17.233.163.119/32`

**Does your current IP match?**
- ✅ **YES** - IP matches → Problem is elsewhere
- ❌ **NO** - IP is different → Update security group (see Step 3)

## Step 3: Update Security Group with New IP

### Via AWS Console (Easiest):

1. **Go to AWS Console**: https://console.aws.amazon.com/ec2/
2. **Click "Security Groups"** in left sidebar
3. **Select your security group** (the one with port 5173 rule)
4. **Click "Inbound rules" tab**
5. **Click "Edit inbound rules"**
6. **Find the port 5173 rule** (sgr-0ddc6f871f3a817dd)
7. **Click in the "Source" field**
8. **Select "My IP"** from dropdown (auto-fills your current IP)
   - OR manually enter: `YOUR_NEW_IP/32` (e.g., `203.0.113.45/32`)
9. **Click "Save rules"**
10. **Wait 30 seconds** for AWS to apply changes
11. **Try accessing** `http://13.62.225.158:5173` again

### Via AWS CLI:

```bash
# Get your current IP
MY_IP=$(curl -s https://checkip.amazonaws.com)
echo "Your current IP: $MY_IP"

# Get your security group ID
# Replace sg-xxxxxxxxx with your actual security group ID
SG_ID="sg-xxxxxxxxx"

# Remove old rule with old IP
aws ec2 revoke-security-group-ingress \
  --group-id $SG_ID \
  --ip-permissions IpProtocol=tcp,FromPort=5173,ToPort=5173,IpRanges='[{CidrIp=17.233.163.119/32}]'

# Add new rule with your current IP
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 5173 \
  --cidr $MY_IP/32 \
  --description "Vite dev server from my IP"

echo "✅ Security group updated with your new IP: $MY_IP"
```

## Step 4: Verify the Update

### Check Security Group Rules:

**AWS Console:**
1. EC2 → Security Groups → Your security group
2. Inbound rules tab
3. Verify port 5173 rule shows your NEW IP

**AWS CLI:**
```bash
aws ec2 describe-security-groups \
  --group-ids sg-xxxxxxxxx \
  --query 'SecurityGroups[0].IpPermissions[?FromPort==`5173`]' \
  --output table
```

## Step 5: Test Access Again

1. **Wait 30-60 seconds** for AWS to apply the changes
2. **Open browser** (or refresh if already open)
3. **Go to**: `http://13.62.225.158:5173`
4. **Should work now!** ✅

## 🔄 If Your IP Changes Frequently

### Problem: Dynamic IP
If your ISP gives you a dynamic IP that changes often, you have options:

### Option 1: Allow Broader IP Range
Instead of `/32` (single IP), use `/24` (256 IPs):
```
Example: 17.233.163.0/24
```
This allows any IP from `17.233.163.0` to `17.233.163.255`

### Option 2: Use VPN with Static IP
Get a VPN service that provides a static IP address

### Option 3: Allow from Anywhere (Less Secure)
```
Source: 0.0.0.0/0
```
⚠️ **Warning**: Less secure, but works from any IP

### Option 4: Use AWS Systems Manager
No need to open SSH port at all:
```bash
aws ssm start-session --target i-xxxxxxxxx
```

## 📊 Quick Reference

| Your Current IP | Security Group IP | Action Needed |
|----------------|-------------------|---------------|
| 17.233.163.119 | 17.233.163.119/32 | ✅ No action - IPs match |
| 203.0.113.45 | 17.233.163.119/32 | ❌ Update security group |
| Changes often | Single IP | 🔄 Use broader range or VPN |

## 🆘 Still Not Working After IP Update?

If you've updated your IP and still can't access:

1. **Check Vite is running**:
   ```bash
   # On EC2
   sudo netstat -tulpn | grep 5173
   ```

2. **Check firewall**:
   ```bash
   # On EC2
   sudo systemctl status firewalld
   ```

3. **Use the guaranteed solution** - Port 80 with Nginx:
   ```bash
   # On EC2
   cd ~/karnataka-bar-association
   npm run build
   sudo yum install nginx -y
   # ... (see FINAL_TROUBLESHOOTING.md for complete commands)
   ```

---

**⏱️ Time to check and update IP: 2-3 minutes**

**🎯 Key command**: `curl https://checkip.amazonaws.com`
