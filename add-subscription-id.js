// Manual script to add known subscription IDs to localStorage
// Since we know subscription ID 2 exists for plan 1

console.log("Adding known subscription IDs to localStorage...");

// Your subscription ID 2 for plan 1
localStorage.setItem("subscription_1", "2");

console.log("✅ Added: subscription_1 = 2");
console.log("Now refresh your subscriptions page to see it!");

// Check what's in localStorage
console.log("\nCurrent localStorage items:");
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith("subscription_")) {
    console.log(`${key}: ${localStorage.getItem(key)}`);
  }
}
