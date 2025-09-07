# StreamPay GraphQL Subgraph

## 🚀 Overview
GraphQL subgraph for StreamPay provider analytics and transaction tracking.

## 📋 Subgraph Details
- **Network**: Arbitrum Sepolia
- **Contract**: `0xe65365Ea1cfb28dafD5fF6246a2E2A124A13093B`
- **Version**: v0.0.4
- **Studio**: The Graph Studio

## 🔧 Provider Analytics Features
### 📊 Real-time Tracking
- All payments received by providers
- Subscription analytics and metrics  
- User transaction history
- Revenue tracking and reporting

### 💰 Financial Insights
- Total earnings per provider
- Monthly/weekly revenue breakdown
- Protocol fee analysis
- Payment volume trends

## 🛠️ Core Entities
```graphql
type Provider {
  id: ID!
  address: Bytes!
  name: String!
  totalEarnings: BigDecimal!
  totalSubscriptions: BigInt!
  plans: [Plan!]!
}

type Payment {
  id: ID!
  from: Bytes!
  to: Bytes!
  amount: BigDecimal!
  timestamp: BigInt!
  subscription: UserSubscription!
}

type ProviderEarning {
  id: ID!
  provider: Provider!
  amount: BigDecimal!
  timestamp: BigInt!
}
```

## 📈 Provider Analytics Queries

### Get Provider Earnings
```graphql
query ProviderEarnings($provider: String!) {
  providerEarnings(
    where: { provider: $provider }
    orderBy: timestamp
    orderDirection: desc
  ) {
    amount
    timestamp
    transactionHash
  }
}
```

### Get All Payments to Provider
```graphql
query ProviderPayments($provider: String!) {
  payments(
    where: { to: $provider }
    orderBy: timestamp  
    orderDirection: desc
  ) {
    from
    amount
    timestamp
    transactionHash
  }
}
```

### Provider Dashboard
```graphql
query ProviderDashboard($provider: String!) {
  provider(id: $provider) {
    name
    totalEarnings
    totalSubscriptions
    plans {
      price
      totalSubscriptions
    }
  }
}
```

## 🚀 Deployment

### Prerequisites
```bash
npm install -g @graphprotocol/graph-cli
```

### Deploy to The Graph Studio
```bash
# Generate types
graph codegen

# Build
graph build

# Deploy
graph deploy --studio subscription-escrow-subgraph
```

## 📊 Usage Examples

### Frontend Integration
```javascript
import { gql, useQuery } from '@apollo/client';

const GET_PROVIDER_EARNINGS = gql`
  query GetProviderEarnings($provider: String!) {
    providerEarnings(where: { provider: $provider }) {
      amount
      timestamp
    }
  }
`;

function ProviderDashboard({ providerAddress }) {
  const { data } = useQuery(GET_PROVIDER_EARNINGS, {
    variables: { provider: providerAddress }
  });
  
  return (
    <div>
      {data?.providerEarnings.map(earning => (
        <div key={earning.timestamp}>
          Earned: {earning.amount} ETH
        </div>
      ))}
    </div>
  );
}
```

## 🔧 Configuration
- **Start Block**: Latest deployment block
- **Network**: arbitrum-sepolia
- **Events**: All provider-related events tracked

See `/smart-contract` folder for contract details.
