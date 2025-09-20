# StreamPay Val.town Cron Script

This directory contains a cron script for automated recurring payment processing on the Val.town platform.

## Overview

The `valtown-cron.ts` script automatically processes due subscription payments for the StreamPay contract every minute. It connects to the Avalanche Fuji testnet and checks all active subscriptions for payments that are due.

## Features

- ⏰ Runs every minute automatically
- 🔍 Checks all active subscriptions for due payments
- 💰 Processes payments automatically when due
- 📊 Provides detailed logging and metrics
- ❌ Graceful error handling for individual subscription failures
- 🔒 Secure private key management via environment variables

## Setup Instructions

### 1. Deploy to Val.town

1. Go to [Val.town](https://val.town)
2. Create a new Val
3. Copy the contents of `valtown-cron.ts` into the Val editor
4. The `@cron * * * * *` comment at the top will automatically schedule it to run every minute

### 2. Configure Environment Variables

Add your private key to Val.town secrets:

1. In your Val.town dashboard, go to "Secrets"
2. Add a new secret with key: `PRIVATE_KEY`
3. Set the value to your Avalanche wallet private key (the one that will execute the payments)

⚠️ **Security Note**: Never commit private keys to version control. Always use environment variables.

### 3. Wallet Requirements

The wallet associated with your private key must:
- Have sufficient AVAX for gas fees on Fuji testnet
- Be authorized to call the `processSubscriptionPayment` function (if there are access controls)

### 4. Monitor Execution

Once deployed, you can monitor the cron job execution in your Val.town logs to see:
- How many payments were processed
- Which subscriptions were checked
- Any errors that occurred
- Performance metrics

## Script Configuration

The script is pre-configured for:
- **Network**: Avalanche Fuji Testnet
- **RPC URL**: `https://api.avax-test.network/ext/bc/C/rpc`
- **Contract Address**: `0x08006F413fbb555eFfcc9A27e9A01980B0e42207`
- **Gas Settings**: Optimized for Fuji testnet (25 gwei, 200k gas limit)

## How It Works

1. **Connection**: Connects to Avalanche Fuji using ethers.js
2. **Discovery**: Gets the total number of subscriptions from the contract
3. **Checking**: For each subscription:
   - Checks if it's active
   - Gets the last payment time and plan interval
   - Calculates if payment is due
4. **Processing**: If payment is due, calls `processSubscriptionPayment(subscriptionId)`
5. **Reporting**: Logs detailed results and metrics

## Output Example

```
🚀 StreamPay Payment Processor started at 2025-09-20T10:30:00.000Z
🔗 Connected to Avalanche Fuji with wallet: 0x1234...5678
⏰ Current time: 1726826200, Total subscriptions: 5
📋 Subscription 1: Last payment 1726825800, Due at 1726826400, Current 1726826200
⏳ Subscription 1: Payment due in 200 seconds
💰 Processing payment for subscription 2...
✅ Payment transaction sent for subscription 2
🧾 Transaction hash: 0xabc...def
✅ Payment confirmed for subscription 2 in block 12345678
📊 Payment processing complete:
   ✅ Processed: 1 payments
   ⏭️  Skipped: 4 subscriptions (inactive/not due)
   ❌ Errors: 0 subscriptions
   📋 Total checked: 5 subscriptions
```

## Error Handling

The script includes comprehensive error handling:
- **Individual Failures**: If one subscription fails, others continue processing
- **Specific Error Types**: Identifies common issues like insufficient funds or inactive subscriptions
- **Graceful Degradation**: Returns detailed error information for debugging

## Local Testing

To test the script locally before deploying:

1. Create a `.env` file with your `PRIVATE_KEY`
2. Modify the import to use local ethers: `import { ethers } from "ethers"`
3. Run with Node.js: `npx tsx valtown-cron.ts`

## Contract Integration

The script uses the complete StreamPay contract ABI embedded in the file. Key functions used:
- `nextSubscriptionId()` - Get total subscription count
- `subscriptionActive(id)` - Check if subscription is active
- `subscriptionLastPayment(id)` - Get last payment timestamp
- `subscriptionPlanId(id)` - Get associated plan ID
- `planInterval(planId)` - Get payment interval for plan
- `processSubscriptionPayment(id)` - Process the payment

## Support

For issues or questions:
1. Check Val.town logs for execution details
2. Verify wallet has sufficient AVAX for gas
3. Ensure private key is correctly set in secrets
4. Review contract state on Avascan explorer