import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rawatakhilvibh_db_user:0SeNDPni67Nx4hZv@cluster0.eo7tmmj.mongodb.net/streampay?retryWrites=true&w=majority';

// On-chain plan data discovered via Foundry
const onChainPlans = [
  {
    planId: 1,
    name: "⚡ Premium Plan",
    description: "High-value subscription with 5-minute intervals",
    price: "1.0", // AVAX
    interval: 300, // 5 minutes in seconds
    features: ["Premium Content", "Priority Support", "Advanced Analytics"],
    category: "premium",
    active: true
  },
  {
    planId: 2,
    name: "📅 Daily Essential",
    description: "Daily subscription at affordable rate",
    price: "0.001", // AVAX
    interval: 86400, // 1 day in seconds
    features: ["Daily Content", "Basic Support", "Standard Analytics"],
    category: "daily",
    active: true
  },
  {
    planId: 3,
    name: "🚀 Quick Test",
    description: "Fast testing plan with 1-minute intervals",
    price: "0.001", // AVAX
    interval: 60, // 1 minute in seconds
    features: ["Test Content", "Community Support", "Basic Metrics"],
    category: "testing",
    active: true
  }
];

// Sample provider data to match the plans
const sampleProvider = {
  walletAddress: "0x1234567890123456789012345678901234567890", // Replace with actual
  name: "StreamPay Demo Provider",
  email: "demo@streampay.xyz",
  description: "Official demo provider showcasing StreamPay capabilities",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=streampay",
  isVerified: true,
  createdAt: new Date(),
  totalEarnings: "0",
  totalSubscribers: 0,
  status: "active"
};

async function syncOnChainPlans() {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('streampay');
    const providersCollection = db.collection('providers');
    const plansCollection = db.collection('plans');
    
    console.log('✅ Connected to MongoDB');
    
    // First, ensure we have a provider for the plans
    console.log('👤 Checking for existing provider...');
    let provider = await providersCollection.findOne({});
    
    if (!provider) {
      console.log('➕ Creating sample provider...');
      const result = await providersCollection.insertOne(sampleProvider);
      provider = { ...sampleProvider, _id: result.insertedId };
      console.log('✅ Provider created:', provider.name);
    } else {
      console.log('✅ Found existing provider:', provider.name);
    }
    
    // Clear existing plans to avoid duplicates
    console.log('🗑️ Clearing existing plans...');
    await plansCollection.deleteMany({});
    
    // Insert on-chain plans
    console.log('📦 Syncing on-chain plans...');
    
    for (const plan of onChainPlans) {
      const planDoc = {
        ...plan,
        providerId: provider._id.toString(),
        providerAddress: provider.walletAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
        subscriberCount: 0,
        totalRevenue: "0",
        onChain: true, // Mark as synchronized from blockchain
        isActive: true, // Required for API filtering
        onChainPlanId: plan.planId, // Required for API filtering
        contractAddress: "0x08006F413fbb555eFfcc9A27e9A01980B0e42207",
        network: "avalanche-fuji"
      };
      
      await plansCollection.insertOne(planDoc);
      console.log(`✅ Synced Plan ${plan.planId}: ${plan.name} (${plan.price} AVAX, ${plan.interval}s)`);
    }
    
    // Verify sync
    const totalPlans = await plansCollection.countDocuments();
    const totalProviders = await providersCollection.countDocuments();
    
    console.log('\n🎉 Sync Complete!');
    console.log(`📊 Database Summary:`);
    console.log(`   - Providers: ${totalProviders}`);
    console.log(`   - Plans: ${totalPlans}`);
    console.log(`   - Contract: 0x08006F413fbb555eFfcc9A27e9A01980B0e42207`);
    console.log(`   - Network: Avalanche Fuji Testnet`);
    
    // Show plan summary
    console.log('\n📋 Plan Summary:');
    const plans = await plansCollection.find({}).toArray();
    plans.forEach(plan => {
      const intervalText = plan.interval === 60 ? '1 minute' : 
                          plan.interval === 300 ? '5 minutes' : 
                          plan.interval === 86400 ? '1 day' : `${plan.interval}s`;
      console.log(`   Plan ${plan.planId}: ${plan.name} - ${plan.price} AVAX every ${intervalText}`);
    });
    
  } catch (error) {
    console.error('❌ Error syncing plans:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the sync
syncOnChainPlans();

export { syncOnChainPlans, onChainPlans };