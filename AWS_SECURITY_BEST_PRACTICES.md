# AWS Security Best Practices for LegalIQ

## 🔒 Security Overview

This guide provides security best practices for deploying LegalIQ on AWS, focusing on proper security group configuration and network access control.

## ⚠️ Critical Security Issues to Avoid

### 1. Open Security Groups (0.0.0.0/0 or ::/0)

**Problem**: Rules with source `0.0.0.0/0` (IPv4) or `::/0` (IPv6) allow ALL IP addresses to access your resources.

**Risk Level**: 🔴 **CRITICAL**

**Impact**:
- Exposes your application to attacks from anywhere on the internet
- Increases risk of brute force attacks
- Makes your system vulnerable to DDoS attacks
- Violates compliance requirements (PCI-DSS, HIPAA, etc.)

## 🛡️ Secure Configuration Guide

### EC2 Security Groups

#### ❌ INSECURE Configuration

```bash
# DO NOT USE THIS
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxx \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0  # DANGEROUS!
```

#### ✅ SECURE Configuration

```bash
# Option 1: Restrict to your office/home IP
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxx \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_IP_ADDRESS/32

# Option 2: Restrict to your organization's IP range
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxx \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_OFFICE_IP_RANGE/24
```

### Recommended Security Group Rules

#### Backend EC2 Instance

```bash
# Create security group
aws ec2 create-security-group \
  --group-name legaliq-backend-sg \
  --description "LegalIQ Backend Security Group" \
  --vpc-id vpc-xxxxxxxx

# SSH Access - Restrict to your IP only
aws ec2 authorize-security-group-ingress \
  --group-id sg-backend \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_ADMIN_IP/32 \
  --description "SSH from admin IP only"

# HTTP/HTTPS - Allow from ALB/CloudFront only
aws ec2 authorize-security-group-ingress \
  --group-id sg-backend \
  --protocol tcp \
  --port 80 \
  --source-group sg-alb \
  --description "HTTP from ALB only"

aws ec2 authorize-security-group-ingress \
  --group-id sg-backend \
  --protocol tcp \
  --port 443 \
  --source-group sg-alb \
  --description "HTTPS from ALB only"

# Backend API - Allow from ALB only
aws ec2 authorize-security-group-ingress \
  --group-id sg-backend \
  --protocol tcp \
  --port 4000 \
  --source-group sg-alb \
  --description "API from ALB only"
```

#### Application Load Balancer (ALB)

```bash
# Create ALB security group
aws ec2 create-security-group \
  --group-name legaliq-alb-sg \
  --description "LegalIQ ALB Security Group" \
  --vpc-id vpc-xxxxxxxx

# HTTP - Allow from anywhere (will redirect to HTTPS)
aws ec2 authorize-security-group-ingress \
  --group-id sg-alb \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0 \
  --description "HTTP from internet (redirect to HTTPS)"

# HTTPS - Allow from anywhere (public API)
aws ec2 authorize-security-group-ingress \
  --group-id sg-alb \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0 \
  --description "HTTPS from internet"
```

### MongoDB Atlas Network Access

#### ❌ INSECURE Configuration

```
IP Address: 0.0.0.0/0
Description: Allow from anywhere  # DANGEROUS!
```

#### ✅ SECURE Configuration

**Option 1: Specific EC2 Instance (Recommended)**

1. Assign Elastic IP to your EC2 instance
2. In MongoDB Atlas:
   ```
   IP Address: YOUR_EC2_ELASTIC_IP/32
   Description: LegalIQ Backend EC2 Instance
   ```

**Option 2: VPC Peering (Most Secure)**

1. Set up VPC Peering between AWS VPC and MongoDB Atlas
2. Use private IP addresses
3. No public internet exposure

**Option 3: Multiple Known IPs**

```
# Production EC2
IP Address: 54.123.45.67/32
Description: Production Backend

# Staging EC2
IP Address: 54.123.45.68/32
Description: Staging Backend

# Admin Access (your office)
IP Address: 203.0.113.0/24
Description: Office Network
```

**Option 4: AWS Security Group (Atlas M10+)**

1. In MongoDB Atlas, use AWS Security Group peering
2. Specify your EC2 security group ID
3. No IP whitelisting needed

## 🔐 Additional Security Measures

### 1. Use AWS Systems Manager Session Manager

Instead of opening SSH (port 22), use AWS Systems Manager:

```bash
# Install SSM agent on EC2 (pre-installed on Amazon Linux 2)
# Connect without opening port 22
aws ssm start-session --target i-xxxxxxxxx
```

**Benefits**:
- No need to open port 22
- All sessions logged in CloudTrail
- No SSH keys to manage
- Works from anywhere

### 2. Use AWS Secrets Manager

Store sensitive credentials securely:

