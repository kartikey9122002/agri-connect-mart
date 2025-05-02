
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface PricePredictionCardProps {
  products?: Product[];
}

interface PricePrediction {
  productName: string;
  currentPrice: number;
  predictedChangePercent: number;
  trend: 'up' | 'down' | 'stable';
}

const PricePredictionCard: React.FC<PricePredictionCardProps> = ({ products = [] }) => {
  const [predictions, setPredictions] = useState<PricePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchPricePredictions = async () => {
      setIsLoading(true);
      try {
        // Get unique product categories for this seller's products
        if (!products || products.length === 0) {
          setPredictions([]);
          return;
        }
        
        // In a real app, this would fetch from a real price prediction API
        // For now, we simulate price predictions for the products this seller has
        const mockPredictions: PricePrediction[] = products.slice(0, 3).map(product => {
          const randomChange = (Math.random() * 10 - 3).toFixed(1);
          const changeValue = parseFloat(randomChange);
          
          return {
            productName: product.name,
            currentPrice: product.price,
            predictedChangePercent: changeValue,
            trend: changeValue >= 0 ? 'up' : 'down'
          };
        });
        
        setPredictions(mockPredictions);
      } catch (error) {
        console.error('Error fetching price predictions:', error);
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPricePredictions();
  }, [products]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Price Predictions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">
          Market trends predict price changes for your products
        </p>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : predictions.length > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 text-xs font-medium text-gray-500 pb-1 border-b border-gray-100">
              <span>Product</span>
              <span className="text-center">Current</span>
              <span className="text-right">Prediction</span>
            </div>
            
            {predictions.map((prediction, index) => (
              <div key={index} className="grid grid-cols-3 items-center p-2 border-b border-gray-100">
                <span className="text-sm font-medium truncate max-w-[150px]">
                  {prediction.productName}
                </span>
                <span className="text-sm font-bold text-center">
                  ₹{prediction.currentPrice.toFixed(2)}
                </span>
                <div className="flex items-center justify-end">
                  <span 
                    className={`text-xs ${
                      prediction.trend === 'up' 
                        ? 'text-green-600 bg-green-50' 
                        : 'text-red-600 bg-red-50'
                    } px-2 py-0.5 rounded-full flex items-center`}
                  >
                    {prediction.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-0.5" />
                    )}
                    {prediction.predictedChangePercent > 0 ? '+' : ''}
                    {prediction.predictedChangePercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">No products available for price prediction</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PricePredictionCard;
