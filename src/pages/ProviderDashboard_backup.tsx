import React, { useState, useEffect } from "react";
import { DollarSign, Users, TrendingUp, Plus } from "lucide-react";
import { StatsCard } from "../components/StatsCard";
import { PlanCard } from "../components/PlanCard";
import { EarningsChart } from "../components/EarningsChart";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import toast from "react-hot-toast";
import { getConnectedWallet, getContract, formatAvax, parseAvax } from "../utils/contract.js";

const API_BASE_URL = "http://localhost:3001";

interface Plan {
  _id: string;
  name: string;
  description: string;
  price: number;
  interval: number;
  providerAddress: string;
  onChainPlanId: number | null;
  isActive: boolean;
  createdAt: string;
}

export const ProviderDashboard: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [creatingPlan, setCreatingPlan] = useState(false);

  // Plan creation form
  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    price: "",
    interval: ""
  });

  useEffect(() => {
    initializeWallet();
  }, []);

  useEffect(() => {
    if (walletAddress) {
      fetchProviderPlans();
    }
  }, [walletAddress]);

  const initializeWallet = async () => {
    try {
      const wallet = await getConnectedWallet();
      if (wallet) {
        setWalletAddress(wallet.address);
      }
    } catch (error) {
      console.error("Wallet initialization error:", error);
    }
  };

  const fetchProviderPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await fetch(`${API_BASE_URL}/providers/${walletAddress}`);
      const data = await response.json();
      
      if (data.success) {
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handlePlanFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPlanForm({
      ...planForm,
      [e.target.name]: e.target.value,
    });
  };

  const createPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!planForm.name || !planForm.price || !planForm.interval) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setCreatingPlan(true);

      // Step 1: Save plan to MongoDB
      const planResponse = await fetch(`${API_BASE_URL}/plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: planForm.name,
          description: planForm.description,
          price: parseFloat(planForm.price),
          interval: parseInt(planForm.interval),
          providerAddress: walletAddress,
        }),
      });

      const planData = await planResponse.json();
      
      if (!planResponse.ok) {
        throw new Error(planData.error || "Failed to save plan");
      }

      toast.success("Plan saved to database!");

      // Step 2: Create plan on-chain
      const contract = await getContract();
      const priceInWei = parseAvax(planForm.price);
      const intervalInSeconds = parseInt(planForm.interval);

      const tx = await contract.createPlan(priceInWei, intervalInSeconds);
      toast.success("Creating plan on blockchain...");
      
      const receipt = await tx.wait();
      
      // Extract planId from events
      const planCreatedEvent = receipt.logs.find(log => 
        log.topics[0] === contract.interface.getEvent('PlanCreated').topicHash
      );
      
      let onChainPlanId = null;
      if (planCreatedEvent) {
        const parsedEvent = contract.interface.parseLog(planCreatedEvent);
        onChainPlanId = parsedEvent.args.planId.toString();
      }

      // Step 3: Update plan with on-chain ID
      if (onChainPlanId) {
        await fetch(`${API_BASE_URL}/plans/${planData.planId}/onchain`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            onChainPlanId,
            transactionHash: tx.hash,
          }),
        });
      }

      toast.success("Plan created successfully!");
      
      // Reset form and close modal
      setPlanForm({ name: "", description: "", price: "", interval: "" });
      setShowCreatePlan(false);
      
      // Refresh plans
      fetchProviderPlans();

    } catch (error) {
      console.error("Plan creation error:", error);
      toast.error(error.message || "Failed to create plan");
    } finally {
      setCreatingPlan(false);
    }
  };

  // Calculate stats
  const activePlans = plans.filter(plan => plan.isActive);
  const totalEarnings = activePlans.reduce((sum, plan) => sum + (plan.price * 0.1), 0); // Mock earnings

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-4">Please connect your MetaMask wallet to access the provider dashboard</p>
          <Button onClick={initializeWallet}>Connect Wallet</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your subscription plans and track earnings</p>
            <p className="text-sm text-gray-500">Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
          </div>
          <Button 
            onClick={() => setShowCreatePlan(true)}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Create New Plan
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Active Plans"
            value={activePlans.length.toString()}
            icon={TrendingUp}
          />
          <StatsCard
            title="Total Plans"
            value={plans.length.toString()}
            icon={DollarSign}
          />
          <StatsCard
            title="Est. Monthly Earnings"
            value={`${totalEarnings.toFixed(3)} AVAX`}
            icon={Users}
          />
        </div>

        {/* Plans Section */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">Your Subscription Plans</h2>
          </CardHeader>
          <CardContent>
            {loadingPlans ? (
              <p className="text-center py-8">Loading your plans...</p>
            ) : plans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No plans created yet</p>
                <Button onClick={() => setShowCreatePlan(true)}>Create Your First Plan</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <PlanCard key={plan._id} plan={plan} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Plan Modal */}
        {showCreatePlan && (
          <Modal onClose={() => setShowCreatePlan(false)}>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Create New Subscription Plan</h2>
              <form onSubmit={createPlan} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={planForm.name}
                    onChange={handlePlanFormChange}
                    placeholder="e.g., Premium Subscription"
                    required
                    disabled={creatingPlan}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={planForm.description}
                    onChange={handlePlanFormChange}
                    placeholder="Describe what's included in this plan..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={creatingPlan}
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price (AVAX) *
                  </label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.001"
                    value={planForm.price}
                    onChange={handlePlanFormChange}
                    placeholder="0.01"
                    required
                    disabled={creatingPlan}
                  />
                </div>

                <div>
                  <label htmlFor="interval" className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Interval (seconds) *
                  </label>
                  <Input
                    id="interval"
                    name="interval"
                    type="number"
                    value={planForm.interval}
                    onChange={handlePlanFormChange}
                    placeholder="2592000 (30 days)"
                    required
                    disabled={creatingPlan}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Common intervals: 86400 (1 day), 604800 (1 week), 2592000 (30 days)
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreatePlan(false)}
                    disabled={creatingPlan}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creatingPlan}>
                    {creatingPlan ? "Creating..." : "Create Plan"}
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Earnings Overview
                  </h2>
                  <Button
                    onClick={handleWithdraw}
                    isLoading={isLoading}
                    size="sm"
                  >
                    Withdraw Available
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <EarningsChart />
              </CardContent>
            </Card>

            {/* Recent Subscribers Table */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Subscribers
                </h2>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">
                          Address
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">
                          Plan
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSubscribers.map((subscriber, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm text-gray-900 font-mono">
                            {subscriber.address}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {subscriber.plan}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {new Date(subscriber.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {subscriber.amount} ETH
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Plans */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Plans
            </h2>
            {loadingPlans ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-200 h-48 rounded-xl"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onDeactivate={handleDeactivatePlan}
                    isProvider
                    isLoading={isLoading}
                  />
                ))}
                {plans.length === 0 && (
                  <Card>
                    <CardContent>
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">
                          No plans created yet
                        </p>
                        <Button
                          onClick={() => navigate("/provider/onboarding")}
                          variant="outline"
                        >
                          Create Your First Plan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
