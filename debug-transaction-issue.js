// Debug why transactions aren't reaching the blockchain
import { ethers } from "ethers";
import { readFileSync } from "fs";

const CONTRACT_ABI_JSON = JSON.parse(
  readFileSync("./complete-abi.json", "utf8")
);
const CONTRACT_ADDRESS = "0xe65365Ea1cfb28dafD5fF6246a2E2A124A13093B";
const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";

async function debugTransactionIssue() {
  console.log("🔍 Debugging transaction submission issue...");

  try {
    // Test with JsonRpcProvider (read-only)
    console.log("📡 Testing RPC connection...");
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    const network = await provider.getNetwork();
    console.log(
      "✅ Network:",
      network.name,
      "Chain ID:",
      network.chainId.toString()
    );

    const latestBlock = await provider.getBlockNumber();
    console.log("✅ Latest block:", latestBlock);

    // Test contract connection
    console.log("📋 Testing contract connection...");
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI_JSON,
      provider
    );

    // Test a read-only function first
    try {
      const plans = await contract.getPlans();
      console.log("✅ Contract read test successful");
      console.log("📊 Current plans count:", plans.length);
    } catch (e) {
      console.error("❌ Contract read test failed:", e.message);
    }

    // Now test the specific transaction hashes from the console
    const txHashes = [
      "0xfc0ea40b08139dceb11ab8b4772d854750cf73d625730f1097db61fa8e3d80db",
      "0x461f76a7a54e4297269d639cf2bc5c1743e5b1187563044e329fdc9e02858621",
    ];

    console.log("\n🔍 Checking transaction hashes...");
    for (const hash of txHashes) {
      console.log(`Checking ${hash}...`);
      try {
        const tx = await provider.getTransaction(hash);
        if (tx) {
          console.log(`✅ Transaction found:`, {
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: ethers.formatEther(tx.value || 0),
            blockNumber: tx.blockNumber,
          });
        } else {
          console.log(`❌ Transaction not found on blockchain`);
        }
      } catch (e) {
        console.log(`❌ Error checking transaction:`, e.message);
      }
    }

    // Check what the issue might be
    console.log("\n🔍 Possible issues:");
    console.log("1. Transactions were only simulated locally, not broadcast");
    console.log("2. MetaMask submitted to wrong network");
    console.log("3. Gas estimation failed silently");
    console.log("4. Network congestion caused drops");
    console.log("5. ethers.js version compatibility issue");
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
  }
}

debugTransactionIssue();
