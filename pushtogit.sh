#!/bin/bash

# Script to remove secrets and push LegalIQ code to GitHub
# Run this on your EC2 instance: bash push-to-github.sh

set -e  # Exit on any error

echo "=========================================="
echo "LegalIQ - Push to GitHub Script"
echo "=========================================="
echo ""

# Navigate to legqlIQ directory
cd ~/legqlIQ
echo "✓ Changed to ~/legqlIQ directory"

# Remove old git history
echo ""
echo "Removing old git history..."
rm -rf .git
echo "✓ Old git history removed"

# Initialize fresh git repository
echo ""
echo "Initializing fresh git repository..."
git init
echo "✓ Git initialized"

# Configure git
echo ""
echo "Configuring git..."
git config user.name "yogmca"
git config user.email "yogmca@github.com"
echo "✓ Git configured"

# Create .gitignore
echo ""
echo "Creating .gitignore..."
cat > .gitignore << 'EOF'
# Tar files
*.tar.gz
*.tar
*.zip

# Dependencies
node_modules/

# Environment files
backend/.env
.env
.env.local
.env.production

# Logs
*.log
frontend.log

# Build output
dist/

# Backups
backups/

# OS files
.DS_Store

# PM2
.pm2/
EOF
echo "✓ .gitignore created"

# Replace secrets in documentation files
echo ""
echo "Replacing secrets in documentation files..."
sed -i 's/[0-9]\{12\}-[a-z0-9]\{32\}\.apps\.googleusercontent\.com/YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com/g' COMPLETE_MIGRATION_GUIDE.md 2>/dev/null || true
sed -i 's/[0-9]\{12\}-[a-z0-9]\{32\}\.apps\.googleusercontent\.com/YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com/g' DEPLOY_WITHOUT_DOCKER.md 2>/dev/null || true
sed -i 's/[0-9]\{12\}-[a-z0-9]\{32\}\.apps\.googleusercontent\.com/YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com/g' MONGODB_ATLAS_SETUP.md 2>/dev/null || true

sed -i 's/GOCSPX-[a-zA-Z0-9_-]\{28\}/YOUR_GOOGLE_CLIENT_SECRET/g' COMPLETE_MIGRATION_GUIDE.md 2>/dev/null || true
sed -i 's/GOCSPX-[a-zA-Z0-9_-]\{28\}/YOUR_GOOGLE_CLIENT_SECRET/g' DEPLOY_WITHOUT_DOCKER.md 2>/dev/null || true
sed -i 's/GOCSPX-[a-zA-Z0-9_-]\{28\}/YOUR_GOOGLE_CLIENT_SECRET/g' MONGODB_ATLAS_SETUP.md 2>/dev/null || true
echo "✓ Secrets replaced with placeholders"

# Create .env.example
echo ""
echo "Creating backend/.env.example..."
cat > backend/.env.example << 'EOF'
# MongoDB Configuration
MONGODB_URI=your-mongodb-connection-string

# JWT Secret
JWT_SECRET=your-jwt-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Server Configuration
PORT=4000
NODE_ENV=production

# Frontend URL
FRONTEND_URL=http://your-domain.com

# Session Secret
SESSION_SECRET=your-session-secret
EOF
echo "✓ backend/.env.example created"

# Add all files
echo ""
echo "Adding all files to git..."
git add .
echo "✓ Files added"

# Verify backend/.env is not being added
echo ""
echo "Verifying backend/.env is ignored..."
if git ls-files | grep -q "backend/.env$"; then
    echo "✗ ERROR: backend/.env is being tracked!"
    echo "Please check your .gitignore file"
    exit 1
else
    echo "✓ backend/.env is properly ignored"
fi

# Commit
echo ""
echo "Committing changes..."
git commit -m "Initial commit: LegalIQ source code (secrets removed)"
echo "✓ Changes committed"

# Add remote
echo ""
echo "Adding GitHub remote..."
git remote add origin https://github.com/yogmca/legqlIQ.git
echo "✓ Remote added"

# Create LegalIQ_prod branch
echo ""
echo "Creating LegalIQ_prod branch..."
git checkout -b LegalIQ_prod
echo "✓ Branch created"

# Push to GitHub
echo ""
echo "=========================================="
echo "Ready to push to GitHub!"
echo "=========================================="
echo ""
echo "You will be prompted for credentials:"
echo "  Username:"
echo "  Password: "
echo ""
echo "Pushing to GitHub..."
echo ""

git push -f origin LegalIQ_prod

echo ""
echo "=========================================="
echo "✓ SUCCESS! Code pushed to GitHub"
echo "=========================================="
echo ""
echo "View your code at:"
echo "https://github.com/yogmca/legqlIQ/tree/LegalIQ_prod"
echo ""
echo "Note: Your backend/.env file is still safe on this server"
echo "and your application will continue running normally."
echo ""
