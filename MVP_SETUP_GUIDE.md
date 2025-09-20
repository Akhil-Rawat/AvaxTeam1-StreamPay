# StreamPay MVP Setup Guide

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# MongoDB Atlas is already configured in .env
# No need to start local MongoDB

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:3001` and connect to MongoDB Atlas automatically.

### 2. Frontend Setup

```bash
# Navigate to project root
cd ../

# Install frontend dependencies (if not already done)
npm install

# Start the frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

### 3. MetaMask Setup

1. Install MetaMask browser extension
2. Add Avalanche Fuji testnet:
   - Network Name: Avalanche Fuji Testnet
   - RPC URL: https://api.avax-test.network/ext/bc/C/rpc
   - Chain ID: 43113
   - Symbol: AVAX
   - Explorer: https://testnet.avascan.info/

3. Get test AVAX from faucet: https://faucet.avax.network/

## 🔄 MVP Flow Testing

### Step 1: Provider Registration
1. Visit `/provider/onboarding`
2. Connect MetaMask wallet
3. Fill provider information
4. Submit registration

### Step 2: Create Subscription Plan
1. Go to `/provider` (Provider Dashboard)
2. Click "Create New Plan"
3. Fill plan details:
   - Name: "Premium Service"
   - Description: "Access to premium features"
   - Price: 0.01 (AVAX)
   - Interval: 86400 (1 day in seconds)
4. Submit - this will:
   - Save plan to MongoDB
   - Create plan on-chain via MetaMask
   - Link on-chain planId to database record

### Step 3: Subscribe to Plan
1. Visit `/marketplace`
2. Connect wallet (if not connected)
3. Find your created plan
4. Click "Subscribe"
5. Confirm transaction in MetaMask
6. Receive subscription ID

### Step 4: Verify Automation
Your subscription is now active and will be processed automatically by:
- Val.town cron job (every minute)
- Chainlink Automation (if configured)

## 📊 API Endpoints

### Provider Management
- `POST /provider/register` - Register new provider
- `GET /providers/:address` - Get provider info and plans

### Plan Management
- `POST /plans` - Create new plan (saves to DB only)
- `PUT /plans/:id/onchain` - Link plan to on-chain planId
- `GET /plans` - Get all active plans (marketplace)
- `GET /plans/:id` - Get specific plan details

### Subscription Tracking
- `POST /subscriptions` - Track new subscription
- `GET /subscriptions/:address` - Get user's subscriptions

## 🔧 Configuration

### Backend Environment Variables (.env)
```
MONGODB_URI=mongodb+srv://rawatakhilvibh_db_user:0SeNDPni67Nx4hZv@cluster0.eo7tmmj.mongodb.net/streampay?retryWrites=true&w=majority
PORT=3001
RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
CONTRACT_ADDRESS=0x08006F413fbb555eFfcc9A27e9A01980B0e42207
```

### Contract Configuration
- Network: Avalanche Fuji Testnet
- Contract: 0x08006F413fbb555eFfcc9A27e9A01980B0e42207
- ABI: Available in `/src/utils/contract.js`

## 🐛 Troubleshooting

### Common Issues

1. **"Cannot connect to MongoDB"**
   - MongoDB Atlas is already configured
   - Check internet connection
   - Verify credentials in .env file

2. **"MetaMask not detected"**
   - Install MetaMask extension
   - Refresh the page

3. **"Network not supported"**
   - Add Avalanche Fuji testnet to MetaMask
   - Switch to Fuji network

4. **"Insufficient funds"**
   - Get test AVAX from faucet
   - Ensure sufficient balance for gas + subscription

5. **"Plan creation fails"**
   - Check MetaMask connection
   - Ensure provider is registered first
   - Verify gas settings

### Backend Logs
Check terminal for API request logs and error details.

### Frontend Logs
Open browser DevTools console for React errors and contract interaction logs.

## 📁 Key Files

### Backend
- `backend/server.js` - Main API server
- `backend/.env` - Configuration

### Frontend
- `src/utils/contract.js` - Blockchain integration
- `src/pages/ProviderOnboarding.tsx` - Provider registration
- `src/pages/ProviderDashboard.tsx` - Plan creation
- `src/pages/Marketplace.tsx` - Plan browsing & subscription

### Automation
- `valtown-cron.ts` - Automated payment processing

## 🎯 MVP Features Completed

✅ Provider registration with wallet connection
✅ Plan creation (database + on-chain)
✅ Marketplace with plan browsing
✅ Subscription functionality with MetaMask
✅ Database tracking of all entities
✅ Automated payment processing ready
✅ Complete TypeScript integration
✅ Error handling and user feedback

## 🚀 Next Steps

1. Test the complete flow
2. Deploy to production (backend + frontend)
3. Set up automated payment processing
4. Add subscription management features
5. Implement provider analytics
6. Add user subscription dashboard