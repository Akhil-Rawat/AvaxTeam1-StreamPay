# 🚀 Deployment Guide

## Quick Start Deployment to The Graph Studio

### 1. Prepare The Graph Studio

1. Go to [The Graph Studio](https://thegraph.com/studio/)
2. Connect your wallet (same wallet used for contract deployment)
3. Create a new subgraph:
   - Name: `subscription-escrow-analytics`
   - Slug: `subscription-escrow-analytics`
   - Network: `arbitrum-sepolia`

### 2. Get Your Deploy Key

After creating the subgraph:
1. Copy your **Deploy Key** from the subgraph dashboard
2. The deploy key looks like: `a1b2c3d4e5f6...`

### 3. Deploy the Subgraph

```bash
# Navigate to the subgraph directory
cd /home/faygo/MVP/subscription-stylus/subscription-escrow-subgraph

# Authenticate with The Graph Studio
graph auth --studio YOUR_DEPLOY_KEY_HERE

# Deploy to The Graph Studio
graph deploy --studio subscription-escrow-analytics
```

### 4. Monitor Deployment

1. The deployment will take a few minutes
2. Watch the progress in your terminal
3. Check the status on The Graph Studio dashboard
4. Once synced, you'll get a GraphQL endpoint URL

### 5. GraphQL Endpoint

After successful deployment, you'll receive:
- **Query URL**: `https://api.studio.thegraph.com/query/[ID]/subscription-escrow-analytics/[VERSION]`
- **Playground**: Available in The Graph Studio for testing queries

## 📝 Example Deployment Commands

```bash
# Full deployment sequence
yarn codegen
yarn build
graph auth --studio abcd1234efgh5678...
graph deploy --studio subscription-escrow-analytics

# If you need to redeploy
yarn build
graph deploy --studio subscription-escrow-analytics --version-label v1.0.1
```

## 🔧 Configuration Verification

Before deploying, verify these settings in `subgraph.yaml`:

```yaml
network: arbitrum-sepolia
source:
  address: "0x403db7aedf27c8f4e59c05656673cec64ea5fb20"
  startBlock: 191531406  # Block when contract was deployed
```

## 📊 Testing Your Deployment

Once deployed, test with this simple query:

```graphql
{
  globalStats(id: "global") {
    totalProviders
    totalPlans
    totalSubscriptions
  }
}
```

## 🚨 Troubleshooting

### Common Issues:

1. **Authentication Failed**
   ```bash
   # Make sure you're using the correct deploy key
   graph auth --studio YOUR_CORRECT_DEPLOY_KEY
   ```

2. **Build Errors**
   ```bash
   # Clean and rebuild
   rm -rf build generated
   yarn codegen
   yarn build
   ```

3. **Network Issues**
   ```bash
   # Verify network in subgraph.yaml
   network: arbitrum-sepolia  # Not arbitrum-one
   ```

4. **Contract Address Wrong**
   - Double-check the contract address in `subgraph.yaml`
   - Verify on Arbiscan Sepolia

### Getting Help:

- Check [The Graph Documentation](https://thegraph.com/docs/)
- Join [The Graph Discord](https://discord.gg/vtvv7FP)
- Review deployment logs in The Graph Studio

## 🎯 Next Steps After Deployment

1. **Test Queries**: Use the GraphQL playground to test queries
2. **Monitor Sync**: Watch indexing progress in The Graph Studio
3. **Frontend Integration**: Use the query URL in your dApp
4. **Set Up Monitoring**: Track subgraph health and performance

## 📈 Provider Dashboard Integration

After deployment, use these endpoints in your frontend:

```javascript
const SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/[ID]/subscription-escrow-analytics/[VERSION]'

// Example: Fetch provider data
const query = `
  query GetProvider($address: String!) {
    provider(id: $address) {
      totalRevenue
      totalSubscriptions
      monthlyRevenue
    }
  }
`

const variables = { address: "0x..." }
const response = await fetch(SUBGRAPH_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, variables })
})
```

## 🔄 Updates and Versioning

When you update the subgraph:

```bash
# Build new version
yarn build

# Deploy with version label
graph deploy --studio subscription-escrow-analytics --version-label v1.1.0
```

The Graph Studio will show version history and allow you to switch between versions.

## ✅ Deployment Checklist

- [ ] Contract deployed and verified on Arbitrum Sepolia
- [ ] The Graph Studio account created
- [ ] Subgraph created in studio
- [ ] Deploy key copied
- [ ] `subgraph.yaml` configured correctly
- [ ] Schema and mappings tested locally
- [ ] Build successful (`yarn build`)
- [ ] Authentication successful (`graph auth`)
- [ ] Deployment successful (`graph deploy`)
- [ ] Indexing completed in studio
- [ ] Test queries working
- [ ] GraphQL endpoint URL saved for frontend
