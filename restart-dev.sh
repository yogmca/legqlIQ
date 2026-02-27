#!/bin/bash

echo "========================================="
echo "LegalIQ Development Server Restart Script"
echo "========================================="
echo ""

# Get the public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "13.62.225.158")

# Navigate to project directory
cd ~/legqlIQ || { echo "Error: ~/legqlIQ directory not found"; exit 1; }

echo "1. Stopping all running servers..."
pkill -f "node.*server.js"
pkill -f "vite"
sleep 2
echo "   ✓ Servers stopped"
echo ""

echo "2. Cleaning build artifacts and cache..."
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf .vite/
echo "   ✓ Cache cleared"
echo ""

echo "3. Setting up environment variables..."
cat > .env << EOF
VITE_API_URL=http://${PUBLIC_IP}:4000/api
EOF
echo "   ✓ Frontend .env created with VITE_API_URL=http://${PUBLIC_IP}:4000/api"
echo ""

echo "4. Checking backend .env..."
if [ -f backend/.env ]; then
    echo "   ✓ Backend .env exists"
    echo "   Current settings:"
    grep -E "PORT|CLIENT_URL|MONGODB" backend/.env | sed 's/^/     /'
else
    echo "   ⚠ Warning: backend/.env not found"
fi
echo ""

echo "5. Starting backend server..."
cd backend
nohup node server.js > backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

if ps -p $BACKEND_PID > /dev/null; then
    echo "   ✓ Backend started (PID: $BACKEND_PID)"
    echo "   Last 10 lines of backend log:"
    tail -10 backend.log | sed 's/^/     /'
else
    echo "   ✗ Backend failed to start. Check logs:"
    tail -20 backend.log | sed 's/^/     /'
    exit 1
fi
echo ""

echo "6. Testing backend API..."
HEALTH_CHECK=$(curl -s http://localhost:4000/api/health 2>&1)
if [ $? -eq 0 ]; then
    echo "   ✓ Backend API responding"
    echo "   Response: $HEALTH_CHECK"
else
    echo "   ✗ Backend API not responding"
fi
echo ""

echo "7. Starting frontend development server..."
cd ~/legqlIQ
nohup npm run dev -- --host 0.0.0.0 --port 5173 > frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 5

if ps -p $FRONTEND_PID > /dev/null; then
    echo "   ✓ Frontend started (PID: $FRONTEND_PID)"
    echo "   Last 10 lines of frontend log:"
    tail -10 frontend.log | sed 's/^/     /'
else
    echo "   ✗ Frontend failed to start. Check logs:"
    tail -20 frontend.log | sed 's/^/     /'
    exit 1
fi
echo ""

echo "8. Verifying running processes..."
echo "   Running servers:"
ps aux | grep -E "node.*server.js|vite" | grep -v grep | sed 's/^/     /'
echo ""

echo "========================================="
echo "✓ Restart Complete!"
echo "========================================="
echo ""
echo "Access your application at:"
echo "  → http://${PUBLIC_IP}:5173/"
echo ""
echo "Backend API:"
echo "  → http://${PUBLIC_IP}:4000/api"
echo ""
echo "IMPORTANT: After accessing the site:"
echo "  1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)"
echo "  2. Clear browser cache if needed"
echo "  3. Check browser console - should NOT see 'index-*.js' files"
echo ""
echo "To view logs:"
echo "  Backend:  tail -f ~/legqlIQ/backend/backend.log"
echo "  Frontend: tail -f ~/legqlIQ/frontend.log"
echo ""
