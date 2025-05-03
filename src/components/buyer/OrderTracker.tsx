
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, Truck, Check, AlertCircle } from 'lucide-react';

type OrderStatus = 'processing' | 'shipped' | 'out-for-delivery' | 'delivered' | 'failed';

interface OrderTrackerProps {
  orderStatus: OrderStatus;
  estimatedDelivery?: string;
  orderNumber: string;
}

const OrderTracker: React.FC<OrderTrackerProps> = ({ 
  orderStatus, 
  estimatedDelivery = 'Tomorrow', 
  orderNumber = 'N/A'
}) => {
  const getStatusDetails = () => {
    switch (orderStatus) {
      case 'processing':
        return {
          message: 'Your order is being processed',
          icon: <Package className="h-6 w-6 text-orange-500" />,
          color: 'bg-orange-100 text-orange-800'
        };
      case 'shipped':
        return {
          message: 'Your order has been shipped',
          icon: <Truck className="h-6 w-6 text-blue-500" />,
          color: 'bg-blue-100 text-blue-800'
        };
      case 'out-for-delivery':
        return {
          message: 'Your order is out for delivery',
          icon: <Truck className="h-6 w-6 text-agrigreen-500" />,
          color: 'bg-agrigreen-100 text-agrigreen-800'
        };
      case 'delivered':
        return {
          message: 'Your order has been delivered',
          icon: <Check className="h-6 w-6 text-green-500" />,
          color: 'bg-green-100 text-green-800'
        };
      case 'failed':
        return {
          message: 'Delivery attempt failed',
          icon: <AlertCircle className="h-6 w-6 text-red-500" />,
          color: 'bg-red-100 text-red-800'
        };
      default:
        return {
          message: 'Order status unavailable',
          icon: <AlertCircle className="h-6 w-6 text-gray-500" />,
          color: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const statusDetails = getStatusDetails();
  const steps = ['processing', 'shipped', 'out-for-delivery', 'delivered'];
  const currentStepIndex = steps.indexOf(orderStatus);
  
  // Safely handle orderNumber for display
  const displayOrderNumber = orderNumber ? orderNumber.replace(/-/g, '') : 'N/A';

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Order Tracking</CardTitle>
          <Badge className={statusDetails.color}>
            {orderStatus ? orderStatus.replace(/-/g, ' ').toUpperCase() : 'PROCESSING'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center gap-3">
          {statusDetails.icon}
          <div>
            <p className="font-medium">{statusDetails.message}</p>
            <p className="text-sm text-gray-500">Order #{displayOrderNumber}</p>
          </div>
        </div>

        <div className="relative mb-8">
          <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-gray-200"></div>
          <div 
            className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-agrigreen-500 transition-all duration-300"
            style={{ width: `${Math.max(0, currentStepIndex) * 33.3}%` }}
          ></div>
          
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <div 
                key={step} 
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  index <= currentStepIndex 
                    ? 'border-agrigreen-500 bg-agrigreen-500 text-white' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                {index < currentStepIndex ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-2 flex justify-between text-xs">
            <span>Processed</span>
            <span>Shipped</span>
            <span>Out for Delivery</span>
            <span>Delivered</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-gray-50 p-3">
          <MapPin className="h-5 w-5 text-agrigreen-500" />
          <div>
            <p className="text-sm font-medium">Estimated Delivery</p>
            <p className="text-xs text-gray-500">{estimatedDelivery}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderTracker;
