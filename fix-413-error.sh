#!/bin/bash

# Script to fix 413 Content Too Large error on EC2
# This script updates nginx configuration and restarts services

echo "=========================================="
echo "Fixing 413 Content Too Large Error"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run with sudo: sudo bash fix-413-error.sh${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Pulling latest code from GitHub...${NC}"
cd /home/ubuntu/karnataka-bar-association
sudo -u ubuntu git pull origin LegalIQ_prod

echo ""
echo -e "${YELLOW}Step 2: Updating nginx configuration...${NC}"

# Backup existing nginx config
if [ -f /etc/nginx/sites-available/legaliq ]; then
    cp /etc/nginx/sites-available/legaliq /etc/nginx/sites-available/legaliq.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✓ Backed up existing nginx config${NC}"
fi

# Copy new nginx configuration
cp /home/ubuntu/karnataka-bar-association/nginx-production.conf /etc/nginx/sites-available/legaliq
echo -e "${GREEN}✓ Updated nginx configuration${NC}"

# Enable site if not already enabled
if [ ! -L /etc/nginx/sites-enabled/legaliq ]; then
    ln -s /etc/nginx/sites-available/legaliq /etc/nginx/sites-enabled/
    echo -e "${GREEN}✓ Enabled site${NC}"
fi

# Remove default nginx site if exists
if [ -L /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
    echo -e "${GREEN}✓ Removed default site${NC}"
fi

echo ""
echo -e "${YELLOW}Step 3: Testing nginx configuration...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
else
    echo -e "${RED}✗ Nginx configuration has errors. Restoring backup...${NC}"
    if [ -f /etc/nginx/sites-available/legaliq.backup.* ]; then
        cp /etc/nginx/sites-available/legaliq.backup.* /etc/nginx/sites-available/legaliq
    fi
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 4: Restarting nginx...${NC}"
systemctl restart nginx

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx restarted successfully${NC}"
else
    echo -e "${RED}✗ Failed to restart nginx${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 5: Installing backend dependencies...${NC}"
cd /home/ubuntu/karnataka-bar-association/backend
sudo -u ubuntu npm install

echo ""
echo -e "${YELLOW}Step 6: Restarting backend with PM2...${NC}"
sudo -u ubuntu pm2 restart backend

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend restarted successfully${NC}"
else
    echo -e "${RED}✗ Failed to restart backend${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 7: Checking service status...${NC}"
echo ""
echo "Nginx status:"
systemctl status nginx --no-pager | head -5
echo ""
echo "PM2 status:"
sudo -u ubuntu pm2 status

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Fix completed successfully!${NC}"
echo "=========================================="
echo ""
echo "Changes made:"
echo "  1. Updated Express server to accept 50MB requests"
echo "  2. Updated nginx to accept 50MB client body size"
echo "  3. Increased proxy timeouts and buffer sizes"
echo "  4. Restarted both nginx and backend services"
echo ""
echo "You can now create articles with images up to 50MB"
echo ""
echo "To view backend logs: sudo -u ubuntu pm2 logs backend"
echo "To view nginx logs: sudo tail -f /var/log/nginx/error.log"
echo ""
