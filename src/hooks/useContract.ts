import { useState } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { CONTRACT_CONFIG, CONTRACT_FUNCTIONS, CONTRACT_ERRORS } from '../contracts/contractconfig';
import { useWallet } from './useWallet';

// Add type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}


export const useStreamPayContract = () => {
  const { isConnected, address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize provider and contract
  const getContract = async () => {
    if (!isConnected) throw new Error(CONTRACT_ERRORS.Unauthorized);
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_CONFIG.CONTRACT_ADDRESS, CONTRACT_CONFIG.CONTRACT_ABI, signer);
  };

  // Register a provider on-chain
  const registerProvider = async (name: string) => {
    setIsLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract[CONTRACT_FUNCTIONS.ProviderRegister](name);
      await tx.wait();
      toast.success('Provider registered successfully!');
      return tx;
    } catch (error: any) {
      console.error(error);
      toast.error(error?.reason || 'Failed to register provider');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a plan on-chain
  const createPlan = async (price: string, interval: number, metadataHash: string) => {
    setIsLoading(true);
    try {
      const contract = await getContract();
      const priceWei = ethers.parseEther(price); // Convert ETH to Wei
      const tx = await contract[CONTRACT_FUNCTIONS.CreatePlan](priceWei, interval, metadataHash);
      const receipt = await tx.wait();
      toast.success('Plan created successfully!');
      return receipt;
    } catch (error: any) {
      console.error(error);
      toast.error(error?.reason || 'Failed to create plan');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to a plan
  const subscribe = async (planId: string, price: string) => {
    setIsLoading(true);
    try {
      const contract = await getContract();
      console.log("Subscribing with:", { planId, price });
      const tx = await contract[CONTRACT_FUNCTIONS.Subscribe](planId, {
        value: ethers.parseEther(price),
      });
      await tx.wait();
      toast.success('Subscribed successfully!');
      return tx;
    } catch (error: any) {
      console.error(error);
      toast.error(error?.reason || 'Failed to subscribe');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw earnings
  const withdrawEarnings = async (amount: string) => {
    setIsLoading(true);
    try {
      const contract = await getContract();
      const amountWei = ethers.parseEther(amount);
      const tx = await contract[CONTRACT_FUNCTIONS.WithdrawBalance](amountWei);
      await tx.wait();
      toast.success('Withdraw successful!');
      return tx;
    } catch (error: any) {
      console.error(error);
      toast.error(error?.reason || 'Failed to withdraw');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get user balance
  const getUserBalance = async () => {
    try {
      const contract = await getContract();
      const balance = await contract[CONTRACT_FUNCTIONS.UserBalance](address);
      return ethers.formatEther(balance);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to fetch balance');
      throw error;
    }
  };

  // Process subscription payments (only for admin/provider)
  const processPayments = async (subscriptionId: string) => {
    setIsLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract[CONTRACT_FUNCTIONS.ProcessPayments](subscriptionId);
      await tx.wait();
      toast.success('Payment processed successfully!');
      return tx;
    } catch (error: any) {
      console.error(error);
      toast.error(error?.reason || 'Failed to process payment');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const Deposite = async (amount: string) => {
    setIsLoading(true);
    try {
      const contract = await getContract();

      // Send ETH value along with the tx
      const tx = await contract[CONTRACT_FUNCTIONS.Deposite]({
        value: ethers.parseEther(amount),
      });

      await tx.wait();
      toast.success('Deposit successful!');
      return tx;
    } catch (error: any) {
      console.error(error);
      toast.error(error?.reason || 'Failed to deposit');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  // Fetch all plans
  const getAllPlans = async () => {
    try {
      const contract = await getContract();
      const plans = await contract[CONTRACT_FUNCTIONS.AllPlans]();
      return plans;
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to fetch plans');
      throw error;
    }
  };

  return {
    registerProvider,
    createPlan,
    subscribe,
    withdrawEarnings,
    getUserBalance,
    processPayments,
    getAllPlans,
    Deposite,
    isLoading,
  };
};
