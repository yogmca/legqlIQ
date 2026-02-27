# 🚨 IMMEDIATE ACTION REQUIRED - Your Security Group Rules

## 📊 Your Current Configuration

You have **3 security group rules** that need attention:

| Rule ID | Type | Port | Source | Status |
|---------|------|------|--------|--------|
| sgr-0da456e751c6fe67d | HTTPS | 443 | 0.0.0.0/0 | ⚠️ **NEEDS REVIEW** |
| sgr-07a1b50ae0ac57909 | SSH | 22 | 0.0.0.0/0 | 🔴 **CRITICAL - FIX NOW** |
| sgr-0f14aa76c9df3f3e2 | HTTP | 80 | 0.0.0.0/0 | ⚠️ **NEEDS REVIEW** |

## 🎯 What Needs to Be Fixed

### 🔴 CRITICAL: SSH Rule (Port 22)
**Rule ID**: `sgr-07a1b50ae0ac57909`
**Current**: SSH from 0.0.0.0/0 (ANYONE can attempt to SSH)
**Risk**: Brute force attacks, unauthorized access
**Action**: **MUST FIX IMMEDIATELY**

### ⚠️ HTTP/HTTPS Rules (Ports 80/443)
**Rule IDs**: `sgr-0da456e751c6fe67d`, `sgr-0f14aa76c9df3f3e2`
**Current**: HTTP/HTTPS from 0.0.0.0/0
**Risk**: Depends on your architecture
**Action**: Review based on your setup (see below)

## 🔧 Fix Strategy

### Architecture Check

**Question**: Are you using an Application Load Balancer (ALB) or CloudFront?

#### Scenario A: Using ALB/CloudFront (Recommended)
If you have an ALB or CloudFront in front of your EC2:
- ✅ **Keep** HTTP/HTTPS (80/443) open to 0.0.0.0/0 on the **ALB security group**
- ❌ **Restrict** HTTP/HTTPS on EC2 to only accept traffic from ALB security group
- ❌ **Remove** SSH (22) from 0.0.0.0/0, restrict to your IP

#### Scenario B: Direct EC2 Access (Not Recommended)
If users connect directly to your EC2 instance:
- ⚠️ **Keep** HTTP/HTTPS (80/443) open to 0.0.0.0/0 (for public access)
- ❌ **Remove** SSH (22) from 0.0.0.0/0, restrict to your IP
- 🔄 **Recommended**: Set up ALB/CloudFront for better security

## 📋 Step-by-Step Fix

### Step 1: Get Your IP Address

```bash
curl https://checkip.amazonaws.com
```
**Example output**: `203.0.113.45`
**You'll use**: `203.0.113.45/32`

### Step 2: Fix SSH Rule (CRITICAL)

#### Via AWS Console (Easiest):

1. **Go to AWS Console** → **EC2** → **Security Groups**
2. **Select your security group** (the one with these rules)
3. **Click "Inbound rules" tab**
4. **Click "Edit inbound rules"**
5. **Find the SSH rule** (sgr-07a1b50ae0ac57909):
   - Click the **X** to delete it
6. **Add new SSH rule**:
   - Click "Add rule"
   - Type: **SSH**
   - Port: **22**
   - Source: **Custom** → Enter `YOUR_IP/32` (e.g., `203.0.113.45/32`)
   - Description: "SSH from my IP only"
7. **Click "Save rules"**

#### Via AWS CLI:

```bash
# Get your IP
MY_IP=$(curl -s https://checkip.amazonaws.com)
echo "Your IP: $MY_IP"

# Get your security group ID
# (Replace with your actual security group ID)
SG_ID="sg-xxxxxxxxx"

# Remove the dangerous SSH rule
aws ec2 revoke-security-group-ingress \
  --group-id $SG_ID \
  --ip-permissions IpProtocol=tcp,FromPort=22,ToPort=22,IpRanges='[{CidrIp=0.0.0.0/0}]'

# Add secure SSH rule with your IP
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 22 \
  --cidr $MY_IP/32 \
  --description "SSH from my IP only"

echo "✓ SSH rule fixed!"
```

### Step 3: Review HTTP/HTTPS Rules

#### If You're Using ALB/CloudFront:

**Option 1: Via AWS Console**
1. Keep HTTP/HTTPS rules on ALB security group
2. On EC2 security group:
   - Edit HTTP rule (sgr-0f14aa76c9df3f3e2)
   - Change Source from `0.0.0.0/0` to your **ALB Security Group ID**
   - Edit HTTPS rule (sgr-0da456e751c6fe67d)
   - Change Source from `0.0.0.0/0` to your **ALB Security Group ID**

