#!/bin/bash

# Quick fix for contact form nodemailer error
# Run this on EC2 server

echo "=== Fixing Contact Form Error ==="
echo ""

# Navigate to backend directory
cd ~/legqlIQ/backend || { echo "Error: ~/legqlIQ/backend not found"; exit 1; }

echo "1. Installing nodemailer..."
npm install nodemailer

echo ""
echo "2. Verifying installation..."
npm list nodemailer

echo ""
echo "3. Restarting backend..."
pm2 restart legaliq-backend

echo ""
echo "4. Checking backend status..."
sleep 2
pm2 logs legaliq-backend --lines 10 --nostream

echo ""
echo "=== Fix Complete! ==="
echo ""
echo "Now configure email in .env file:"
echo "  nano ~/legqlIQ/backend/.env"
echo ""
echo "Add these lines:"
echo "  EMAIL_USER=your-gmail@gmail.com"
echo "  EMAIL_PASSWORD=your-gmail-app-password"
echo "  CONTACT_EMAIL=yogmca@gmail.com"
echo ""
echo "Get Gmail App Password:"
echo "  https://myaccount.google.com/apppasswords"
echo ""
echo "After adding email config, restart:"
echo "  pm2 restart legaliq-backend"
echo ""
echo "Then test at: https://legaliq.in/contact"
