#!/bin/bash

# LegalIQ EC2 Security Hardening Script
# This script helps secure your EC2 instance by configuring proper security group rules

set -e

echo "================================================"
echo "LegalIQ EC2 Security Hardening Script"
echo "================================================"
echo ""
echo "⚠️  WARNING: This script will modify your EC2 security groups"
echo "⚠️  Make sure you have your current IP address ready"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    echo "Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi

echo -e "${GREEN}✓ AWS CLI is configured${NC}"
echo ""

# Get current public IP
echo "Detecting your current public IP..."
CURRENT_IP=$(curl -s https://checkip.amazonaws.com)
if [ -z "$CURRENT_IP" ]; then
    echo -e "${RED}Error: Could not detect your IP address${NC}"
    read -p "Enter your public IP address: " CURRENT_IP
fi
echo -e "${GREEN}Your IP: $CURRENT_IP${NC}"
echo ""

# Get EC2 instance ID
read -p "Enter your EC2 Instance ID (e.g., i-1234567890abcdef0): " INSTANCE_ID

if [ -z "$INSTANCE_ID" ]; then
    echo -e "${RED}Error: Instance ID is required${NC}"
    exit 1
fi

# Get security group ID
echo "Fetching security group for instance $INSTANCE_ID..."
SECURITY_GROUP_ID=$(aws ec2 describe-instances \
    --instance-ids "$INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
    --output text)

if [ -z "$SECURITY_GROUP_ID" ] || [ "$SECURITY_GROUP_ID" == "None" ]; then
    echo -e "${RED}Error: Could not find security group for instance${NC}"
    exit 1
fi

echo -e "${GREEN}Security Group ID: $SECURITY_GROUP_ID${NC}"
echo ""

# Show current rules
echo "Current Security Group Rules:"
echo "=============================="
aws ec2 describe-security-groups \
    --group-ids "$SECURITY_GROUP_ID" \
    --query 'SecurityGroups[0].IpPermissions[*].[IpProtocol,FromPort,ToPort,IpRanges[*].CidrIp]' \
    --output table
echo ""

# Check for dangerous rules
echo "Checking for security issues..."
DANGEROUS_RULES=$(aws ec2 describe-security-groups \
    --group-ids "$SECURITY_GROUP_ID" \
    --query 'SecurityGroups[0].IpPermissions[?IpRanges[?CidrIp==`0.0.0.0/0`]]' \
    --output json)

if [ "$DANGEROUS_RULES" != "[]" ]; then
    echo -e "${RED}⚠️  SECURITY RISK DETECTED!${NC}"
    echo -e "${RED}Found rules allowing access from 0.0.0.0/0 (anywhere)${NC}"
    echo ""
    
    read -p "Do you want to remove dangerous 0.0.0.0/0 rules? (yes/no): " REMOVE_DANGEROUS
    
    if [ "$REMOVE_DANGEROUS" == "yes" ]; then
        echo "Removing dangerous rules..."
        
        # Remove SSH access from 0.0.0.0/0
        echo "Removing SSH (port 22) access from 0.0.0.0/0..."
        aws ec2 revoke-security-group-ingress \
            --group-id "$SECURITY_GROUP_ID" \
            --protocol tcp \
            --port 22 \
            --cidr 0.0.0.0/0 2>/dev/null || echo "No SSH rule with 0.0.0.0/0 found"
        
        # Remove backend API access from 0.0.0.0/0
        echo "Removing Backend API (port 4000) access from 0.0.0.0/0..."
        aws ec2 revoke-security-group-ingress \
            --group-id "$SECURITY_GROUP_ID" \
            --protocol tcp \
            --port 4000 \
            --cidr 0.0.0.0/0 2>/dev/null || echo "No port 4000 rule with 0.0.0.0/0 found"
        
        echo -e "${GREEN}✓ Dangerous rules removed${NC}"
    fi
else
    echo -e "${GREEN}✓ No dangerous 0.0.0.0/0 rules found${NC}"
fi
echo ""

# Add secure SSH rule
read -p "Add SSH access for your current IP ($CURRENT_IP)? (yes/no): " ADD_SSH

if [ "$ADD_SSH" == "yes" ]; then
    echo "Adding SSH access for $CURRENT_IP/32..."
    aws ec2 authorize-security-group-ingress \
        --group-id "$SECURITY_GROUP_ID" \
        --protocol tcp \
        --port 22 \
        --cidr "$CURRENT_IP/32" \
        --description "SSH from admin IP" 2>/dev/null || echo "Rule may already exist"
    echo -e "${GREEN}✓ SSH access added for your IP${NC}"
fi
echo ""

# Configure backend API access
echo "Backend API Configuration:"
echo "=========================="
echo "1. Allow from Application Load Balancer (recommended)"
echo "2. Allow from specific IP addresses"
echo "3. Skip"
read -p "Choose option (1-3): " API_OPTION

if [ "$API_OPTION" == "1" ]; then
    read -p "Enter ALB Security Group ID (sg-xxxxxxxxx): " ALB_SG_ID
    if [ ! -z "$ALB_SG_ID" ]; then
        echo "Adding Backend API access from ALB..."
        aws ec2 authorize-security-group-ingress \
            --group-id "$SECURITY_GROUP_ID" \
            --protocol tcp \
            --port 4000 \
            --source-group "$ALB_SG_ID" \
            --description "API from ALB only" 2>/dev/null || echo "Rule may already exist"
        echo -e "${GREEN}✓ Backend API access configured for ALB${NC}"
    fi
elif [ "$API_OPTION" == "2" ]; then
    read -p "Enter IP address or CIDR (e.g., 203.0.113.0/24): " API_IP
    if [ ! -z "$API_IP" ]; then
        echo "Adding Backend API access from $API_IP..."
        aws ec2 authorize-security-group-ingress \
            --group-id "$SECURITY_GROUP_ID" \
            --protocol tcp \
            --port 4000 \
            --cidr "$API_IP" \
            --description "API from trusted IP" 2>/dev/null || echo "Rule may already exist"
        echo -e "${GREEN}✓ Backend API access configured${NC}"
    fi
fi
echo ""

# Get Elastic IP
echo "EC2 Elastic IP Configuration:"
echo "============================="
ELASTIC_IP=$(aws ec2 describe-addresses \
    --filters "Name=instance-id,Values=$INSTANCE_ID" \
    --query 'Addresses[0].PublicIp' \
    --output text 2>/dev/null)

if [ "$ELASTIC_IP" == "None" ] || [ -z "$ELASTIC_IP" ]; then
    echo -e "${YELLOW}No Elastic IP associated with this instance${NC}"
    read -p "Allocate and associate an Elastic IP? (yes/no): " ALLOCATE_EIP
    
    if [ "$ALLOCATE_EIP" == "yes" ]; then
        echo "Allocating Elastic IP..."
        ALLOCATION_ID=$(aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text)
        
        echo "Associating Elastic IP with instance..."
        aws ec2 associate-address \
            --instance-id "$INSTANCE_ID" \
            --allocation-id "$ALLOCATION_ID"
        
        ELASTIC_IP=$(aws ec2 describe-addresses \
            --allocation-ids "$ALLOCATION_ID" \
            --query 'Addresses[0].PublicIp' \
            --output text)
        
        echo -e "${GREEN}✓ Elastic IP allocated: $ELASTIC_IP${NC}"
    fi
else
    echo -e "${GREEN}Elastic IP: $ELASTIC_IP${NC}"
fi
echo ""

# MongoDB Atlas configuration
if [ ! -z "$ELASTIC_IP" ]; then
    echo "================================================"
    echo "MongoDB Atlas Configuration"
    echo "================================================"
    echo ""
    echo "Add this IP to MongoDB Atlas Network Access:"
    echo -e "${GREEN}$ELASTIC_IP/32${NC}"
    echo ""
    echo "Steps:"
    echo "1. Go to MongoDB Atlas Dashboard"
    echo "2. Navigate to Network Access"
    echo "3. Click 'Add IP Address'"
    echo "4. Enter: $ELASTIC_IP/32"
    echo "5. Description: LegalIQ Production Backend"
    echo "6. Click 'Confirm'"
    echo ""
fi

# Summary
echo "================================================"
echo "Security Configuration Summary"
echo "================================================"
echo ""
echo "Updated Security Group Rules:"
aws ec2 describe-security-groups \
    --group-ids "$SECURITY_GROUP_ID" \
    --query 'SecurityGroups[0].IpPermissions[*].[IpProtocol,FromPort,ToPort,IpRanges[*].CidrIp]' \
    --output table
echo ""

echo -e "${GREEN}✓ Security hardening complete!${NC}"
echo ""
echo "Next Steps:"
echo "1. Update MongoDB Atlas IP whitelist with: $ELASTIC_IP/32"
echo "2. Test SSH access: ssh -i your-key.pem ec2-user@$ELASTIC_IP"
echo "3. Test backend API access"
echo "4. Review AWS_SECURITY_BEST_PRACTICES.md for additional security measures"
echo ""
echo "⚠️  Important: Save your Elastic IP address for future reference"
echo ""
