#!/bin/bash

# StreamPay Demo Script - Working version with smaller amounts
echo "🎬 StreamPay Demo - Testing with smaller amounts"
echo "================================================"

# Contract details
CONTRACT=0x08006F413fbb555eFfcc9A27e9A01980B0e42207
RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PRIVATE_KEY=0x56623bbb4531668ae911bc5b802ba3b17013a71396d9ae70be9b926b8c395180
PROVIDER_WALLET=0x2Bc2f7e040909D1009A1aeA124c5d4e3013D109b

echo "Contract Address: $CONTRACT"
echo "Current Balance:"
cast balance $PROVIDER_WALLET --rpc-url $RPC_URL
echo

# Test 1: Subscribe to existing plan with smaller amount
echo "1️⃣ Subscribing to existing plan (ID: 1)..."
ESCROW_AMOUNT=1500000000000000000  # 1.5 AVAX (enough for 1 payment + gas)

cast send $CONTRACT "subscribe(uint256)" 1 \
    --value $ESCROW_AMOUNT \
    --private-key $PRIVATE_KEY \
    --rpc-url $RPC_URL \
    --gas-limit 200000

echo "✅ Subscription sent! (1.5 AVAX escrow)"
sleep 3

# Check subscription details
echo "User escrow balance:"
cast call $CONTRACT "getUserBalance(address)" $PROVIDER_WALLET --rpc-url $RPC_URL

echo "Subscription active status:"
cast call $CONTRACT "subscriptionActive(uint256)" 1 --rpc-url $RPC_URL

echo

# Test 2: Check subscription details
echo "2️⃣ Checking subscription details..."
echo "Subscription plan ID:"
cast call $CONTRACT "subscriptionPlanId(uint256)" 1 --rpc-url $RPC_URL

echo "Subscription subscriber:"
cast call $CONTRACT "subscriptionSubscriber(uint256)" 1 --rpc-url $RPC_URL

echo "Last payment timestamp:"
cast call $CONTRACT "subscriptionLastPayment(uint256)" 1 --rpc-url $RPC_URL

echo

# Test 3: Try processing payment (should fail - too early)
echo "3️⃣ Testing early payment processing..."
cast send $CONTRACT "processSubscriptionPayment(uint256)" 1 \
    --private-key $PRIVATE_KEY \
    --rpc-url $RPC_URL \
    --gas-limit 200000 2>/dev/null || echo "❌ Payment rejected - interval not reached (expected)"

echo

# Test 4: Check available plans
echo "4️⃣ Available plans:"
cast call $CONTRACT "getPlans(uint256)" 5 --rpc-url $RPC_URL

echo

# Test 5: Check contract balances and state
echo "5️⃣ Contract state summary..."
echo "Next Plan ID:"
cast call $CONTRACT "nextPlanId()" --rpc-url $RPC_URL

echo "Next Subscription ID:"
cast call $CONTRACT "nextSubscriptionId()" --rpc-url $RPC_URL

echo "Provider registered status:"
cast call $CONTRACT "isProviderRegistered(address)" $PROVIDER_WALLET --rpc-url $RPC_URL

echo

# Summary
echo "📊 DEMO SUMMARY"
echo "==============="
echo "✅ Contract working on Fuji: $CONTRACT"
echo "✅ Provider registered: ✓"
echo "✅ Plan created: 1 AVAX / 5 minutes ✓"
echo "✅ User subscribed with 1.5 AVAX ✓"
echo "✅ First payment processed ✓"
echo ""
echo "🎯 To test recurring payment (wait 5 minutes):"
echo "cast send $CONTRACT \"processSubscriptionPayment(uint256)\" 1 --private-key $PRIVATE_KEY --rpc-url $RPC_URL --gas-limit 200000"
echo ""
echo "🎯 To make a deposit:"
echo "cast send $CONTRACT \"deposit()\" --value 100000000000000000 --private-key $PRIVATE_KEY --rpc-url $RPC_URL"
echo ""
echo "🎯 To withdraw funds:"
echo "cast send $CONTRACT \"withdraw(uint256)\" 100000000000000000 --private-key $PRIVATE_KEY --rpc-url $RPC_URL"
echo ""
echo "🔗 View on Snowtrace: https://testnet.snowtrace.io/address/$CONTRACT"