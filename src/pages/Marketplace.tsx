import React, { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { PlanCard } from "../components/PlanCard";
import { WalletStatusCard } from "../components/WalletStatusCard";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
          <p className="text-gray-600">
            Discover and subscribe to amazing Web3 services
          </p>
        </div>

        {/* Wallet Status */}
        <WalletStatusCard className="mb-8" />

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>
        </div>

        {!isConnected && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> Connect your wallet to subscribe to plans
            </p>
          </div>
        )}

        {/* Plans Grid */}
        {loadingPlans ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 h-64 rounded-xl"
              />
            ))}
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">
              {searchTerm
                ? "No plans found matching your search"
                : "No plans available"}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        )}
      </div>
    </div>
  );
};
