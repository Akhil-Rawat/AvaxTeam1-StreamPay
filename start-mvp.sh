#!/bin/bash

# StreamPay MVP Start Script

echo "🚀 Starting StreamPay MVP..."

# Note: Using MongoDB Atlas - no need to check local MongoDB
echo "☁️  Using MongoDB Atlas for database"

# Start backend
echo "📡 Starting backend server..."
cd backend
npm install > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check if backend started successfully
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend running on http://localhost:3001"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend
echo "🌐 Starting frontend..."
cd ..
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!

sleep 3

echo ""
echo "🎉 StreamPay MVP is running!"
echo ""
echo "📊 Backend API: http://localhost:3001"
echo "🌐 Frontend App: http://localhost:5173"
echo ""
echo "📋 Quick Test Flow:"
echo "1. Visit http://localhost:5173/provider/onboarding"
echo "2. Connect MetaMask (Avalanche Fuji testnet)"
echo "3. Register as provider"
echo "4. Create a subscription plan"
echo "5. Visit marketplace and subscribe"
echo ""
echo "🛑 To stop: Ctrl+C or kill $BACKEND_PID $FRONTEND_PID"

# Keep script running and monitor processes
trap "echo '🛑 Stopping StreamPay MVP...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

wait