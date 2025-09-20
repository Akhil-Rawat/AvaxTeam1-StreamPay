import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rawatakhilvibh_db_user:0SeNDPni67Nx4hZv@cluster0.eo7tmmj.mongodb.net/streampay?retryWrites=true&w=majority';

// StreamPay Contract Configuration
const CONTRACT_ADDRESS = "0x08006F413fbb555eFfcc9A27e9A01980B0e42207";
const RPC_URL = "https://api.avax-test.network/ext/bc/C/rpc";

// Contract ABI (minimal for MVP)
const CONTRACT_ABI = [
  {
    "type": "function",
    "name": "createPlan",
    "inputs": [
      {"name": "price", "type": "uint256"},
      {"name": "interval", "type": "uint256"}
    ],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "subscribe",
    "inputs": [{"name": "planId", "type": "uint256"}],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "registerProvider",
    "inputs": [{"name": "name", "type": "string"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];

// Initialize ethers provider
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('streampay');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'StreamPay Backend API',
    version: '1.0.0',
    status: 'Running',
    endpoints: [
      'GET /health - Health check',
      'GET / - This message',
      'POST /provider/register - Register a new provider',
      'POST /plans - Create a new plan',
      'GET /plans - Get all plans',
      'GET /plans/:id - Get specific plan',
      'PUT /plans/:id/onchain - Update plan with on-chain data',
      'POST /subscriptions - Create subscription',
      'GET /subscriptions/:address - Get user subscriptions',
      'GET /providers/:address - Get provider data'
    ],
    contract: {
      address: CONTRACT_ADDRESS,
      network: 'Avalanche Fuji C-Chain',
      rpc: RPC_URL
    }
  });
});

// Clear all data endpoint (for testing)
app.delete('/clear-all', async (req, res) => {
  try {
    await db.collection('providers').deleteMany({});
    await db.collection('plans').deleteMany({});
    await db.collection('subscriptions').deleteMany({});
    res.json({ 
      success: true, 
      message: 'All data cleared successfully',
      cleared: ['providers', 'plans', 'subscriptions']
    });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /provider/register - Register a new provider
app.post('/provider/register', async (req, res) => {
  try {
    const { name, description, walletAddress, email } = req.body;
    
    if (!name || !walletAddress) {
      return res.status(400).json({ error: 'Name and wallet address are required' });
    }

    // Check if provider already exists
    const existingProvider = await db.collection('providers').findOne({ walletAddress });
    if (existingProvider) {
      return res.status(409).json({ error: 'Provider already registered' });
    }

    const provider = {
      name,
      description: description || '',
      walletAddress,
      email: email || '',
      createdAt: new Date(),
      isActive: true
    };

    const result = await db.collection('providers').insertOne(provider);
    
    res.status(201).json({
      success: true,
      providerId: result.insertedId,
      message: 'Provider registered successfully'
    });
  } catch (error) {
    console.error('Provider registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /plans - Create a new subscription plan
app.post('/plans', async (req, res) => {
  try {
    const { name, description, price, interval, providerAddress } = req.body;
    
    if (!name || !price || !interval || !providerAddress) {
      return res.status(400).json({ 
        error: 'Name, price, interval, and provider address are required' 
      });
    }

    // Verify provider exists
    const provider = await db.collection('providers').findOne({ walletAddress: providerAddress });
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Store plan in MongoDB (without on-chain planId initially)
    const plan = {
      name,
      description: description || '',
      price: parseFloat(price),
      interval: parseInt(interval),
      providerAddress,
      providerName: provider.name,
      createdAt: new Date(),
      isActive: true,
      onChainPlanId: null // Will be updated after on-chain creation
    };

    const result = await db.collection('plans').insertOne(plan);
    
    res.status(201).json({
      success: true,
      planId: result.insertedId,
      message: 'Plan created successfully. Complete on-chain creation to activate.',
      plan: { ...plan, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Plan creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /plans/:id/onchain - Update plan with on-chain planId
app.put('/plans/:id/onchain', async (req, res) => {
  try {
    const { id } = req.params;
    const { onChainPlanId, transactionHash } = req.body;
    
    if (!onChainPlanId) {
      return res.status(400).json({ error: 'On-chain plan ID is required' });
    }

    const result = await db.collection('plans').updateOne(
      { _id: new MongoClient.ObjectId(id) },
      { 
        $set: { 
          onChainPlanId: parseInt(onChainPlanId),
          transactionHash,
          activatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({
      success: true,
      message: 'Plan activated on-chain successfully'
    });
  } catch (error) {
    console.error('Plan activation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /plans - Get all active plans for marketplace
app.get('/plans', async (req, res) => {
  try {
    const plans = await db.collection('plans')
      .find({ 
        isActive: true,
        onChainPlanId: { $ne: null } // Only show activated plans
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      plans,
      count: plans.length
    });
  } catch (error) {
    console.error('Plans fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /plans/:id - Get specific plan details
app.get('/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await db.collection('plans').findOne({ _id: new MongoClient.ObjectId(id) });
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({
      success: true,
      plan
    });
  } catch (error) {
    console.error('Plan fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /providers/:address - Get provider info
app.get('/providers/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const provider = await db.collection('providers').findOne({ walletAddress: address });
    
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Get provider's plans
    const plans = await db.collection('plans')
      .find({ providerAddress: address })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      provider,
      plans,
      planCount: plans.length
    });
  } catch (error) {
    console.error('Provider fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /subscriptions - Track subscription creation
app.post('/subscriptions', async (req, res) => {
  try {
    const { subscriberAddress, planId, onChainSubscriptionId, transactionHash } = req.body;
    
    if (!subscriberAddress || !planId || !onChainSubscriptionId) {
      return res.status(400).json({ 
        error: 'Subscriber address, plan ID, and on-chain subscription ID are required' 
      });
    }

    // Get plan details
    const plan = await db.collection('plans').findOne({ _id: new MongoClient.ObjectId(planId) });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const subscription = {
      subscriberAddress,
      planId,
      planName: plan.name,
      providerAddress: plan.providerAddress,
      onChainSubscriptionId: parseInt(onChainSubscriptionId),
      transactionHash,
      createdAt: new Date(),
      isActive: true
    };

    const result = await db.collection('subscriptions').insertOne(subscription);
    
    res.status(201).json({
      success: true,
      subscriptionId: result.insertedId,
      message: 'Subscription tracked successfully',
      subscription: { ...subscription, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Subscription tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /subscriptions/:address - Get user's subscriptions
app.get('/subscriptions/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const subscriptions = await db.collection('subscriptions')
      .find({ subscriberAddress: address })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      subscriptions,
      count: subscriptions.length
    });
  } catch (error) {
    console.error('Subscriptions fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
async function startServer() {
  await connectToMongoDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 StreamPay Backend running on port ${PORT}`);
    console.log(`📊 API endpoints:`);
    console.log(`   POST /provider/register`);
    console.log(`   POST /plans`);
    console.log(`   GET  /plans`);
    console.log(`   GET  /plans/:id`);
    console.log(`   PUT  /plans/:id/onchain`);
    console.log(`   POST /subscriptions`);
    console.log(`   GET  /subscriptions/:address`);
    console.log(`   GET  /providers/:address`);
  });
}

startServer().catch(console.error);