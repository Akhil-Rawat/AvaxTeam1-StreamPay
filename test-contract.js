// Simple test script to test contract interactions
import { ethers } from "ethers";
import fs from "fs";

const CONTRACT_ADDRESS = "0xe65365Ea1cfb28dafD5fF6246a2E2A124A13093B";
const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";

// Load ABI
const contractABI = JSON.parse(
  fs.readFileSync("./src/contracts/escrowabi.json", "utf8")
);

async function testContract() {
  console.log("🔍 Testing StreamPay Contract...\n");

  // Connect to provider
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

  try {
    console.log("📋 Contract Address:", CONTRACT_ADDRESS);
    console.log("🌐 Network:", await provider.getNetwork());

    // Test 1: Get all plans
    console.log("\n📦 Testing getAllPlans...");
    const plans = await contract.getPlans();
    console.log("Plans found:", plans.length);
    console.log(
      "Plan IDs:",
      plans.map((id) => id.toString())
    );

    // Test 2: Check if any address is registered as provider
    console.log("\n👤 Testing provider registration...");
    // Using some common test addresses
    const testAddresses = [
      "0x742d35Cc6Db7Fd76D38Ce3d8E6cbE62F5bFe37bd",
      "0x8ba1f109fddb5f1c9f2ee9a3ee7d7c7c65aD9c4b",
    ];

    for (const addr of testAddresses) {
      try {
        const isRegistered = await contract.isProviderRegistered(addr);
        console.log(
          `Address ${addr}: ${
            isRegistered ? "✅ Registered" : "❌ Not registered"
          }`
        );
      } catch (error) {
        console.log(`Address ${addr}: ❌ Error checking - ${error.message}`);
      }
    }

    // Test 3: Get user balances
    console.log("\n💰 Testing user balances...");
    for (const addr of testAddresses) {
      try {
        const balance = await contract.getUserBalance(addr);
        console.log(`Address ${addr}: ${ethers.formatEther(balance)} ETH`);
      } catch (error) {
        console.log(
          `Address ${addr}: ❌ Error checking balance - ${error.message}`
        );
      }
    }
  } catch (error) {
    console.error("❌ Contract test failed:", error.message);
  }
}

// Run the test
testContract()
  .then(() => console.log("\n✅ Test completed"))
  .catch(console.error);
