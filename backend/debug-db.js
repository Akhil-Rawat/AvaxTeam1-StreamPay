import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rawatakhilvibh_db_user:0SeNDPni67Nx4hZv@cluster0.eo7tmmj.mongodb.net/streampay?retryWrites=true&w=majority';

async function debugDatabase() {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log('URI:', MONGODB_URI.replace(/\/\/[^:]*:[^@]*@/, '//***:***@'));
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('streampay');
    console.log('✅ Connected to database: streampay');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Collections found:', collections.map(c => c.name));
    
    // Check providers collection
    const providersCollection = db.collection('providers');
    const providersCount = await providersCollection.countDocuments();
    console.log(`\n👤 Providers count: ${providersCount}`);
    
    if (providersCount > 0) {
      const sampleProvider = await providersCollection.findOne({});
      console.log('Sample provider:', {
        name: sampleProvider?.name,
        walletAddress: sampleProvider?.walletAddress
      });
    }
    
    // Check plans collection
    const plansCollection = db.collection('plans');
    const plansCount = await plansCollection.countDocuments();
    console.log(`\n📋 Plans count: ${plansCount}`);
    
    if (plansCount > 0) {
      const plans = await plansCollection.find({}).toArray();
      console.log('Found plans:');
      plans.forEach((plan, index) => {
        console.log(`  ${index + 1}. ${plan.name} - ${plan.price} AVAX (Plan ID: ${plan.planId})`);
      });
    } else {
      console.log('❌ No plans found in database!');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

debugDatabase();