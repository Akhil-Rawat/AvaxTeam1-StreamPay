#!/bin/bash

# StreamPay Avalanche Deployment Script
echo "🚀 StreamPay Avalanche Deployment"
echo "================================="

# Load environment variables
source .env

echo "Deployer address: $DEPLOYER"
echo "RPC URL: $RPC_URL"

# Check balance
echo "Checking AVAX balance..."
BALANCE=$(cast balance $DEPLOYER --rpc-url $RPC_URL)
echo "Current balance: $BALANCE wei"

if [ "$BALANCE" = "0" ]; then
    echo "❌ No AVAX in wallet! Please get testnet AVAX first:"
    echo "1. Go to https://faucet.avax.network/"
    echo "2. Request AVAX for address: $DEPLOYER"
    echo "3. Wait for confirmation, then run this script again"
    exit 1
fi

echo "✅ Sufficient AVAX balance found"

# Deploy contract
echo "Deploying StreamPay contract..."
forge script script/DeployStreamPay.s.sol --rpc-url $RPC_URL --broadcast --verify

echo "🎉 Deployment complete!"