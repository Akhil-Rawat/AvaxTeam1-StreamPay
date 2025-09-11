// Check if provider was actually registered on-chain
import { ethers } from "ethers";
import CONTRACT_ABI_JSON from "./complete-abi.json" assert { type: "json" };

const CONTRACT_ADDRESS = "0xe65365Ea1cfb28dafD5fF6246a2E2A124A13093B";
const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";

// Your wallet address from the screenshot
const YOUR_ADDRESS = "0x2Bc2...109b"; // Replace with your full address

async function checkProviderStatus() {
  console.log("🔍 Checking if provider was registered...");

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI_JSON,
      provider
    );

    // Check if your address is registered as a provider
    try {
      const isRegistered = await contract.isProviderRegistered(YOUR_ADDRESS);
      console.log("✅ Provider registration status:", isRegistered);
    } catch (e) {
      console.log("❌ Could not check provider status:", e.message);
    }

    // Get recent transactions to see if registration went through
    console.log("\n🔄 Checking recent contract transactions...");
    const latestBlock = await provider.getBlockNumber();

    for (let i = 0; i < 20; i++) {
      try {
        const blockNumber = latestBlock - i;
        const block = await provider.getBlock(blockNumber, true);

        if (block && block.transactions) {
          const contractTxs = block.transactions.filter(
            (tx) =>
              tx.to && tx.to.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()
          );

          if (contractTxs.length > 0) {
            console.log(`📦 Block ${blockNumber}:`);
            for (const tx of contractTxs) {
              console.log(
                `  • ${tx.hash} from ${tx.from} - Value: ${ethers.formatEther(
                  tx.value || 0
                )} ETH`
              );

              // Try to get transaction receipt to see function called
              try {
                const receipt = await provider.getTransactionReceipt(tx.hash);
                if (receipt && receipt.logs.length > 0) {
                  console.log(
                    `    └─ ${receipt.logs.length} logs/events emitted`
                  );
                }
              } catch (e) {
                // Skip receipt check if it fails
              }
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

checkProviderStatus();
