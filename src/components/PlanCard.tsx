import React from 'react';
import { Calendar, Users } from 'lucide-react';
import { Plan } from '../types';
import { Card, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';

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
  const formatPrice = (price: string) => `${price} ETH`;
  
  const formatInterval = (interval: string) => 
    interval === 'monthly' ? 'per month' : 'per year';

  return (
    <Card hover={!isProvider} className="h-full flex flex-col">
      <CardContent className="flex-1">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-1">{plan.name}</h3>
            <p className="text-sm text-gray-500">{plan.providerName}</p>
          </div>
          {!plan.isActive && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              Inactive
            </span>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{plan.description}</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(plan.price)}
            </span>
            <span className="text-sm text-gray-500">{formatInterval(plan.interval)}</span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{plan.subscriberCount} subscribers</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{plan.interval}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        {isProvider ? (
          <div className="flex space-x-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onDeactivate?.(plan.id)}
              disabled={!plan.isActive || isLoading}
            >
              {plan.isActive ? 'Deactivate' : 'Deactivated'}
            </Button>
          </div>
        ) : (
          <Button
            className="w-full"
            onClick={() => onSubscribe?.(plan.id)}
            disabled={!plan.isActive || isLoading}
            isLoading={isLoading}
          >
            {plan.isActive ? 'Subscribe' : 'Unavailable'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};