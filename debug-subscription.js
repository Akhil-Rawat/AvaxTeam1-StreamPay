// Debug script to check what's happening with subscription IDs
import { ethers } from "ethers";
import fs from "fs";

const CONTRACT_ADDRESS = "0xe65365Ea1cfb28dafD5fF6246a2E2A124A13093B";
const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
const SUBSCRIBE_TX_HASH = "0x02be68620f0"; // From your screenshot

// Load the complete ABI
const COMPLETE_ABI = JSON.parse(fs.readFileSync("./complete-abi.json", "utf8"));

async function debugSubscription() {
  try {
    console.log("🔍 Debugging subscription transaction...");

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      COMPLETE_ABI,
      provider
    );

    // Get the full transaction hash (you'll need to provide the complete hash)
    console.log(
      "⚠️  I need the complete transaction hash from your screenshot"
    );
    console.log(
      "   Please run: node debug-subscription.js 0xCOMPLETE_HASH_HERE"
    );

    if (process.argv[2]) {
      const txHash = process.argv[2];
      console.log(`\n🔍 Analyzing transaction: ${txHash}`);

      const tx = await provider.getTransaction(txHash);
      const receipt = await provider.getTransactionReceipt(txHash);

      console.log("📋 Transaction details:");
      console.log("   From:", tx.from);
      console.log("   To:", tx.to);
      console.log("   Value:", ethers.formatEther(tx.value), "ETH");
      console.log("   Status:", receipt.status === 1 ? "Success" : "Failed");

      console.log("\n📋 Transaction logs:");
      receipt.logs.forEach((log, index) => {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed) {
            console.log(`   Event ${index + 1}: ${parsed.name}`);
            if (parsed.name === "SubscriptionCreated") {
              console.log(
                `      🎉 FOUND SUBSCRIPTION ID: ${parsed.args.subscriptionId}`
              );
              console.log(`      User: ${parsed.args.user}`);
              console.log(`      Plan ID: ${parsed.args.planId}`);
            }
            console.log(`      Args:`, parsed.args);
          }
        } catch (e) {
          console.log(
            `   Log ${index + 1}: Could not parse (${log.topics[0]})`
          );
        }
      });
    } else {
      console.log("\n💡 Usage: node debug-subscription.js 0xTRANSACTION_HASH");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

debugSubscription();
