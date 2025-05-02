
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/types';

interface DashboardSummaryProps {
  products?: Product[];
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ products = [] }) => {
  // Count products by status
  const liveProductsCount = products.filter(
    p => p.status === 'approved' && p.availability === 'available'
  ).length;
  
  const pendingApprovalCount = products.filter(
    p => p.status === 'pending'
  ).length;
  
  const rejectedCount = products.filter(
    p => p.status === 'rejected'
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Dashboard Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Live Products</p>
            <p className="text-2xl font-bold">{liveProductsCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Approval</p>
            <p className="text-2xl font-bold">{pendingApprovalCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Rejected</p>
            <p className="text-2xl font-bold">{rejectedCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardSummary;
