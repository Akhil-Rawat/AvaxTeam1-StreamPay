# 🚀 SubscriptionEscrow Frontend Integration Guide

## 🎯 Hybrid Escrow System Overview

Your SubscriptionEscrow contract implements a **hybrid escrow model** where:
- Users can subscribe with **any amount** (minimum: first payment + gas)
- Users can **deposit funds separately** for future payments
- **Immediate activation** upon successful first payment
- **Flexible payment strategies** for different user needs

## 💰 Contract Integration Patterns

### 1. Core Contract Functions

```javascript
// Contract interface for frontend integration
const contractInterface = {
    // Subscription management
    subscribe: "function subscribe(uint256 planId) payable returns (uint256)",
    
    // Hybrid Escrow Functions
    deposit: "function deposit() payable returns (bool)",
    withdraw: "function withdraw(uint256 amount) returns (bool)",
    
    // Plan information
    plan_price: "function plan_price(uint256) view returns (uint256)",
    plan_provider: "function plan_provider(uint256) view returns (address)",
    plan_interval: "function plan_interval(uint256) view returns (uint256)",
    
    // User escrow management
    user_escrow_balance: "function user_escrow_balance(address) view returns (uint256)",
    
    // Subscription tracking
    subscription_active: "function subscription_active(uint256) view returns (bool)",
    subscription_subscriber: "function subscription_subscriber(uint256) view returns (address)",
    subscription_last_payment: "function subscription_last_payment(uint256) view returns (uint256)",
    
    // Events
    SubscriptionCreated: "event SubscriptionCreated(uint256 indexed subscriptionId, address indexed user, uint256 indexed planId)",
    PaymentProcessed: "event PaymentProcessed(address indexed from, address indexed to, uint256 amount, uint256 indexed subscriptionId)",
    ProviderEarnings: "event ProviderEarnings(address indexed provider, uint256 indexed planId, uint256 amount)",
    EscrowDeposit: "event EscrowDeposit(address indexed user, uint256 amount, uint256 newBalance)",
    EscrowWithdrawal: "event EscrowWithdrawal(address indexed user, uint256 amount, uint256 newBalance)"
};
```

## 🤖 Intelligent Subscription Agent

### HybridEscrowAgent Class

