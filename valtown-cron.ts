// @cron * * * * *
// StreamPay Recurring Payments Processor - Runs every minute on Val.town
// Deploy this script to Val.town and add your PRIVATE_KEY to environment variables

import { ethers } from "npm:ethers@6.8.0";

// Contract configuration
const CONTRACT_ADDRESS = "0x08006F413fbb555eFfcc9A27e9A01980B0e42207";
const RPC_URL = "https://api.avax-test.network/ext/bc/C/rpc";

// Complete StreamPay Contract ABI
const CONTRACT_ABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "admin",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "createPlan",
    "inputs": [
      {
        "name": "price",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "interval",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "deposit",
    "inputs": [],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "getPlans",
    "inputs": [
      {
        "name": "max",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserBalance",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isProviderRegistered",
    "inputs": [
      {
        "name": "provider",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "nextPlanId",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "nextSubscriptionId",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "planInterval",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "planPrice",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "planProvider",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "processSubscriptionPayment",
    "inputs": [
      {
        "name": "subscriptionId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "protocolFeeBps",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "registerProvider",
    "inputs": [
      {
        "name": "name",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "registeredProviders",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "subscribe",
    "inputs": [
      {
        "name": "planId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "subscriptionActive",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "subscriptionLastPayment",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "subscriptionPlanId",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "subscriptionSubscriber",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "userEscrowBalance",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "withdraw",
    "inputs": [
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "EscrowDeposit",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "newBalance",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "EscrowWithdrawal",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "newBalance",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PaymentProcessed",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "subscriptionId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PlanCreated",
    "inputs": [
      {
        "name": "planId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "provider",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "price",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "interval",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ProviderEarnings",
    "inputs": [
      {
        "name": "provider",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "planId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ProviderRegistered",
    "inputs": [
      {
        "name": "provider",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "name",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "SubscriptionCreated",
    "inputs": [
      {
        "name": "subscriptionId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "planId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  }
];

/**
 * StreamPay Recurring Payments Cron Job
 * 
 * This function runs every minute to process due subscription payments.
 * It checks all active subscriptions and processes payments that are due.
 * 
 * Setup Instructions:
 * 1. Deploy this script to Val.town
 * 2. Add PRIVATE_KEY to your Val.town environment variables
 * 3. The script will automatically run every minute
 * 
 * @returns {Object} Processing results with success status and metrics
 */
export default async function handler() {
  const startTime = Date.now();
  console.log(`🚀 StreamPay Payment Processor started at ${new Date().toISOString()}`);
  
  try {
    // Get private key from Val.town environment variables
    const privateKey = process.env.PRIVATE_KEY || Deno.env.get("PRIVATE_KEY");
    if (!privateKey) {
      throw new Error("❌ PRIVATE_KEY not found in environment variables");
    }

    // Initialize ethers provider and wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

    console.log(`🔗 Connected to Avalanche Fuji with wallet: ${wallet.address}`);

    // Get current block timestamp and next subscription ID
    const currentBlock = await provider.getBlock("latest");
    const currentTime = currentBlock?.timestamp || Math.floor(Date.now() / 1000);
    const nextSubId = await contract.nextSubscriptionId();
    
    console.debug(`⏰ Current time: ${currentTime}, Total subscriptions: ${nextSubId - 1n}`);

    let processedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const processedSubs: number[] = [];
    const errorSubs: { id: number; error: string }[] = [];

    // Check all subscriptions for due payments
    for (let subId = 1n; subId < nextSubId; subId++) {
      try {
        // Check if subscription is active
        const isActive = await contract.subscriptionActive(subId);
        if (!isActive) {
          console.debug(`⏭️  Subscription ${subId}: Inactive`);
          skippedCount++;
          continue;
        }

        // Get subscription details
        const [lastPayment, planId] = await Promise.all([
          contract.subscriptionLastPayment(subId),
          contract.subscriptionPlanId(subId)
        ]);

        const planInterval = await contract.planInterval(planId);
        const nextPaymentDue = lastPayment + planInterval;

        console.debug(`📋 Subscription ${subId}: Last payment ${lastPayment}, Due at ${nextPaymentDue}, Current ${currentTime}`);

        // Check if payment is due (with 30 second buffer for execution timing)
        if (currentTime >= (nextPaymentDue - 30)) {
          console.log(`💰 Processing payment for subscription ${subId}...`);
          
          // Process the payment with auto gas settings (Fuji testnet optimized)
          const tx = await contract.processSubscriptionPayment(subId);

          console.log(`✅ Payment transaction sent for subscription ${subId}: ${tx.hash}`);
          
          // Wait for confirmation
          const receipt = await tx.wait(1);
          console.log(`✅ Payment confirmed for subscription ${subId} in block ${receipt?.blockNumber}`);
          
          processedCount++;
          processedSubs.push(Number(subId));
        } else {
          const timeUntilDue = nextPaymentDue - currentTime;
          console.debug(`⏳ Subscription ${subId}: Payment due in ${timeUntilDue} seconds`);
          skippedCount++;
        }

      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Error processing subscription ${subId}: ${errorMessage}`);
        errorSubs.push({ id: Number(subId), error: errorMessage });
        
        // Log specific error types for better debugging
        if (errorMessage.includes("insufficient funds")) {
          console.debug(`💸 Insufficient escrow balance for subscription ${subId}`);
        } else if (errorMessage.includes("Not due")) {
          console.debug(`⏰ Payment not yet due for subscription ${subId}`);
        } else if (errorMessage.includes("Inactive")) {
          console.debug(`❌ Subscription ${subId} is inactive`);
        }
        
        // Continue processing other subscriptions even if one fails
        continue;
      }
    }

    // Summary report with execution time
    const executionTime = Date.now() - startTime;
    const summary = {
      success: true,
      processed: processedCount,
      skipped: skippedCount,
      errors: errorCount,
      total: Number(nextSubId - 1n),
      executionTime: `${executionTime}ms`,
      timestamp: new Date().toISOString(),
      contractAddress: CONTRACT_ADDRESS,
      network: "Avalanche Fuji",
      processedSubscriptions: processedSubs,
      errorDetails: errorSubs
    };

    console.log(`📊 Payment processing complete:`, JSON.stringify(summary, null, 2));
    return summary;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("💥 Fatal error in payment processor:", errorMessage);
    return {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      contractAddress: CONTRACT_ADDRESS,
      network: "Avalanche Fuji"
    };
  }
}