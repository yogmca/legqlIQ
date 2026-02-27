# Fix Security Groups: default and launch-wizard-1

## 🎯 Your Current Setup

You have two security groups:
1. **default** - The default VPC security group
2. **launch-wizard-1** - Created when you launched your EC2 instance

Your EC2 instance is likely using **launch-wizard-1**.

## 🔍 Step 1: Identify Which Security Group Your Instance Uses

### Option A: AWS Console
1. Go to **EC2 Dashboard** → **Instances**
2. Select your instance
3. Look at the **Security** tab at the bottom
4. Note which security group(s) are attached (likely "launch-wizard-1")

### Option B: AWS CLI
```bash
# List your instances and their security groups
aws ec2 describe-instances \
  --query 'Reservations[*].Instances[*].[InstanceId,Tags[?Key==`Name`].Value|[0],SecurityGroups[*].GroupName]' \
  --output table
```

## 🚨 Step 2: Fix launch-wizard-1 Security Group

This is the security group that needs immediate attention.

### Get Your Current IP
```bash
curl https://checkip.amazonaws.com
# Example output: 203.0.113.45
# You'll use this as: 203.0.113.45/32
```

### Fix via AWS Console (Easiest)

1. **Go to EC2 Dashboard** → **Security Groups**
2. **Select "launch-wizard-1"**
3. **Click "Inbound rules" tab**
4. **Click "Edit inbound rules"**

5. **Review Current Rules** - Look for dangerous rules:
   - ❌ SSH (22) with Source: `0.0.0.0/0` or `Anywhere-IPv4`
   - ❌ Custom TCP (4000) with Source: `0.0.0.0/0`
   - ❌ HTTP (80) with Source: `0.0.0.0/0` (only if NOT using ALB)
   - ❌ Any rule with `::/0` or `Anywhere-IPv6`

