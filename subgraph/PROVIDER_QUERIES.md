# 📊 Provider Analytics Queries

## Query Endpoint
```
https://api.studio.thegraph.com/query/120327/subscription-escrow-subgraph/v0.0.3
```

## 🏢 Provider Queries

### 1. Get All Providers
```graphql
query GetAllProviders {
  providers {
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
  }
}
```

### 2. Get Specific Provider Details
```graphql
query GetProvider($providerId: ID!) {
  provider(id: $providerId) {
    id
    address
    name
    registeredAt
    totalPlans
    totalSubscriptions
    totalRevenue
    totalEarnings
    monthlyRevenue
    weeklyRevenue
    avgRevenuePerSubscription
    isActive
    lastActivityAt
    firstPlanCreatedAt
  }
}
```

### 3. Provider Dashboard Overview
```graphql
query ProviderDashboard($providerAddress: String!) {
  provider(id: $providerAddress) {
    id
    name
    address
    registeredAt
    totalPlans
    totalSubscriptions
    totalRevenue
    totalEarnings
    monthlyRevenue
    isActive
    lastActivityAt
    
    # Provider's Plans
    plans {
      id
      planId
      price
      interval
      createdAt
      totalSubscriptions
      activeSubscriptions
      totalRevenue
      isPopular
    }
  }
}
```

### 4. Provider with Recent Activity
```graphql
query ProviderWithActivity($providerAddress: String!) {
  provider(id: $providerAddress) {
    id
    name
    totalRevenue
    totalSubscriptions
    
    # Recent earnings
    earnings(
      orderBy: timestamp
      orderDirection: desc
      first: 10
    ) {
      id
      amount
      timestamp
      earningType
      cumulativeEarnings
      
      plan {
        planId
        price
      }
    }
  }
}
```

## 📋 Plan Queries

### 5. All Plans by Provider
```graphql
query ProviderPlans($providerAddress: String!) {
  plans(where: { provider: $providerAddress }) {
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
    
    provider {
      name
      address
    }
  }
}
```

### 6. Top Performing Plans
```graphql
query TopPlans($first: Int = 10) {
  plans(
    orderBy: totalRevenue
    orderDirection: desc
    first: $first
    where: { totalSubscriptions_gt: 0 }
  ) {
    id
    planId
    price
    interval
    totalSubscriptions
    activeSubscriptions
    totalRevenue
    
    provider {
      name
      address
    }
  }
}
```

## 💰 Revenue & Earnings Queries

### 7. Provider Earnings History
```graphql
query ProviderEarnings($providerAddress: String!, $first: Int = 50) {
  providerEarnings(
    where: { provider: $providerAddress }
    orderBy: timestamp
    orderDirection: desc
    first: $first
  ) {
    id
    amount
    timestamp
    transactionHash
    cumulativeEarnings
    earningType
    
    plan {
      planId
      price
      interval
    }
  }
}
```

### 8. Revenue Analytics
```graphql
query RevenueAnalytics($providerAddress: String!) {
  provider(id: $providerAddress) {
    totalRevenue
    totalEarnings
    monthlyRevenue
    weeklyRevenue
    avgRevenuePerSubscription
    
    plans {
      planId
      price
      totalRevenue
      totalSubscriptions
      
      # Calculate revenue per subscription for each plan
      subscriptions {
        totalPaid
        paymentCount
      }
    }
  }
}
```

## 👥 Subscription Queries

### 9. Provider's Subscriptions
```graphql
query ProviderSubscriptions($providerAddress: String!) {
  plans(where: { provider: $providerAddress }) {
    planId
    price
    
    subscriptions {
      id
      subscriptionId
      subscriber
      createdAt
      isActive
      totalPaid
      paymentCount
      subscriptionLength
      status
      lastPaymentAt
      
      payments(first: 5, orderBy: timestamp, orderDirection: desc) {
        amount
        timestamp
        isRecurring
        paymentIndex
      }
    }
  }
}
```

### 10. Active Subscriptions Summary
```graphql
query ActiveSubscriptions($providerAddress: String!) {
  plans(where: { provider: $providerAddress }) {
    planId
    price
    interval
    activeSubscriptions
    
    subscriptions(where: { isActive: true }) {
      id
      subscriber
      createdAt
      totalPaid
      paymentCount
      lastPaymentAt
      nextPaymentDue
    }
  }
}
```

## 📈 Analytics & Metrics Queries

### 11. Provider Performance Metrics
```graphql
query ProviderMetrics($providerAddress: String!) {
  provider(id: $providerAddress) {
    name
    totalPlans
    totalSubscriptions
    totalRevenue
    avgRevenuePerSubscription
    
    # Plan performance
    plans {
      planId
      price
      totalSubscriptions
      activeSubscriptions
      totalRevenue
      subscriptionRate
      churnRate
      
      # Subscription lifecycle metrics
      subscriptions {
        subscriptionLength
        paymentCount
        totalPaid
        status
      }
    }
  }
}
```

### 12. Recent Payments for Provider
```graphql
query ProviderPayments($providerAddress: String!, $first: Int = 20) {
  payments(
    where: { 
      subscription_: { 
        plan_: { provider: $providerAddress } 
      } 
    }
    orderBy: timestamp
    orderDirection: desc
    first: $first
  ) {
    id
    amount
    timestamp
    isRecurring
    paymentIndex
    protocolFee
    providerAmount
    
    subscription {
      subscriptionId
      subscriber
      
      plan {
        planId
        price
      }
    }
  }
}
```

## 🔍 Search & Filter Queries

### 13. Search Providers by Name
```graphql
query SearchProviders($searchTerm: String!) {
  providers(
    where: { name_contains_nocase: $searchTerm }
    orderBy: totalRevenue
    orderDirection: desc
  ) {
    id
    name
    address
    totalPlans
    totalSubscriptions
    totalRevenue
    isActive
  }
}
```

### 14. Filter Plans by Price Range
```graphql
query PlansByPriceRange($minPrice: BigDecimal!, $maxPrice: BigDecimal!, $providerAddress: String!) {
  plans(
    where: {
      provider: $providerAddress
      price_gte: $minPrice
      price_lte: $maxPrice
    }
    orderBy: price
    orderDirection: asc
  ) {
    id
    planId
    price
    interval
    totalSubscriptions
    activeSubscriptions
    totalRevenue
  }
}
```

## 📊 Example Usage with Variables

### Query Variables Examples:

```json
{
  "providerAddress": "0x...your_provider_address...",
  "providerId": "0x...your_provider_address...",
  "first": 10,
  "minPrice": "1000000000000000000",
  "maxPrice": "10000000000000000000",
  "searchTerm": "provider"
}
```

## 🚀 How to Use These Queries

1. **GraphQL Playground**: Use The Graph Studio playground
2. **Frontend Integration**: Use with Apollo Client, urql, or fetch
3. **Analytics Dashboard**: Build provider dashboard with these queries
4. **Real-time Updates**: Queries automatically reflect blockchain data

## 📝 Testing Your Queries

Since you just registered a provider, start with:

```graphql
query TestProvider {
  providers {
    id
    name
    address
    registeredAt
    totalPlans
    isActive
  }
}
```

This should show your newly registered provider!
