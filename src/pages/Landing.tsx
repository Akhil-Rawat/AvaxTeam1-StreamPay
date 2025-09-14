import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Globe, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useWallet } from '../hooks/useWallet';

export const Landing: React.FC = () => {
  const { isConnected, connectWallet, isConnecting } = useWallet();

  const features = [
    {
      icon: Shield,
      title: 'Trustless Payments',
      description: 'Smart contract-based escrow ensures secure, automated recurring payments'
    },
    {
      icon: Zap,
      title: 'Instant Settlement',
      description: 'No intermediaries. Payments are processed directly on-chain'
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Accept subscribers worldwide without traditional payment barriers'
    }
  ];

  const benefits = [
    'No chargebacks or payment disputes',
    'Lower fees than traditional processors',
    'Programmable payment logic',
    'Real-time earnings tracking',
    'Decentralized and censorship-resistant'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            StreamPay: Trustless
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Recurring Payments
            </span>
            <br />
            on Blockchain
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Build sustainable businesses with decentralized subscription payments. 
            No intermediaries, no chargebacks, just pure peer-to-peer recurring revenue.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <Link to="/provider/onboarding">
              <Button size="lg" className="min-w-[200px]">
                Become a Provider
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                Browse Plans
              </Button>
            </Link>
          </div>

          {!isConnected && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800 mb-3">Connect your wallet to get started</p>
              <Button
                onClick={connectWallet}
                variant="secondary"
                size="sm"
              >
                Connect Wallet
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built for the Future of Payments
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              StreamPay leverages blockchain technology to create a more transparent, 
              efficient, and fair payment ecosystem for creators and subscribers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-4 group-hover:bg-blue-200 transition-colors">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose StreamPay?
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready to Start?</h3>
              <p className="text-gray-600 mb-6">
                Join the growing community of creators and businesses using StreamPay 
                for their subscription needs.
              </p>
              <div className="space-y-3">
                <Link to="/provider/onboarding">
                  <Button className="w-full">Start as Provider</Button>
                </Link>
                <Link to="/marketplace">
                  <Button variant="outline" className="w-full">Explore Marketplace</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="text-lg font-bold">StreamPay</span>
          </div>
          <p className="text-gray-400 text-sm">
            The future of subscription payments is decentralized.
          </p>
        </div>
      </footer>
    </div>
  );
};
