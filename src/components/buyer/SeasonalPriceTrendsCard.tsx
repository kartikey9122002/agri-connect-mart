
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PriceData {
  commodity: string;
  market: string;
  price: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  date: string;
}

const SeasonalPriceTrendsCard = () => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPriceData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from the Open Government Data Platform API
        // For demo purposes, we'll use mock data
        setTimeout(() => {
          const mockData: PriceData[] = [
            {
              commodity: 'Rice',
              market: 'Delhi',
              price: 42.50,
              unit: 'kg',
              trend: 'up',
              change: 2.5,
              date: '2025-05-01'
            },
            {
              commodity: 'Wheat',
              market: 'Ludhiana',
              price: 28.75,
              unit: 'kg',
              trend: 'down',
              change: -1.25,
              date: '2025-05-01'
            },
            {
              commodity: 'Potato',
              market: 'Agra',
              price: 18.30,
              unit: 'kg',
              trend: 'up',
              change: 0.8,
              date: '2025-05-01'
            },
            {
              commodity: 'Onion',
              market: 'Nashik',
              price: 32.00,
              unit: 'kg',
              trend: 'stable',
              change: 0.2,
              date: '2025-05-01'
            }
          ];
          
          setPriceData(mockData);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching price data:', error);
        toast({
          title: 'Failed to load price data',
          description: 'Could not retrieve seasonal price trends.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    fetchPriceData();
  }, [toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-agrigreen-600" />
          Seasonal Price Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-md" />
            ))}
          </div>
        ) : priceData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Commodity</th>
                  <th className="text-left py-2">Market</th>
                  <th className="text-right py-2">Price (₹)</th>
                  <th className="text-right py-2">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {priceData.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2">{item.commodity}</td>
                    <td className="py-2">{item.market}</td>
                    <td className="text-right py-2">₹{item.price.toFixed(2)}/{item.unit}</td>
                    <td className={`text-right py-2 ${
                      item.trend === 'up' ? 'text-green-600' : 
                      item.trend === 'down' ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No price data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SeasonalPriceTrendsCard;
