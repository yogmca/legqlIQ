# Fix ERR_CONNECTION_TIMED_OUT - AWS Security Group Issue

## Problem
Browser shows: `Failed to load resource: net::ERR_CONNECTION_TIMED_OUT` when trying to access `http://13.62.225.158:4000/api/auth/register`

This means **port 4000 is blocked by AWS Security Group firewall**.

## Root Cause
- Backend is running on EC2 ✅
- Port 4000 is listening ✅
- But AWS Security Group is blocking external access to port 4000 ❌

## Solution: Open Port 4000 in AWS Security Group

### Step 1: Go to AWS Console
1. Open https://console.aws.amazon.com/ec2/
2. Sign in to your AWS account

### Step 2: Find Your EC2 Instance
1. Click on **"Instances"** in the left sidebar
2. Find your instance (IP: 13.62.225.158)
3. Click on the instance to select it

### Step 3: Find the Security Group
1. Scroll down to the **"Security"** tab
2. Under **"Security groups"**, click on the security group name (e.g., `launch-wizard-1` or similar)

### Step 4: Edit Inbound Rules
1. Click on the **"Inbound rules"** tab
2. Click **"Edit inbound rules"** button

### Step 5: Add Rule for Port 4000
1. Click **"Add rule"** button
2. Configure the new rule:
   - **Type**: Custom TCP
   - **Protocol**: TCP
   - **Port range**: 4000
   - **Source**: Custom → `0.0.0.0/0` (allows access from anywhere)
   - **Description**: Backend API Server

3. Click **"Add rule"** again for port 5173 if not already added:
   - **Type**: Custom TCP
   - **Protocol**: TCP
   - **Port range**: 5173
   - **Source**: Custom → `0.0.0.0/0`
   - **Description**: Frontend Vite Server

4. Click **"Save rules"**

### Step 6: Verify the Rules
Your inbound rules should now include:

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | 0.0.0.0/0 | SSH access |
| Custom TCP | TCP | 4000 | 0.0.0.0/0 | Backend API Server |
| Custom TCP | TCP | 5173 | 0.0.0.0/0 | Frontend Vite Server |
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP (optional) |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS (optional) |

## Test After Adding Rules

### From Your Local Computer:
```bash
# Test backend API
curl http://13.62.225.158:4000/api/lawyers?limit=1

# Test registration endpoint
curl -X POST http://13.62.225.158:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"testuser@example.com","password":"test123","phone":"9876543210","role":"client"}'
```

You should get JSON responses. If you still get "Connection timed out", the security group rules haven't been applied yet (wait 30 seconds and try again).

### From Browser:
1. Open: `http://13.62.225.158:4000/api/lawyers?limit=1`
   - Should show JSON data with lawyers

2. Open: `http://13.62.225.158:5173/register`
   - Registration page should load

3. Try to register a new account
   - Should work without "Unable to connect to server" error

## Alternative: Use AWS CLI (If You Have It Configured)

```bash
# Get your security group ID
SECURITY_GROUP_ID=$(aws ec2 describe-instances \
  --filters "Name=ip-address,Values=13.62.225.158" \
  --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
  --output text)

# Add rule for port 4000
aws ec2 authorize-security-group-ingress \
  --group-id $SECURITY_GROUP_ID \
  --protocol tcp \
  --port 4000 \
  --cidr 0.0.0.0/0

# Add rule for port 5173
aws ec2 authorize-security-group-ingress \
  --group-id $SECURITY_GROUP_ID \
  --protocol tcp \
  --port 5173 \
  --cidr 0.0.0.0/0
```

## Troubleshooting

### Issue: Rules added but still getting timeout

**Check if rules are applied:**
```bash
# On EC2, test from another server or your local machine
curl -v http://13.62.225.158:4000/api/lawyers?limit=1
```

**Wait 30-60 seconds** for AWS to apply the security group changes.

### Issue: Can't find Security Group

1. Go to EC2 Console → Instances
2. Select your instance
3. Look at the **Security** tab
4. The security group name is listed there (usually starts with `sg-`)

### Issue: Multiple Security Groups

If your instance has multiple security groups:
1. Add the port 4000 and 5173 rules to **all** security groups
2. Or identify the primary security group and add rules there

### Issue: VPC or Network ACL blocking

If security group rules are correct but still blocked:
1. Check **Network ACLs** in VPC console
2. Ensure inbound/outbound rules allow ports 4000 and 5173

## Security Note

Opening ports to `0.0.0.0/0` allows access from anywhere on the internet. For production:

1. **Use HTTPS** instead of HTTP
2. **Use a domain name** instead of IP address
3. **Restrict source IPs** if you know where traffic will come from
4. **Use a reverse proxy** (nginx) on port 80/443
5. **Enable rate limiting** to prevent abuse

## Quick Visual Guide

```
AWS Console → EC2 → Instances → Select Instance → Security Tab
    ↓
Click Security Group Name
    ↓
Inbound Rules Tab → Edit Inbound Rules
    ↓
Add Rule:
  Type: Custom TCP
  Port: 4000
  Source: 0.0.0.0/0
    ↓
Add Rule:
  Type: Custom TCP
  Port: 5173
  Source: 0.0.0.0/0
    ↓
Save Rules
    ↓
Wait 30 seconds → Test in browser
```

## After Fixing

Once port 4000 is open:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Go to `http://13.62.225.158:5173/register`
3. Try registering - should work now!

The registration error will be fixed once the AWS Security Group allows traffic on port 4000.