6. **Remove Dangerous Rules**:
   - Click the **X** button next to each rule with `0.0.0.0/0` or `::/0`
   - **DO NOT** remove all rules at once (you'll lock yourself out!)

7. **Add Secure Rules**:
   
   **For SSH:**
   - Type: SSH
   - Protocol: TCP
   - Port: 22
   - Source: **Custom** → Enter `YOUR_IP/32` (e.g., `203.0.113.45/32`)
   - Description: "SSH from my IP"
   
   **For Backend API:**
   - Type: Custom TCP
   - Protocol: TCP
   - Port: 4000
   - Source: **Custom** → Enter `YOUR_IP/32` OR your ALB security group
   - Description: "Backend API"
   
   **For HTTP (if using Nginx):**
   - Type: HTTP
   - Protocol: TCP
   - Port: 80
   - Source: **Custom** → Your ALB security group OR specific IPs
   - Description: "HTTP from ALB"

8. **Click "Save rules"**

### Fix via AWS CLI

```bash
# Get your IP
MY_IP=$(curl -s https://checkip.amazonaws.com)
echo "Your IP: $MY_IP"

# Get the security group ID for launch-wizard-1
SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=launch-wizard-1" \
  --query 'SecurityGroups[0].GroupId' \
  --output text)
echo "Security Group ID: $SG_ID"

# View current rules
echo "Current rules:"
aws ec2 describe-security-groups \
  --group-ids $SG_ID \
  --query 'SecurityGroups[0].IpPermissions[*].[IpProtocol,FromPort,ToPort,IpRanges[*].CidrIp]' \
  --output table

# Remove dangerous SSH rule (0.0.0.0/0)
echo "Removing SSH access from 0.0.0.0/0..."
aws ec2 revoke-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

# Remove dangerous API rule (0.0.0.0/0)
echo "Removing API access from 0.0.0.0/0..."
aws ec2 revoke-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 4000 \
  --cidr 0.0.0.0/0

# Add secure SSH rule (your IP only)
echo "Adding SSH access for your IP only..."
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 22 \
  --cidr $MY_IP/32 \
  --description "SSH from my IP"

# Add secure API rule (your IP only)
echo "Adding API access for your IP only..."
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 4000 \
  --cidr $MY_IP/32 \
  --description "Backend API from my IP"

# Verify new rules
echo "New rules:"
aws ec2 describe-security-groups \
  --group-ids $SG_ID \
  --query 'SecurityGroups[0].IpPermissions[*].[IpProtocol,FromPort,ToPort,IpRanges[*].CidrIp]' \
  --output table

echo "✓ Security group fixed!"
```

## 📋 Step 3: Check the "default" Security Group

The "default" security group should typically NOT be used for production instances, but let's check it:

### Via AWS Console
1. Go to **EC2 Dashboard** → **Security Groups**
2. Select **"default"**
3. Check if it has any `0.0.0.0/0` rules
4. If your instance is NOT using this group, you can leave it as is
5. If it IS using this group, apply the same fixes as above

### Via AWS CLI
```bash
# Check default security group
DEFAULT_SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=default" \
  --query 'SecurityGroups[0].GroupId' \
  --output text)

echo "Default Security Group rules:"
aws ec2 describe-security-groups \
  --group-ids $DEFAULT_SG_ID \
  --query 'SecurityGroups[0].IpPermissions[*].[IpProtocol,FromPort,ToPort,IpRanges[*].CidrIp]' \
  --output table
```

## 🔐 Step 4: Best Practice - Create a New Security Group

Instead of using "launch-wizard-1", create a properly named security group:

### Via AWS Console
1. **EC2 Dashboard** → **Security Groups** → **Create security group**
2. **Name**: `legaliq-backend-sg`
3. **Description**: `LegalIQ Backend Security Group`
4. **VPC**: Select your VPC
5. **Add Inbound Rules**:
   - SSH (22) from `YOUR_IP/32`
   - Custom TCP (4000) from `YOUR_IP/32` or ALB
   - HTTP (80) from ALB (if needed)
6. **Create security group**
7. **Attach to your instance**:
   - Go to **Instances** → Select your instance
   - **Actions** → **Security** → **Change security groups**
   - Remove "launch-wizard-1"
   - Add "legaliq-backend-sg"
   - **Save**

### Via AWS CLI
```bash
# Get your VPC ID
VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=isDefault,Values=true" \
  --query 'Vpcs[0].VpcId' \
  --output text)

# Create new security group
NEW_SG_ID=$(aws ec2 create-security-group \
  --group-name legaliq-backend-sg \
  --description "LegalIQ Backend Security Group" \
  --vpc-id $VPC_ID \
  --query 'GroupId' \
  --output text)

echo "Created security group: $NEW_SG_ID"

# Add secure rules
MY_IP=$(curl -s https://checkip.amazonaws.com)

aws ec2 authorize-security-group-ingress \
  --group-id $NEW_SG_ID \
  --protocol tcp \
  --port 22 \
  --cidr $MY_IP/32 \
  --description "SSH from admin IP"

aws ec2 authorize-security-group-ingress \
  --group-id $NEW_SG_ID \
  --protocol tcp \
  --port 4000 \
  --cidr $MY_IP/32 \
  --description "Backend API from admin IP"

# Get your instance ID
INSTANCE_ID=$(aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text)

# Attach new security group to instance
aws ec2 modify-instance-attribute \
  --instance-id $INSTANCE_ID \
  --groups $NEW_SG_ID

echo "✓ New security group attached to instance"
```

## ✅ Step 5: Verify the Fix

### Test SSH Access
```bash
# Get your instance's public IP
INSTANCE_IP=$(aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

# Test SSH (should work from your IP)
ssh -i your-key.pem ec2-user@$INSTANCE_IP
```

### Check Security Group Rules
```bash
# View final configuration
aws ec2 describe-security-groups \
  --group-names launch-wizard-1 \
  --query 'SecurityGroups[0].IpPermissions[*].[IpProtocol,FromPort,ToPort,IpRanges[*].CidrIp]' \
  --output table
```

### Verify No 0.0.0.0/0 Rules
Look at the output - you should see your specific IP (e.g., `203.0.113.45/32`) instead of `0.0.0.0/0`.

## 📊 Summary of What You Should See

**BEFORE (Insecure):**
```
Port 22 (SSH)    → 0.0.0.0/0  ❌ DANGEROUS
Port 4000 (API)  → 0.0.0.0/0  ❌ DANGEROUS
```

**AFTER (Secure):**
```
Port 22 (SSH)    → 203.0.113.45/32  ✅ SECURE
Port 4000 (API)  → 203.0.113.45/32  ✅ SECURE
```

## 🆘 Troubleshooting

### "I locked myself out!"
If you can't SSH after removing 0.0.0.0/0:
1. Go to AWS Console → EC2 → Security Groups
2. Edit "launch-wizard-1" inbound rules
3. Add SSH rule with your current IP
4. Your IP may have changed - check with `curl https://checkip.amazonaws.com`

### "My IP keeps changing"
If you have a dynamic IP:
- **Option 1**: Use AWS Systems Manager Session Manager (no SSH needed)
- **Option 2**: Use a VPN with static IP
- **Option 3**: Add your ISP's IP range (e.g., `203.0.113.0/24`)
- **Option 4**: Set up a bastion host with Elastic IP

### "I need to access from multiple locations"
Add multiple rules:
```bash
# Office IP
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 22 \
  --cidr 203.0.113.0/24 \
  --description "SSH from office"

# Home IP
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 22 \
  --cidr 198.51.100.45/32 \
  --description "SSH from home"
```

## 📝 Next Steps

1. ✅ Fix launch-wizard-1 security group
2. ✅ Verify SSH access works from your IP
3. ✅ Get Elastic IP for your instance
4. ✅ Update MongoDB Atlas with Elastic IP
5. ✅ Consider creating a properly named security group
6. ✅ Document your security group configuration
7. ✅ Set up CloudWatch alarms for security events

## 📚 Additional Resources

- [URGENT_SECURITY_FIX.md](URGENT_SECURITY_FIX.md) - Quick fix guide
- [AWS_SECURITY_BEST_PRACTICES.md](AWS_SECURITY_BEST_PRACTICES.md) - Comprehensive security guide
- [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md) - Full deployment guide

---

**⏱️ Time to fix: 5-10 minutes**

**🚨 Priority: CRITICAL - Fix immediately!**
