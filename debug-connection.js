// Simple subscription test
console.log("Testing subscription manually...");

// Check if we're on the right network
if (window.ethereum) {
  window.ethereum.request({ method: "eth_chainId" }).then((chainId) => {
    console.log("Current chain ID:", chainId);
    console.log("Expected chain ID: 0x66eee (421614)");
    if (chainId !== "0x66eee") {
      console.error("❌ Wrong network! Switch to Arbitrum Sepolia");
    } else {
      console.log("✅ Correct network");
    }
  });

  // Check account
  window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
    console.log("Connected account:", accounts[0]);
  });

  // Check balance
  window.ethereum
    .request({
      method: "eth_getBalance",
      params: [window.ethereum.selectedAddress, "latest"],
    })
    .then((balance) => {
      console.log("Balance:", parseInt(balance, 16) / 1e18, "ETH");
    });
}

console.log("Run this in browser console to debug your connection!");
