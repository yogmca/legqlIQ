#!/bin/bash

# Deploy Online Status Indicator to AWS EC2
# This script pulls the latest changes and restarts services

echo "🚀 Deploying Online Status Indicator to Production..."
echo ""

# Navigate to project directory
cd /home/ubuntu/karnataka-bar-association || cd ~/karnataka-bar-association || {
    echo "❌ Error: Could not find project directory"
    exit 1
}

echo "📂 Current directory: $(pwd)"
echo ""

# Pull latest changes from GitHub
echo "📥 Pulling latest changes from GitHub..."
git fetch origin
git pull origin LegalIQ_prod

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to pull from GitHub"
    exit 1
fi

echo "✅ Successfully pulled latest changes"
echo ""

# Install backend dependencies (if needed)
echo "📦 Installing backend dependencies..."
cd backend
npm install --production

if [ $? -ne 0 ]; then
    echo "⚠️  Warning: npm install had issues, but continuing..."
fi

cd ..
echo ""

# Install frontend dependencies (if needed)
echo "📦 Installing frontend dependencies..."
npm install --production

if [ $? -ne 0 ]; then
    echo "⚠️  Warning: npm install had issues, but continuing..."
fi

echo ""

# Restart backend server
echo "🔄 Restarting backend server..."
pm2 restart backend || pm2 restart server || pm2 restart all

if [ $? -ne 0 ]; then
    echo "⚠️  Warning: PM2 restart had issues"
    echo "   Trying alternative restart method..."
    pkill -f "node server.js"
    sleep 2
    cd backend
    nohup npm start > ../backend.log 2>&1 &
    cd ..
fi

echo "✅ Backend server restarted"
echo ""

# Rebuild frontend
echo "🏗️  Rebuilding frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error: Frontend build failed"
    exit 1
fi

echo "✅ Frontend rebuilt successfully"
echo ""

# Restart Nginx (if using)
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx 2>/dev/null || sudo service nginx restart 2>/dev/null || echo "⚠️  Nginx not found or not using systemd"

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📋 What was deployed:"
echo "   ✅ Online status indicator (green dot + 'Online' badge)"
echo "   ✅ Email notifications (welcome + admin notification)"
echo "   ✅ Optional registration numbers"
echo "   ✅ Real-time activity tracking"
echo ""
echo "🧪 Testing:"
echo "   1. Login to your account"
echo "   2. Visit 'Find Lawyers' or 'Tax Consultants' page"
echo "   3. You should see a green dot on your avatar if you're online"
echo "   4. The 'Online' badge should appear next to your name"
echo ""
echo "🔍 Check logs:"
echo "   Backend: pm2 logs backend"
echo "   Or: tail -f backend.log"
echo ""
