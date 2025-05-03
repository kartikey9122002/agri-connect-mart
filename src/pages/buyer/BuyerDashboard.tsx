
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import OrderTracker from '@/components/buyer/OrderTracker';
import SeasonalPriceTrends from '@/components/buyer/SeasonalPriceTrends';

const BuyerDashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Default order data
  const [orderData] = useState({
    orderStatus: 'processing' as 'processing' | 'shipped' | 'out-for-delivery' | 'delivered' | 'failed',
    orderNumber: 'BX' + Math.floor(100000 + Math.random() * 900000),
    estimatedDelivery: 'Tomorrow'
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-agrigreen-900">Buyer Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name || 'Buyer'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OrderTracker 
            orderStatus={orderData.orderStatus}
            orderNumber={orderData.orderNumber}
            estimatedDelivery={orderData.estimatedDelivery}
          />
        </div>
        <div className="lg:col-span-1">
          <SeasonalPriceTrends />
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
