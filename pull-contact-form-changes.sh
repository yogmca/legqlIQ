#!/bin/bash

# Script to pull contact form changes from GitHub on EC2
# This handles the unrelated histories issue

echo "=== Pulling Contact Form Changes from GitHub ==="

# Navigate to project directory
cd ~/legqlIQ || { echo "Error: ~/legqlIQ directory not found"; exit 1; }

# Backup current .env files
echo "1. Backing up .env files..."
cp .env .env.backup 2>/dev/null
cp backend/.env backend/.env.backup 2>/dev/null
echo "   ✓ .env files backed up"

# Fetch latest changes
echo "2. Fetching latest changes from GitHub..."
git fetch origin LegalIQ_prod

# Reset to remote branch (this will overwrite local changes except .env files)
echo "3. Resetting to remote branch..."
git reset --hard origin/LegalIQ_prod

# Restore .env files
echo "4. Restoring .env files..."
mv .env.backup .env 2>/dev/null
mv backend/.env.backup backend/.env 2>/dev/null
echo "   ✓ .env files restored"

# Install new dependencies
echo "5. Installing nodemailer..."
cd backend
npm install nodemailer
cd ..

echo ""
echo "=== Pull Complete! ==="
echo ""
echo "Next steps:"
echo "1. Configure email in backend/.env:"
echo "   EMAIL_USER=your-gmail@gmail.com"
echo "   EMAIL_PASSWORD=your-gmail-app-password"
echo "   CONTACT_EMAIL=yogmca@gmail.com"
echo ""
echo "2. Get Gmail App Password:"
echo "   https://myaccount.google.com/apppasswords"
echo ""
echo "3. Restart services:"
echo "   pm2 restart legaliq-backend"
echo "   ./deploy-frontend.sh"
echo ""
echo "4. Test contact form:"
echo "   https://legaliq.in/contact"
