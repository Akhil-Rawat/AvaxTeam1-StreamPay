import React from "react";
import { 
  Users, 
  Star, 
  Zap, 
  Shield, 
  TrendingUp, 
  Clock,
  DollarSign,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { Plan } from "../types";
import { Card, CardContent, CardFooter } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";

interface PlanCardProps {
  plan: Plan;
  onSubscribe?: (planId: string) => void;
  onDeactivate?: (planId: string) => void;
  isProvider?: boolean;
  isLoading?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onSubscribe,
  onDeactivate,
  isProvider = false,
  isLoading = false,
}) => {
  const formatPrice = (price: string) => `${parseFloat(price).toFixed(2)} AVAX`;

  const formatInterval = (interval: string) =>
    interval === "monthly" ? "per month" : "per year";

  const getPriceCategory = (price: string) => {
    const priceVal = parseFloat(price);
    if (priceVal >= 10) return { category: 'premium', color: 'purple', icon: Star };
    if (priceVal >= 1) return { category: 'standard', color: 'blue', icon: Zap };
    return { category: 'basic', color: 'emerald', icon: CheckCircle2 };
  };

  const priceInfo = getPriceCategory(plan.price);
  const PriceIcon = priceInfo.icon;

  const isPopular = plan.subscriberCount > 50 || parseFloat(plan.price) > 5;
  const isNewPlan = new Date(plan.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <Card className="relative h-full flex flex-col overflow-hidden bg-white border-0 shadow-xl card-hover shimmer group">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-slate-50/50 group-hover:from-blue-50/50 group-hover:to-indigo-50/50 transition-all duration-300"></div>
      
      {/* Popular Badge */}
      {(isPopular || isNewPlan) && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className={`${
            isPopular 
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white' 
              : 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white'
          } shadow-lg`}>
            {isPopular ? (
              <>
                <Star className="w-3 h-3 mr-1" />
                Popular
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-1" />
                New
              </>
            )}
          </Badge>
        </div>
      )}

      <CardContent className="relative flex-1 p-6">
        {/* Provider Info */}
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${plan.providerId}`} />
            <AvatarFallback className={`bg-gradient-to-r from-${priceInfo.color}-500 to-${priceInfo.color}-600 text-white font-bold`}>
              {plan.providerName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{plan.providerName}</p>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className={`bg-${priceInfo.color}-100 text-${priceInfo.color}-700 text-xs`}>
                <PriceIcon className="w-3 h-3 mr-1" />
                {priceInfo.category}
              </Badge>
              {plan.isActive ? (
                <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1 pulse-slow"></div>
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Plan Title */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:gradient-text transition-all duration-300">
            {plan.name}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
            {plan.description}
          </p>
        </div>

        <Separator className={`bg-gradient-to-r from-${priceInfo.color}-200 to-${priceInfo.color}-100 mb-4`} />

        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className={`p-2 bg-${priceInfo.color}-100 rounded-full`}>
                <DollarSign className={`w-4 h-4 text-${priceInfo.color}-600`} />
              </div>
              <div>
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(plan.price)}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  {formatInterval(plan.interval)}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            ≈ ${(parseFloat(plan.price) * 25).toFixed(2)} USD equivalent
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`p-3 bg-gradient-to-br from-${priceInfo.color}-50 to-${priceInfo.color}-100/50 rounded-lg border border-${priceInfo.color}-200/50`}>
            <div className="flex items-center space-x-2 mb-1">
              <Users className={`w-4 h-4 text-${priceInfo.color}-600`} />
              <span className="text-xs font-medium text-gray-600">Subscribers</span>
            </div>
            <p className={`font-bold text-${priceInfo.color}-700`}>{plan.subscriberCount}</p>
          </div>
          
          <div className={`p-3 bg-gradient-to-br from-gray-50 to-slate-100/50 rounded-lg border border-gray-200/50`}>
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">Billing</span>
            </div>
            <p className="font-bold text-gray-700 capitalize">{plan.interval}</p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700 mb-2">What's Included:</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span className="text-xs text-gray-600">Secure Access</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-gray-600">24/7 Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-3 h-3 text-purple-500" />
              <span className="text-xs text-gray-600">Instant Setup</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-3 h-3 text-indigo-500" />
              <span className="text-xs text-gray-600">Premium Features</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative p-6 pt-0">
        {isProvider ? (
          <div className="flex space-x-3 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-gray-300 hover:bg-gray-50"
              onClick={() => onDeactivate?.(plan.id)}
              disabled={!plan.isActive || isLoading}
            >
              {plan.isActive ? "Deactivate" : "Deactivated"}
            </Button>
          </div>
        ) : (
          <Button
            className={`w-full h-12 font-bold text-lg ${
              plan.isActive 
                ? `bg-gradient-to-r from-${priceInfo.color}-500 to-${priceInfo.color}-600 hover:from-${priceInfo.color}-600 hover:to-${priceInfo.color}-700 text-white glow-button`
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={() => onSubscribe?.(plan.id)}
            disabled={!plan.isActive || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : plan.isActive ? (
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                <span>Subscribe Now</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Unavailable</span>
              </div>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
