import { ethers } from 'ethers';

// Contract Configuration
export const CONTRACT_ADDRESS = "0x08006F413fbb555eFfcc9A27e9A01980B0e42207";
export const RPC_URL = "https://api.avax-test.network/ext/bc/C/rpc";

// Minimal ABI for MVP
export const CONTRACT_ABI = [
  {
    "type": "function",
    "name": "createPlan",
    "inputs": [
      {"name": "price", "type": "uint256"},
      {"name": "interval", "type": "uint256"}
    ],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "subscribe",
    "inputs": [{"name": "planId", "type": "uint256"}],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "registerProvider",
    "inputs": [{"name": "name", "type": "string"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "planPrice",
    "inputs": [{"name": "", "type": "uint256"}],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "planInterval",
    "inputs": [{"name": "", "type": "uint256"}],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "PlanCreated",
    "inputs": [
      {"name": "planId", "type": "uint256", "indexed": true},
      {"name": "provider", "type": "address", "indexed": true},
      {"name": "price", "type": "uint256"},
      {"name": "interval", "type": "uint256"}
    ]
  },
  {
    "type": "event",
    "name": "SubscriptionCreated",
    "inputs": [
      {"name": "subscriptionId", "type": "uint256", "indexed": true},
      {"name": "user", "type": "address", "indexed": true},
      {"name": "planId", "type": "uint256", "indexed": true}
    ]
  }
];

// Get provider (read-only)
export const getProvider = () => {
  return new ethers.JsonRpcProvider(RPC_URL);
};

// Get signer from MetaMask
export const getSigner = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not detected');
  }
  
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const provider = new ethers.BrowserProvider(window.ethereum);
  return await provider.getSigner();
};

// Get contract instance with signer
export const getContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

// Get read-only contract instance
export const getReadOnlyContract = () => {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

// Utility functions
export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    return { address, signer };
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
};

// Check if wallet is connected
export const getConnectedWallet = async () => {
  try {
    if (!window.ethereum) return null;
    
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) return null;
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    return { address, signer };
  } catch (error) {
    console.error('Get wallet error:', error);
    return null;
  }
};

// Switch to Avalanche Fuji network
export const switchToAvalancheFuji = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xA869' }], // Avalanche Fuji testnet
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xA869',
              chainName: 'Avalanche Fuji Testnet',
              nativeCurrency: {
                name: 'AVAX',
                symbol: 'AVAX',
                decimals: 18,
              },
              rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
              blockExplorerUrls: ['https://testnet.avascan.info/'],
            },
          ],
        });
      } catch (addError) {
        throw addError;
      }
    } else {
      throw switchError;
    }
  }
};

// Format AVAX amount for display
export const formatAvax = (wei) => {
  return ethers.formatEther(wei);
};

// Parse AVAX amount to wei
export const parseAvax = (avax) => {
  return ethers.parseEther(avax.toString());
};