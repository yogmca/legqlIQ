# LegalIQ - AWS Deployment Guide

Complete guide to deploy the LegalIQ application on AWS Cloud.

## 📦 Package Contents

This deployment package includes:
- Complete source code (frontend + backend)
- All dependencies and configurations
- Database schemas and migrations
- Environment configuration templates
- Docker configurations
- AWS deployment scripts

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   Route 53   │──────│  CloudFront  │──────│    S3     │ │
│  │     DNS      │      │     CDN      │      │  Frontend │ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   ALB/ELB    │──────│     EC2      │──────│  MongoDB  │ │
│  │Load Balancer │      │   Backend    │      │   Atlas   │ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Deployment Options

### Option 1: EC2 + MongoDB Atlas (Recommended)
- **Frontend**: S3 + CloudFront
- **Backend**: EC2 instance
- **Database**: MongoDB Atlas (managed)
- **Cost**: ~$20-50/month

### Option 2: Elastic Beanstalk
- **Full Stack**: Elastic Beanstalk
- **Database**: MongoDB Atlas
- **Cost**: ~$30-60/month

### Option 3: ECS/Fargate (Docker)
- **Containers**: ECS with Fargate
- **Database**: MongoDB Atlas
- **Cost**: ~$40-80/month

## 📋 Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **MongoDB Atlas** account (free tier available)
4. **Domain name** (optional, for custom domain)
5. **Google OAuth credentials** (for social login)

## 🔧 Step-by-Step Deployment

### Step 1: Extract and Prepare

```bash
# Extract the tar file
tar -xzf legaliq-deployment.tar.gz
cd karnataka-bar-association

# Install dependencies
npm install
cd backend && npm install && cd ..
```

### Step 2: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create Cluster**
   - Choose AWS as cloud provider
   - Select region closest to your EC2 region
   - Choose M0 (Free tier) or M10+ for production

3. **Configure Network Access** ⚠️ **SECURITY CRITICAL**
   - **DO NOT use `0.0.0.0/0`** - this allows access from anywhere (security risk)
   - **Option 1 (Recommended)**: Add your EC2 instance's Elastic IP after deployment
     - Format: `YOUR_EC2_IP/32` (e.g., `54.123.45.67/32`)
   - **Option 2**: Use VPC Peering for private connection (most secure)
   - **Option 3**: Add specific known IPs only (your office, staging server, etc.)
   - See [`AWS_SECURITY_BEST_PRACTICES.md`](AWS_SECURITY_BEST_PRACTICES.md) for details

4. **Create Database User**
   - Username: `legaliq_admin`
   - Password: Generate strong password
   - Role: `readWrite` on `legaliq` database

5. **Get Connection String**
   ```
   mongodb+srv://legaliq_admin:<password>@cluster0.xxxxx.mongodb.net/legaliq?retryWrites=true&w=majority
   ```

### Step 3: Configure Environment Variables

Create `backend/.env.production`:

```env
# Server Configuration
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://yourdomain.com

# MongoDB Atlas
MONGODB_URI=mongodb+srv://legaliq_admin:<password>@cluster0.xxxxx.mongodb.net/legaliq?retryWrites=true&w=majority

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_super_secure_jwt_secret_here_min_32_chars

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback

# SMS Service (Optional - MSG91)
SMS_ENABLED=false
SMS_PROVIDER=MSG91
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_SENDER_ID=LGALIQ
MSG91_ROUTE=4

# Session Secret
SESSION_SECRET=your_session_secret_here
```

Create `frontend/.env.production`:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

### Step 4: Deploy Backend to EC2

#### 4.1 Launch EC2 Instance

```bash
# Using AWS CLI
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t2.micro \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxxxxx \
  --subnet-id subnet-xxxxxxxx \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=LegalIQ-Backend}]'
```

Or use AWS Console:
1. Go to EC2 Dashboard
2. Launch Instance
3. Choose Amazon Linux 2 AMI
4. Instance type: t2.micro (free tier) or t2.small
5. **Configure Security Group** (⚠️ CRITICAL - See security notes below):
   - Create new security group: `legaliq-backend-sg`
   - **SSH (Port 22)**: Restrict to YOUR IP only (`YOUR_IP/32`)
   - **Backend API (Port 4000)**: Only if using ALB, otherwise restrict to known IPs
   - **HTTP (Port 80)**: Only if using ALB/CloudFront, otherwise restrict
   - **HTTPS (Port 443)**: Only if using ALB/CloudFront, otherwise restrict

#### 🔒 Security Group Configuration (IMPORTANT)

**⚠️ WARNING**: Never use `0.0.0.0/0` or `::/0` for SSH or application ports!

**Secure Configuration Example**:

```bash
# Create security group
aws ec2 create-security-group \
  --group-name legaliq-backend-sg \
  --description "LegalIQ Backend - Secure Configuration" \
  --vpc-id vpc-xxxxxxxx

# SSH - Restrict to your IP ONLY
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxx \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_ADMIN_IP/32 \
  --description "SSH from admin IP only"

# Backend API - Restrict to known IPs or ALB
# Option 1: If using ALB (recommended)
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxx \
  --protocol tcp \
  --port 4000 \
  --source-group sg-alb-xxxxxxxx \
  --description "API from ALB only"

# Option 2: If direct access needed (not recommended for production)
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxx \
  --protocol tcp \
  --port 4000 \
  --cidr YOUR_OFFICE_IP_RANGE/24 \
  --description "API from office network only"

# HTTP/HTTPS - Only if using Nginx reverse proxy with ALB
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxx \
  --protocol tcp \
  --port 80 \
  --source-group sg-alb-xxxxxxxx \
  --description "HTTP from ALB only"

aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxx \
  --protocol tcp \
  --port 443 \
  --source-group sg-alb-xxxxxxxx \
  --description "HTTPS from ALB only"
```

**How to find your IP**:
```bash
# On your local machine
curl https://checkip.amazonaws.com
# Use this IP with /32 suffix (e.g., 203.0.113.45/32)
```

**After EC2 is running, get its Elastic IP**:
```bash
# Allocate Elastic IP
aws ec2 allocate-address --domain vpc

# Associate with instance
aws ec2 associate-address \
  --instance-id i-xxxxxxxx \
  --allocation-id eipalloc-xxxxxxxx

# Use this IP to whitelist in MongoDB Atlas
```

#### 4.2 Connect and Setup EC2

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Update system
sudo yum update -y

# Install Node.js 18
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git
sudo yum install -y git

# Clone or upload your code
# Option 1: Upload via SCP
# scp -i your-key.pem -r karnataka-bar-association ec2-user@your-ec2-ip:~/

# Option 2: From Git repository
# git clone your-repo-url
```

#### 4.3 Deploy Backend

```bash
# Navigate to backend
cd ~/karnataka-bar-association/backend

# Install dependencies
npm install --production

# Copy production environment file
cp .env.production .env

# Start with PM2
pm2 start server.js --name legaliq-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command it outputs

# Check status
pm2 status
pm2 logs legaliq-backend
```

#### 4.4 Setup Nginx Reverse Proxy (Optional but Recommended)

```bash
# Install Nginx
sudo amazon-linux-extras install nginx1 -y

# Configure Nginx
sudo nano /etc/nginx/conf.d/legaliq.conf
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Test configuration
sudo nginx -t
```

### Step 5: Deploy Frontend to S3 + CloudFront

#### 5.1 Build Frontend

```bash
# On your local machine
cd karnataka-bar-association

# Create production environment file
echo "VITE_API_URL=https://api.yourdomain.com/api" > .env.production

# Build for production
npm run build
# This creates a 'dist' folder
```

#### 5.2 Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://legaliq-frontend --region us-east-1

# Enable static website hosting
aws s3 website s3://legaliq-frontend \
  --index-document index.html \
  --error-document index.html

# Set bucket policy for public read
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::legaliq-frontend/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket legaliq-frontend \
  --policy file://bucket-policy.json
```

#### 5.3 Upload Frontend

```bash
# Upload build files
aws s3 sync dist/ s3://legaliq-frontend/ \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html"

# Upload index.html separately (no cache)
aws s3 cp dist/index.html s3://legaliq-frontend/index.html \
  --cache-control "no-cache, no-store, must-revalidate"
```

#### 5.4 Setup CloudFront (CDN)

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name legaliq-frontend.s3-website-us-east-1.amazonaws.com \
  --default-root-object index.html
```

Or use AWS Console:
1. Go to CloudFront
2. Create Distribution
3. Origin Domain: Select your S3 bucket
4. Default Root Object: `index.html`
5. Custom Error Response: 404 → /index.html (for React Router)
6. SSL Certificate: Use AWS Certificate Manager (free)

### Step 6: Configure Domain (Optional)

#### 6.1 Request SSL Certificate

```bash
# Request certificate in ACM
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names www.yourdomain.com api.yourdomain.com \
  --validation-method DNS
```

#### 6.2 Setup Route 53

1. Create Hosted Zone for your domain
2. Add A records:
   - `yourdomain.com` → CloudFront distribution
   - `www.yourdomain.com` → CloudFront distribution
   - `api.yourdomain.com` → EC2 Elastic IP

### Step 7: Import Database Data

```bash
# On your local machine, export data
mongodump --uri="mongodb://localhost:27017/legaliq" --out=./dump

# Import to Atlas
mongorestore --uri="mongodb+srv://legaliq_admin:<password>@cluster0.xxxxx.mongodb.net/legaliq" ./dump/legaliq
```

### Step 8: Configure Google OAuth

1. Go to Google Cloud Console
2. Update Authorized redirect URIs:
   - `https://api.yourdomain.com/api/auth/google/callback`
