// Test provider registration functions
import { ethers } from "ethers";
import { readFileSync } from "fs";

const CONTRACT_ABI_JSON = JSON.parse(
  readFileSync("./complete-abi.json", "utf8")
);

const CONTRACT_ADDRESS = "0xe65365Ea1cfb28dafD5fF6246a2E2A124A13093B";
const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";

async function testProviderFunctions() {
  console.log("🔍 Testing provider registration functions...");

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI_JSON,
      provider
    );

    console.log("✅ Contract created successfully");
    console.log("📋 Contract address:", CONTRACT_ADDRESS);

    // Test if functions exist
    const functions = [
      "registerProvider",
      "createPlan",
      "isProviderRegistered",
    ];

    console.log("\n📋 Checking function availability:");
    functions.forEach((funcName) => {
      try {
        const func = contract.interface.getFunction(funcName);
        console.log(`✅ ${funcName}: ${func.format()}`);
      } catch (e) {
        console.log(`❌ ${funcName}: NOT FOUND`);
      }
    });

    // List all functions for reference
    console.log("\n📋 All available functions:");
    contract.interface.forEachFunction((func) => {
      console.log(
        `  • ${func.name}(${func.inputs
          .map((i) => `${i.name}: ${i.type}`)
          .join(", ")})`
      );
    });

    // Check recent transactions that might be provider registrations
    console.log("\n🔍 Checking for any provider registration attempts...");
    const latestBlock = await provider.getBlockNumber();
    console.log("Latest block:", latestBlock);

    // Look for transactions in last 50 blocks
    for (let i = 0; i < 50; i++) {
      try {
        const blockNumber = latestBlock - i;
        const block = await provider.getBlock(blockNumber, true);

        if (block && block.transactions) {
          const contractTxs = block.transactions.filter(
            (tx) =>
              tx.to && tx.to.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()
          );

          for (const tx of contractTxs) {
            try {
              // Try to decode the transaction data
              const decoded = contract.interface.parseTransaction({
                data: tx.data,
                value: tx.value,
              });

              if (
                decoded &&
                (decoded.name === "registerProvider" ||
                  decoded.name === "createPlan")
              ) {
                console.log(
                  `📦 Found ${decoded.name} transaction in block ${blockNumber}:`
                );
                console.log(`  Hash: ${tx.hash}`);
                console.log(`  From: ${tx.from}`);
                console.log(`  Args:`, decoded.args);
              }
            } catch (e) {
              // Skip if can't decode
            }
          }
        }
      } catch (e) {
        // Skip this block if error
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testProviderFunctions();
