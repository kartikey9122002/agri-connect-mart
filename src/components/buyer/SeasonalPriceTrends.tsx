
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface PriceTrend {
  commodity: string;
  market: string;
  season: string;
  currentPrice: number;
  lastMonthPrice: number;
  priceChange: number;
  changePercentage: number;
}

const SeasonalPriceTrends: React.FC = () => {
  const [trends, setTrends] = useState<PriceTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSeasonalTrends = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from the Open Government Data Platform of India API
        // For now, we'll use mock data that resembles what we might get
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data representing seasonal trends
        const mockTrends: PriceTrend[] = [
          {
            commodity: 'Rice',
            market: 'New Delhi',
            season: 'Monsoon',
            currentPrice: 42.50,
            lastMonthPrice: 40.00,
            priceChange: 2.50,
            changePercentage: 6.25
          },
          {
            commodity: 'Wheat',
            market: 'Ludhiana',
            season: 'Winter',
            currentPrice: 28.75,
            lastMonthPrice: 30.50,
            priceChange: -1.75,
            changePercentage: -5.74
          },
          {
            commodity: 'Potato',
            market: 'Agra',
            season: 'Winter',
            currentPrice: 18.25,
            lastMonthPrice: 16.75,
            priceChange: 1.50,
            changePercentage: 8.96
          },
          {
            commodity: 'Onion',
            market: 'Nashik',
            season: 'Summer',
            currentPrice: 24.50,
            lastMonthPrice: 32.25,
            priceChange: -7.75,
            changePercentage: -24.03
          },
          {
            commodity: 'Tomato',
            market: 'Bengaluru',
            season: 'Summer',
            currentPrice: 35.80,
            lastMonthPrice: 28.90,
            priceChange: 6.90,
            changePercentage: 23.88
          }
        ];
        
        setTrends(mockTrends);
      } catch (error) {
        console.error('Error fetching seasonal price trends:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSeasonalTrends();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Seasonal Price Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Current market data from agricultural markets across India
        </p>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-gray-100 animate-pulse rounded"></div>
            ))}
          </div>
        ) : trends.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium">Commodity</th>
                  <th className="text-left py-2 font-medium">Market</th>
                  <th className="text-right py-2 font-medium">Current (₹/kg)</th>
                  <th className="text-right py-2 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((trend, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2">{trend.commodity}</td>
                    <td className="py-2">{trend.market}</td>
                    <td className="py-2 text-right">₹{trend.currentPrice.toFixed(2)}</td>
                    <td className="py-2 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        trend.priceChange >= 0 
                          ? 'text-green-700 bg-green-50' 
                          : 'text-red-700 bg-red-50'
                      }`}>
                        {trend.priceChange >= 0 ? '+' : ''}
                        {trend.changePercentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No price trend data available</p>
            <p className="text-gray-400 text-sm mt-1">Please check back later</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SeasonalPriceTrends;
