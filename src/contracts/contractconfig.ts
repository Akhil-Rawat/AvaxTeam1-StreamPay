import CONTRACT_ABI_JSON from "./complete-abi.json" assert { type: "json" };

export const CONTRACT_CONFIG = {
  CONTRACT_ADDRESS: "0x08006F413fbb555eFfcc9A27e9A01980B0e42207",
  CONTRACT_ABI: CONTRACT_ABI_JSON,
  NETWORK_ID: 43113, // Avalanche Fuji
  NETWORK_NAME: "Avalanche Fuji",
  NETWORK_RPC_URL: "https://api.avax-test.network/ext/bc/C/rpc",
};

export const CONTRACT_FUNCTIONS = {
  ProviderRegister: "registerProvider",
  CreatePlan: "createPlan",
  Subscribe: "subscribe",
  ProcessPayments: "processSubscriptionPayment",
  UserBalance: "getUserBalance",
  WithdrawBalance: "withdraw",
  AllPlans: "getPlans",
  Deposite: "deposit",
};

export const CONTRACT_ERRORS = {
  Unauthorized: "Unauthorized",
  InvalidInput: "InvalidInput",
  InsufficientFunds: "InsufficientFunds",
  NotFound: "NotFound",
};
