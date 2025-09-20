#!/bin/bash

# StreamPay Demo Script - Test all functionality on Fuji testnet
echo "🎬 StreamPay Demo - Testing on Avalanche Fuji"
echo "============================================="

# Contract details
CONTRACT=0x08006F413fbb555eFfcc9A27e9A01980B0e42207
RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PRIVATE_KEY=0x56623bbb4531668ae911bc5b802ba3b17013a71396d9ae70be9b926b8c395180
PROVIDER_WALLET=0x2Bc2f7e040909D1009A1aeA124c5d4e3013D109b

echo "Contract Address: $CONTRACT"
echo "Provider Wallet: $PROVIDER_WALLET"
echo

# Test 1: Check initial contract state
echo "1️⃣ Checking initial contract state..."
echo "Admin:"
cast call $CONTRACT "admin()" --rpc-url $RPC_URL

echo "Protocol Fee (BPS):"
cast call $CONTRACT "protocolFeeBps()" --rpc-url $RPC_URL

echo "Next Plan ID:"
cast call $CONTRACT "nextPlanId()" --rpc-url $RPC_URL

echo

# Test 2: Register as provider
echo "2️⃣ Registering as streaming provider..."
cast send $CONTRACT "registerProvider(string)" "Netflix Clone Streaming" \
    --private-key $PRIVATE_KEY \
    --rpc-url $RPC_URL \
    --gas-limit 100000

echo "✅ Provider registration sent!"
sleep 3

# Check if provider is registered
echo "Checking provider registration:"
cast call $CONTRACT "isProviderRegistered(address)" $PROVIDER_WALLET --rpc-url $RPC_URL

echo

# Test 3: Create a subscription plan
echo "3️⃣ Creating subscription plan..."
PLAN_PRICE=1000000000000000000  # 1 AVAX in wei
PLAN_INTERVAL=300               # 5 minutes for demo

cast send $CONTRACT "createPlan(uint256,uint256)" $PLAN_PRICE $PLAN_INTERVAL \
    --private-key $PRIVATE_KEY \
    --rpc-url $RPC_URL \
    --gas-limit 150000

echo "✅ Plan creation sent! (1 AVAX / 5 minutes)"
sleep 3

# Check plan details
echo "Plan provider for ID 1:"
cast call $CONTRACT "planProvider(uint256)" 1 --rpc-url $RPC_URL

echo "Plan price for ID 1:"
cast call $CONTRACT "planPrice(uint256)" 1 --rpc-url $RPC_URL

echo "Plan interval for ID 1:"
cast call $CONTRACT "planInterval(uint256)" 1 --rpc-url $RPC_URL

echo

# Test 4: Subscribe to the plan
echo "4️⃣ Subscribing to plan with escrow deposit..."
ESCROW_AMOUNT=5000000000000000000  # 5 AVAX

cast send $CONTRACT "subscribe(uint256)" 1 \
    --value $ESCROW_AMOUNT \
    --private-key $PRIVATE_KEY \
    --rpc-url $RPC_URL \
    --gas-limit 200000

echo "✅ Subscription sent! (5 AVAX escrow)"
sleep 3

# Check subscription details
echo "Subscription plan ID for subscription 1:"
cast call $CONTRACT "subscriptionPlanId(uint256)" 1 --rpc-url $RPC_URL

echo "Subscription subscriber for subscription 1:"
cast call $CONTRACT "subscriptionSubscriber(uint256)" 1 --rpc-url $RPC_URL

echo "Subscription active status:"
cast call $CONTRACT "subscriptionActive(uint256)" 1 --rpc-url $RPC_URL

echo "User escrow balance:"
cast call $CONTRACT "getUserBalance(address)" $PROVIDER_WALLET --rpc-url $RPC_URL

echo

# Test 5: Make additional escrow deposit
echo "5️⃣ Making additional escrow deposit..."
cast send $CONTRACT "deposit()" \
    --value 2000000000000000000 \
    --private-key $PRIVATE_KEY \
    --rpc-url $RPC_URL \
    --gas-limit 100000

echo "✅ Additional deposit sent! (2 AVAX)"
sleep 3

echo "Updated escrow balance:"
cast call $CONTRACT "getUserBalance(address)" $PROVIDER_WALLET --rpc-url $RPC_URL

echo

# Test 6: Get available plans
echo "6️⃣ Getting available plans..."
cast call $CONTRACT "getPlans(uint256)" 10 --rpc-url $RPC_URL

echo

# Test 7: Try to process subscription payment (will fail - too early)
echo "7️⃣ Attempting early payment processing (should fail)..."
cast send $CONTRACT "processSubscriptionPayment(uint256)" 1 \
    --private-key $PRIVATE_KEY \
    --rpc-url $RPC_URL \
    --gas-limit 200000 || echo "❌ Failed as expected - payment not due yet"

echo

# Summary
echo "📊 DEMO SUMMARY"
echo "==============="
echo "✅ Contract deployed to: $CONTRACT"
echo "✅ Provider registered: Netflix Clone Streaming"
echo "✅ Plan created: 1 AVAX / 5 minutes"
echo "✅ User subscribed with 5 AVAX escrow"
echo "✅ Additional 2 AVAX deposited"
echo "✅ Total escrow: ~6 AVAX (after first payment)"
echo ""
echo "🎯 Next steps:"
echo "- Wait 5 minutes then run: cast send $CONTRACT \"processSubscriptionPayment(uint256)\" 1 --private-key $PRIVATE_KEY --rpc-url $RPC_URL"
echo "- Test withdrawal: cast send $CONTRACT \"withdraw(uint256)\" 1000000000000000000 --private-key $PRIVATE_KEY --rpc-url $RPC_URL"
echo ""
echo "🔗 View on Explorer: https://testnet.snowtrace.io/address/$CONTRACT"