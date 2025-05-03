
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BuyerDashboardTabs from '@/components/buyer/BuyerDashboardTabs';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

const BuyerDashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
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
        <div className="mt-4 md:mt-0">
          <Button className="flex items-center gap-2 bg-agrigreen-600 hover:bg-agrigreen-700" asChild>
            <a href="/products">
              <ShoppingBag className="h-4 w-4" />
              Shop Products
            </a>
          </Button>
        </div>
      </div>

      <BuyerDashboardTabs />
    </div>
  );
};

export default BuyerDashboard;
