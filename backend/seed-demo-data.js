import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rawatakhilvibh_db_user:0SeNDPni67Nx4hZv@cluster0.eo7tmmj.mongodb.net/streampay?retryWrites=true&w=majority';

async function seedDemoData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('streampay');
    
    console.log('🌱 Seeding demo data...');
    
    // Demo providers
    const providers = [
      {
        name: "StreamFlix Pro",
        description: "Premium video streaming with 4K content",
        email: "support@streamflix.demo",
        walletAddress: "0xa1b2c3d4e5f6789012345678901234567890abcd",
        createdAt: new Date(),
        isActive: true
      },
      {
        name: "CloudSync Premium",
        description: "Secure cloud storage and file synchronization",
        email: "hello@cloudsync.demo", 
        walletAddress: "0xb2c3d4e5f6789012345678901234567890abcde1",
        createdAt: new Date(),
        isActive: true
      },
      {
        name: "DevTools Suite",
        description: "Professional development tools and APIs",
        email: "dev@devtools.demo",
        walletAddress: "0xc3d4e5f6789012345678901234567890abcdef12",
        createdAt: new Date(),
        isActive: true
      }
    ];
    
    // Insert providers
    const providerResult = await db.collection('providers').insertMany(providers);
    console.log(`✅ Inserted ${providerResult.insertedCount} providers`);
    
    // Demo plans with your preferred short intervals
    const plans = [
      {
        name: "⚡ Quick Start",
        description: "Perfect for testing - ultra-fast billing cycle for instant gratification!",
        price: 0.01,
        interval: 30, // 30 seconds
        providerAddress: providers[0].walletAddress,
        providerName: providers[0].name,
        createdAt: new Date(),
        isActive: true,
        onChainPlanId: 1,
        category: "Entertainment"
      },
      {
        name: "🚀 Turbo Trial",
        description: "Rapid-fire subscription for power users who want instant results!",
        price: 0.02,
        interval: 60, // 60 seconds  
        providerAddress: providers[0].walletAddress,
        providerName: providers[0].name,
        createdAt: new Date(),
        isActive: true,
        onChainPlanId: 2,
        category: "Entertainment"
      },
      {
        name: "💎 Premium Flash",
        description: "Lightning-fast premium experience with all features unlocked!",
        price: 0.05,
        interval: 30, // 30 seconds
        providerAddress: providers[1].walletAddress,
        providerName: providers[1].name,
        createdAt: new Date(),
        isActive: true,
        onChainPlanId: 3,
        category: "Storage"
      },
      {
        name: "🔧 Dev Sprint",
        description: "Rapid development cycles for agile teams - billed every minute!",
        price: 0.03,
        interval: 60, // 60 seconds
        providerAddress: providers[2].walletAddress,
        providerName: providers[2].name,
        createdAt: new Date(),
        isActive: true,
        onChainPlanId: 4,
        category: "Developer Tools"
      },
      {
        name: "⭐ VIP Express",
        description: "Exclusive ultra-premium experience with instant activation!",
        price: 0.1,
        interval: 45, // 45 seconds
        providerAddress: providers[1].walletAddress,
        providerName: providers[1].name,
        createdAt: new Date(),
        isActive: true,
        onChainPlanId: 5,
        category: "Premium"
      }
    ];
    
    // Insert plans
    const planResult = await db.collection('plans').insertMany(plans);
    console.log(`✅ Inserted ${planResult.insertedCount} plans`);
    
    console.log('\n🎉 Demo data seeded successfully!');
    console.log('\n📋 Created Plans:');
    plans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name} - ${plan.price} AVAX every ${plan.interval}s by ${plan.providerName}`);
    });
    
    console.log('\n🌐 Now visit http://localhost:5173/marketplace to see the plans!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await client.close();
  }
}

seedDemoData();