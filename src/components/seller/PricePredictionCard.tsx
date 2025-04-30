
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/types';

interface PricePredictionCardProps {
  products: Product[];
}

const PricePredictionCard: React.FC<PricePredictionCardProps> = ({ products }) => {
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
        <div className="space-y-3">
          {products.slice(0, 3).map(product => (
            <div key={`price-${product.id}`} className="flex justify-between items-center p-2 border-b border-gray-100">
              <span className="text-sm font-medium truncate max-w-[150px]">{product.name}</span>
              <div className="flex items-center">
                <span className="text-sm font-bold mr-1">₹{product.price}</span>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  +5%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PricePredictionCard;
