#!/bin/bash

# Fix Backend Connection Issue on AWS EC2
# This script diagnoses and fixes the "Unable to connect to server" error

echo "=========================================="
echo "Backend Connection Diagnostic & Fix"
echo "=========================================="
echo ""

# Get EC2 public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null)
if [ -z "$PUBLIC_IP" ]; then
    PUBLIC_IP="13.62.225.158"
fi
echo "EC2 Public IP: $PUBLIC_IP"
echo ""

# Step 1: Check if backend is running
echo "=========================================="
echo "Step 1: Checking Backend Process"
echo "=========================================="

BACKEND_PID=$(pgrep -f "node.*server.js")
if [ -n "$BACKEND_PID" ]; then
    echo "✓ Backend is running (PID: $BACKEND_PID)"
    BACKEND_RUNNING=true
else
    echo "✗ Backend is NOT running"
    BACKEND_RUNNING=false
fi
echo ""

# Step 2: Check if port 4000 is listening
echo "=========================================="
echo "Step 2: Checking Port 4000"
echo "=========================================="

if netstat -tuln 2>/dev/null | grep -q ":4000 " || ss -tuln 2>/dev/null | grep -q ":4000 "; then
    echo "✓ Port 4000 is listening"
    PORT_LISTENING=true
else
    echo "✗ Port 4000 is NOT listening"
    PORT_LISTENING=false
fi
echo ""

# Step 3: Check MongoDB connection
echo "=========================================="
echo "Step 3: Checking MongoDB Connection"
echo "=========================================="

if [ "$BACKEND_RUNNING" = true ]; then
    echo "Checking backend logs for MongoDB connection..."
    if pm2 list 2>/dev/null | grep -q "backend"; then
        pm2 logs backend --lines 20 --nostream | grep -i "mongodb\|connected\|error" | tail -5
    else
        echo "PM2 not managing backend, checking recent logs..."
        if [ -f "backend.log" ]; then
            tail -20 backend.log | grep -i "mongodb\|connected\|error" | tail -5
        fi
    fi
else
    echo "Backend not running, cannot check MongoDB connection"
fi
echo ""

# Step 4: Test backend locally
echo "=========================================="
echo "Step 4: Testing Backend Locally"
echo "=========================================="

if [ "$PORT_LISTENING" = true ]; then
    echo "Testing: http://localhost:4000/api/lawyers?limit=1"
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/lawyers?limit=1 2>/dev/null)
    if [ "$RESPONSE" = "200" ]; then
        echo "✓ Backend API responding locally (HTTP $RESPONSE)"
        LOCAL_API_WORKS=true
    else
        echo "✗ Backend API returned HTTP $RESPONSE"
        LOCAL_API_WORKS=false
    fi
else
    echo "✗ Cannot test - port 4000 not listening"
    LOCAL_API_WORKS=false
fi
echo ""

# Step 5: Test backend externally
echo "=========================================="
echo "Step 5: Testing Backend Externally"
echo "=========================================="

echo "Testing: http://$PUBLIC_IP:4000/api/lawyers?limit=1"
EXTERNAL_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://$PUBLIC_IP:4000/api/lawyers?limit=1 2>/dev/null)
if [ "$EXTERNAL_RESPONSE" = "200" ]; then
    echo "✓ Backend API responding externally (HTTP $EXTERNAL_RESPONSE)"
    EXTERNAL_API_WORKS=true
else
    echo "✗ Backend API returned HTTP $EXTERNAL_RESPONSE"
    EXTERNAL_API_WORKS=false
fi
echo ""

# Step 6: Check firewall/security group
echo "=========================================="
echo "Step 6: Checking Firewall Rules"
echo "=========================================="

# Check iptables
if command -v iptables &> /dev/null; then
    if sudo iptables -L -n | grep -q "4000"; then
        echo "⚠️  iptables rules found for port 4000"
        sudo iptables -L -n | grep "4000"
    else
        echo "✓ No iptables blocking port 4000"
    fi
fi

echo ""
echo "Note: Also check AWS Security Group in AWS Console:"
echo "  - Inbound rule for port 4000 from 0.0.0.0/0"
echo "  - Inbound rule for port 5173 from 0.0.0.0/0"
echo ""

# Step 7: Fix based on diagnosis
echo "=========================================="
echo "Step 7: Applying Fixes"
echo "=========================================="