**Option 2: Via AWS CLI**
```bash
# Get ALB security group ID
ALB_SG_ID="sg-alb-xxxxxxxx"  # Replace with your ALB security group

# Remove current HTTP/HTTPS rules
aws ec2 revoke-security-group-ingress \
  --group-id $SG_ID \
  --ip-permissions IpProtocol=tcp,FromPort=80,ToPort=80,IpRanges='[{CidrIp=0.0.0.0/0}]'

aws ec2 revoke-security-group-ingress \
  --group-id $SG_ID \
  --ip-permissions IpProtocol=tcp,FromPort=443,ToPort=443,IpRanges='[{CidrIp=0.0.0.0/0}]'

# Add rules to accept traffic from ALB only
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 80 \
  --source-group $ALB_SG_ID \
  --description "HTTP from ALB only"

aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 443 \
  --source-group $ALB_SG_ID \
  --description "HTTPS from ALB only"
```

#### If You're NOT Using ALB (Direct Access):

**Keep HTTP/HTTPS open** for now, but plan to set up ALB:
- HTTP (80) and HTTPS (443) can stay as `0.0.0.0/0` (needed for public access)
- **Still fix SSH (22)** - this is critical!
- **Plan to set up ALB** for better security architecture

### Step 4: Add Backend API Rule (Port 4000)

If your backend runs on port 4000, add a rule:

```bash
# Via CLI
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 4000 \
  --cidr $MY_IP/32 \
  --description "Backend API from my IP"

# Or if using ALB
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 4000 \
  --source-group $ALB_SG_ID \
  --description "Backend API from ALB"
```

## ✅ Verification

### Check Your New Rules

**Via AWS Console:**
1. EC2 → Security Groups → Your security group
2. Inbound rules tab
3. Verify:
   - ✅ SSH (22) shows your IP (e.g., `203.0.113.45/32`)
   - ✅ HTTP/HTTPS show ALB security group OR 0.0.0.0/0 (if no ALB)
   - ❌ NO rules show `0.0.0.0/0` for SSH

**Via AWS CLI:**
```bash
aws ec2 describe-security-groups \
  --group-ids $SG_ID \
  --query 'SecurityGroups[0].IpPermissions[*].[IpProtocol,FromPort,ToPort,IpRanges[*].CidrIp,UserIdGroupPairs[*].GroupId]' \
  --output table
```

### Test SSH Access

```bash
# Get your EC2 instance public IP
INSTANCE_IP=$(aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

# Test SSH (should work from your IP)
ssh -i your-key.pem ec2-user@$INSTANCE_IP
```

## 📊 Final Configuration

### Recommended Setup (With ALB):

```
Internet → ALB (HTTP/HTTPS from 0.0.0.0/0) → EC2 (HTTP/HTTPS from ALB only)
                                              ↑
                                              SSH from YOUR_IP/32 only
```

**Security Group Rules:**
- SSH (22) → `YOUR_IP/32` ✅
- HTTP (80) → `ALB_SECURITY_GROUP` ✅
- HTTPS (443) → `ALB_SECURITY_GROUP` ✅
- Backend API (4000) → `ALB_SECURITY_GROUP` or `YOUR_IP/32` ✅

### Acceptable Setup (Without ALB - Temporary):

```
Internet → EC2 (HTTP/HTTPS from 0.0.0.0/0)
           ↑
           SSH from YOUR_IP/32 only
```

**Security Group Rules:**
- SSH (22) → `YOUR_IP/32` ✅
- HTTP (80) → `0.0.0.0/0` ⚠️ (acceptable for public web)
- HTTPS (443) → `0.0.0.0/0` ⚠️ (acceptable for public web)
- Backend API (4000) → `YOUR_IP/32` ✅

## 🆘 Troubleshooting

### "I can't SSH after the change"
Your IP may have changed:
```bash
# Check your current IP
curl https://checkip.amazonaws.com

# Update the security group rule with new IP
```

### "My website stopped working"
If you removed HTTP/HTTPS rules:
- Add them back temporarily
- Determine if you need ALB or direct access
- Configure accordingly

### "I locked myself out completely"
1. Go to AWS Console (web browser)
2. EC2 → Security Groups
3. Add your current IP back to SSH rule
4. No SSH needed to access AWS Console

## 📝 Summary of Actions

**Priority 1 (DO NOW):**
- [ ] Get your current IP address
- [ ] Remove SSH rule with 0.0.0.0/0 (sgr-07a1b50ae0ac57909)
- [ ] Add SSH rule with your IP/32
- [ ] Test SSH access

**Priority 2 (REVIEW):**
- [ ] Determine if you're using ALB/CloudFront
- [ ] If yes: Restrict HTTP/HTTPS to ALB security group
- [ ] If no: Plan to set up ALB for better security
- [ ] Add backend API rule (port 4000) if needed

**Priority 3 (BEST PRACTICES):**
- [ ] Set up Elastic IP for your EC2 instance
- [ ] Update MongoDB Atlas IP whitelist
- [ ] Set up CloudWatch alarms
- [ ] Review AWS_SECURITY_BEST_PRACTICES.md

## ⏱️ Time Estimate

- **Fix SSH rule**: 2-3 minutes
- **Review HTTP/HTTPS**: 5-10 minutes
- **Full verification**: 5 minutes
- **Total**: 15-20 minutes

---

**🚨 START WITH SSH (Port 22) - This is the most critical security risk!**
