#!/bin/bash

echo "========================================="
echo "Fix Environment and Restart Servers"
echo "========================================="
echo ""

# Get the public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "13.62.225.158")

cd ~/legqlIQ || exit 1

echo "1. Creating .env file with correct API URL..."
echo "VITE_API_URL=http://${PUBLIC_IP}:4000/api" > .env

echo "   Created .env with:"
cat .env
echo ""

echo "2. Stopping servers..."
pkill -f "vite"
pkill -f "node.*server.js"
sleep 2
echo "   ✓ Stopped"
echo ""

echo "3. Clearing cache..."
rm -rf dist/ node_modules/.vite/ .vite/
echo "   ✓ Cache cleared"
echo ""

echo "4. Starting backend..."
cd ~/legqlIQ/backend
nohup node server.js > backend.log 2>&1 &
sleep 3
echo "   Backend log:"
tail -5 backend.log
echo ""

echo "5. Starting frontend..."
cd ~/legqlIQ
nohup npm run dev -- --host 0.0.0.0 --port 5173 > frontend.log 2>&1 &
sleep 5
echo "   Frontend log:"
tail -5 frontend.log
echo ""

echo "6. Testing backend..."
curl -s http://localhost:4000/api/health
echo ""
echo ""

echo "========================================="
echo "✓ Done!"
echo "========================================="
echo ""
echo "Access: http://${PUBLIC_IP}:5173/"
echo ""
echo "IMPORTANT:"
echo "1. Hard refresh browser (Ctrl+Shift+R)"
echo "2. Clear browser cache completely"
echo "3. The .env file now contains:"
cat ~/legqlIQ/.env
echo ""
