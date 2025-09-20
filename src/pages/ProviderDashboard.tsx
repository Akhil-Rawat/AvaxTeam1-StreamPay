import React, { useState, useEffect } from "react";
import { DollarSign, Users, TrendingUp, Plus, Calendar } from "lucide-react";
import { StatsCard } from "../components/StatsCard";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import toast from "react-hot-toast";
import { getConnectedWallet, getContract, parseAvax } from "../utils/contract.js";

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
      console.log("Initializing wallet...");
      const wallet = await getConnectedWallet();
      if (wallet) {
        console.log("Wallet connected:", wallet.address);
        setWalletAddress(wallet.address);
      } else {
        console.log("No wallet connected");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const fetchProviderPlans = async () => {
    try {
      setLoadingPlans(true);
      console.log("Fetching plans for address:", walletAddress);
      const response = await fetch(`${API_BASE_URL}/providers/${walletAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Provider data:", data);
        setPlans(data.plans || []);
      } else {
        console.log("Provider not found, no plans yet - Response:", response.status);
        setPlans([]);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load plans");
    } finally {
      setLoadingPlans(false);
    }
  };

  const handlePlanFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPlanForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    setCreatingPlan(true);
    
    try {
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

      if (!planResponse.ok) {
        throw new Error("Failed to save plan to database");
      }

      const planData = await planResponse.json();
      toast.success("Plan saved to database!");

      // Step 2: Create plan on-chain
      const contract = await getContract();
      const priceInWei = parseAvax(planForm.price);
      const intervalInDays = parseInt(planForm.interval);
      
      const tx = await contract.createPlan(priceInWei, intervalInDays);
      toast.success("Transaction submitted! Waiting for confirmation...");
      
      const receipt = await tx.wait();
      // Extract planId from events
      const createPlanEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === "PlanCreated";
        } catch {
          return false;
        }
      });

      if (createPlanEvent) {
        const parsedEvent = contract.interface.parseLog(createPlanEvent);
        const onChainPlanId = parsedEvent.args.planId.toString();
        
        // Step 3: Update plan with on-chain ID
        try {
          await fetch(`${API_BASE_URL}/plans/${planData.planId}/onchain`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              onChainPlanId: parseInt(onChainPlanId),
            }),
          });
          
          toast.success(`✅ Plan created successfully! On-chain ID: ${onChainPlanId}`);
        } catch (error) {
          console.error("Error linking on-chain ID:", error);
          toast.success("✅ Plan created on-chain, but failed to link to database");
        }
      }

      // Reset form and close modal
      setPlanForm({ name: "", description: "", price: "", interval: "" });
      setShowCreatePlan(false);
      
      // Refresh plans
      fetchProviderPlans();

    } catch (error: any) {
      console.error("Error creating plan:", error);
      toast.error(error.message || "Failed to create plan");
    } finally {
      setCreatingPlan(false);
    }
  };

  const handleDeactivatePlan = async (planId: string) => {
    // Placeholder function for deactivating plans
    console.log("Deactivating plan:", planId);
    toast.success("Plan deactivated");
  };

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet Required</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to access the provider dashboard.</p>
          <Button onClick={initializeWallet}>Connect Wallet</Button>
          <div className="mt-4 text-sm text-gray-500">
            <p>Debug Info:</p>
            <p>Wallet Address: {walletAddress || "Not connected"}</p>
            <p>API Base: {API_BASE_URL}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your subscription plans and track earnings
          </p>
          <div className="mt-2 text-sm text-gray-500 bg-yellow-50 p-2 rounded">
            <p><strong>Debug Info:</strong></p>
            <p>Wallet: {walletAddress}</p>
            <p>API: {API_BASE_URL}</p>
            <p>Plans Count: {plans.length}</p>
            <p>Loading: {loadingPlans.toString()}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Revenue"
            value="0"
            icon={DollarSign}
          />
          <StatsCard
            title="Active Subscribers"
            value="0"
            icon={Users}
          />
          <StatsCard
            title="Monthly Growth"
            value="0%"
            icon={TrendingUp}
          />
          <StatsCard
            title="Active Plans"
            value={plans.filter((p) => p.isActive).length.toString()}
            icon={Calendar}
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Plans Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Your Plans</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchProviderPlans}>
                  Refresh
                </Button>
                <Button onClick={() => setShowCreatePlan(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Plan
                </Button>
              </div>
            </div>
            
            {loadingPlans ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading plans...</p>
              </div>
            ) : plans.length === 0 ? (
              <Card>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No plans created yet</p>
                    <div className="space-y-2">
                      <Button onClick={() => setShowCreatePlan(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Plan
                      </Button>
                      <p className="text-sm text-gray-400">
                        Or <a href="/provider/onboarding" className="text-blue-600 hover:underline">register as a provider first</a>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {plans.map((plan) => (
                  <Card key={plan._id}>
                    <CardContent>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            plan.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {plan.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{plan.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="text-lg font-bold text-gray-900">
                            {plan.price} AVAX
                            <span className="text-sm font-normal text-gray-500">
                              /{plan.interval} days
                            </span>
                          </div>
                          {plan.onChainPlanId && (
                            <span className="text-xs text-blue-600">
                              On-chain ID: {plan.onChainPlanId}
                            </span>
                          )}
                        </div>
                        {!plan.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeactivatePlan(plan._id)}
                            className="mt-3"
                          >
                            Activate Plan
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Quick Stats</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Plans</span>
                    <span className="font-medium">{plans.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Plans</span>
                    <span className="font-medium">{plans.filter(p => p.isActive).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Revenue</span>
                    <span className="font-medium">0 AVAX</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Plan Modal */}
        {showCreatePlan && (
          <Modal 
            isOpen={showCreatePlan}
            onClose={() => setShowCreatePlan(false)}
            title="Create New Plan"
          >
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-600">
                  💡 <strong>Tip:</strong> Plans will be saved to the database and created on-chain automatically.
                  Make sure you have enough AVAX for gas fees.
                </p>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-4">
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
                    placeholder="e.g., Premium Plan"
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
                    placeholder="0.1"
                    required
                    disabled={creatingPlan}
                  />
                </div>

                <div>
                  <label htmlFor="interval" className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Interval (days) *
                  </label>
                  <Input
                    id="interval"
                    name="interval"
                    type="number"
                    value={planForm.interval}
                    onChange={handlePlanFormChange}
                    placeholder="30"
                    required
                    disabled={creatingPlan}
                  />
                </div>

                <div className="flex gap-3 pt-4">
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