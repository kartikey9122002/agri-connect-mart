
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface ProductStatusCount {
  name: string;
  count: number;
  color: string;
}

const ProductAnalyticsChart: React.FC = () => {
  const [productStats, setProductStats] = useState<ProductStatusCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProductStats = async () => {
    try {
      // Fetch approved products count
      const { count: approvedCount, error: approvedError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');
        
      if (approvedError) throw approvedError;
      
      // Fetch rejected products count
      const { count: rejectedCount, error: rejectedError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected');
        
      if (rejectedError) throw rejectedError;
      
      // Fetch pending products count
      const { count: pendingCount, error: pendingError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
        
      if (pendingError) throw pendingError;
      
      const data: ProductStatusCount[] = [
        { name: 'Approved', count: approvedCount || 0, color: '#2ecc71' },
        { name: 'Pending', count: pendingCount || 0, color: '#f39c12' },
        { name: 'Rejected', count: rejectedCount || 0, color: '#e74c3c' }
      ];
      
      setProductStats(data);
    } catch (error) {
      console.error('Error fetching product statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductStats();
    
    // Poll every 10 seconds for updates
    const interval = setInterval(() => {
      fetchProductStats();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 shadow rounded border text-sm">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value} products`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Status Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agrigreen-600"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Products" label={{ position: 'top' }}>
                {productStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductAnalyticsChart;
