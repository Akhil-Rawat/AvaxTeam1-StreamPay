# Val.town Cron Job Deployment Guide

## Overview
This guide explains how to deploy the StreamPay automated payment processing system using Val.town's cron job infrastructure.

## What It Does
The `valtown-cron.ts` script runs every minute to automatically process due subscription payments on your StreamPay contract deployed on Avalanche Fuji testnet.

## Key Features
- ✅ Runs every minute automatically
- ✅ Uses Val.town's new secrets API (not deprecated env)
- ✅ Auto gas pricing (Fuji optimized)
- ✅ Comprehensive error handling
- ✅ Detailed logging with execution metrics
- ✅ TypeScript support

## Deployment Steps

### 1. Copy the Script
Copy the contents of `valtown-cron.ts` to a new Val.town script.

### 2. Set Up Environment Variables
In your Val.town dashboard:
1. Go to your val's settings (left sidebar)
2. Navigate to "Environment Variables"
3. Add a new environment variable:
   - **Key**: `PRIVATE_KEY`
   - **Value**: Your wallet's private key (the one with permissions to call the contract)

### 3. Deploy the Script
1. Paste the script code into a new Val.town script
2. The `@cron * * * * *` comment will automatically schedule it to run every minute
3. Save and deploy

### 4. Monitor Execution
- Check Val.town logs to see execution results
- Each run produces a summary JSON with processing metrics
- Failed payments will be logged with specific error details

## Script Improvements Applied

### ✅ Current Environment Variables API
```typescript
// Val.town supports both approaches:
const privateKey = process.env.PRIVATE_KEY || Deno.env.get("PRIVATE_KEY");
```
*Note: Neither `process.env` nor `Deno.env` is deprecated - both work in Val.town*

### ✅ Optimized Gas Settings
```typescript
// Old (manual gas settings)
const tx = await contract.processSubscriptionPayment(subId, {
  gasLimit: 200000,
  gasPrice: ethers.parseUnits("25", "gwei")
});

// New (auto gas for Fuji)
const tx = await contract.processSubscriptionPayment(subId);
```

### ✅ Improved Logging
- Reduced verbose logs to `console.debug`
- Consolidated summary into single JSON output
- Added execution time tracking
- Better error type handling

### ✅ Enhanced Error Handling
```typescript
// Proper TypeScript error handling
const errorMessage = error instanceof Error ? error.message : String(error);
```

## Contract Information
- **Network**: Avalanche Fuji Testnet
- **Contract Address**: `0x08006F413fbb555eFfcc9A27e9A01980B0e42207`
- **RPC URL**: `https://api.avax-test.network/ext/bc/C/rpc`

## Expected Output
Each cron job execution will return a summary like:
```json
{
  "success": true,
  "processed": 2,
  "skipped": 3,
  "errors": 0,
  "total": 5,
  "executionTime": "1250ms",
  "timestamp": "2025-09-20T10:30:00.000Z",
  "contractAddress": "0x08006F413fbb555eFfcc9A27e9A01980B0e42207",
  "network": "Avalanche Fuji",
  "processedSubscriptions": [1, 3],
  "errorDetails": []
}
```

## Troubleshooting

### Common Issues
1. **"PRIVATE_KEY not found"**: Ensure you've added the environment variable in your val's settings
2. **Gas estimation failed**: Network congestion, try manual gas settings
3. **"insufficient funds"**: User's escrow balance is too low
4. **"Not due"**: Payment timing check - subscription not ready yet

### Monitoring
- Val.town provides execution logs for each cron run
- Check for consistent execution every minute
- Monitor for recurring error patterns

## Security Notes
- Private key is stored securely in Val.town environment variables
- Script only has permission to call `processSubscriptionPayment`
- No direct fund handling - contract manages all escrow

## Support
If you encounter issues:
1. Check Val.town execution logs
2. Verify contract address and network
3. Ensure sufficient test AVAX for gas fees
4. Confirm private key has necessary permissions