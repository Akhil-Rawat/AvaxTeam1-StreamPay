#!/bin/bash

# StreamPay Contract Deployment Script

echo "🚀 Deploying StreamPay Hybrid Escrow Contract..."

# Configuration
NETWORK="https://sepolia-rollup.arbitrum.io/rpc"
CONTRACT_NAME="SubscriptionEscrow"

# Check if private key is provided
if [ -z "$1" ]; then
    echo "❌ Please provide private key as argument"
    echo "Usage: ./deploy.sh YOUR_PRIVATE_KEY"
    exit 1
fi

PRIVATE_KEY=$1

echo "📋 Contract Configuration:"
echo "  - Network: Arbitrum Sepolia"
echo "  - Language: Rust (Stylus)"
echo "  - Expected Size: ~23.6 KiB"
echo ""

# Check contract compilation
echo "🔧 Checking contract compilation..."
cargo stylus check --endpoint=$NETWORK

if [ $? -ne 0 ]; then
    echo "❌ Contract compilation failed"
    exit 1
fi

echo "✅ Contract compiled successfully"
echo ""

# Deploy contract
echo "🚀 Deploying contract..."
DEPLOY_OUTPUT=$(cargo stylus deploy --endpoint=$NETWORK --private-key=$PRIVATE_KEY --no-verify 2>&1)

if [ $? -eq 0 ]; then
    CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -o '0x[a-fA-F0-9]\{40\}' | head -1)
    echo "✅ Contract deployed successfully!"
    echo "📍 Contract Address: $CONTRACT_ADDRESS"
    echo ""
    
    # Export ABI
    echo "📄 Generating ABI..."
    cargo stylus export-abi > abi.json
    echo "✅ ABI saved to abi.json"
    echo ""
    
    # Initialize contract
    echo "🔧 Initializing contract..."
    cast send $CONTRACT_ADDRESS "initialize()" --private-key $PRIVATE_KEY --rpc-url $NETWORK
    
    if [ $? -eq 0 ]; then
        echo "✅ Contract initialized successfully!"
        echo ""
        echo "🎉 Deployment Complete!"
        echo "📍 Contract: $CONTRACT_ADDRESS"
        echo "🌐 Network: Arbitrum Sepolia"
        echo "📄 ABI: abi.json"
        echo ""
        echo "📋 Next Steps:"
        echo "1. Update subgraph with new contract address"
        echo "2. Test contract functions"
        echo "3. Deploy subgraph for analytics"
    else
        echo "❌ Contract initialization failed"
    fi
else
    echo "❌ Contract deployment failed"
    echo "$DEPLOY_OUTPUT"
fi
