import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpCircle, DollarSign } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useStreamPayContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { DepositComponent } from './DepositComponent';
import { ethers } from 'ethers';

interface WalletStatusCardProps {
  className?: string;
}

export const WalletStatusCard: React.FC<WalletStatusCardProps> = ({ className = '' }) => {
  const [userBalance, setUserBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const { getUserBalance } = useStreamPayContract();
  const { isConnected, address, connectWallet } = useWallet();

  const fetchBalance = async () => {
    if (!isConnected) {
      console.log('⚠️ Cannot fetch balance: wallet not connected');
      return;
    }
    
    try {
      console.log('💰 Fetching user balance...');
      setLoading(true);
      const balance = await getUserBalance();
      console.log('✅ Balance received:', balance);
      setUserBalance(balance);
    } catch (error) {
      console.error('❌ Failed to fetch balance:', error);
      setUserBalance('0');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchBalance();
    } else {
      setLoading(false);
    }
  }, [isConnected]);

  const handleDepositSuccess = () => {
    fetchBalance(); // Refresh balance after deposit
    setShowDeposit(false);
  };

  if (!isConnected) {
    return (
      <Card className={`p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Connect Wallet</h3>
              <p className="text-sm text-gray-600">Connect to view balance and subscribe</p>
            </div>
          </div>
          <Button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700">
            Connect
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </h3>
              <p className="text-sm text-gray-600">StreamPay Balance</p>
            </div>
          </div>
          <div className="text-right">
            {loading ? (
              <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-xl font-bold text-green-700">
                  {parseFloat(userBalance || '0').toFixed(4)} AVAX
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={() => setShowDeposit(!showDeposit)}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1 border-green-300 text-green-700 hover:bg-green-100"
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>Deposit</span>
          </Button>
          <Button
            onClick={fetchBalance}
            variant="outline"
            size="sm"
            disabled={loading}
            className="border-green-300 text-green-700 hover:bg-green-100"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Balance Status Messages */}
        {!loading && (
          <div className="mt-3 text-xs">
            {parseFloat(userBalance || '0') > 0 ? (
              <p className="text-green-600 flex items-center space-x-1">
                <span>✅</span>
                <span>Ready to subscribe to plans</span>
              </p>
            ) : (
              <p className="text-orange-600 flex items-center space-x-1">
                <span>⚠️</span>
                <span>Deposit AVAX to subscribe to plans</span>
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Deposit Component */}
      {showDeposit && (
        <div className="mt-4">
          <DepositComponent
            onDepositSuccess={handleDepositSuccess}
            className="border-green-200"
          />
        </div>
      )}
    </div>
  );
};

export default WalletStatusCard;