# Provider Analytics Dashboard Queries

## 📊 **Provider Overview Query**

Get all provider analytics for a specific provider:

```graphql
query ProviderDashboard($providerAddress: String!) {
  provider(id: $providerAddress) {
    id
    address
    name
    registeredAt
    totalPlans
    totalSubscriptions
    totalRevenue
    totalEarnings
    isActive
    lastActivityAt
    monthlyRevenue
    weeklyRevenue
    avgRevenuePerSubscription
    
    plans {
      id
      planId
      price
      interval
      createdAt
      totalSubscriptions
      activeSubscriptions
      totalRevenue
      subscriptionRate
      avgSubscriptionLength
      churnRate
      isPopular
    }
    
    earnings(orderBy: timestamp, orderDirection: desc, first: 20) {
      id
      amount
      timestamp
      transactionHash
      blockNumber
      earningType
      plan {
        id
        price
      }
    }
  }
}
```

## 💰 **Provider Transaction History**

Get all payments received by a provider:

```graphql
query ProviderTransactions($providerAddress: Bytes!, $first: Int = 50) {
  payments(
    where: { to: $providerAddress }
    orderBy: timestamp
    orderDirection: desc
    first: $first
  ) {
    id
    from
    to
    amount
    timestamp
    transactionHash
    blockNumber
    subscription {
      id
      subscriptionId
      subscriber
      plan {
        id
        price
        interval
      }
    }
    providerAmount
    protocolFee
    isRecurring
    paymentIndex
  }
}
```

## 📈 **Provider Earnings Analysis**

Get detailed earnings breakdown:

```graphql
query ProviderEarningsAnalysis($providerAddress: String!) {
  providerEarnings(
    where: { provider: $providerAddress }
    orderBy: timestamp
    orderDirection: desc
    first: 100
  ) {
    id
    provider
    amount
    timestamp
    transactionHash
    blockNumber
    cumulativeEarnings
    earningType
    plan {
      id
      planId
      price
      interval
      totalSubscriptions
      activeSubscriptions
    }
  }
}
```

## 👥 **Provider Subscribers**

Get all subscribers for a provider's plans:

```graphql
query ProviderSubscribers($providerAddress: String!) {
  provider(id: $providerAddress) {
    plans {
      id
      planId
      price
      interval
      subscriptions(orderBy: createdAt, orderDirection: desc) {
        id
        subscriptionId
        subscriber
        createdAt
        isActive
        lastPaymentAt
        nextPaymentDue
        totalPaid
        paymentCount
        status
        subscriptionLength
        avgPaymentAmount
        
        payments(orderBy: timestamp, orderDirection: desc, first: 5) {
          id
          amount
          timestamp
          transactionHash
        }
      }
    }
  }
}
```

## 🎯 **Real-time Provider Dashboard**

Combined query for complete dashboard:

```graphql
query ProviderCompleteDashboard($providerAddress: String!) {
  provider(id: $providerAddress) {
    # Provider Info
    id
    address
    name
    registeredAt
    totalPlans
    totalSubscriptions
    totalRevenue
    totalEarnings
    isActive
    lastActivityAt
    
    # Recent Plans
    plans(first: 10, orderBy: createdAt, orderDirection: desc) {
      id
      planId
      price
      interval
      totalSubscriptions
      activeSubscriptions
      totalRevenue
    }
    
    # Recent Earnings (last 20)
    earnings(first: 20, orderBy: timestamp, orderDirection: desc) {
      id
      amount
      timestamp
      transactionHash
      earningType
    }
  }
  
  # Recent payments to this provider
  payments(
    where: { to: $providerAddress }
    first: 20
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    from
    amount
    timestamp
    transactionHash
    subscription {
      subscriptionId
      plan {
        planId
        price
      }
    }
  }
  
  # Active subscriptions to provider's plans
  userSubscriptions(
    where: { 
      plan_in: [] # This will be populated with provider's plan IDs
      isActive: true 
    }
    first: 50
    orderBy: createdAt
    orderDirection: desc
  ) {
    id
    subscriptionId
    subscriber
    createdAt
    totalPaid
    paymentCount
    status
    plan {
      planId
      price
      interval
    }
  }
}
```

## 🔍 **Usage Examples**

### JavaScript/TypeScript Usage:

```javascript
// Query provider dashboard
const PROVIDER_DASHBOARD = gql`
  query ProviderDashboard($providerAddress: String!) {
    provider(id: $providerAddress) {
      totalRevenue
      totalEarnings
      totalSubscriptions
      earnings(first: 20, orderBy: timestamp, orderDirection: desc) {
        amount
        timestamp
        transactionHash
      }
    }
    payments(where: { to: $providerAddress }, first: 20) {
      from
      amount
      timestamp
      transactionHash
    }
  }
`;

// Example usage
const { data } = await apolloClient.query({
  query: PROVIDER_DASHBOARD,
  variables: {
    providerAddress: "0x23316A7AF939a09c0Ee9A57Dece71ba7f2A0F996"
  }
});

console.log("Total Earnings:", data.provider.totalEarnings);
console.log("Recent Payments:", data.payments);
```

## 🎨 **React Dashboard Component**

```tsx
import { useQuery } from '@apollo/client';

const ProviderDashboard = ({ providerAddress }) => {
  const { data, loading, error } = useQuery(PROVIDER_DASHBOARD, {
    variables: { providerAddress },
    pollInterval: 10000 // Update every 10 seconds
  });

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const provider = data.provider;
  const payments = data.payments;

  return (
    <div className="provider-dashboard">
      <h2>Provider Analytics</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>{provider.totalRevenue} ETH</p>
        </div>
        
        <div className="stat-card">
          <h3>Total Earnings</h3>
          <p>{provider.totalEarnings} ETH</p>
        </div>
        
        <div className="stat-card">
          <h3>Subscribers</h3>
          <p>{provider.totalSubscriptions}</p>
        </div>
      </div>
      
      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        {payments.map(payment => (
          <div key={payment.id} className="transaction-row">
            <span>From: {payment.from}</span>
            <span>Amount: {payment.amount} ETH</span>
            <span>Time: {new Date(payment.timestamp * 1000).toLocaleString()}</span>
            <a href={`https://sepolia.arbiscan.io/tx/${payment.transactionHash}`} 
               target="_blank">View Tx</a>
          </div>
        ))}
      </div>
    </div>
  );
};
```
