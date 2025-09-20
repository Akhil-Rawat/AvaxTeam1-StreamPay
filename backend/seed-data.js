import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rawatakhilvibh_db_user:0SeNDPni67Nx4hZv@cluster0.eo7tmmj.mongodb.net/streampay?retryWrites=true&w=majority';

// Demo providers
const demoProviders = [
  {
    name: "StreamFlix",
    description: "Premium streaming service with 4K content",
    walletAddress: "0x742d35Cc6634C0532925a3b8D93B6c1204B2c3c1",
    email: "contact@streamflix.com",
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    name: "CloudStorage Pro",
    description: "Secure cloud storage with unlimited space",
    walletAddress: "0x8ba1f109551bD432803012645Hac136c9.c7",
    email: "support@cloudstorage.com", 
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    name: "MusicStream",
    description: "High-quality music streaming platform",
    walletAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    email: "hello@musicstream.com",
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    name: "DevTools Suite",
    description: "Professional development tools and analytics",
    walletAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    email: "team@devtools.com",
    createdAt: new Date().toISOString(),
    isActive: true
  }
];

// Demo plans
const demoPlans = [
  // StreamFlix Plans
  {
    name: "StreamFlix Basic",
    description: "HD streaming, 2 devices, ad-free experience",
    price: 0.05,
    interval: 30,
    providerAddress: "0x742d35Cc6634C0532925a3b8D93B6c1204B2c3c1",
    providerName: "StreamFlix",
    createdAt: new Date().toISOString(),
    isActive: true,
    onChainPlanId: 1
  },
  {
    name: "StreamFlix Premium", 
    description: "4K streaming, 5 devices, exclusive content",
    price: 0.1,
    interval: 30,
    providerAddress: "0x742d35Cc6634C0532925a3b8D93B6c1204B2c3c1",
    providerName: "StreamFlix",
    createdAt: new Date().toISOString(),
    isActive: true,
    onChainPlanId: 2
  },
  // CloudStorage Plans
  {
    name: "CloudStorage Personal",
    description: "100GB storage, file sync, mobile apps",
    price: 0.02,
    interval: 30,
    providerAddress: "0x8ba1f109551bD432803012645Hac136c9.c7",
    providerName: "CloudStorage Pro",
    createdAt: new Date().toISOString(),
    isActive: true,
    onChainPlanId: 3
  },
  {
    name: "CloudStorage Business",
    description: "1TB storage, team collaboration, advanced security",
    price: 0.08,
    interval: 30,
    providerAddress: "0x8ba1f109551bD432803012645Hac136c9.c7",
    providerName: "CloudStorage Pro",
    createdAt: new Date().toISOString(),
    isActive: true,
    onChainPlanId: 4
  },
  // MusicStream Plans
  {
    name: "MusicStream Student",
    description: "Ad-free music, offline downloads, student discount",
    price: 0.03,
    interval: 30,
    providerAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    providerName: "MusicStream",
    createdAt: new Date().toISOString(),
    isActive: true,
    onChainPlanId: 5
  },
  {
    name: "MusicStream Family",
    description: "6 accounts, high-quality audio, family sharing",
    price: 0.07,
    interval: 30,
    providerAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    providerName: "MusicStream",
    createdAt: new Date().toISOString(),
    isActive: true,
    onChainPlanId: 6
  },
  // DevTools Plans
  {
    name: "DevTools Starter",
    description: "Code analytics, basic CI/CD, 5 projects",
    price: 0.06,
    interval: 30,
    providerAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    providerName: "DevTools Suite",
    createdAt: new Date().toISOString(),
    isActive: true,
    onChainPlanId: 7
  },
  {
    name: "DevTools Enterprise",
    description: "Advanced analytics, unlimited projects, priority support",
    price: 0.15,
    interval: 30,
    providerAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    providerName: "DevTools Suite",
    createdAt: new Date().toISOString(),
    isActive: true,
    onChainPlanId: 8
  }
];

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('streampay');
    
    // Clear existing data
    await db.collection('providers').deleteMany({});
    await db.collection('plans').deleteMany({});
    console.log('🧹 Cleared existing data');
    
    // Insert providers
    const providerResult = await db.collection('providers').insertMany(demoProviders);
    console.log(`📊 Inserted ${providerResult.insertedCount} providers`);
    
    // Insert plans
    const planResult = await db.collection('plans').insertMany(demoPlans);
    console.log(`📦 Inserted ${planResult.insertedCount} plans`);
    
    console.log('🎉 Database seeded successfully!');
    console.log(`
🚀 Demo Data Created:
📊 Providers: ${providerResult.insertedCount}
📦 Plans: ${planResult.insertedCount}

💡 Plans Available:
${demoPlans.map(plan => `   • ${plan.name} - ${plan.price} AVAX/month`).join('\n')}

🌐 View at: http://localhost:5173/marketplace
    `);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
  }
}

// Run the seed function
seedDatabase();