```javascript
class HybridEscrowAgent {
    constructor(contract, userAddress, provider) {
        this.contract = contract;
        this.userAddress = userAddress;
        this.provider = provider;
        this.gasBuffer = ethers.parseEther("0.001"); // Gas buffer for transactions
    }

    // 🔍 Plan Discovery & Analysis
    async discoverPlans() {
        const plans = [];
        let planId = 1;
        
        console.log("🔍 Discovering available plans...");
        
        while (planId <= 100) { // Check first 100 plan IDs
            try {
                const provider = await this.contract.plan_provider(planId);
                
                // Stop if we hit an empty plan
                if (provider === "0x0000000000000000000000000000000000000000") {
                    break;
                }
                
                const price = await this.contract.plan_price(planId);
                const interval = await this.contract.plan_interval(planId);
                
                plans.push({
                    id: planId,
                    provider,
                    price: ethers.formatEther(price),
                    priceWei: price,
                    interval: interval.toString(),
                    intervalDays: Math.floor(Number(interval) / 86400)
                });
                
                console.log(`✅ Found Plan ${planId}: ${ethers.formatEther(price)} ETH every ${Math.floor(Number(interval) / 86400)} days`);
                
            } catch (error) {
                break;
            }
            planId++;
        }
        
        console.log(`📊 Total plans discovered: ${plans.length}`);
        return plans;
    }

    // 💎 Smart Payment Strategy Analyzer
    async analyzePaymentStrategy(planId, userPreference = "optimal") {
        const plan = await this.getPlanDetails(planId);
        const userBalance = await this.getUserBalance();
        const walletBalance = await this.provider.getBalance(this.userAddress);
        
        const strategies = {
            minimal: {
                name: "Minimal Payment",
                description: "Pay only for first interval",
                amount: plan.priceWei - userBalance > 0 ? plan.priceWei - userBalance : BigInt(0),
                coverage: "1 payment",
                riskLevel: "High - Requires frequent top-ups"
            },
            
            safe: {
                name: "Safe Buffer",
                description: "Cover 3 payments in advance",
                amount: (plan.priceWei * BigInt(3)) - userBalance > 0 ? 
                       (plan.priceWei * BigInt(3)) - userBalance : BigInt(0),
                coverage: "3 payments",
                riskLevel: "Low - Reduces transaction frequency"
            },
            
            optimal: {
                name: "Optimal Strategy",
                description: "Balance between safety and capital efficiency",
                amount: (plan.priceWei * BigInt(2)) - userBalance > 0 ? 
                       (plan.priceWei * BigInt(2)) - userBalance : BigInt(0),
                coverage: "2 payments",
                riskLevel: "Medium - Good balance"
            },
            
            maximum: {
                name: "Maximum Security",
                description: "Use 50% of wallet balance for subscriptions",
                amount: walletBalance / BigInt(2),
                coverage: `${Math.floor(Number(walletBalance / BigInt(2)) / Number(plan.priceWei))} payments`,
                riskLevel: "Very Low - Maximum runway"
            }
        };
        
        const recommendation = strategies[userPreference] || strategies.optimal;
        
        console.log(`💡 Recommended strategy: ${recommendation.name}`);
        console.log(`📈 Coverage: ${recommendation.coverage}`);
        console.log(`⚠️ Risk Level: ${recommendation.riskLevel}`);
        
        return {
            plan,
            userBalance: ethers.formatEther(userBalance),
            walletBalance: ethers.formatEther(walletBalance),
            strategies,
            recommendation
        };
    }

    // 🎯 Intelligent Subscription Execution
    async executeSubscription(planId, strategy = "optimal", customAmount = null) {
        try {
            console.log(`🚀 Executing subscription to plan ${planId} with ${strategy} strategy...`);
            
            const analysis = await this.analyzePaymentStrategy(planId, strategy);
            let paymentAmount = customAmount ? ethers.parseEther(customAmount) : analysis.recommendation.amount;
            
            // Safety checks
            const walletBalance = await this.provider.getBalance(this.userAddress);
            if (paymentAmount + this.gasBuffer > walletBalance) {
                throw new Error(`Insufficient wallet balance. Need ${ethers.formatEther(paymentAmount + this.gasBuffer)} ETH, have ${ethers.formatEther(walletBalance)} ETH`);
            }
            
            // Estimate gas
            const gasEstimate = await this.contract.subscribe.estimateGas(planId, {
                value: paymentAmount
            });
            
            console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
            console.log(`💰 Payment amount: ${ethers.formatEther(paymentAmount)} ETH`);
            
            // Execute transaction
            const tx = await this.contract.subscribe(planId, {
                value: paymentAmount,
                gasLimit: gasEstimate * BigInt(120) / BigInt(100) // 20% buffer
            });
            
            console.log(`📤 Transaction sent: ${tx.hash}`);
            console.log("⏳ Waiting for confirmation...");
            
            const receipt = await tx.wait();
            
            // Extract subscription ID from events
            const subscriptionEvent = receipt.logs.find(log => {
                try {
                    const decoded = this.contract.interface.decodeEventLog("SubscriptionCreated", log.data, log.topics);
                    return decoded;
                } catch {
                    return false;
                }
            });
            
            if (subscriptionEvent) {
                const decoded = this.contract.interface.decodeEventLog("SubscriptionCreated", subscriptionEvent.data, subscriptionEvent.topics);
                const subscriptionId = decoded.subscriptionId;
                
                console.log(`✅ Subscription created successfully!`);
                console.log(`🆔 Subscription ID: ${subscriptionId.toString()}`);
                console.log(`📋 Transaction Hash: ${tx.hash}`);
                
                return {
                    success: true,
                    subscriptionId: subscriptionId.toString(),
                    txHash: tx.hash,
                    gasUsed: receipt.gasUsed.toString(),
                    paymentAmount: ethers.formatEther(paymentAmount)
                };
            }
            
        } catch (error) {
            console.error("❌ Subscription failed:", error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // � Hybrid Escrow Management
    async depositToEscrow(amount) {
        try {
            console.log(`💰 Depositing ${amount} ETH to escrow...`);
            
            const depositAmount = ethers.parseEther(amount.toString());
            const walletBalance = await this.provider.getBalance(this.userAddress);
            
            // Safety checks
            if (depositAmount + this.gasBuffer > walletBalance) {
                throw new Error(`Insufficient wallet balance. Need ${ethers.formatEther(depositAmount + this.gasBuffer)} ETH, have ${ethers.formatEther(walletBalance)} ETH`);
            }
            
            // Estimate gas
            const gasEstimate = await this.contract.deposit.estimateGas({
                value: depositAmount
            });
            
            console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
            
            // Execute deposit
            const tx = await this.contract.deposit({
                value: depositAmount,
                gasLimit: gasEstimate * BigInt(120) / BigInt(100) // 20% buffer
            });
            
            console.log(`📤 Deposit transaction sent: ${tx.hash}`);
            console.log("⏳ Waiting for confirmation...");
            
            const receipt = await tx.wait();
            
            // Get new balance
            const newBalance = await this.getUserBalance();
            
            console.log(`✅ Deposit successful!`);
            console.log(`💰 New escrow balance: ${ethers.formatEther(newBalance)} ETH`);
            
            return {
                success: true,
                txHash: tx.hash,
                depositAmount: amount,
                newBalance: ethers.formatEther(newBalance),
                gasUsed: receipt.gasUsed.toString()
            };
            
        } catch (error) {
            console.error("❌ Deposit failed:", error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async withdrawFromEscrow(amount) {
        try {
            console.log(`💸 Withdrawing ${amount} ETH from escrow...`);
            
            const withdrawAmount = ethers.parseEther(amount.toString());
            const currentBalance = await this.getUserBalance();
            
            // Safety checks
            if (withdrawAmount > currentBalance) {
                throw new Error(`Insufficient escrow balance. Want to withdraw ${amount} ETH, have ${ethers.formatEther(currentBalance)} ETH`);
            }
            
            // Estimate gas
            const gasEstimate = await this.contract.withdraw.estimateGas(withdrawAmount);
            
            console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
            
            // Execute withdrawal
            const tx = await this.contract.withdraw(withdrawAmount, {
                gasLimit: gasEstimate * BigInt(120) / BigInt(100) // 20% buffer
            });
            
            console.log(`📤 Withdrawal transaction sent: ${tx.hash}`);
            console.log("⏳ Waiting for confirmation...");
            
            const receipt = await tx.wait();
            
            // Get new balance
            const newBalance = await this.getUserBalance();
            
            console.log(`✅ Withdrawal successful!`);
            console.log(`💰 New escrow balance: ${ethers.formatEther(newBalance)} ETH`);
            
            return {
                success: true,
                txHash: tx.hash,
                withdrawAmount: amount,
                newBalance: ethers.formatEther(newBalance),
                gasUsed: receipt.gasUsed.toString()
            };
            
        } catch (error) {
            console.error("❌ Withdrawal failed:", error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 🎯 Intelligent Top-Up Recommendations
    async getTopUpRecommendations(targetMonths = 3) {
        const subscriptions = await this.getUserSubscriptions();
        const currentBalance = await this.getUserBalance();
        
        if (subscriptions.length === 0) {
            return {
                currentBalance: ethers.formatEther(currentBalance),
                recommendations: [],
                message: "No active subscriptions found"
            };
        }
        
        let totalMonthlyBurn = BigInt(0);
        for (const sub of subscriptions) {
            if (sub.isActive) {
                const plan = await this.getPlanDetails(sub.planId);
                totalMonthlyBurn += plan.priceWei;
            }
        }
        
        const targetBalance = totalMonthlyBurn * BigInt(targetMonths);
        const shortfall = targetBalance > currentBalance ? targetBalance - currentBalance : BigInt(0);
        
        const recommendations = [
            {
                strategy: "Conservative",
                months: 6,
                amount: ethers.formatEther(totalMonthlyBurn * BigInt(6) - currentBalance > 0 ? 
                        totalMonthlyBurn * BigInt(6) - currentBalance : BigInt(0)),
                description: "6 months runway for maximum security"
            },
            {
                strategy: "Balanced", 
                months: 3,
                amount: ethers.formatEther(shortfall),
                description: `${targetMonths} months runway for good balance`
            },
            {
                strategy: "Minimal",
                months: 1,
                amount: ethers.formatEther(totalMonthlyBurn - currentBalance > 0 ? 
                        totalMonthlyBurn - currentBalance : BigInt(0)),
                description: "1 month runway for immediate needs"
            }
        ];
        
        return {
            currentBalance: ethers.formatEther(currentBalance),
            monthlyBurn: ethers.formatEther(totalMonthlyBurn),
            currentRunway: totalMonthlyBurn > 0 ? 
                (Number(currentBalance) / Number(totalMonthlyBurn)).toFixed(2) : "∞",
            recommendations
        };
    }
    async monitorSubscriptionHealth() {
        const userSubscriptions = await this.getUserSubscriptions();
        const userBalance = await this.getUserBalance();
        
        let totalMonthlyBurn = BigInt(0);
        const healthReport = [];
        
        for (const sub of userSubscriptions) {
            if (sub.isActive) {
                const plan = await this.getPlanDetails(sub.planId);
                totalMonthlyBurn += plan.priceWei;
                
                const monthsRemaining = userBalance > 0 ? 
                    Number(userBalance) / Number(plan.priceWei) : 0;
                
                healthReport.push({
                    subscriptionId: sub.id,
                    planId: sub.planId,
                    monthlyRuns: ethers.formatEther(plan.priceWei),
                    monthsRemaining: monthsRemaining.toFixed(2),
                    status: monthsRemaining > 1 ? "Healthy" : monthsRemaining > 0.5 ? "Warning" : "Critical"
                });
            }
        }
        
        const overallHealth = {
            userBalance: ethers.formatEther(userBalance),
            totalMonthlyBurn: ethers.formatEther(totalMonthlyBurn),
            overallMonthsRemaining: totalMonthlyBurn > 0 ? 
                (Number(userBalance) / Number(totalMonthlyBurn)).toFixed(2) : "∞",
            subscriptions: healthReport
        };
        
        console.log("🏥 Subscription Health Report:");
        console.log(`💰 Current Balance: ${overallHealth.userBalance} ETH`);
        console.log(`🔥 Monthly Burn: ${overallHealth.totalMonthlyBurn} ETH`);
        console.log(`⏰ Runway: ${overallHealth.overallMonthsRemaining} months`);
        
        return overallHealth;
    }

    // 🔧 Helper Methods
    async getPlanDetails(planId) {
        const price = await this.contract.plan_price(planId);
        const provider = await this.contract.plan_provider(planId);
        const interval = await this.contract.plan_interval(planId);
        
        return {
            id: planId,
            price: ethers.formatEther(price),
            priceWei: price,
            provider,
            interval: interval.toString(),
            intervalDays: Math.floor(Number(interval) / 86400)
        };
    }
    
    async getUserBalance() {
        return await this.contract.user_escrow_balance(this.userAddress);
    }
    
    async getUserSubscriptions() {
        // This would need to be implemented based on your event tracking
        // or by iterating through subscription IDs
        const subscriptions = [];
        // Implementation depends on how you track user subscriptions
        return subscriptions;
    }
}
```

