#!/bin/bash

echo "🚀 Starting Karnataka Bar Association Lawyer Directory"
echo "=================================================="
echo ""

# Check if node_modules exists in backend
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Check if node_modules exists in frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo ""
echo "✅ Dependencies installed"
echo ""
echo "🔧 Starting Backend Server (Port 3001)..."
cd backend && npm start &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 3

echo ""
echo "🎨 Starting Frontend Server (Port 5173/5174)..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=================================================="
echo "✅ Both servers are running!"
echo ""
echo "📡 Backend API: http://localhost:3001"
echo "🌐 Frontend App: http://localhost:5173 (or 5174)"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "=================================================="

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
