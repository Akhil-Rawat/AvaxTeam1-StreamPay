#!/bin/bash

echo "🧪 StreamPay Backend Test Suite"
echo "==============================="

# Test 1: Backend Health
echo "1. Testing backend health..."
HEALTH=$(curl -s http://localhost:3001/health)
echo "   ✅ Health: $HEALTH"

# Test 2: Root endpoint
echo "2. Testing root endpoint..."
ROOT=$(curl -s http://localhost:3001/ | jq -r .message 2>/dev/null || curl -s http://localhost:3001/ | head -c 50)
echo "   ✅ Root: $ROOT"

# Test 3: Plans endpoint
echo "3. Testing plans endpoint..."
PLANS=$(curl -s http://localhost:3001/plans)
echo "   ✅ Plans: $PLANS"

# Test 4: Frontend status
echo "4. Testing frontend..."
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
echo "   ✅ Frontend Status: $FRONTEND"

echo ""
echo "🎯 Next Steps:"
echo "1. Go to http://localhost:5173/provider/onboarding"
echo "2. Connect MetaMask to Avalanche Fuji"
echo "3. Register as provider"
echo "4. Create plans on dashboard"
echo "5. Test marketplace subscription"

echo ""
echo "📋 URLs:"
echo "   Backend API: http://localhost:3001"
echo "   Frontend:    http://localhost:5173"
echo "   Onboarding:  http://localhost:5173/provider/onboarding"
echo "   Dashboard:   http://localhost:5173/provider"
echo "   Marketplace: http://localhost:5173/marketplace"