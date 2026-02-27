# 🚨 URGENT: Fix EC2 Security Group - 0.0.0.0/0 Issue

## ⚠️ CRITICAL SECURITY ISSUE

Your EC2 instance has security group rules with source `0.0.0.0/0` or `::/0`, which allows **ALL IP addresses** on the internet to access your instance. This is a **CRITICAL security vulnerability**.

## 🔴 Immediate Risk

- **Brute force attacks** on SSH
- **Unauthorized access** to your application
- **Data breaches** and system compromise
- **DDoS attacks** targeting your instance
- **Compliance violations** (PCI-DSS, HIPAA, etc.)

## ✅ IMMEDIATE ACTION REQUIRED

### Option 1: Automated Fix (Recommended)

Run the security hardening script:

```bash
cd karnataka-bar-association
./secure-ec2.sh
```

This script will:
- ✓ Detect your current IP address
- ✓ Remove dangerous 0.0.0.0/0 rules
- ✓ Add secure rules for your IP only
- ✓ Configure Elastic IP for MongoDB Atlas
- ✓ Provide MongoDB Atlas configuration instructions

### Option 2: Manual Fix via AWS Console

#### Step 1: Get Your IP Address
```bash
curl https://checkip.amazonaws.com
# Example output: 203.0.113.45
```

#### Step 2: Fix Security Group Rules

1. **Go to AWS Console** → EC2 → Security Groups
2. **Find your instance's security group**
3. **Edit Inbound Rules**:

   **Remove these DANGEROUS rules:**
   - ❌ SSH (22) from `0.0.0.0/0`
   - ❌ Custom TCP (4000) from `0.0.0.0/0`
   - ❌ Any other ports from `0.0.0.0/0` (except 80/443 if using ALB)

   **Add these SECURE rules:**
   - ✅ SSH (22) from `YOUR_IP/32` (e.g., `203.0.113.45/32`)
   - ✅ Custom TCP (4000) from ALB Security Group OR `YOUR_IP/32`

4. **Save Rules**

#### Step 3: Configure Elastic IP

1. **Allocate Elastic IP**:
   - EC2 → Elastic IPs → Allocate Elastic IP address
   
2. **Associate with Instance**:
   - Select the Elastic IP → Actions → Associate Elastic IP address
   - Choose your instance → Associate

3. **Note the Elastic IP** (e.g., `54.123.45.67`)

#### Step 4: Update MongoDB Atlas

1. **Go to MongoDB Atlas Dashboard**
2. **Network Access** → Add IP Address
3. **Enter**: `YOUR_ELASTIC_IP/32` (e.g., `54.123.45.67/32`)
4. **Description**: "LegalIQ Production Backend"
5. **Confirm**

### Option 3: Manual Fix via AWS CLI

```bash
# Get your current IP
MY_IP=$(curl -s https://checkip.amazonaws.com)
echo "Your IP: $MY_IP"

# Set your security group ID
SG_ID="sg-xxxxxxxxx"  # Replace with your security group ID

# Remove dangerous SSH rule
aws ec2 revoke-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

# Remove dangerous API rule
aws ec2 revoke-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 4000 \
  --cidr 0.0.0.0/0

# Add secure SSH rule
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 22 \
  --cidr $MY_IP/32 \
  --description "SSH from admin IP only"

# Add secure API rule (if not using ALB)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 4000 \
  --cidr $MY_IP/32 \
  --description "API from admin IP only"
```

## 🔍 Verify the Fix

### Check Security Group Rules

**AWS Console:**
1. EC2 → Security Groups → Select your group
2. Inbound rules tab
3. Verify NO rules have `0.0.0.0/0` (except ALB ports 80/443)

**AWS CLI:**
```bash
aws ec2 describe-security-groups \
  --group-ids sg-xxxxxxxxx \
  --query 'SecurityGroups[0].IpPermissions[*].[IpProtocol,FromPort,ToPort,IpRanges[*].CidrIp]' \
  --output table
```

### Test Access

```bash
# Test SSH (should work from your IP)
ssh -i your-key.pem ec2-user@YOUR_ELASTIC_IP

# Test from another IP (should fail)
# This confirms the security is working
```

## 📋 Post-Fix Checklist

- [ ] Removed all `0.0.0.0/0` rules from security group (except ALB 80/443)
- [ ] Added SSH access for your specific IP only
- [ ] Configured Elastic IP for EC2 instance
- [ ] Updated MongoDB Atlas IP whitelist with Elastic IP
- [ ] Tested SSH access from your IP
- [ ] Verified backend API is accessible
- [ ] Documented the Elastic IP for future reference
- [ ] Reviewed other security groups for similar issues
- [ ] Checked CloudTrail logs for unauthorized access attempts
- [ ] Rotated credentials if breach suspected

## 🔐 Additional Security Measures

After fixing the immediate issue, implement these additional security measures:

1. **Enable AWS Systems Manager Session Manager** (eliminates need for SSH port 22)
   ```bash
   # No port 22 needed - connect via SSM
   aws ssm start-session --target i-xxxxxxxxx
   ```

2. **Enable MFA on AWS Account**
   - AWS Console → IAM → Users → Security credentials → Enable MFA

3. **Enable CloudTrail Logging**
   - Track all API calls and security changes

4. **Set up CloudWatch Alarms**
   - Alert on failed SSH attempts
   - Alert on unusual API activity

5. **Review AWS Security Best Practices**
   - Read: [`AWS_SECURITY_BEST_PRACTICES.md`](AWS_SECURITY_BEST_PRACTICES.md)

## 🆘 If You Suspect a Breach

If you believe your instance was compromised:

1. **Immediate Actions**:
   ```bash
   # Isolate the instance (remove all inbound rules)
   aws ec2 revoke-security-group-ingress --group-id sg-xxx --ip-permissions ...
   
   # Take a snapshot for forensics
   aws ec2 create-snapshot --volume-id vol-xxx --description "Forensic snapshot"
   ```

2. **Rotate All Credentials**:
   - Change all passwords
   - Rotate JWT secrets
   - Regenerate API keys
   - Update MongoDB Atlas credentials

3. **Audit Logs**:
   - Check CloudTrail for unauthorized API calls
   - Review application logs for suspicious activity
   - Check MongoDB Atlas logs

4. **Contact Support**:
   - AWS Security: https://aws.amazon.com/security/
   - Report incident to your security team

## 📚 Resources

- [AWS Security Best Practices](AWS_SECURITY_BEST_PRACTICES.md)
- [AWS Deployment Guide](AWS_DEPLOYMENT_GUIDE.md)
- [AWS Security Documentation](https://docs.aws.amazon.com/security/)
- [MongoDB Atlas Security](https://docs.atlas.mongodb.com/security/)

## ⏱️ Time Estimate

- **Automated fix**: 5-10 minutes
- **Manual fix**: 15-20 minutes
- **Full security audit**: 1-2 hours

---

**🚨 DO NOT DELAY - Fix this security issue immediately to protect your application and data!**
