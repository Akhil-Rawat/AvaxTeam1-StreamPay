// Check current contract state and recent transactions
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xe65365Ea1cfb28dafD5fF6246a2E2A124A13093B";
const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";

async function checkContractState() {
  console.log("🔍 Checking contract state...");

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Check if contract exists
    const code = await provider.getCode(CONTRACT_ADDRESS);
    console.log("📋 Contract code length:", code.length);
    console.log("✅ Contract exists:", code !== "0x");

    // Get latest block
    const latestBlock = await provider.getBlockNumber();
    console.log("📊 Latest block:", latestBlock);

    // Check contract balance
    const balance = await provider.getBalance(CONTRACT_ADDRESS);
    console.log("💰 Contract balance:", ethers.formatEther(balance), "ETH");

    // Get recent transactions to this contract (last 10 blocks)
    console.log("\n🔄 Checking recent transactions...");
    for (let i = 0; i < 10; i++) {
      const blockNumber = latestBlock - i;
      try {
        const block = await provider.getBlock(blockNumber, true);
        if (block && block.transactions) {
          const contractTxs = block.transactions.filter(
            (tx) =>
              tx.to && tx.to.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()
          );

          if (contractTxs.length > 0) {
            console.log(`📦 Block ${blockNumber}:`);
            contractTxs.forEach((tx) => {
              console.log(
                `  • ${tx.hash} - Value: ${ethers.formatEther(
                  tx.value || 0
                )} ETH`
              );
            });
          }
        }
      } catch (e) {
        console.log(`❌ Error checking block ${blockNumber}:`, e.message);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkContractState();
