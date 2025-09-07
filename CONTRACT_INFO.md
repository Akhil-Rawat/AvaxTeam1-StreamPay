# StreamPay Production Contract Information

## 🚀 Current Deployment

### Contract Details
- **Address**: `0xe65365Ea1cfb28dafD5fF6246a2E2A124A13093B`
- **Network**: Arbitrum Sepolia
- **Language**: Rust (Stylus)
- **Size**: 23.6 KiB
- **Protocol Fee**: 2.5%

### RPC Endpoints
- **Primary**: `https://sepolia-rollup.arbitrum.io/rpc`
- **Backup**: `https://arbitrum-sepolia.gateway.pokt.network/v1/lb/`

### Key Features
✅ Hybrid Escrow System  
✅ Provider Registration  
✅ Flexible Subscriptions  
✅ Auto-recurring Payments  
✅ Emergency Withdrawals  
✅ Real-time Analytics  

## 📁 Repository Structure

### `/smart-contract/` 
Production-ready Stylus contract with:
- `lib.rs` - Main contract code
- `Cargo.toml` - Dependencies
- `abi.json` - Contract ABI
- `deploy.sh` - Deployment script
- `README.md` - Documentation

### `/subgraph/`
GraphQL subgraph for analytics with:
- Provider earnings tracking
- Payment history
- Subscription analytics  
- Real-time dashboards
- `README.md` - Documentation

## 🛠️ Quick Setup

### Deploy Contract
```bash
cd smart-contract
./deploy.sh YOUR_PRIVATE_KEY
```

### Deploy Subgraph  
```bash
cd subgraph
npm install
graph deploy --studio subscription-escrow-subgraph
```

### Frontend Integration
```javascript
const CONTRACT_ADDRESS = "0xe65365Ea1cfb28dafD5fF6246a2E2A124A13093B";
const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
```

## 📊 Provider Analytics

Use the subgraph to track:
- All payments to your wallet
- Subscription revenue
- User engagement
- Financial reports

Query endpoint available at The Graph Studio.

## 🔒 Security & Testing

✅ Comprehensive test coverage  
✅ Manual testing verified  
✅ Production deployment ready  
✅ Event logging for analytics  
✅ Reentrancy protection  

## 📞 Support

For technical support or questions:
- Check `/smart-contract/README.md`
- Check `/subgraph/README.md` 
- Review contract source code
- Test on Arbitrum Sepolia first
