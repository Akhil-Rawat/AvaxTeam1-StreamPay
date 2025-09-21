# StreamPay

**Trustless recurring payments on blockchain**

StreamPay revolutionizes subscription payments by leveraging smart contracts for secure, automated, and transparent recurring transactions. Built for creators, businesses, and developers who want to escape traditional payment processor limitations.

## 🌟 Features

- **Trustless Escrow**: Smart contract-based payment security
- **No Chargebacks**: Immutable blockchain transactions
- **Lower Fees**: Direct peer-to-peer payments without intermediaries
- **Global Access**: Accept payments from anywhere in the world
- **Real-time Analytics**: Track earnings and subscriber metrics
- **Instant Settlement**: Payments processed directly on-chain

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- MetaMask or compatible Web3 wallet
- Avalanche Fuji testnet AVAX

### Installation

```bash
# Clone the repository
git clone https://github.com/Akhil-Rawat/AvaxTeam1-StreamPay.git
cd AvaxTeam1-StreamPay/StreamPay-arbitrum

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Start the API server
npm start
```

## 🏗️ Architecture

**Frontend**: React + TypeScript + Vite + Tailwind CSS  
**Backend**: Node.js + Express + MongoDB  
**Blockchain**: Avalanche Fuji Testnet  
**Smart Contracts**: Solidity + Foundry  

### Smart Contract

Deployed on Avalanche Fuji: `0x08006F413fbb555eFfcc9A27e9A01980B0e42207`

## 🎯 How It Works

### For Providers
1. Connect your wallet and register as a provider
2. Create subscription plans with custom pricing
3. Share your plans with subscribers
4. Receive automatic payments through escrow

### For Subscribers
1. Browse available subscription plans
2. Deposit AVAX into the secure escrow contract
3. Subscribe to plans with one-click transactions
4. Manage your subscriptions through the dashboard

## 🛠️ Development

### Smart Contract Development

```bash
# Compile contracts
forge build

# Run tests
forge test

# Deploy to testnet
forge script script/Deploy.s.sol --rpc-url $AVALANCHE_FUJI_RPC --private-key $PRIVATE_KEY --broadcast
```

### Frontend Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
StreamPay-arbitrum/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Application pages
│   ├── hooks/             # Custom React hooks
│   └── contracts/         # Contract configurations
├── backend/               # Express.js API server
├── contracts/             # Smart contract source
├── script/                # Deployment scripts
└── subgraph/             # The Graph protocol integration
```

## 🌐 Live Demo

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Contract**: [View on SnowTrace](https://testnet.snowtrace.io/address/0x08006F413fbb555eFfcc9A27e9A01980B0e42207)

## 🔧 Configuration

### Environment Variables

Create `.env` file in the root directory:

```env
VITE_CONTRACT_ADDRESS=0x08006F413fbb555eFfcc9A27e9A01980B0e42207
VITE_AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
MONGODB_URI=your_mongodb_connection_string
```

### Network Configuration

The application is configured for Avalanche Fuji testnet:
- **Network Name**: Avalanche Fuji C-Chain
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Chain ID**: 43113
- **Symbol**: AVAX

## 🎨 UI Components

Built with modern Web3 design principles:
- Gradient backgrounds and animations
- Interactive hover effects
- Responsive design for all devices
- shadcn/ui component library
- Tailwind CSS for styling

## 🧪 Testing

```bash
# Run smart contract tests
forge test

# Run frontend tests
npm test

# Test API endpoints
npm run test:api
```

## 📊 Analytics

The platform includes comprehensive analytics:
- Provider earnings tracking
- Subscriber metrics
- Payment history
- Plan performance insights

## 🔐 Security

- Smart contract audited for common vulnerabilities
- Escrow-based payment protection
- No custody of user funds
- Open source and verifiable

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests for any improvements.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](docs/)
- [Smart Contract](https://testnet.snowtrace.io/address/0x08006F413fbb555eFfcc9A27e9A01980B0e42207)
- [Demo Video](https://example.com)

---

**Built with ❤️ for the decentralized future**