3. Update Authorized JavaScript origins:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`

## 🔒 Security Checklist

### Critical Security Items ⚠️
- [ ] **EC2 Security Groups**: NO `0.0.0.0/0` rules except for ALB ports 80/443
- [ ] **SSH Access**: Restricted to specific admin IPs only (`YOUR_IP/32`)
- [ ] **MongoDB Atlas**: IP whitelist with specific EC2 Elastic IP only
- [ ] **Secrets**: All credentials in AWS Secrets Manager or environment variables
- [ ] **MFA**: Enabled on AWS root account and all IAM users

### Application Security
- [ ] Change all default passwords
- [ ] Use strong JWT secret (min 32 characters, use `openssl rand -base64 32`)
- [ ] Enable HTTPS/SSL certificates (AWS Certificate Manager)
- [ ] Configure CORS properly (specific origins, not `*`)
- [ ] Configure rate limiting in backend
- [ ] Input validation on all endpoints
- [ ] XSS protection headers enabled

### Infrastructure Security
- [ ] Enable AWS CloudWatch logging
- [ ] Enable CloudTrail for audit logs
- [ ] Set up AWS WAF (Web Application Firewall)
- [ ] Enable VPC Flow Logs
- [ ] Use AWS Systems Manager Session Manager (instead of SSH)
- [ ] Regular security updates and patches

### Monitoring & Compliance
- [ ] CloudWatch alarms for suspicious activity
- [ ] Regular security audits
- [ ] Backup and disaster recovery plan
- [ ] Incident response plan documented

**📖 See [`AWS_SECURITY_BEST_PRACTICES.md`](AWS_SECURITY_BEST_PRACTICES.md) for detailed security guidance**

## 📊 Monitoring & Maintenance

### CloudWatch Alarms

```bash
# CPU Utilization
aws cloudwatch put-metric-alarm \
  --alarm-name legaliq-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### PM2 Monitoring

```bash
# View logs
pm2 logs legaliq-backend

# Monitor resources
pm2 monit

# Restart application
pm2 restart legaliq-backend

# View detailed info
pm2 info legaliq-backend
```

### Database Monitoring

- MongoDB Atlas provides built-in monitoring
- Check metrics in Atlas dashboard
- Set up alerts for high CPU/memory usage

## 🔄 CI/CD Pipeline (Optional)

### Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/karnataka-bar-association/backend
            git pull
            npm install --production
            pm2 restart legaliq-backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and Deploy
        run: |
          npm install
          npm run build
          aws s3 sync dist/ s3://legaliq-frontend/ --delete
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## 💰 Cost Estimation

### Free Tier (First 12 months)
- EC2 t2.micro: Free
- S3: 5GB storage free
- CloudFront: 50GB transfer free
- MongoDB Atlas M0: Free forever
- **Total: $0-5/month**

### Production (After free tier)
- EC2 t2.small: ~$17/month
- S3 + CloudFront: ~$5-10/month
- MongoDB Atlas M10: ~$57/month
- Route 53: ~$1/month
- **Total: ~$80-100/month**

## 🆘 Troubleshooting

### Backend not starting
```bash
# Check PM2 logs
pm2 logs legaliq-backend --lines 100

# Check if port is in use
sudo netstat -tulpn | grep 4000

# Restart backend
pm2 restart legaliq-backend
```

### Frontend not loading
```bash
# Check S3 bucket policy
aws s3api get-bucket-policy --bucket legaliq-frontend

# Check CloudFront distribution
aws cloudfront list-distributions

# Clear CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### Database connection issues
- Verify MongoDB Atlas IP whitelist
- Check connection string in .env
- Test connection: `mongosh "your-connection-string"`

### CORS errors
- Update CORS configuration in backend/server.js
- Ensure FRONTEND_URL matches your domain

## 📞 Support

For issues or questions:
- Check logs: `pm2 logs legaliq-backend`
- MongoDB Atlas support: https://support.mongodb.com
- AWS Support: https://console.aws.amazon.com/support

## 📝 Post-Deployment Checklist

- [ ] Test user registration
- [ ] Test login (email + Google OAuth)
- [ ] Test lawyer search and filtering
- [ ] Test consultation booking
- [ ] Test video consultation
- [ ] Verify email notifications
- [ ] Check mobile responsiveness
- [ ] Test payment integration (if enabled)
- [ ] Monitor error logs for 24 hours
- [ ] Set up automated backups

## 🎉 Deployment Complete!

Your LegalIQ application is now live on AWS!

**Frontend URL**: https://yourdomain.com
**Backend API**: https://api.yourdomain.com
**Admin Panel**: https://yourdomain.com/admin (if implemented)

Remember to:
1. Monitor logs regularly
2. Keep dependencies updated
3. Backup database weekly
4. Review security settings monthly