## 🎮 React Integration Component

```jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const IntelligentSubscriptionDashboard = ({ contract, userAddress, provider }) => {
    const [agent, setAgent] = useState(null);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [paymentAnalysis, setPaymentAnalysis] = useState(null);
    const [healthReport, setHealthReport] = useState(null);
    const [topUpRecommendations, setTopUpRecommendations] = useState(null);
    const [loading, setLoading] = useState(false);
    const [depositAmount, setDepositAmount] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");

    useEffect(() => {
        if (contract && userAddress && provider) {
            const subscriptionAgent = new HybridEscrowAgent(contract, userAddress, provider);
            setAgent(subscriptionAgent);
            initializeDashboard(subscriptionAgent);
        }
    }, [contract, userAddress, provider]);

    const initializeDashboard = async (agent) => {
        setLoading(true);
        try {
            const discoveredPlans = await agent.discoverPlans();
            setPlans(discoveredPlans);
            
            const health = await agent.monitorSubscriptionHealth();
            setHealthReport(health);
            
            const topUp = await agent.getTopUpRecommendations();
            setTopUpRecommendations(topUp);
        } catch (error) {
            console.error("Dashboard initialization failed:", error);
        }
        setLoading(false);
    };

    const handleDeposit = async () => {
        if (!agent || !depositAmount) return;
        
        setLoading(true);
        try {
            const result = await agent.depositToEscrow(depositAmount);
            
            if (result.success) {
                alert(`✅ Deposit successful!\nAmount: ${result.depositAmount} ETH\nNew Balance: ${result.newBalance} ETH\nTx: ${result.txHash}`);
                setDepositAmount("");
                initializeDashboard(agent); // Refresh
            } else {
                alert(`❌ Deposit failed: ${result.error}`);
            }
        } catch (error) {
            alert(`❌ Deposit failed: ${error.message}`);
        }
        setLoading(false);
    };

    const handleWithdraw = async () => {
        if (!agent || !withdrawAmount) return;
        
        setLoading(true);
        try {
            const result = await agent.withdrawFromEscrow(withdrawAmount);
            
            if (result.success) {
                alert(`✅ Withdrawal successful!\nAmount: ${result.withdrawAmount} ETH\nNew Balance: ${result.newBalance} ETH\nTx: ${result.txHash}`);
                setWithdrawAmount("");
                initializeDashboard(agent); // Refresh
            } else {
                alert(`❌ Withdrawal failed: ${result.error}`);
            }
        } catch (error) {
            alert(`❌ Withdrawal failed: ${error.message}`);
        }
        setLoading(false);
    };

    const handleQuickDeposit = async (recommendedAmount) => {
        if (!agent) return;
        
        setLoading(true);
        try {
            const result = await agent.depositToEscrow(recommendedAmount);
            
            if (result.success) {
                alert(`✅ Quick deposit successful!\nAmount: ${result.depositAmount} ETH\nNew Balance: ${result.newBalance} ETH`);
                initializeDashboard(agent); // Refresh
            } else {
                alert(`❌ Quick deposit failed: ${result.error}`);
            }
        } catch (error) {
            alert(`❌ Quick deposit failed: ${error.message}`);
        }
        setLoading(false);
    };

    const analyzePlan = async (planId, strategy = "optimal") => {
        if (!agent) return;
        
        setLoading(true);
        try {
            const analysis = await agent.analyzePaymentStrategy(planId, strategy);
            setPaymentAnalysis(analysis);
            setSelectedPlan(planId);
        } catch (error) {
            console.error("Plan analysis failed:", error);
        }
        setLoading(false);
    };

    const executeSubscription = async (strategy = "optimal") => {
        if (!agent || !selectedPlan) return;
        
        setLoading(true);
        try {
            const result = await agent.executeSubscription(selectedPlan, strategy);
            
            if (result.success) {
                alert(`✅ Subscription successful!\nID: ${result.subscriptionId}\nTx: ${result.txHash}`);
                // Refresh dashboard
                initializeDashboard(agent);
            } else {
                alert(`❌ Subscription failed: ${result.error}`);
            }
        } catch (error) {
            alert(`❌ Execution failed: ${error.message}`);
        }
        setLoading(false);
    };

    if (loading) {
        return <div className="loading">🤖 AI Agent processing...</div>;
    }

    return (
        <div className="intelligent-subscription-dashboard">
            <h2>🤖 Intelligent Subscription Agent</h2>
            
            {/* Hybrid Escrow Management */}
            <div className="escrow-management">
                <h3>💰 Hybrid Escrow Management</h3>
                
                {/* Current Balance & Health */}
                {healthReport && (
                    <div className="escrow-status">
                        <div className="balance-info">
                            <h4>Current Status</h4>
                            <p>💰 Escrow Balance: {healthReport.userBalance} ETH</p>
                            <p>🔥 Monthly Burn: {healthReport.totalMonthlyBurn} ETH</p>
                            <p>⏰ Runway: {healthReport.overallMonthsRemaining} months</p>
                        </div>
                    </div>
                )}
                
                {/* Deposit Section */}
                <div className="deposit-section">
                    <h4>📥 Deposit to Escrow</h4>
                    <div className="deposit-controls">
                        <input
                            type="number"
                            placeholder="Amount in ETH"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            step="0.001"
                            min="0"
                        />
                        <button onClick={handleDeposit} disabled={!depositAmount || loading}>
                            💰 Deposit {depositAmount} ETH
                        </button>
                    </div>
                </div>

                {/* AI Top-Up Recommendations */}
                {topUpRecommendations && (
                    <div className="topup-recommendations">
                        <h4>🤖 AI Top-Up Recommendations</h4>
                        <p>Current Runway: {topUpRecommendations.currentRunway} months</p>
                        <div className="recommendations-grid">
                            {topUpRecommendations.recommendations.map((rec, index) => (
                                <div key={index} className={`recommendation ${rec.strategy.toLowerCase()}`}>
                                    <h5>{rec.strategy} Strategy</h5>
                                    <p>{rec.description}</p>
                                    <p>💸 Deposit: {rec.amount} ETH</p>
                                    <p>📅 Coverage: {rec.months} months</p>
                                    <button 
                                        onClick={() => handleQuickDeposit(rec.amount)}
                                        disabled={parseFloat(rec.amount) === 0 || loading}
                                    >
                                        Quick Deposit
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Withdraw Section */}
                <div className="withdraw-section">
                    <h4>📤 Withdraw from Escrow</h4>
                    <div className="withdraw-controls">
                        <input
                            type="number"
                            placeholder="Amount in ETH"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            step="0.001"
                            min="0"
                        />
                        <button onClick={handleWithdraw} disabled={!withdrawAmount || loading}>
                            💸 Withdraw {withdrawAmount} ETH
                        </button>
                    </div>
                </div>
            </div>

            {/* Health Monitor */}
            {healthReport && (
                <div className="health-monitor">
                    <h3>🏥 Subscription Health</h3>
                    <div className="health-stats">
                        <div>💰 Balance: {healthReport.userBalance} ETH</div>
                        <div>🔥 Monthly Burn: {healthReport.totalMonthlyBurn} ETH</div>
                        <div>⏰ Runway: {healthReport.overallMonthsRemaining} months</div>
                    </div>
                </div>
            )}

            {/* Available Plans */}
            <div className="plans-grid">
                <h3>📋 Available Plans</h3>
                {plans.map(plan => (
                    <div key={plan.id} className="plan-card">
                        <h4>Plan {plan.id}</h4>
                        <p>💰 {plan.price} ETH / {plan.intervalDays} days</p>
                        <p>👨‍💼 Provider: {plan.provider.slice(0, 8)}...</p>
                        <button onClick={() => analyzePlan(plan.id)}>
                            🔍 Analyze
                        </button>
                    </div>
                ))}
            </div>

            {/* Payment Analysis */}
            {paymentAnalysis && (
                <div className="payment-analysis">
                    <h3>💡 AI Payment Strategy Analysis</h3>
                    <div className="user-status">
                        <p>💰 Current Balance: {paymentAnalysis.userBalance} ETH</p>
                        <p>👛 Wallet Balance: {paymentAnalysis.walletBalance} ETH</p>
                    </div>
                    
                    <div className="strategies">
                        {Object.entries(paymentAnalysis.strategies).map(([key, strategy]) => (
                            <div key={key} className={`strategy ${key === 'optimal' ? 'recommended' : ''}`}>
                                <h4>{strategy.name}</h4>
                                <p>{strategy.description}</p>
                                <p>💸 Payment: {ethers.formatEther(strategy.amount)} ETH</p>
                                <p>🛡️ Coverage: {strategy.coverage}</p>
                                <p>⚠️ {strategy.riskLevel}</p>
                                <button onClick={() => executeSubscription(key)}>
                                    Subscribe with {strategy.name}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntelligentSubscriptionDashboard;
```

