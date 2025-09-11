import { ethers } from "ethers";

// Simple test of subscription ID capture
const CONTRACT_ADDRESS = "0xe65365Ea1cfb28dafD5fF6246a2E2A124A13093B";
const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";

// Minimal ABI with just what we need
const MINIMAL_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "plan_id", type: "uint256" }],
    name: "subscribe",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getPlans",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "subscriptionId",
        type: "uint256",
      },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: true,
        internalType: "uint256",
        name: "planId",
        type: "uint256",
      },
    ],
    name: "SubscriptionCreated",
    type: "event",
  },
];

async function testMinimalSubscribe() {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      MINIMAL_ABI,
      provider
    );

    console.log("🔍 Testing with minimal ABI...");
    console.log(
      "📋 Contract interface events:",
      Object.keys(contract.interface.events)
    );

    // Check if event is recognized
    if (contract.interface.events["SubscriptionCreated"]) {
      console.log("✅ SubscriptionCreated event found in interface");
    } else {
      console.log("❌ SubscriptionCreated event NOT found in interface");
    }

    const plans = await contract.getPlans();
    console.log(
      "📊 Available plans:",
      plans.map((p) => p.toString()).join(", ")
    );

    console.log("\n💡 To test subscription with your wallet:");
    console.log('1. Set your private key: $env:PRIVATE_KEY="your_private_key"');
    console.log("2. Run: node test-wallet-subscribe.js");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testMinimalSubscribe();
