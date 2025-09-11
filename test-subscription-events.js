import { ethers } from "ethers";
import fs from "fs";

const COMPLETE_ABI = JSON.parse(fs.readFileSync("./complete-abi.json", "utf8"));

const CONTRACT_ADDRESS = "0xe65365Ea1cfb28dafD5fF6246a2E2A124A13093B";
const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";

async function testSubscriptionEvents() {
  try {
    console.log("🔍 Testing subscription events...");

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      COMPLETE_ABI,
      provider
    );

    console.log("✅ Contract created successfully");
    console.log("📋 Interface events:", contract.interface.events);
    console.log(
      "📋 Available event names:",
      Object.keys(contract.interface.events || {})
    );

    // Get all SubscriptionCreated events from the last 1000 blocks
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 1000);

    console.log(
      `🔍 Searching for SubscriptionCreated events from block ${fromBlock} to ${currentBlock}`
    );

    const filter = contract.filters.SubscriptionCreated();
    const events = await contract.queryFilter(filter, fromBlock);

    console.log(`📊 Found ${events.length} SubscriptionCreated events:`);

    events.forEach((event, index) => {
      console.log(`\n📋 Event ${index + 1}:`);
      console.log(`   Subscription ID: ${event.args.subscriptionId}`);
      console.log(`   User: ${event.args.user}`);
      console.log(`   Plan ID: ${event.args.planId}`);
      console.log(`   Block: ${event.blockNumber}`);
      console.log(`   Transaction: ${event.transactionHash}`);
    });

    if (events.length === 0) {
      console.log("❌ No subscription events found. This means:");
      console.log("   1. No subscriptions have been created yet, OR");
      console.log("   2. The events are not being emitted properly, OR");
      console.log("   3. The ABI is still missing events");
    }

    // Test a subscription call (read-only simulation)
    console.log("\n🧪 Testing contract functions...");
    const plans = await contract.getPlans();
    console.log(
      `📊 Available plans: ${plans.map((p) => p.toString()).join(", ")}`
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("missing")) {
      console.log(
        "💡 This suggests the ABI is still incomplete or events are not being emitted by the contract"
      );
    }
  }
}

testSubscriptionEvents();
