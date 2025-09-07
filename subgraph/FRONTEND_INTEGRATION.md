# 🔄 Frontend Integration Guide

## 📱 Complete User Subscription Flow

### **1. Frontend Subscription Function**

```javascript
// Complete subscription integration
const subscribeToService = async (planId, ethAmount) => {
  try {
    // Step 1: Get plan details first
    const planData = await queryPlanDetails(planId);
    
    // Step 2: Check user balance vs plan price
    const userBalance = await contract.get_user_balance(userAddress);
    const planPrice = planData.plan.price;
    
    // Step 3: Calculate total needed (escrow + direct payment)
    const totalNeeded = parseFloat(planPrice) - parseFloat(userBalance);
    
    // Step 4: Call subscribe with payment
    const tx = await contract.subscribe(planId, {
      value: ethers.parseEther(ethAmount.toString()),
      gasLimit: 500000
    });
    
    // Step 5: Wait for confirmation
    const receipt = await tx.wait();
    
    // Step 6: Query subgraph for updated data
    const subscriptionData = await fetchNewSubscription(receipt.transactionHash);
    
    return {
      success: true,
      subscriptionId: subscriptionData.subscriptionId,
      transactionHash: receipt.transactionHash
    };
    
  } catch (error) {
    console.error("Subscription failed:", error);
    return { success: false, error: error.message };
  }
};

// Helper: Query plan details
const queryPlanDetails = async (planId) => {
  const query = `
    query GetPlan($planId: String!) {
      plan(id: $planId) {
        planId
        price
        interval
        provider {
          name
          address
        }
      }
    }
  `;
  
  const response = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      query, 
      variables: { planId } 
    })
  });
  
  return response.json();
};

// Helper: Fetch new subscription after transaction
const fetchNewSubscription = async (txHash) => {
  // Wait a bit for subgraph to index
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const query = `
    query GetPaymentByTx($txHash: Bytes!) {
      payments(where: { transactionHash: $txHash }) {
        subscription {
          subscriptionId
          subscriber
          isActive
          plan {
            planId
            price
            provider {
              name
            }
          }
        }
      }
    }
  `;
  
  const response = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      query, 
      variables: { txHash } 
    })
  });
  
  const data = await response.json();
  return data.data.payments[0]?.subscription;
};
```

### **2. React Subscription Component**

```jsx
import React, { useState } from 'react';
import { ethers } from 'ethers';

const SubscriptionForm = ({ planId, planPrice, planInterval }) => {
  const [ethAmount, setEthAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      const result = await subscribeToService(planId, ethAmount);
      
      if (result.success) {
        setSuccess({
          subscriptionId: result.subscriptionId,
          message: 'Subscription created successfully!'
        });
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert(`Transaction failed: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="subscription-form">
      <h3>Subscribe to Service</h3>
      <p>Plan Price: {planPrice} ETH</p>
      <p>Billing Interval: {planInterval} seconds</p>
      
      <input
        type="number"
        step="0.001"
        placeholder="ETH Amount"
        value={ethAmount}
        onChange={(e) => setEthAmount(e.target.value)}
      />
      
      <button 
        onClick={handleSubscribe}
        disabled={loading || !ethAmount}
      >
        {loading ? 'Processing...' : 'Subscribe'}
      </button>
      
      {success && (
        <div className="success">
          {success.message}
          <br />
          Subscription ID: {success.subscriptionId}
        </div>
      )}
    </div>
  );
};
```

### **3. Provider Dashboard Integration**

```javascript
// Provider dashboard data fetching
const useProviderDashboard = (providerAddress) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch provider overview
        const overviewData = await fetchProviderOverview(providerAddress);
        
        // Fetch recent earnings
        const earningsData = await fetchProviderEarnings(providerAddress);
        
        // Fetch active subscriptions
        const subscriptionsData = await fetchActiveSubscriptions(providerAddress);
        
        setData({
          overview: overviewData.data.provider,
          earnings: earningsData.data.providerEarnings,
          subscriptions: subscriptionsData.data.userSubscriptions
        });
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [providerAddress]);

  return { data, loading };
};

// Provider Dashboard Component
const ProviderDashboard = ({ providerAddress }) => {
  const { data, loading } = useProviderDashboard(providerAddress);

  if (loading) return <div>Loading dashboard...</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div className="provider-dashboard">
      <div className="overview">
        <h2>{data.overview.name}</h2>
        <div className="metrics">
          <div>Total Revenue: {data.overview.totalRevenue} ETH</div>
          <div>Active Subscriptions: {data.overview.totalSubscriptions}</div>
          <div>Total Plans: {data.overview.totalPlans}</div>
        </div>
      </div>
      
      <div className="recent-earnings">
        <h3>Recent Earnings</h3>
        {data.earnings.map(earning => (
          <div key={earning.id}>
            +{earning.amount} ETH - {new Date(earning.timestamp * 1000).toLocaleString()}
          </div>
        ))}
      </div>
      
      <div className="active-subscriptions">
        <h3>Active Subscriptions</h3>
        {data.subscriptions.map(sub => (
          <div key={sub.id}>
            Subscription #{sub.subscriptionId} - {sub.totalPaid} ETH paid
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🎯 **Key Integration Points**

### **1. Subscription Flow Events**
Your contract emits these events when `subscribe()` is called:
- `SubscriptionCreated` → Creates subscription entity
- `PaymentProcessed` → Records first payment  
- `ProviderEarnings` → Tracks provider earnings

### **2. Real-time Updates**
```javascript
// Listen for new subscriptions
const subscribeToEvents = (providerAddress) => {
  // Set up contract event listeners
  contract.on("SubscriptionCreated", (subscriptionId, user, planId, event) => {
    console.log("New subscription:", { subscriptionId, user, planId });
    
    // Refresh dashboard data
    refreshProviderDashboard(providerAddress);
  });

  contract.on("PaymentProcessed", (from, to, amount, subscriptionId, event) => {
    if (to.toLowerCase() === providerAddress.toLowerCase()) {
      console.log("Payment received:", { amount, subscriptionId });
      
      // Update earnings display
      refreshEarnings(providerAddress);
    }
  });
};
```

### **3. Recurring Payment Monitoring**
```javascript
// Check for upcoming payments
const checkUpcomingPayments = async (subscriptionId) => {
  const query = `
    query GetSubscription($id: String!) {
      userSubscription(id: $id) {
        nextPaymentDue
        lastPaymentAt
        isActive
        plan {
          interval
          price
        }
      }
    }
  `;
  
  const response = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { id: subscriptionId } })
  });
  
  const data = await response.json();
  const subscription = data.data.userSubscription;
  
  const nextPayment = new Date(subscription.nextPaymentDue * 1000);
  const now = new Date();
  
  if (nextPayment <= now) {
    return { paymentDue: true, amount: subscription.plan.price };
  }
  
  return { paymentDue: false, nextPayment };
};
```

This integration gives you:
✅ **Real-time subscription tracking**
✅ **Provider earnings analytics** 
✅ **Payment history monitoring**
✅ **Automated recurring payment detection**
✅ **Complete dashboard functionality**
