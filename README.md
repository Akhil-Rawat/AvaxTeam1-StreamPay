# StreamPay - Web3 Subscription Payments Platform ( Drop To Bottom for Manual Smart Contract Testing ) 

A modern, minimal React frontend for managing trustless recurring payments on Web3.

## Features

- **Landing Page**: Hero section with clear CTAs and wallet connection
- **Provider Onboarding**: Complete registration flow for service providers
- **Provider Dashboard**: Earnings tracking, plan management, and subscriber analytics
- **Marketplace**: Browse and subscribe to available plans
- **Wallet Management**: Escrow balance tracking and deposit/withdrawal functionality
- **Subscription Management**: View active subscriptions and payment history

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS with custom design system
- **UI Components**: Custom components with Headless UI
- **Charts**: Recharts for earnings visualization
- **Wallet**: Placeholder hooks ready for Wagmi/RainbowKit integration
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, Input, etc.)
│   ├── Layout.tsx      # Main layout with navigation
│   ├── PlanCard.tsx    # Plan display component
│   ├── StatsCard.tsx   # Statistics display component
│   └── EarningsChart.tsx # Earnings visualization
├── pages/              # Page components
│   ├── Landing.tsx     # Landing page
│   ├── ProviderOnboarding.tsx # Provider registration
│   ├── ProviderDashboard.tsx  # Provider dashboard
│   ├── Marketplace.tsx # Plan marketplace
│   ├── Wallet.tsx      # Wallet management
│   └── Subscriptions.tsx # Subscription management
├── hooks/              # Custom React hooks
│   ├── useContract.ts  # Contract interaction hooks
│   └── useWallet.ts    # Wallet connection hooks
├── services/           # API services
│   └── mockApi.ts      # Mock API for development
├── types/              # TypeScript type definitions
│   └── index.ts        # Core types
└── utils/              # Utility functions
```

## Integration Guide

### Smart Contract Integration

Replace the placeholder hooks in `src/hooks/useContract.ts` with real contract calls:

1. **Contract Address**: Add your deployed contract address
2. **ABI**: Import your contract ABI
3. **Provider**: Configure your Web3 provider (Wagmi recommended)

Example integration:
```typescript
// Replace placeholder in useStreamPayContract hook
const createPlan = async (price: string) => {
  const { writeContract } = useWriteContract();
  return writeContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'createPlan',
    args: [parseEther(price)],
  });
};
```

### Wallet Integration

Replace the mock wallet hook in `src/hooks/useWallet.ts` with Wagmi/RainbowKit:

```typescript
// Install and configure
npm install @rainbow-me/rainbowkit wagmi viem

// Use wagmi hooks
const { address, isConnected } = useAccount();
const { connect } = useConnect();
```

### API Integration

Replace `src/services/mockApi.ts` with real API calls:

1. **TheGraph**: For indexing on-chain events
2. **IPFS**: For storing plan metadata
3. **Backend API**: For user profiles and off-chain data

### Environment Variables

Create a `.env` file with:
```
VITE_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=1
VITE_INFURA_PROJECT_ID=...
VITE_WALLET_CONNECT_PROJECT_ID=...
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Connect your wallet** and explore the platform

## Production Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy** the `dist` folder to your hosting provider

## Key Integration Points

- **Contract Hooks**: All contract interactions are centralized in `useStreamPayContract`
- **Mock API**: Replace with real API endpoints in `mockApi.ts`
- **Types**: Extend types in `src/types/index.ts` as needed
- **Toast Notifications**: Already configured for success/error feedback

## Design System

- **Colors**: Blue primary (#3B82F6), Purple secondary (#8B5CF6), Green accent (#10B981)
- **Typography**: System fonts with proper hierarchy
- **Spacing**: 8px base grid system
- **Components**: Accessible, consistent UI components
- **Responsive**: Mobile-first design with proper breakpoints

The platform is designed to be production-ready with minimal additional configuration once integrated with your smart contracts and backend services.


