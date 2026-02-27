#!/bin/bash

# Troubleshoot and Fix Server Connection Issues
# Run this on AWS EC2: bash troubleshoot-server.sh

echo "🔍 Troubleshooting Server Connection..."
echo "================================================"

PROJECT_DIR=~/legqlIQ

cd $PROJECT_DIR

echo ""
echo "1️⃣ Checking if backend is running..."
BACKEND_PID=$(ps aux | grep "node server.js" | grep -v grep | awk '{print $2}')
if [ -z "$BACKEND_PID" ]; then
    echo "❌ Backend is NOT running!"
else
    echo "✅ Backend is running (PID: $BACKEND_PID)"
fi

echo ""
echo "2️⃣ Checking if frontend is running..."
FRONTEND_PID=$(ps aux | grep "vite" | grep -v grep | awk '{print $2}')
if [ -z "$FRONTEND_PID" ]; then
    echo "❌ Frontend is NOT running!"
else
    echo "✅ Frontend is running (PID: $FRONTEND_PID)"
fi

echo ""
echo "3️⃣ Checking ports..."
echo "Port 4000 (Backend):"
netstat -tulpn 2>/dev/null | grep 4000 || echo "  ❌ Nothing listening on port 4000"

echo "Port 5173 (Frontend):"
netstat -tulpn 2>/dev/null | grep 5173 || echo "  ❌ Nothing listening on port 5173"

echo ""
echo "4️⃣ Checking .env files..."
if [ -f ".env" ]; then
    echo "✅ Frontend .env exists"
    echo "   VITE_API_URL=$(grep VITE_API_URL .env | cut -d'=' -f2)"
else
    echo "❌ Frontend .env NOT found!"
fi

if [ -f "backend/.env" ]; then
    echo "✅ Backend .env exists"
    echo "   PORT=$(grep ^PORT backend/.env | cut -d'=' -f2)"
    echo "   CLIENT_URL=$(grep CLIENT_URL backend/.env | cut -d'=' -f2)"
else
    echo "❌ Backend .env NOT found!"
fi

echo ""
echo "5️⃣ Testing backend API..."
BACKEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/health 2>/dev/null)
if [ "$BACKEND_TEST" = "200" ]; then
    echo "✅ Backend API is responding (HTTP $BACKEND_TEST)"
else
    echo "❌ Backend API not responding (HTTP $BACKEND_TEST)"
fi

echo ""
echo "================================================"
echo "🔧 FIXING ISSUES..."
echo "================================================"

# Create .env files if missing
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Creating frontend .env file..."
    cat > .env << 'EOF'
VITE_API_URL=http://13.62.225.158:4000/api
VITE_SOCKET_URL=http://13.62.225.158:4000
VITE_RAZORPAY_KEY_ID=rzp_live_SINnm2d5ld3vlh
VITE_ENABLE_WEBRTC=true
EOF
    echo "✅ Frontend .env created"
fi

if [ ! -f "backend/.env" ]; then
    echo ""
    echo "📝 Creating backend .env file..."
    cat > backend/.env << 'EOF'
PORT=4000
NODE_ENV=production
MONGODB_URI=mongodb+srv://yogmca_db_user:Diya2012@legaliq.b4xrthx.mongodb.net/legaliq?retryWrites=true&w=majority&appName=LegalIQ
CLIENT_URL=http://13.62.225.158:5173
SESSION_SECRET=legaliq-secret-key-change-in-production-2026
RAZORPAY_KEY_ID=rzp_live_SINnm2d5ld3vlh
RAZORPAY_KEY_SECRET=9cjbp0rh7dZHIwDa33Eq1wE6
MSG91_AUTH_KEY=495242AKEqo8T6Z6996e572P1
MSG91_SENDER_ID=LGALIQ
MSG91_ROUTE=4
SMS_ENABLED=true
SMS_PROVIDER=MSG91
EOF
    echo "✅ Backend .env created"
fi

echo ""
echo "🛑 Stopping all existing processes..."
pkill -f "node server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
pm2 delete all 2>/dev/null
sleep 2

echo ""
echo "🚀 Starting backend..."
cd backend
node server.js > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend started (PID: $BACKEND_PID)"
cd ..

sleep 3

echo ""
echo "🚀 Starting frontend..."
npm run dev -- --host 0.0.0.0 --port 5173 > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend started (PID: $FRONTEND_PID)"

sleep 5

echo ""
echo "================================================"
echo "✅ VERIFICATION"
echo "================================================"

echo ""
echo "📊 Process Status:"
ps aux | grep -E "node server.js|vite" | grep -v grep

echo ""
echo "🔌 Port Status:"
netstat -tulpn 2>/dev/null | grep -E "4000|5173"

echo ""
echo "🧪 Testing Backend API:"
curl -s http://localhost:4000/api/health | head -n 5

echo ""
echo "================================================"
echo "✅ Server restart complete!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://13.62.225.158:5173"
echo "   Backend:  http://13.62.225.158:4000/api/health"
echo ""
echo "📝 View logs:"
echo "   Backend:  tail -f ~/legqlIQ/backend.log"
echo "   Frontend: tail -f ~/legqlIQ/frontend.log"
echo ""
echo "💡 To use PM2 instead (recommended):"
echo "   cd ~/legqlIQ/backend && pm2 start server.js --name backend"
echo "   cd ~/legqlIQ && pm2 start 'npm run dev -- --host 0.0.0.0 --port 5173' --name frontend"
echo "   pm2 save"
echo ""
