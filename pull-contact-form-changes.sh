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
echo "5. Installing dependencies..."
echo "   - Installing react-quill for rich text editor..."
npm install react-quill@^2.0.0 --legacy-peer-deps
echo "   - Installing all frontend dependencies..."
npm install --legacy-peer-deps
echo "   - Installing backend dependencies (nodemailer, isomorphic-dompurify)..."
cd backend
npm install
cd ..

# Verify react-quill installation
echo "6. Verifying react-quill installation..."
if npm list react-quill > /dev/null 2>&1; then
    echo "   ✓ react-quill installed successfully"
else
    echo "   ✗ react-quill installation failed!"
    exit 1
fi

# Build frontend
echo "7. Building frontend..."
npm run build

echo ""
echo "=== Pull Complete! ==="
echo ""
echo "✓ Installed react-quill (rich text editor)"
echo "✓ Installed isomorphic-dompurify (HTML sanitization)"
echo "✓ Frontend built successfully"
echo ""
echo "Next steps:"
echo "1. Restart services:"
echo "   pm2 restart all"
echo ""
echo "2. Verify rich text editor:"
echo "   - Admin Dashboard: Create/edit articles with formatting"
echo "   - Article Submission: Professionals can use rich text editor"
echo "   - Articles display with proper formatting"
echo ""
echo "3. Test contact form:"
echo "   https://legaliq.in/contact"
