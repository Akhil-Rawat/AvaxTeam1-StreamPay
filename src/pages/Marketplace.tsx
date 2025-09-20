import React, { useState, useEffect } from "react";
import { Search, Filter, Sparkles, TrendingUp, Package, Zap, Star, Shield } from "lucide-react";
import { PlanCard } from "../components/PlanCard";
import { WalletStatusCard } from "../components/WalletStatusCard";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Skeleton } from "../components/ui/skeleton";
import { useWallet } from "../hooks/useWallet";
import { useStreamPayContract } from "../hooks/useContract";
import toast from "react-hot-toast";

const API_BASE_URL = "http://localhost:3001";

interface Plan {
  _id: string;
  name: string;
  description: string;
  price: number;
  interval: number;
  providerAddress: string;
  providerName: string;
  onChainPlanId: number;
  isActive: boolean;
  createdAt: string;
}

export const Marketplace: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingPlans, setLoadingPlans] = useState(true);
  
  const { isConnected } = useWallet();
  const { subscribe, isLoading } = useStreamPayContract();

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    const filtered = plans.filter(
      (plan) =>
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPlans(filtered);
  }, [searchTerm, plans]);

  const fetchPlans = async () => {
    try {
      console.log('🔄 Fetching plans from:', `${API_BASE_URL}/plans`);
      setLoadingPlans(true);
      const response = await fetch(`${API_BASE_URL}/plans`);
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📊 Plans data received:', data);
      
      if (data.success) {
        console.log(`✅ Loaded ${data.plans.length} plans`);
        setPlans(data.plans);
        setFilteredPlans(data.plans);
      } else {
        console.error('❌ Plans API returned error:', data);
        toast.error("Failed to load plans from API");
      }
    } catch (error) {
      console.error("❌ Failed to fetch plans:", error);
      toast.error("Failed to load marketplace");
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      // Use the subscribe function from the contract hook
      await subscribe(plan.onChainPlanId.toString(), plan.price.toString());
      
      toast.success(`Successfully subscribed to ${plan.name}!`);
      
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast.error(error?.message || "Failed to subscribe");
    }
  };

  const getMarketplaceStats = () => {
    const activePlans = plans.filter(p => p.isActive).length;
    const avgPrice = plans.length > 0 ? plans.reduce((sum, p) => sum + p.price, 0) / plans.length : 0;
    const providers = new Set(plans.map(p => p.providerAddress)).size;
    
    return { activePlans, avgPrice, providers };
  };

  const stats = getMarketplaceStats();

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 blur-3xl floating-animation"></div>
            </div>
            <div className="relative">
              <h1 className="text-5xl font-bold gradient-text mb-4">
                StreamPay Marketplace
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover amazing Web3 services and subscribe with crypto payments
              </p>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-blue-700">{stats.activePlans}</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Active Plans</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="p-2 bg-emerald-100 rounded-full">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-2xl font-bold text-emerald-700">{stats.avgPrice.toFixed(1)}</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Avg Price (AVAX)</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-purple-700">{stats.providers}</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Providers</p>
            </div>
          </div>
        </div>

        {/* Wallet Status */}
        <div className="mb-8">
          <WalletStatusCard className="max-w-4xl mx-auto" />
        </div>

        <Separator className="bg-gradient-to-r from-blue-200 via-purple-200 to-indigo-200 mb-8" />

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search plans, providers, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg bg-white/80 backdrop-blur-sm border-white/30 focus:border-blue-400 focus:ring-blue-400"
                />
                {searchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {filteredPlans.length} found
                    </Badge>
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                className="h-12 px-6 bg-white/80 backdrop-blur-sm border-white/30 hover:bg-white/90 glow-button"
              >
                <Filter className="w-5 h-5 mr-2" />
                <span>Filters</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Connection Notice */}
        {!isConnected && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 card-hover">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-amber-100 rounded-full">
                  <Zap className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">Ready to Subscribe?</h3>
                  <p className="text-amber-700">
                    Connect your wallet to start subscribing to amazing Web3 services
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        {loadingPlans ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-4" />
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                {searchTerm ? "No matching plans found" : "No plans available yet"}
              </h3>
              <p className="text-gray-500 text-lg mb-6 max-w-md mx-auto">
                {searchTerm
                  ? "Try adjusting your search terms or browse all available plans"
                  : "Be the first to explore amazing Web3 services when they become available"
                }
              </p>
            </div>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm("")}
                className="glow-button"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Show All Plans
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-800">
                  {searchTerm ? "Search Results" : "All Plans"}
                </h2>
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {filteredPlans.length} {filteredPlans.length === 1 ? "plan" : "plans"}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-600 font-medium">Premium Services</span>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPlans.map((plan) => (
                <PlanCard
                  key={plan._id}
                  plan={{
                    id: plan._id,
                    name: plan.name,
                    description: plan.description,
                    price: plan.price.toString(),
                    interval: "monthly", // Simplified for now
                    providerId: plan.providerAddress,
                    providerName: plan.providerName || "Unknown Provider",
                    subscriberCount: 0,
                    isActive: plan.isActive,
                    createdAt: plan.createdAt || new Date().toISOString()
                  }}
                  onSubscribe={(planId: string) => {
                    const planToSubscribe = filteredPlans.find(p => p._id === planId);
                    if (planToSubscribe) handleSubscribe(planToSubscribe);
                  }}
                  isLoading={isLoading}
                />
              ))}
            </div>
          </>
        )}

        {/* Footer CTA */}
        {filteredPlans.length > 0 && (
          <div className="mt-16 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/20 shadow-lg max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold gradient-text mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-gray-600 mb-6">
                Join the Web3 subscription revolution with StreamPay's secure and transparent platform
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Badge className="bg-green-100 text-green-700 px-3 py-1">
                  <Shield className="w-4 h-4 mr-1" />
                  Secure
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
                  <Zap className="w-4 h-4 mr-1" />
                  Instant
                </Badge>
                <Badge className="bg-purple-100 text-purple-700 px-3 py-1">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Decentralized
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
