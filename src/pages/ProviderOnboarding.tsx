import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import toast from "react-hot-toast";
import { connectWallet, switchToAvalancheFuji } from "../utils/contract.js";

const API_BASE_URL = "http://localhost:3001";

export function ProviderOnboarding() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      console.log("Connecting wallet...");
      await switchToAvalancheFuji();
      const wallet = await connectWallet();
      console.log("Wallet connected:", wallet.address);
      setWalletAddress(wallet.address);
      setIsWalletConnected(true);
      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast.error(error.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isWalletConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Provider name is required");
      return;
    }

    try {
      setLoading(true);
      console.log("Submitting provider registration...");
      console.log("Data:", { ...formData, walletAddress });

      const response = await fetch(`${API_BASE_URL}/provider/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          walletAddress,
        }),
      });

      const data = await response.json();
      console.log("Registration response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Provider registered successfully!");
      
      // Reset form
      setFormData({ name: "", description: "", email: "" });
      
      // Redirect to provider dashboard
      setTimeout(() => {
        window.location.href = "/provider";
      }, 2000);
      
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Become a StreamPay Provider
        </h1>
        <p className="text-gray-600">
          Register your service and start accepting recurring payments
        </p>
        <div className="mt-2 text-sm text-gray-500 bg-blue-50 p-2 rounded">
          <p><strong>Debug Info:</strong></p>
          <p>Wallet Connected: {isWalletConnected.toString()}</p>
          <p>Wallet Address: {walletAddress || "Not connected"}</p>
          <p>API Base: {API_BASE_URL}</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Wallet Connection */}
          <div className="border-b pb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Connection
            </label>
            {!isWalletConnected ? (
              <Button
                type="button"
                onClick={handleConnectWallet}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Connecting..." : "Connect MetaMask Wallet"}
              </Button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  ✅ Wallet Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              </div>
            )}
          </div>

          {/* Provider Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Provider Name *
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Netflix, Spotify, Premium Service"
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of your service..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="contact@yourservice.com"
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !isWalletConnected}
            className="w-full"
          >
            {loading ? "Registering..." : "Register as Provider"}
          </Button>
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Next Steps:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>1. Connect your MetaMask wallet</li>
            <li>2. Fill out your provider information</li>
            <li>3. Register to create subscription plans</li>
            <li>4. Start accepting recurring payments!</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