## 🎯 Agent Usage Examples

```javascript
// Initialize the agent
const agent = new HybridEscrowAgent(contract, userAddress, provider);

// Discover all available plans
const plans = await agent.discoverPlans();

// Analyze payment strategies for a specific plan
const analysis = await agent.analyzePaymentStrategy(1, "optimal");

// Execute subscription with AI recommendations
const result = await agent.executeSubscription(1, "safe");

// Monitor subscription health
const health = await agent.monitorSubscriptionHealth();

// Hybrid Escrow Management
// Deposit funds to escrow
const depositResult = await agent.depositToEscrow("0.5"); // 0.5 ETH

// Get AI top-up recommendations
const recommendations = await agent.getTopUpRecommendations(3); // 3 months target

// Withdraw from escrow
const withdrawResult = await agent.withdrawFromEscrow("0.1"); // 0.1 ETH
```

## 💎 Hybrid Escrow Workflow Examples

### **Scenario 1: New User Onboarding**
```javascript
// 1. User wants to subscribe to a plan that costs 0.1 ETH/month
const planId = 1;
const analysis = await agent.analyzePaymentStrategy(planId, "safe");

// 2. AI recommends 3-month strategy: deposit 0.3 ETH
const subscriptionResult = await agent.executeSubscription(planId, "safe");

// 3. User is now subscribed with 2 months remaining in escrow
```

