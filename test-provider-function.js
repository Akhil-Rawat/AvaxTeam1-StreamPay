// Test provider registration function
import { ethers } from "ethers";
import CONTRACT_ABI_JSON from "./complete-abi.json" assert { type: "json" };

const CONTRACT_ADDRESS = "0xe65365Ea1cfb28dafD5fF6246a2E2A124A13093B";
const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";

async function testProviderRegistration() {
  console.log("🔍 Testing provider registration function...");

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI_JSON,
      provider
    );

    console.log("✅ Contract created successfully");
    console.log("📋 Contract address:", CONTRACT_ADDRESS);

    // Check if registerProvider function exists
    const registerProviderFunction =
      contract.interface.getFunction("registerProvider");
    console.log(
      "✅ registerProvider function found:",
      registerProviderFunction.name
    );
    console.log("📝 Function signature:", registerProviderFunction.format());

    // Check if isProviderRegistered function exists (to test later)
    try {
      const isRegisteredFunction = contract.interface.getFunction(
        "isProviderRegistered"
      );
      console.log(
        "✅ isProviderRegistered function found:",
        isRegisteredFunction.name
      );
      console.log("📝 Function signature:", isRegisteredFunction.format());
    } catch (e) {
      console.log("❌ isProviderRegistered function not found");
    }

    // List all available functions
    console.log("\n📋 All available functions:");
    contract.interface.forEachFunction((func) => {
      console.log(
        `  • ${func.name}(${func.inputs.map((i) => i.type).join(", ")})`
      );
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testProviderRegistration();
