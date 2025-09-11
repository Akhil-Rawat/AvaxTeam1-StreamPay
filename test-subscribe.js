import { ethers } from "ethers";
import fs from "fs";

const COMPLETE_ABI = JSON.parse(fs.readFileSync("./complete-abi.json", "utf8"));

const CONTRACT_ADDRESS = "0xe65365Ea1cfb28dafD5fF6246a2E2A124A13093B";
const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";

async function testSubscription() {
  try {
    console.log("🔍 Testing subscription with events...");

    // You'll need to add your private key here for testing
    const PRIVATE_KEY = process.env.PRIVATE_KEY || "your_private_key_here";

    if (PRIVATE_KEY === "your_private_key_here") {
      console.log(
        "⚠️  Please set PRIVATE_KEY environment variable to test subscriptions"
      );
      console.log(
        '   You can do: $env:PRIVATE_KEY="your_private_key"; node test-subscribe.js'
      );
      return;
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      COMPLETE_ABI,
      wallet
    );

    console.log("📋 Wallet address:", wallet.address);
    console.log(
      "💰 Wallet balance:",
      ethers.formatEther(await provider.getBalance(wallet.address)),
      "ETH"
    );

    // Check available plans
    const plans = await contract.getPlans();
    console.log(
      "📊 Available plans:",
      plans.map((p) => p.toString()).join(", ")
    );

    if (plans.length === 0) {
      console.log("❌ No plans available");
      return;
    }

    const planId = plans[0]; // Use first plan
    console.log(`🎯 Subscribing to plan ${planId}...`);

    // Listen for SubscriptionCreated events
    contract.on(
      "SubscriptionCreated",
      (subscriptionId, user, planId, event) => {
        console.log("🎉 SubscriptionCreated event received!");
        console.log("   Subscription ID:", subscriptionId.toString());
        console.log("   User:", user);
        console.log("   Plan ID:", planId.toString());
        console.log("   Block:", event.blockNumber);
        console.log("   Transaction:", event.transactionHash);
      }
    );

    // Call subscribe with 0.1 ETH
    const tx = await contract.subscribe(planId, {
      value: ethers.parseEther("0.1"),
      gasLimit: 500000, // Set a reasonable gas limit
    });

    console.log("📝 Transaction sent:", tx.hash);
    console.log("⏳ Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

    // Parse events from receipt
    console.log("📋 Events in transaction:");
    receipt.logs.forEach((log, index) => {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed) {
          console.log(`   Event ${index + 1}: ${parsed.name}`);
          if (parsed.name === "SubscriptionCreated") {
            console.log(`      Subscription ID: ${parsed.args.subscriptionId}`);
            console.log(`      User: ${parsed.args.user}`);
            console.log(`      Plan ID: ${parsed.args.planId}`);
          }
        }
      } catch (e) {
        console.log(
          `   Log ${
            index + 1
          }: Unable to parse (likely from different contract)`
        );
      }
    });

    // Wait a bit for event listener
    await new Promise((resolve) => setTimeout(resolve, 2000));
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.reason) {
      console.error("   Reason:", error.reason);
    }
  }
}

testSubscription();
