import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Globe, CheckCircle, Sparkles, Star, TrendingUp, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/Card';
import { useWallet } from '../hooks/useWallet';

export const Landing: React.FC = () => {
  const { isConnected, connectWallet, isConnecting } = useWallet();

  const features = [
    {
      icon: Shield,
      title: 'Trustless Payments',
      description: 'Smart contract-based escrow ensures secure, automated recurring payments',
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50'
    },
    {
      icon: Zap,
      title: 'Instant Settlement',
      description: 'No intermediaries. Payments are processed directly on-chain',
      gradient: 'from-blue-500 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50'
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Accept subscribers worldwide without traditional payment barriers',
      gradient: 'from-purple-500 to-violet-500',
      bgGradient: 'from-purple-50 to-violet-50'
    }
  ];

  const benefits = [
    'No chargebacks or payment disputes',
    'Lower fees than traditional processors',
    'Programmable payment logic',
    'Real-time earnings tracking',
    'Decentralized and censorship-resistant'
  ];

  const stats = [
    { icon: Users, label: 'Active Users', value: '1,000+' },
    { icon: TrendingUp, label: 'Volume Processed', value: '$50K+' },
    { icon: Star, label: 'Providers', value: '100+' }
  ];

  return (
    <div className="min-h-screen gradient-bg">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 floating-animation"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 floating-animation" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 floating-animation" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Avalanche Blockchain
            </Badge>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="text-gray-900">StreamPay: </span>
            <span className="gradient-text">Trustless</span>
            <br />
            <span className="gradient-text">Recurring Payments</span>
            <br />
            <span className="text-gray-900">on </span>
            <span className="gradient-text">Blockchain</span>
          </h1>
          
          <p className="text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
            Build sustainable businesses with decentralized subscription payments. 
            No intermediaries, no chargebacks, just pure peer-to-peer recurring revenue.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            <Link to="/provider/onboarding">
              <Button 
                size="lg" 
                className="min-w-[240px] h-14 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 glow-button"
              >
                <Sparkles className="mr-2 w-5 h-5" />
                Become a Provider
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button 
                variant="outline" 
                size="lg" 
                className="min-w-[240px] h-14 text-lg border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 card-hover"
              >
                Browse Plans
              </Button>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <stat.icon className="w-5 h-5 text-blue-600" />
                  <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                </div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          {!isConnected && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl p-6 max-w-md mx-auto card-hover">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Connect Your Wallet</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Get started with StreamPay's decentralized payment ecosystem
              </p>
              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 glow-button"
              >
                {isConnecting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connecting...</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </Card>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 mb-6">
              Built for the Future
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Revolutionary Payment Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              StreamPay leverages cutting-edge blockchain technology to create a more transparent, 
              efficient, and fair payment ecosystem for creators and subscribers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden bg-white border-0 shadow-xl card-hover shimmer">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-50`}></div>
                <div className="relative p-8 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl mb-6 floating-animation`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 mb-6">
                Why StreamPay?
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                The Future of Payments is Here
              </h2>
              <ul className="space-y-6">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-lg text-gray-700 font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Card className="bg-white border-0 shadow-2xl p-8 card-hover">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Transform?</h3>
                <p className="text-gray-600 text-lg">
                  Join the growing community of creators and businesses revolutionizing 
                  subscription payments with blockchain technology.
                </p>
              </div>
              
              <div className="space-y-4">
                <Link to="/provider/onboarding">
                  <Button className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg font-semibold glow-button">
                    <Star className="w-5 h-5 mr-2" />
                    Start as Provider
                  </Button>
                </Link>
                <Link to="/marketplace">
                  <Button variant="outline" className="w-full h-12 text-lg font-semibold border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50">
                    <Globe className="w-5 h-5 mr-2" />
                    Explore Marketplace
                  </Button>
                </Link>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span>Instant</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Globe className="w-4 h-4" />
                    <span>Global</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-2xl font-bold">StreamPay</span>
            </div>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Building the future of subscription payments with blockchain technology. 
              Transparent, secure, and truly decentralized.
            </p>
            <div className="flex items-center justify-center space-x-6">
              <Badge className="bg-gray-800 text-gray-300 px-3 py-1">
                Built on Avalanche
              </Badge>
              <Badge className="bg-gray-800 text-gray-300 px-3 py-1">
                Open Source
              </Badge>
              <Badge className="bg-gray-800 text-gray-300 px-3 py-1">
                Web3 Native
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