```bash
# Store MongoDB connection string
aws secretsmanager create-secret \
  --name legaliq/mongodb/connection-string \
  --secret-string "mongodb+srv://user:pass@cluster.mongodb.net/legaliq"

# Store JWT secret
aws secretsmanager create-secret \
  --name legaliq/jwt-secret \
  --secret-string "your-super-secure-jwt-secret"
```

Update backend to retrieve secrets:

```javascript
// backend/config/secrets.js
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
  return data.SecretString;
}

module.exports = { getSecret };
```

### 3. Enable AWS WAF (Web Application Firewall)

```bash
# Create WAF Web ACL
aws wafv2 create-web-acl \
  --name legaliq-waf \
  --scope REGIONAL \
  --default-action Allow={} \
  --rules file://waf-rules.json
```

**Recommended WAF Rules**:
- Rate limiting (prevent DDoS)
- SQL injection protection
- XSS protection
- Geographic restrictions (if applicable)
- Known bad inputs blocking

### 4. Enable VPC Flow Logs

```bash
# Create flow logs for monitoring
aws ec2 create-flow-logs \
  --resource-type VPC \
  --resource-ids vpc-xxxxxxxx \
  --traffic-type ALL \
  --log-destination-type cloud-watch-logs \
  --log-group-name /aws/vpc/legaliq
```

### 5. Use AWS Certificate Manager (ACM)

```bash
# Request SSL certificate
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names www.yourdomain.com api.yourdomain.com \
  --validation-method DNS \
  --region us-east-1
```

### 6. Enable CloudTrail Logging

```bash
# Enable CloudTrail for audit logging
aws cloudtrail create-trail \
  --name legaliq-audit-trail \
  --s3-bucket-name legaliq-cloudtrail-logs
```

## 📋 Security Checklist

### Network Security
- [ ] EC2 SSH access restricted to specific IPs only
- [ ] Backend API only accessible through ALB
- [ ] MongoDB Atlas IP whitelist configured with specific IPs
- [ ] Security groups follow principle of least privilege
- [ ] VPC Flow Logs enabled
- [ ] Network ACLs configured properly

### Application Security
- [ ] HTTPS/TLS enabled everywhere
- [ ] Strong JWT secrets (min 32 characters)
- [ ] Secrets stored in AWS Secrets Manager
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection protection
- [ ] XSS protection headers

### Access Control
- [ ] AWS IAM roles with minimal permissions
- [ ] MFA enabled on AWS root account
- [ ] MFA enabled on all IAM users
- [ ] AWS Systems Manager Session Manager configured
- [ ] No hardcoded credentials in code
- [ ] Regular access key rotation

### Monitoring & Logging
- [ ] CloudWatch alarms configured
- [ ] CloudTrail enabled
- [ ] Application logs centralized
- [ ] MongoDB Atlas monitoring enabled
- [ ] AWS GuardDuty enabled
- [ ] Regular security audits scheduled

### Data Protection
- [ ] Database encryption at rest
- [ ] Database encryption in transit
- [ ] S3 bucket encryption enabled
- [ ] Regular automated backups
- [ ] Backup retention policy defined
- [ ] Disaster recovery plan documented

## 🚨 Incident Response

### If You Discover Open Security Groups

1. **Immediate Action**:
   ```bash
   # Revoke the dangerous rule
   aws ec2 revoke-security-group-ingress \
     --group-id sg-xxxxxxxx \
     --protocol tcp \
     --port 22 \
     --cidr 0.0.0.0/0
   ```

2. **Add Proper Rules**:
   ```bash
   # Add restricted rule
   aws ec2 authorize-security-group-ingress \
     --group-id sg-xxxxxxxx \
     --protocol tcp \
     --port 22 \
     --cidr YOUR_IP/32
   ```

3. **Audit Access**:
   - Check CloudTrail logs for unauthorized access
   - Review application logs for suspicious activity
   - Rotate all credentials immediately
   - Scan for malware/backdoors

4. **Document & Report**:
   - Document the incident
   - Notify stakeholders
   - Update security procedures

## 🔍 Regular Security Audits

### Weekly
- Review CloudWatch logs for anomalies
- Check failed login attempts
- Monitor API rate limits

### Monthly
- Review security group rules
- Audit IAM permissions
- Check for unused resources
- Update dependencies

### Quarterly
- Full security assessment
- Penetration testing
- Compliance review
- Disaster recovery drill

## 📚 Additional Resources

- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [MongoDB Atlas Security](https://docs.atlas.mongodb.com/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [AWS Well-Architected Framework - Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html)

## 🆘 Support

For security concerns:
- AWS Security: https://aws.amazon.com/security/
- MongoDB Security: https://www.mongodb.com/security
- Report vulnerabilities: security@yourdomain.com

---

**Remember**: Security is not a one-time setup but an ongoing process. Regular reviews and updates are essential to maintain a secure infrastructure.