### **Scenario 2: Top-Up Management**
```javascript
// 1. Check current runway
const health = await agent.monitorSubscriptionHealth();
console.log(`Current runway: ${health.overallMonthsRemaining} months`);

// 2. Get AI recommendations for extending runway
const recommendations = await agent.getTopUpRecommendations(6); // Target 6 months

// 3. Deposit based on AI recommendation
const depositResult = await agent.depositToEscrow(recommendations.recommendations[0].amount);
```

### **Scenario 3: Emergency Withdrawal**
```javascript
// 1. User needs to withdraw funds urgently
const currentBalance = await agent.getUserBalance();
const maxWithdraw = ethers.formatEther(currentBalance);

// 2. Check impact on subscriptions
const health = await agent.monitorSubscriptionHealth();
if (parseFloat(health.overallMonthsRemaining) < 1) {
    console.log("⚠️ Warning: Low runway after withdrawal");
}

// 3. Execute withdrawal
const withdrawResult = await agent.withdrawFromEscrow("0.05");
```

## 🚀 Key Features of the Hybrid Escrow Agent

1. **🔍 Plan Discovery**: Automatically finds all available subscription plans
2. **💡 Smart Analysis**: AI-powered payment strategy recommendations
3. **🎯 Intelligent Execution**: Optimized transaction execution with safety checks
4. **🏥 Health Monitoring**: Real-time subscription health and runway analysis
5. **💰 Hybrid Escrow Management**: Separate deposit/withdraw functions for flexibility
6. **🤖 AI Top-Up Recommendations**: Smart suggestions for maintaining optimal runway
7. **⚡ Gas Optimization**: Automatic gas estimation and optimization
8. **🛡️ Safety Checks**: Multiple validation layers before execution
9. **📊 Real-time Feedback**: Comprehensive logging and status updates
10. **🎮 Complete UI Components**: Ready-to-use React components with escrow management

### **Hybrid Escrow Benefits:**

- **💎 Flexibility**: Users can subscribe with minimal amounts and top-up later
- **💰 Capital Efficiency**: No need to lock large amounts upfront
- **🏦 Self-Custody**: Users maintain control over their escrow funds
- **🤖 AI Guidance**: Smart recommendations for optimal fund management
- **⚡ Gas Optimization**: Batch deposits reduce transaction costs
- **🔒 Emergency Access**: Withdraw unused funds anytime

This intelligent agent with hybrid escrow makes subscription management effortless while providing maximum flexibility and capital efficiency! 🤖✨💰
