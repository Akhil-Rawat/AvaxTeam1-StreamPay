import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

// Simplified wallet connection hook
// In production, this would use Wagmi/RainbowKit
export const useWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet was previously connected
  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      setIsConnected(true);
      setAddress(savedAddress);
    }
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockAddress = '0x742d35Cc6676C0532925a3b8D926AD3e9c5bFe37';
      setAddress(mockAddress);
      setIsConnected(true);
      localStorage.setItem('walletAddress', mockAddress);
      toast.success('Wallet connected successfully!');
    } catch (error) {
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setIsConnected(false);
    localStorage.removeItem('walletAddress');
    toast.success('Wallet disconnected');
  };

  return {
    isConnected,
    address,
    isConnecting,
    connectWallet,
    disconnectWallet,
  };
};