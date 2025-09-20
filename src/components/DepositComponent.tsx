import React, { useState } from 'react';
import { useStreamPayContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import toast from 'react-hot-toast';

interface DepositComponentProps {
  onDepositSuccess?: () => void;
  className?: string;
}

export const DepositComponent: React.FC<DepositComponentProps> = ({
  onDepositSuccess,
  className = ''
}) => {
  const [depositAmount, setDepositAmount] = useState('');
  const { Deposite, isLoading } = useStreamPayContract();
  const { isConnected, connectWallet } = useWallet();
  const [isValidating, setIsValidating] = useState(false);

  const handleDeposit = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Please enter a valid deposit amount');
      return;
    }

    try {
      setIsValidating(true);
      
      // Call the deposit function
      const tx = await Deposite(depositAmount);
      
      toast.success(`Successfully deposited ${depositAmount} AVAX!`);
      
      // Clear the input
      setDepositAmount('');
      
      // Call the success callback if provided
      if (onDepositSuccess) {
        onDepositSuccess();
      }
      
      console.log('✅ Deposit transaction:', tx);
      
    } catch (error: any) {
      console.error('❌ Deposit failed:', error);
      
      // More specific error handling
      if (error.code === 'INSUFFICIENT_FUNDS') {
        toast.error('Insufficient AVAX balance for deposit');
      } else if (error.code === 'USER_REJECTED') {
        toast.error('Transaction was cancelled');
      } else {
        toast.error(error?.reason || error?.message || 'Deposit failed');
      }
    } finally {
      setIsValidating(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            💰 Deposit Funds
          </h3>
          <p className="text-gray-600 mb-4">
            Connect your wallet to deposit AVAX into your StreamPay account
          </p>
          <Button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700">
            Connect Wallet
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            💰 Deposit AVAX
          </h3>
          <p className="text-sm text-gray-600">
            Deposit AVAX to your StreamPay account for subscriptions
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="deposit-amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount (AVAX)
            </label>
            <Input
              id="deposit-amount"
              type="number"
              step="0.001"
              min="0"
              placeholder="Enter amount to deposit"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full"
              disabled={isLoading || isValidating}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDepositAmount('0.1')}
              disabled={isLoading || isValidating}
            >
              0.1 AVAX
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDepositAmount('1')}
              disabled={isLoading || isValidating}
            >
              1 AVAX
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDepositAmount('5')}
              disabled={isLoading || isValidating}
            >
              5 AVAX
            </Button>
          </div>

          <Button
            onClick={handleDeposit}
            disabled={isLoading || isValidating || !depositAmount || parseFloat(depositAmount) <= 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading || isValidating ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Depositing...
              </div>
            ) : (
              `Deposit ${depositAmount || '0'} AVAX`
            )}
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>⚡ Funds are secured in the StreamPay escrow contract</p>
          <p>🔒 You maintain full control of your deposited funds</p>
        </div>
      </div>
    </Card>
  );
};

export default DepositComponent;