if [ "$BACKEND_RUNNING" = false ] || [ "$PORT_LISTENING" = false ]; then
    echo "Backend is not running properly. Starting backend..."
    
    # Navigate to backend directory
    cd backend
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        echo "✗ backend/.env file not found!"
        echo "Please create backend/.env with proper configuration"
        exit 1
    fi
    
    # Stop any existing backend processes
    pkill -f "node.*server.js" 2>/dev/null
    sleep 2
    
    # Start backend
    if command -v pm2 &> /dev/null; then
        echo "Starting backend with PM2..."
        pm2 delete backend 2>/dev/null
        pm2 start server.js --name backend
        pm2 save
        echo "✓ Backend started with PM2"
    else
        echo "Starting backend manually..."
        nohup node server.js > ../backend.log 2>&1 &
        echo "✓ Backend started (PID: $!)"
    fi
    
    cd ..
    
    # Wait for backend to start
    echo "Waiting for backend to initialize..."
    sleep 5
    
    # Test again
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/lawyers?limit=1 2>/dev/null)
    if [ "$RESPONSE" = "200" ]; then
        echo "✓ Backend is now responding (HTTP $RESPONSE)"
    else
        echo "⚠️  Backend may still be starting (HTTP $RESPONSE)"
        echo "Check logs: tail -f backend.log or pm2 logs backend"
    fi
fi

echo ""

# Step 8: Restart frontend with correct config
echo "=========================================="
echo "Step 8: Restarting Frontend"
echo "=========================================="

# Stop frontend
pkill -f "vite" 2>/dev/null
sleep 2

# Start frontend
if command -v pm2 &> /dev/null; then
    echo "Starting frontend with PM2..."
    pm2 delete frontend 2>/dev/null
    pm2 start npm --name frontend -- run dev -- --host 0.0.0.0 --port 5173
    pm2 save
    echo "✓ Frontend started with PM2"
else
    echo "Starting frontend manually..."
    nohup npm run dev -- --host 0.0.0.0 --port 5173 > frontend.log 2>&1 &
    echo "✓ Frontend started (PID: $!)"
fi

echo "Waiting for frontend to initialize..."
sleep 5

echo ""

# Final verification
echo "=========================================="
echo "Final Verification"
echo "=========================================="

# Test backend
echo "Testing backend API..."
BACKEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/lawyers?limit=1 2>/dev/null)
if [ "$BACKEND_TEST" = "200" ]; then
    echo "✓ Backend API: OK (HTTP $BACKEND_TEST)"
else
    echo "✗ Backend API: FAILED (HTTP $BACKEND_TEST)"
fi

# Test frontend
echo "Testing frontend..."
FRONTEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null)
if [ "$FRONTEND_TEST" = "200" ]; then
    echo "✓ Frontend: OK (HTTP $FRONTEND_TEST)"
else
    echo "✗ Frontend: FAILED (HTTP $FRONTEND_TEST)"
fi

# Test registration endpoint
echo "Testing registration endpoint..."
REG_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"test@test.com","password":"test123","phone":"1234567890","role":"client"}' 2>/dev/null)
if [ "$REG_TEST" = "201" ] || [ "$REG_TEST" = "400" ]; then
    echo "✓ Registration endpoint: OK (HTTP $REG_TEST)"
else
    echo "✗ Registration endpoint: FAILED (HTTP $REG_TEST)"
fi

echo ""
echo "=========================================="
echo "Summary & Next Steps"
echo "=========================================="
echo ""
echo "Access your application:"
echo "  Frontend: http://$PUBLIC_IP:5173"
echo "  Registration: http://$PUBLIC_IP:5173/register"
echo "  Backend API: http://$PUBLIC_IP:4000/api"
echo ""
echo "If registration still fails:"
echo ""
echo "1. Clear browser cache (Ctrl+Shift+Delete)"
echo "   Then hard refresh (Ctrl+Shift+R)"
echo ""
echo "2. Check browser console (F12) for errors"
echo ""
echo "3. Verify AWS Security Group allows:"
echo "   - Port 4000 (Backend)"
echo "   - Port 5173 (Frontend)"
echo ""
echo "4. Check logs:"
echo "   Backend: tail -f backend.log (or pm2 logs backend)"
echo "   Frontend: tail -f frontend.log (or pm2 logs frontend)"
echo ""
echo "5. Test API directly:"
echo "   curl http://$PUBLIC_IP:4000/api/lawyers?limit=1"
echo ""
echo "6. Check MongoDB connection:"
echo "   Backend logs should show 'MongoDB connected successfully'"
echo ""
echo "=========================================="
echo "Done! 🎉"
echo "=========================================="
