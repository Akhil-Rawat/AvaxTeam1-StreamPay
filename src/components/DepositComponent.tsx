import React, { useState } from 'react';
import { useStreamPayContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { 
  Wallet, 
  Shield, 
  Zap, 
  DollarSign, 
  Lock, 
  ArrowUpCircle, 
  Sparkles,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
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

  const depositValue = parseFloat(depositAmount || '0');
  const getDepositStatus = () => {
    if (depositValue >= 10) return { level: 'high', color: 'emerald', message: 'Excellent deposit!' };
    if (depositValue >= 1) return { level: 'medium', color: 'blue', message: 'Great for subscriptions' };
    if (depositValue > 0) return { level: 'low', color: 'amber', message: 'Good start' };
    return { level: 'none', color: 'gray', message: 'Enter amount' };
  };

  const depositStatus = getDepositStatus();

  if (!isConnected) {
    return (
      <Card className={`relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 border-0 shadow-xl card-hover ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-violet-400/10 to-purple-400/10"></div>
        <div className="relative p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center floating-animation">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold gradient-text mb-2">
                Deposit Funds
              </h3>
              <p className="text-gray-600">
                Connect your wallet to deposit AVAX into your StreamPay account
              </p>
            </div>
            <Button 
              onClick={connectWallet} 
              className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold px-6 py-3 glow-button"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`relative overflow-hidden bg-white border-0 shadow-xl shimmer ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 to-purple-50/80"></div>
      <div className="relative p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
              <ArrowUpCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold gradient-text">
              Deposit AVAX
            </h3>
          </div>
          <p className="text-gray-600">
            Secure your funds in the StreamPay escrow contract
          </p>
        </div>

        <div className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-3">
            <label htmlFor="deposit-amount" className="block text-sm font-semibold text-gray-700">
              Deposit Amount
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <Input
                id="deposit-amount"
                type="number"
                step="0.001"
                min="0"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="pl-10 pr-16 h-12 text-lg font-semibold bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                disabled={isLoading || isValidating}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                  AVAX
                </Badge>
              </div>
            </div>
            
            {/* Amount Status */}
            {depositAmount && (
              <div className="flex items-center justify-between text-sm">
                <span className={`font-medium text-${depositStatus.color}-600`}>
                  {depositStatus.message}
                </span>
                <span className="text-gray-500">
                  ≈ ${(depositValue * 25).toFixed(2)} USD
                </span>
              </div>
            )}
          </div>

          <Separator className="bg-gradient-to-r from-indigo-200 to-purple-200" />

          {/* Quick Amount Buttons */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Quick Select</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { amount: '0.1', label: '0.1 AVAX', popular: false },
                { amount: '1', label: '1 AVAX', popular: true },
                { amount: '5', label: '5 AVAX', popular: false }
              ].map((option) => (
                <Button
                  key={option.amount}
                  variant="outline"
                  onClick={() => setDepositAmount(option.amount)}
                  disabled={isLoading || isValidating}
                  className={`relative h-12 ${option.popular 
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100' 
                    : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.popular && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs">
                        Popular
                      </Badge>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-xs opacity-70">≈ ${(parseFloat(option.amount) * 25).toFixed(0)}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Deposit Progress */}
          {depositAmount && depositValue > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-600">Deposit Health</span>
                <span className="text-gray-500">{Math.min(depositValue * 20, 100).toFixed(0)}%</span>
              </div>
              <Progress 
                value={Math.min(depositValue * 20, 100)} 
                className="h-2"
              />
            </div>
          )}

          {/* Deposit Button */}
          <Button
            onClick={handleDeposit}
            disabled={isLoading || isValidating || !depositAmount || parseFloat(depositAmount) <= 0}
            className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold text-lg disabled:opacity-50 glow-button"
          >
            {isLoading || isValidating ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing Deposit...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Deposit {depositAmount || '0'} AVAX</span>
              </div>
            )}
          </Button>

          {/* Security Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2 p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
              <div className="p-1 bg-emerald-100 rounded-full">
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-800">Secured</p>
                <p className="text-xs text-emerald-600">Escrow Protected</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="p-1 bg-blue-100 rounded-full">
                <Lock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-800">Your Control</p>
                <p className="text-xs text-blue-600">Full Access</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg border border-violet-100">
              <div className="p-1 bg-violet-100 rounded-full">
                <Zap className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-violet-800">Instant</p>
                <p className="text-xs text-violet-600">Ready to Use</p>
              </div>
            </div>
          </div>

          {/* Info Messages */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Secure Escrow Contract</p>
                <p className="text-xs text-blue-600">Your funds are protected by smart contract technology</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">Gas Fee Required</p>
                <p className="text-xs text-amber-600">Small network fee applies for blockchain transaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DepositComponent;