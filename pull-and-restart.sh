#!/bin/bash

echo "========================================="
echo "Pull Latest Changes and Restart Servers"
echo "========================================="
echo ""

cd ~/legqlIQ || { echo "Error: ~/legqlIQ directory not found"; exit 1; }

echo "1. Fetching latest changes from GitHub..."
git fetch origin LegalIQ_prod
echo ""

echo "2. Checking which files changed..."
echo "   Files that will be updated:"
git diff --name-only HEAD origin/LegalIQ_prod | sed 's/^/     /'
echo ""

read -p "Do you want to merge these changes? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Merge cancelled."
    exit 0
fi

echo "3. Merging changes..."
git merge origin/LegalIQ_prod
if [ $? -ne 0 ]; then
    echo "   ✗ Merge failed. Please resolve conflicts manually."
    exit 1
fi
echo "   ✓ Merge successful"
echo ""

echo "4. Stopping all running processes..."
pkill -f "node.*server.js"
pkill -f "vite"
sleep 2
echo "   ✓ Processes stopped"
echo ""

echo "5. Clearing frontend cache..."
rm -rf node_modules/.vite/
rm -rf .vite/
echo "   ✓ Cache cleared"
echo ""

echo "6. Starting backend server..."
cd ~/legqlIQ/backend
nohup node server.js > backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

if ps -p $BACKEND_PID > /dev/null; then
    echo "   ✓ Backend started (PID: $BACKEND_PID)"
    echo "   Last 5 lines of backend log:"
    tail -5 backend.log | sed 's/^/     /'
else
    echo "   ✗ Backend failed to start"
    echo "   Error log:"
    tail -20 backend.log | sed 's/^/     /'
    exit 1
fi
echo ""

echo "7. Starting frontend development server..."
cd ~/legqlIQ
nohup npm run dev -- --host 0.0.0.0 --port 5173 > frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 5

if ps -p $FRONTEND_PID > /dev/null; then
    echo "   ✓ Frontend started (PID: $FRONTEND_PID)"
    echo "   Last 5 lines of frontend log:"
    tail -5 frontend.log | sed 's/^/     /'
else
    echo "   ✗ Frontend failed to start"
    echo "   Error log:"
    tail -20 frontend.log | sed 's/^/     /'
    exit 1
fi
echo ""

echo "8. Verifying running processes..."
echo "   Active servers:"
ps aux | grep -E "node.*server.js|vite" | grep -v grep | sed 's/^/     /'
echo ""

echo "========================================="
echo "✓ Pull and Restart Complete!"
echo "========================================="
echo ""
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "13.62.225.158")
echo "Access your application at:"
echo "  → http://${PUBLIC_IP}:5173/"
echo ""
echo "IMPORTANT: After accessing the site:"
echo "  1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)"
echo "  2. Or clear browser cache completely"
echo "  3. Or use Incognito/Private window"
echo ""
echo "To view logs:"
echo "  Backend:  tail -f ~/legqlIQ/backend/backend.log"
echo "  Frontend: tail -f ~/legqlIQ/frontend.log"
echo ""
