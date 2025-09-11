// Test script focusing on the main subscription issue
import { ethers } from "ethers";
import fs from "fs";

const CONTRACT_ADDRESS = "0xe65365Ea1cfb28dafD5fF6246a2E2A124A13093B";
const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";

// Load ABI
const contractABI = JSON.parse(
  fs.readFileSync("./src/contracts/complete-abi.json", "utf8")
);

async function main() {
  console.log("🔍 Testing StreamPay Contract Events and Functions...\n");

  // Connect to provider
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

  try {
    console.log("📋 Contract ABI loaded:", contractABI ? "YES" : "NO");
    console.log("📋 Interface created:", contract.interface ? "YES" : "NO");

    // Try to call getPlans to test the contract
    console.log("\n� Testing contract functionality...");
    const plans = await contract.getPlans();
    console.log("✅ Contract is working! Plans found:", plans.length);

    // Get all plans
    console.log(
      "Plan IDs:",
      plans.map((id) => id.toString())
    );

    // Let's look at recent events from the contract
    console.log("\n📜 Looking for recent events...");
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - 10000); // Look at last 10k blocks

    console.log(`Searching blocks ${fromBlock} to ${latestBlock}...`);

    const filter = {
      address: CONTRACT_ADDRESS,
      fromBlock: fromBlock,
      toBlock: latestBlock,
    };

    const logs = await provider.getLogs(filter);
    console.log(`Found ${logs.length} events`);

    // Parse each log
    for (let i = 0; i < Math.min(logs.length, 10); i++) {
      const log = logs[i];
      try {
        const parsed = contract.interface.parseLog(log);
        console.log(`Event ${i + 1}: ${parsed.name}`);
        console.log(`  Args:`, parsed.args);
        console.log(`  Block:`, log.blockNumber);
        console.log("---");
      } catch (error) {
        console.log(`Event ${i + 1}: Could not parse log`);
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

main()
  .then(() => console.log("\n✅ Test completed"))
  .catch(console.error);
