import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpCircle, DollarSign, Sparkles, TrendingUp, Shield, RefreshCw } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { useStreamPayContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { DepositComponent } from './DepositComponent';

interface WalletStatusCardProps {
  className?: string;
}

export const WalletStatusCard: React.FC<WalletStatusCardProps> = ({ className = '' }) => {
  const [userBalance, setUserBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBalance();
    setRefreshing(false);
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

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const balanceValue = parseFloat(userBalance || '0');
  const getBalanceStatus = () => {
    if (balanceValue >= 10) return { status: 'high', color: 'emerald', message: 'Excellent balance!' };
    if (balanceValue >= 1) return { status: 'medium', color: 'amber', message: 'Good for subscriptions' };
    if (balanceValue > 0) return { status: 'low', color: 'orange', message: 'Consider depositing more' };
    return { status: 'empty', color: 'red', message: 'Deposit required' };
  };

  const balanceStatus = getBalanceStatus();

  if (!isConnected) {
    return (
      <Card className={`relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-xl card-hover ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center floating-animation">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">!</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-xl gradient-text">Connect Wallet</h3>
                <p className="text-gray-600 text-sm">Connect to view balance and subscribe to plans</p>
              </div>
            </div>
            <Button 
              onClick={connectWallet} 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 py-3 glow-button"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Connect
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card className="relative overflow-hidden bg-white border-0 shadow-xl card-hover shimmer">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 to-teal-50/80"></div>
        <div className="relative p-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${address}`} />
                <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold">
                  {address?.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-bold text-lg text-gray-900">
                    {address && formatAddress(address)}
                  </h3>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1 pulse-slow"></div>
                    Connected
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 font-medium">StreamPay Balance</p>
              </div>
            </div>
            
            {/* Balance Display */}
            <div className="text-right">
              {loading ? (
                <Skeleton className="w-24 h-8 mb-1" />
              ) : (
                <div className="flex items-center space-x-2 justify-end mb-1">
                  <div className={`p-1 rounded-full bg-${balanceStatus.color}-100`}>
                    <DollarSign className={`w-4 h-4 text-${balanceStatus.color}-600`} />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {balanceValue.toFixed(4)} AVAX
                  </span>
                </div>
              )}
              {!loading && (
                <p className={`text-xs font-medium text-${balanceStatus.color}-600`}>
                  {balanceStatus.message}
                </p>
              )}
            </div>
          </div>

          <Separator className="bg-gradient-to-r from-emerald-200 to-teal-200 mb-6" />

          {/* Balance Status Bar */}
          {!loading && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Balance Health</span>
                <span className="text-xs text-gray-500">{Math.min(balanceValue * 10, 100).toFixed(0)}%</span>
              </div>
              <Progress 
                value={Math.min(balanceValue * 10, 100)} 
                className="h-2"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 mb-6">
            <Button
              onClick={() => setShowDeposit(!showDeposit)}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold glow-button"
            >
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              {showDeposit ? 'Hide Deposit' : 'Deposit Funds'}
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={loading || refreshing}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <RefreshCw className={`w-4 h-4 ${(loading || refreshing) ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Status Messages */}
          {!loading && (
            <div className={`p-4 rounded-lg bg-gradient-to-r ${
              balanceValue > 0 
                ? 'from-emerald-50 to-teal-50 border border-emerald-200' 
                : 'from-orange-50 to-amber-50 border border-orange-200'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  balanceValue > 0 ? 'bg-emerald-100' : 'bg-orange-100'
                }`}>
                  {balanceValue > 0 ? (
                    <Shield className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                  )}
                </div>
                <div>
                  <p className={`font-medium ${
                    balanceValue > 0 ? 'text-emerald-800' : 'text-orange-800'
                  }`}>
                    {balanceValue > 0 ? 'Ready for Subscriptions' : 'Deposit Required'}
                  </p>
                  <p className={`text-sm ${
                    balanceValue > 0 ? 'text-emerald-600' : 'text-orange-600'
                  }`}>
                    {balanceValue > 0 
                      ? 'You can subscribe to any available plan'
                      : 'Deposit AVAX to start subscribing to plans'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {!loading && balanceValue > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Status</p>
                <p className="font-bold text-blue-700 capitalize">{balanceStatus.status}</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Secured</p>
                <p className="font-bold text-purple-700">{balanceValue.toFixed(2)} AVAX</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg">
                <Sparkles className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Value</p>
                <p className="font-bold text-emerald-700">${(balanceValue * 25).toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Deposit Component */}
      {showDeposit && (
        <div className="mt-4">
          <div className="p-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <div className="bg-white rounded-lg p-4">
              <DepositComponent
                onDepositSuccess={handleDepositSuccess}
                className="border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletStatusCard;